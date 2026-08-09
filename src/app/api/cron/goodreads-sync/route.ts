import { NextRequest } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { createClient } from '@supabase/supabase-js';
import { XMLParser } from 'fast-xml-parser';

const RSS_URL =
  'https://www.goodreads.com/review/list_rss/183128028?shelf=currently-reading';

// ---------------------------------------------------------------------------
// Auth — reject anything that isn't Vercel's own cron scheduler.
// Vercel sends: Authorization: Bearer <CRON_SECRET>
// Matches the newsletter-digest route exactly.
// ---------------------------------------------------------------------------
function isAuthorized(request: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return false;
  const auth = request.headers.get('authorization');
  return auth === `Bearer ${cronSecret}`;
}

// ---------------------------------------------------------------------------
// Supabase admin client — bypasses RLS so we can replace currently_reading.
// Never expose SUPABASE_SERVICE_ROLE_KEY to the browser.
// ---------------------------------------------------------------------------
function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
}

interface CdataWrapper {
  __cdata?: string;
}

type GoodreadsField = string | CdataWrapper | undefined;

interface GoodreadsItem {
  title?: GoodreadsField;
  book_id?: GoodreadsField;
  author_name?: GoodreadsField;
  book_large_image_url?: GoodreadsField;
  book_medium_image_url?: GoodreadsField;
  book_small_image_url?: GoodreadsField;
  book_image_url?: GoodreadsField;
}

interface ParsedBook {
  goodreads_id: string;
  title: string;
  author: string | null;
  cover_url: string | null;
  book_url: string | null;
  position: number;
}

function getFieldText(
  value: GoodreadsField | null | undefined
): string | undefined {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object' && '__cdata' in value) {
    return value.__cdata;
  }
  return undefined;
}

function parseBooks(xmlText: string): ParsedBook[] {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    cdataPropName: '__cdata',
    parseTagValue: false,
    trimValues: true,
  });

  const parsed = parser.parse(xmlText);
  const rawItems = parsed?.rss?.channel?.item;
  const items: GoodreadsItem[] = Array.isArray(rawItems)
    ? rawItems
    : rawItems
      ? [rawItems]
      : [];

  return items
    .map((item, index) => {
      const goodreadsId = getFieldText(item.book_id)?.trim() ?? '';
      const title = getFieldText(item.title)?.trim() ?? '';
      const coverUrl =
        getFieldText(item.book_large_image_url) ??
        getFieldText(item.book_medium_image_url) ??
        getFieldText(item.book_small_image_url) ??
        getFieldText(item.book_image_url) ??
        null;

      return {
        goodreads_id: goodreadsId,
        title,
        author: getFieldText(item.author_name)?.trim() ?? null,
        cover_url: coverUrl ? coverUrl.trim() : null,
        book_url: goodreadsId
          ? `https://www.goodreads.com/book/show/${goodreadsId}`
          : null,
        position: index,
      };
    })
    .filter((book) => book.goodreads_id && book.title);
}

// ---------------------------------------------------------------------------
// GET handler — invoked by Vercel cron scheduler once daily.
// ---------------------------------------------------------------------------
export async function GET(request: NextRequest): Promise<Response> {
  if (!isAuthorized(request)) {
    return new Response('Unauthorized', { status: 401 });
  }

  let xmlText: string;
  try {
    const res = await fetch(RSS_URL, {
      headers: { Accept: 'application/rss+xml, application/xml, text/xml' },
      next: { revalidate: 0 },
    });
    if (!res.ok) {
      throw new Error(`Goodreads RSS returned ${res.status} ${res.statusText}`);
    }
    xmlText = await res.text();
  } catch (error) {
    const msg = `[goodreads-sync] Failed to fetch RSS: ${error instanceof Error ? error.message : String(error)}`;
    console.error(msg);
    Sentry.captureException(new Error(msg));
    return Response.json(
      { ok: false, reason: 'fetch_failed' },
      { status: 502 }
    );
  }

  let books: ParsedBook[];
  try {
    books = parseBooks(xmlText);
  } catch (error) {
    const msg = `[goodreads-sync] Failed to parse RSS: ${error instanceof Error ? error.message : String(error)}`;
    console.error(msg);
    Sentry.captureException(new Error(msg));
    return Response.json(
      { ok: false, reason: 'parse_failed' },
      { status: 502 }
    );
  }

  // A silently empty feed is the most likely failure mode if Goodreads changes or
  // retires this. Never wipe the last-known-good list in that case.
  if (books.length === 0) {
    const msg =
      '[goodreads-sync] Feed parsed successfully but contained zero items; preserving existing data.';
    console.warn(msg);
    Sentry.captureMessage(msg, 'warning');
    return Response.json({ ok: false, reason: 'empty_feed', preserved: true });
  }

  const supabase = getAdminClient();
  const { error } = await supabase.rpc('replace_currently_reading', {
    books,
  });

  if (error) {
    const msg = `[goodreads-sync] Failed to replace currently_reading: ${error.message}`;
    console.error(msg);
    Sentry.captureException(new Error(msg));
    return Response.json({ ok: false, reason: 'db_error' }, { status: 500 });
  }

  console.log(
    `[goodreads-sync] Replaced currently_reading with ${books.length} book(s).`
  );
  return Response.json({ ok: true, count: books.length });
}

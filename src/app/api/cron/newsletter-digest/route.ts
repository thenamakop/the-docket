import { NextRequest } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { createClient } from '@supabase/supabase-js';
import type { Post } from '@/lib/post-data';

// ---------------------------------------------------------------------------
// Auth — reject anything that isn't Vercel's own cron scheduler.
// Vercel sends: Authorization: Bearer <CRON_SECRET>
// ---------------------------------------------------------------------------
function isAuthorized(request: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return false;
  const auth = request.headers.get('authorization');
  return auth === `Bearer ${cronSecret}`;
}

// ---------------------------------------------------------------------------
// Supabase admin client — bypasses RLS so we can read/write newsletter_state.
// Never expose SUPABASE_SERVICE_ROLE_KEY to the browser.
// ---------------------------------------------------------------------------
function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
}

// ---------------------------------------------------------------------------
// Site base URL for building post links.
// ---------------------------------------------------------------------------
function siteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://daal-baati-churma.vercel.app')
  );
}

// ---------------------------------------------------------------------------
// Compose the digest email body in Markdown.
// Buttondown auto-detects Markdown mode when there's no HTML.
// ---------------------------------------------------------------------------
function composeBody(posts: Post[], base: string): string {
  const lines: string[] = [
    posts.length === 1
      ? 'A new piece is up on DaalBaatiChurma:'
      : `${posts.length} new pieces are up on DaalBaatiChurma:`,
    '',
  ];

  for (const post of posts) {
    lines.push(`### [${post.title}](${base}/essays/${post.slug})`);
    if (post.dek) lines.push('', post.dek);
    lines.push('', `[Read →](${base}/essays/${post.slug})`, '');
    lines.push('---', '');
  }

  lines.push(
    '*You are receiving this because you subscribed at [daal-baati-churma.vercel.app]' +
      `(${base}). [Unsubscribe](%unsubscribe_url%)*`
  );

  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// GET handler — invoked by Vercel cron scheduler once daily.
// ---------------------------------------------------------------------------
export async function GET(request: NextRequest): Promise<Response> {
  if (!isAuthorized(request)) {
    return new Response('Unauthorized', { status: 401 });
  }

  const supabase = getAdminClient();

  // 1. Read the last-sent timestamp.
  const { data: stateRows, error: stateErr } = await supabase
    .from('newsletter_state')
    .select('last_notified_at')
    .eq('id', 1)
    .single();

  if (stateErr || !stateRows) {
    const msg = `[newsletter-digest] Failed to read newsletter_state: ${stateErr?.message}`;
    console.error(msg);
    Sentry.captureException(new Error(msg));
    return new Response('Internal error reading state', { status: 500 });
  }

  const lastNotifiedAt = stateRows.last_notified_at as string;

  // 2. Find posts published since the last digest, oldest-first.
  const { data: posts, error: postsErr } = await supabase
    .from('posts')
    .select('*')
    .eq('status', 'published')
    .gt('published_at', lastNotifiedAt)
    .order('published_at', { ascending: true });

  if (postsErr) {
    const msg = `[newsletter-digest] Failed to query posts: ${postsErr.message}`;
    console.error(msg);
    Sentry.captureException(new Error(msg));
    return new Response('Internal error querying posts', { status: 500 });
  }

  const newPosts = (posts ?? []) as Post[];

  // 3. Nothing new — return early without touching Buttondown.
  if (newPosts.length === 0) {
    console.log('[newsletter-digest] No new posts since', lastNotifiedAt, '— skipping.');
    return Response.json({ sent: false, reason: 'no_new_posts' });
  }

  console.log(`[newsletter-digest] ${newPosts.length} new post(s) since ${lastNotifiedAt} — sending digest.`);

  // 4. Compose and send a single digest email via Buttondown.
  const base = siteUrl();
  const subject =
    newPosts.length === 1
      ? `New on DaalBaatiChurma: ${newPosts[0]!.title}`
      : `${newPosts.length} new pieces on DaalBaatiChurma`;

  const bdRes = await fetch('https://api.buttondown.com/v1/emails', {
    method: 'POST',
    headers: {
      Authorization: `Token ${process.env.BUTTONDOWN_API_KEY}`,
      'Content-Type': 'application/json',
      // One-time confirmation header (already unlocked on this key).
      'X-Buttondown-Live-Dangerously': 'true',
    },
    body: JSON.stringify({
      subject,
      body: composeBody(newPosts, base),
      status: 'about_to_send',
    }),
  });

  if (!bdRes.ok) {
    const errText = await bdRes.text().catch(() => '(unreadable)');
    const msg = `[newsletter-digest] Buttondown error ${bdRes.status}: ${errText}`;
    console.error(msg);
    Sentry.captureException(new Error(msg));
    // Do NOT advance last_notified_at — next run will retry the same posts.
    return new Response('Error sending digest', { status: 502 });
  }

  // 5. Advance last_notified_at to the latest post's published_at.
  // Using the actual timestamp (not now()) avoids a gap if the cron fires
  // slightly before the next post's published_at.
  const latestPublishedAt = newPosts[newPosts.length - 1]!.published_at!;

  const { error: updateErr } = await supabase
    .from('newsletter_state')
    .update({ last_notified_at: latestPublishedAt })
    .eq('id', 1);

  if (updateErr) {
    // The email was sent but state wasn't saved. Log to Sentry but return
    // success — the alternative (claiming failure) would cause a duplicate
    // send on the next run, which is worse.
    const msg = `[newsletter-digest] Email sent but failed to update newsletter_state: ${updateErr.message}`;
    console.error(msg);
    Sentry.captureException(new Error(msg));
  }

  console.log(`[newsletter-digest] Digest sent. last_notified_at advanced to ${latestPublishedAt}.`);
  return Response.json({
    sent: true,
    postCount: newPosts.length,
    subject,
    lastNotifiedAt: latestPublishedAt,
  });
}

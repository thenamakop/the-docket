import { createClient } from '@supabase/supabase-js';

/**
 * Cookie-free Supabase client for public, read-only server paths.
 *
 * Unlike src/lib/supabase/server.ts, this file never touches next/headers
 * or cookies(), so it can safely be used inside routes that are statically
 * generated or on-demand-generated (ISR) without forcing them into dynamic
 * rendering.
 *
 * It is meant only for public data fetching. Admin/session-aware code should
 * continue using the cookie-based server client.
 */
export function createPublicClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }

  return createClient(url, key, {
    global: {
      fetch: (input: RequestInfo | URL, init?: RequestInit) =>
        fetch(input, {
          ...init,
          next: { revalidate: 60 },
        } as RequestInit),
    },
  });
}

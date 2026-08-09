import { createPublicClient } from '@/lib/supabase/public';

export interface CurrentlyReadingBook {
  id: string;
  goodreads_id: string;
  title: string;
  author: string | null;
  cover_url: string | null;
  book_url: string | null;
  position: number;
  fetched_at: string;
}

/**
 * Reads the cached Goodreads "currently reading" shelf.
 *
 * Uses the cookie-free public Supabase client so this stays safe for static/
 * ISR pages and does not reintroduce the DYNAMIC_SERVER_USAGE issue.
 * Never calls Goodreads at request time.
 */
export async function getCurrentlyReading(): Promise<CurrentlyReadingBook[]> {
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from('currently_reading')
      .select('*')
      .order('position', { ascending: true });

    if (error) {
      console.error('getCurrentlyReading error:', error.message);
      return [];
    }

    return (data ?? []) as CurrentlyReadingBook[];
  } catch (error) {
    console.error('getCurrentlyReading error:', error);
    return [];
  }
}

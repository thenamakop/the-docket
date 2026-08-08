import { createClient as createServerClient } from '@/lib/supabase/server';
import { createPublicClient } from '@/lib/supabase/public';
import type { Post, SectionSlug } from '@/lib/post-data';
import { sectionLabels } from '@/lib/post-data';

export type { Post, SectionSlug };
export {
  sectionLabels,
  sectionLabel,
  groupPostsByYear,
  formatPostDate,
} from '@/lib/post-data';

async function getSupabase() {
  return createServerClient();
}

function supabaseRestUrl(path: string): string {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}${path}`;
}

function supabaseRestHeaders(): Record<string, string> {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
  };
}

export async function getSectionCounts(): Promise<Record<SectionSlug, number>> {
  const counts = Object.fromEntries(
    Object.keys(sectionLabels).map((key) => [key as SectionSlug, 0])
  ) as Record<SectionSlug, number>;

  try {
    const res = await fetch(
      supabaseRestUrl('/rest/v1/published_posts_with_docket?select=section'),
      {
        headers: supabaseRestHeaders(),
        next: { revalidate: 60 },
      }
    );

    if (!res.ok) {
      console.error('getSectionCounts error:', res.statusText);
      return counts;
    }

    const data = (await res.json()) as { section: SectionSlug }[];
    for (const row of data) {
      if (row.section in counts) {
        counts[row.section] = (counts[row.section] ?? 0) + 1;
      }
    }
  } catch (error) {
    console.error('getSectionCounts error:', error);
  }

  return counts;
}

export async function getPublishedYears(): Promise<number[]> {
  try {
    const res = await fetch(
      supabaseRestUrl(
        '/rest/v1/published_posts_with_docket?select=published_at'
      ),
      {
        headers: supabaseRestHeaders(),
        next: { revalidate: 60 },
      }
    );

    if (!res.ok) {
      console.error('getPublishedYears error:', res.statusText);
      return [];
    }

    const data = (await res.json()) as { published_at: string }[];
    const years = new Set<number>();
    for (const row of data) {
      years.add(new Date(row.published_at).getUTCFullYear());
    }
    return Array.from(years).sort((a, b) => b - a);
  } catch (error) {
    console.error('getPublishedYears error:', error);
    return [];
  }
}

export async function searchPosts(query: string, limit = 8): Promise<Post[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  try {
    const encoded = encodeURIComponent(trimmed);
    const res = await fetch(
      supabaseRestUrl(
        `/rest/v1/published_posts_with_docket?or=(title.wfts.${encoded},dek.wfts.${encoded},body_html.wfts.${encoded})&limit=${limit}&select=*`
      ),
      {
        headers: supabaseRestHeaders(),
        next: { revalidate: 60 },
      }
    );

    if (!res.ok) {
      console.error('searchPosts error:', res.statusText);
      return [];
    }

    return (await res.json()) as Post[];
  } catch (error) {
    console.error('searchPosts error:', error);
    return [];
  }
}

export async function getPublishedPosts(
  limit = 20,
  offset = 0
): Promise<Post[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from('published_posts_with_docket')
    .select('*')
    .order('published_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('getPublishedPosts error:', error.message);
    return [];
  }

  return (data ?? []) as Post[];
}

export async function getPublishedSlugs(): Promise<{ slug: string }[]> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables for static slugs');
    return [];
  }

  const url = new URL(`${supabaseUrl}/rest/v1/published_posts_with_docket`);
  url.searchParams.set('select', 'slug');

  const res = await fetch(url.toString(), {
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
    },
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    console.error('getPublishedSlugs error:', res.statusText);
    return [];
  }

  return (await res.json()) as { slug: string }[];
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from('published_posts_with_docket')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    console.error('getPostBySlug error:', error.message);
    return null;
  }

  return data as Post;
}

export async function getPostById(id: string): Promise<Post | null> {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('getPostById error:', error.message);
    return null;
  }

  return data as Post;
}

export type AdminPost = Omit<Post, 'docket_no'> & { docket_no: string | null };

export async function getAllPosts(): Promise<AdminPost[]> {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('getAllPosts error:', error.message);
    return [];
  }

  const posts = (data ?? []) as Post[];

  const { data: docketRows, error: docketError } = await supabase
    .from('published_posts_with_docket')
    .select('id, docket_no');

  if (docketError) {
    console.error('getAllPosts docket lookup error:', docketError.message);
  }

  const docketById = new Map<string, string>(
    (docketRows ?? []).map((row) => [row.id as string, row.docket_no as string])
  );

  return posts.map((post) => ({
    ...post,
    docket_no: docketById.get(post.id) ?? null,
  }));
}

export async function getPostsBySection(
  section: SectionSlug,
  limit = 20,
  offset = 0
): Promise<Post[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from('published_posts_with_docket')
    .select('*')
    .eq('section', section)
    .order('published_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('getPostsBySection error:', error.message);
    return [];
  }

  return (data ?? []) as Post[];
}

export async function getPostsByYear(
  year: number,
  limit = 20,
  offset = 0
): Promise<Post[]> {
  const start = `${year}-01-01T00:00:00.000Z`;
  const end = `${year + 1}-01-01T00:00:00.000Z`;
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from('published_posts_with_docket')
    .select('*')
    .gte('published_at', start)
    .lt('published_at', end)
    .order('published_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('getPostsByYear error:', error.message);
    return [];
  }

  return (data ?? []) as Post[];
}

export async function getRelatedPosts(
  currentId: string,
  section: SectionSlug,
  limit = 3
): Promise<Post[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from('published_posts_with_docket')
    .select('*')
    .eq('section', section)
    .neq('id', currentId)
    .order('published_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('getRelatedPosts error:', error.message);
    return [];
  }

  return (data ?? []) as Post[];
}

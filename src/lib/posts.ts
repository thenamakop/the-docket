import { createClient as createServerClient } from '@/lib/supabase/server';

export type SectionSlug =
  | 'law-justice'
  | 'criminal-justice'
  | 'book-reviews'
  | 'personal-essays'
  | 'poetry-fiction'
  | 'guest-posts';

export interface Post {
  id: string;
  title: string;
  slug: string;
  docket_no: string;
  section: SectionSlug;
  dek: string | null;
  body_html: string;
  cover_image_url: string | null;
  author: string;
  status: 'draft' | 'published';
  published_at: string;
  reading_time_minutes: number | null;
  created_at: string;
  updated_at: string;
}

export const sectionLabels: Record<SectionSlug, string> = {
  'law-justice': 'Law & Justice',
  'criminal-justice': 'Criminal Justice',
  'book-reviews': 'Book Reviews',
  'personal-essays': 'Personal Essays',
  'poetry-fiction': 'Poetry & Short Fiction',
  'guest-posts': 'Guest Posts',
};

export function sectionLabel(section: SectionSlug): string {
  return sectionLabels[section] ?? section;
}

async function getSupabase() {
  return createServerClient();
}

export async function getPublishedPosts(
  limit = 20,
  offset = 0
): Promise<Post[]> {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('getPublishedPosts error:', error.message);
    return [];
  }

  return (data ?? []) as Post[];
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (error) {
    console.error('getPostBySlug error:', error.message);
    return null;
  }

  return data as Post;
}

export async function getPostsBySection(
  section: SectionSlug,
  limit = 20,
  offset = 0
): Promise<Post[]> {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('section', section)
    .eq('status', 'published')
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
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('status', 'published')
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
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('section', section)
    .eq('status', 'published')
    .neq('id', currentId)
    .order('published_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('getRelatedPosts error:', error.message);
    return [];
  }

  return (data ?? []) as Post[];
}

export function groupPostsByYear(posts: Post[]): Record<number, Post[]> {
  return posts.reduce(
    (groups, post) => {
      const year = new Date(post.published_at).getUTCFullYear();
      if (!groups[year]) {
        groups[year] = [];
      }
      groups[year].push(post);
      return groups;
    },
    {} as Record<number, Post[]>
  );
}

export function formatPostDate(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

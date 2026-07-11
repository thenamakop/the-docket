import { createClient as createServerClient } from '@/lib/supabase/server';
import type { Post, SectionSlug } from '@/lib/post-data';

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

export async function getAllPosts(): Promise<Post[]> {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('getAllPosts error:', error.message);
    return [];
  }

  return (data ?? []) as Post[];
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

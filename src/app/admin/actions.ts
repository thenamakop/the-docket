'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import sanitizeHtml from 'sanitize-html';
import { createClient } from '@/lib/supabase/server';
import type { Post, SectionSlug } from '@/lib/post-data';

export interface PostFormData {
  title: string;
  section: SectionSlug;
  bodyHtml: string;
  coverImageUrl: string | null;
  intent: 'draft' | 'publish';
}

function stripHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: [],
    allowedAttributes: {},
  });
}

function computeReadingTimeMinutes(html: string): number {
  const text = stripHtml(html);
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 100);
}

async function generateUniqueSlug(
  title: string,
  excludeId?: string
): Promise<string> {
  const supabase = await createClient();
  const baseSlug = slugify(title) || 'untitled';
  let slug = baseSlug;
  let suffix = 1;

  while (true) {
    let query = supabase.from('posts').select('id').eq('slug', slug);
    if (excludeId) {
      query = query.neq('id', excludeId);
    }
    const { data, error } = await query.limit(1);

    if (error) {
      throw new Error(`Slug collision check failed: ${error.message}`);
    }

    if (!data || data.length === 0) {
      return slug;
    }

    suffix += 1;
    slug = `${baseSlug}-${suffix}`;
  }
}

async function generateDocketNo(): Promise<string> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('posts')
    .select('docket_no')
    .order('docket_no', { ascending: false })
    .limit(1);

  if (error) {
    throw new Error(`Docket number lookup failed: ${error.message}`);
  }

  const lastNo = data?.[0]?.docket_no ?? 'No. 000';
  const lastNumber = parseInt(lastNo.replace(/\D/g, ''), 10) || 0;
  const nextNumber = lastNumber + 1;
  return `No. ${String(nextNumber).padStart(3, '0')}`;
}

function sanitizeBodyHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([
      'img',
      'h1',
      'h2',
      'h3',
      'blockquote',
    ]),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      img: ['src', 'alt', 'width', 'height'],
      a: ['href', 'target', 'rel'],
    },
    disallowedTagsMode: 'discard',
  });
}

export async function createPost(formData: PostFormData) {
  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) {
    throw new Error('Unauthorized');
  }

  const title = formData.title.trim();
  if (!title) {
    throw new Error('Title is required');
  }

  const bodyHtml = sanitizeBodyHtml(formData.bodyHtml);
  const slug = await generateUniqueSlug(title);
  const docketNo = await generateDocketNo();
  const readingTime = computeReadingTimeMinutes(bodyHtml);
  const status = formData.intent === 'publish' ? 'published' : 'draft';
  const publishedAt =
    formData.intent === 'publish' ? new Date().toISOString() : null;
  const coverImageUrl = formData.coverImageUrl?.trim() || null;
  const section = formData.section;

  const { error } = await supabase.from('posts').insert({
    title,
    slug,
    docket_no: docketNo,
    section,
    dek: null,
    body_html: bodyHtml,
    cover_image_url: coverImageUrl,
    author: 'Pradyumn Singh Mephawat',
    status,
    published_at: publishedAt,
    reading_time_minutes: readingTime,
  });

  if (error) {
    throw new Error(`Failed to create post: ${error.message}`);
  }

  revalidatePath('/');
  redirect('/admin');
}

export async function updatePost(id: string, formData: PostFormData) {
  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) {
    throw new Error('Unauthorized');
  }

  const { data: existing, error: existingError } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .single();

  if (existingError || !existing) {
    throw new Error('Post not found');
  }

  const title = formData.title.trim();
  if (!title) {
    throw new Error('Title is required');
  }

  const bodyHtml = sanitizeBodyHtml(formData.bodyHtml);
  const slug = await generateUniqueSlug(title, id);
  const readingTime = computeReadingTimeMinutes(bodyHtml);
  const status = formData.intent === 'publish' ? 'published' : 'draft';
  const publishedAt =
    formData.intent === 'publish'
      ? ((existing as Post).published_at ?? new Date().toISOString())
      : null;
  const coverImageUrl = formData.coverImageUrl?.trim() || null;

  const { error } = await supabase
    .from('posts')
    .update({
      title,
      slug,
      section: formData.section,
      body_html: bodyHtml,
      cover_image_url: coverImageUrl,
      status,
      published_at: publishedAt,
      reading_time_minutes: readingTime,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to update post: ${error.message}`);
  }

  revalidatePath('/');
  revalidatePath(`/essays/${slug}`);
  redirect('/admin');
}

export async function deletePost(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) {
    throw new Error('Unauthorized');
  }

  const id = formData.get('id') as string;
  if (!id) {
    throw new Error('Post ID is required');
  }

  const { error } = await supabase.from('posts').delete().eq('id', id);

  if (error) {
    throw new Error(`Failed to delete post: ${error.message}`);
  }

  revalidatePath('/');
  redirect('/admin');
}

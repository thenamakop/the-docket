export type SectionSlug =
  | 'law-justice'
  | 'criminal-justice'
  | 'book-reviews'
  | 'personal-essays'
  | 'poetry-fiction'
  | 'guest-posts'
  | 'travel-diary';

export interface Post {
  id: string;
  title: string;
  slug: string;
  docket_no: string;
  section: SectionSlug;
  dek: string | null;
  body_html: string;
  cover_image_url: string | null;
  location: string | null;
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
  'travel-diary': 'Travel Diary',
};

export function sectionLabel(section: SectionSlug): string {
  return sectionLabels[section] ?? section;
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

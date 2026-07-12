import type { MetadataRoute } from 'next';
import {
  getPublishedPosts,
  getPublishedYears,
  sectionLabels,
} from '@/lib/posts';
import type { SectionSlug } from '@/lib/post-data';

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://daalbaatichurma.vercel.app';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getPublishedPosts(1000);
  const years = await getPublishedYears();
  const sections = Object.keys(sectionLabels) as SectionSlug[];

  const home = {
    url: `${SITE_URL}/`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 1,
  };

  const staticPages = [
    { path: '/about', priority: 0.6 },
    { path: '/search', priority: 0.5 },
  ];

  const essayPages = posts.map((post) => ({
    url: `${SITE_URL}/essays/${post.slug}`,
    lastModified: new Date(post.updated_at),
    changeFrequency: 'monthly' as const,
    priority: 0.9,
  }));

  const sectionPages = sections.map((section) => ({
    url: `${SITE_URL}/section/${section}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  const archivePages = years.map((year) => ({
    url: `${SITE_URL}/archive/${year}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [
    home,
    ...staticPages.map(({ path, priority }) => ({
      url: `${SITE_URL}${path}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority,
    })),
    ...essayPages,
    ...sectionPages,
    ...archivePages,
  ];
}

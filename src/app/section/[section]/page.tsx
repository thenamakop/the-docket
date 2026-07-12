import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getPostsBySection, sectionLabel, groupPostsByYear } from '@/lib/posts';
import { PostCard } from '@/components/post/post-card';
import type { SectionSlug } from '@/lib/post-data';
import { sectionLabels } from '@/lib/post-data';

interface SectionPageProps {
  params: Promise<{ section: string }>;
}

export async function generateStaticParams() {
  const sections = Object.keys(sectionLabels) as SectionSlug[];
  return sections.map((section) => ({ section }));
}

export async function generateMetadata({
  params,
}: SectionPageProps): Promise<Metadata> {
  const { section } = await params;
  const label = sectionLabel(section as SectionSlug);
  return {
    title: `${label} — DaalBaatiChurma`,
    description: `Writing filed under ${label}.`,
  };
}

export default async function SectionPage({ params }: SectionPageProps) {
  const { section } = await params;

  if (!(section in sectionLabels)) {
    notFound();
  }

  const sectionSlug = section as SectionSlug;
  const posts = await getPostsBySection(sectionSlug, 100);
  const postsByYear = groupPostsByYear(posts);
  const years = Object.keys(postsByYear)
    .map(Number)
    .sort((a, b) => b - a);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <div className="mb-10 border-b border-rule pb-4">
        <Link
          href="/"
          className="font-ui text-sm text-slate transition-colors hover:text-oxblood"
        >
          ← Back to all essays
        </Link>
        <h1 className="mt-4 font-display text-3xl font-medium text-ink sm:text-4xl">
          {sectionLabel(sectionSlug)}
        </h1>
        <p className="mt-1 font-body text-base text-slate">
          {posts.length} {posts.length === 1 ? 'essay' : 'essays'}
        </p>
      </div>

      {posts.length === 0 ? (
        <p className="font-body text-base text-slate">
          No published essays in this section yet.
        </p>
      ) : (
        <div className="space-y-16">
          {years.map((year) => (
            <div key={year}>
              <h2 className="mb-6 font-mono text-sm font-medium uppercase tracking-[0.04em] text-slate">
                {year}
              </h2>
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {postsByYear[year].map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

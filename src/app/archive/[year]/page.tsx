import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getPostsByYear, getPublishedYears } from '@/lib/posts';
import { PostCard } from '@/components/post/post-card';

interface ArchiveYearPageProps {
  params: Promise<{ year: string }>;
}

export async function generateStaticParams() {
  const years = await getPublishedYears();
  return years.map((year) => ({ year: String(year) }));
}

export async function generateMetadata({
  params,
}: ArchiveYearPageProps): Promise<Metadata> {
  const { year } = await params;
  return {
    title: `${year} — DaalBaatiChurma`,
    description: `Essays and reviews published in ${year}.`,
  };
}

export default async function ArchiveYearPage({
  params,
}: ArchiveYearPageProps) {
  const { year } = await params;
  const yearNumber = parseInt(year, 10);

  if (Number.isNaN(yearNumber) || yearNumber < 1000 || yearNumber > 9999) {
    notFound();
  }

  const posts = await getPostsByYear(yearNumber, 100);

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
          {year}
        </h1>
        <p className="mt-1 font-body text-base text-slate">
          {posts.length} {posts.length === 1 ? 'essay' : 'essays'}
        </p>
      </div>

      {posts.length === 0 ? (
        <p className="font-body text-base text-slate">
          No published essays from this year.
        </p>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}

import type { Metadata } from 'next';
import Link from 'next/link';
import {
  getPublishedPosts,
  groupPostsByYear,
  sectionLabel,
  formatPostDate,
} from '@/lib/posts';
import { PostCard } from '@/components/post/post-card';
import { DocketBadge } from '@/components/post/docket-badge';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'the-docket',
  description:
    'A personal editorial blog for essays, reviews, poetry, and personal writing.',
};

export const revalidate = 60;

const POSTS_PER_PAGE = 20;

interface HomePageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const currentPage = Math.max(1, parseInt(params.page ?? '1', 10) || 1);
  const offset = (currentPage - 1) * POSTS_PER_PAGE;

  const posts = await getPublishedPosts(POSTS_PER_PAGE, offset);
  const heroPost = posts[0] ?? null;
  const indexPosts = posts;

  const postsByYear = groupPostsByYear(indexPosts);
  const years = Object.keys(postsByYear)
    .map(Number)
    .sort((a, b) => b - a);

  const hasNextPage = posts.length === POSTS_PER_PAGE;
  const hasPreviousPage = currentPage > 1;

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="border-b border-rule bg-parchment-dim">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          {heroPost ? (
            <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
              <div className="order-2 space-y-6 lg:order-1">
                <div className="space-y-3">
                  <span className="inline-block font-ui text-xs font-semibold uppercase tracking-[0.08em] text-brass">
                    {sectionLabel(heroPost.section)}
                  </span>
                  <DocketBadge
                    docketNo={heroPost.docket_no}
                    readingTimeMinutes={heroPost.reading_time_minutes}
                  />
                </div>

                <h1 className="font-display text-3xl font-medium leading-tight text-ink sm:text-4xl lg:text-5xl">
                  {heroPost.title}
                </h1>

                {heroPost.dek && (
                  <p className="font-body text-lg leading-relaxed text-slate sm:text-xl">
                    {heroPost.dek}
                  </p>
                )}

                <div className="flex items-center gap-3 pt-2 font-ui text-sm text-slate">
                  <time dateTime={heroPost.published_at}>
                    {formatPostDate(heroPost.published_at)}
                  </time>
                </div>

                <Link
                  href={`/essays/${heroPost.slug}`}
                  className="inline-flex items-center justify-center rounded-lg bg-oxblood px-4 py-2 text-sm font-medium text-parchment transition-colors hover:bg-oxblood/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-oxblood focus-visible:ring-offset-2 focus-visible:ring-offset-parchment"
                >
                  Read this essay
                </Link>
              </div>

              <div className="order-1 lg:order-2">
                {heroPost.cover_image_url ? (
                  <div
                    className="aspect-[4/3] w-full bg-cover bg-center"
                    style={{
                      backgroundImage: `url(${heroPost.cover_image_url})`,
                    }}
                    role="img"
                    aria-label={`Cover image for ${heroPost.title}`}
                  />
                ) : (
                  <div className="flex aspect-[4/3] w-full items-center justify-center border border-rule bg-parchment">
                    <span className="font-display text-6xl font-light text-rule sm:text-8xl">
                      {heroPost.docket_no}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="py-12 text-center">
              <p className="font-body text-lg text-slate">
                No published essays yet.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Volume Index */}
      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mb-10 border-b border-rule pb-4">
          <h2 className="font-display text-2xl font-medium text-ink sm:text-3xl">
            Volume Index
          </h2>
          <p className="mt-1 font-body text-base text-slate">
            Essays, reviews, and poems arranged by year.
          </p>
        </div>

        {years.length === 0 ? (
          <p className="font-body text-base text-slate">
            The index is empty. Publish a post to see it here.
          </p>
        ) : (
          <div className="space-y-16">
            {years.map((year) => (
              <div key={year}>
                <h3 className="mb-6 font-mono text-sm font-medium uppercase tracking-[0.04em] text-slate">
                  {year}
                </h3>
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                  {postsByYear[year].map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {(hasPreviousPage || hasNextPage) && (
          <div className="mt-16 flex items-center justify-between border-t border-rule pt-6">
            {hasPreviousPage ? (
              <Link
                href={`/?page=${currentPage - 1}`}
                className="inline-flex items-center rounded-lg px-3 py-2 font-ui text-sm text-slate transition-colors hover:bg-parchment-dim hover:text-oxblood focus:outline-none focus-visible:ring-2 focus-visible:ring-oxblood focus-visible:ring-offset-2 focus-visible:ring-offset-parchment"
              >
                <ChevronLeft className="mr-1 h-4 w-4" aria-hidden="true" />
                Previous
              </Link>
            ) : (
              <span className="inline-flex items-center rounded-lg px-3 py-2 font-ui text-sm text-slate opacity-40">
                <ChevronLeft className="mr-1 h-4 w-4" aria-hidden="true" />
                Previous
              </span>
            )}

            <span className="font-mono-smallcaps font-mono text-sm text-slate">
              Page {currentPage}
            </span>

            {hasNextPage ? (
              <Link
                href={`/?page=${currentPage + 1}`}
                className="inline-flex items-center rounded-lg px-3 py-2 font-ui text-sm text-slate transition-colors hover:bg-parchment-dim hover:text-oxblood focus:outline-none focus-visible:ring-2 focus-visible:ring-oxblood focus-visible:ring-offset-2 focus-visible:ring-offset-parchment"
              >
                Next
                <ChevronRight className="ml-1 h-4 w-4" aria-hidden="true" />
              </Link>
            ) : (
              <span className="inline-flex items-center rounded-lg px-3 py-2 font-ui text-sm text-slate opacity-40">
                Next
                <ChevronRight className="ml-1 h-4 w-4" aria-hidden="true" />
              </span>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

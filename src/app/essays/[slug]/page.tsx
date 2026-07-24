import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import {
  getPostBySlug,
  getPublishedSlugs,
  getRelatedPosts,
  formatPostDate,
  sectionLabel,
} from '@/lib/posts';
import { DocketBadge } from '@/components/post/docket-badge';
import { LocationBadge } from '@/components/post/location-badge';
import { PostCard } from '@/components/post/post-card';
import { ShareRow } from '@/components/post/share-row';

interface EssayPageProps {
  params: Promise<{ slug: string }>;
}

function getPostDescription(post: { dek: string | null; body_html: string }) {
  const text = (post.dek ?? post.body_html)
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return text.length > 160 ? `${text.slice(0, 157)}...` : text;
}

export async function generateStaticParams() {
  const slugs = await getPublishedSlugs();
  return slugs.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: EssayPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return {
      title: 'Not Found — DaalBaatiChurma',
    };
  }

  const description = getPostDescription(post);

  return {
    title: `${post.title} — DaalBaatiChurma`,
    description,
    alternates: {
      canonical: `/essays/${post.slug}`,
    },
    openGraph: {
      title: `${post.title} — DaalBaatiChurma`,
      description,
      url: `/essays/${post.slug}`,
      type: 'article',
      publishedTime: post.published_at,
      authors: [post.author],
      images: [`/essays/${post.slug}/opengraph-image`],
    },
    twitter: {
      card: 'summary_large_image',
    },
  };
}

export default async function EssayPage({ params }: EssayPageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const related = await getRelatedPosts(post.id, post.section, 3);
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? 'https://daalbaatichurma.vercel.app';
  const canonicalUrl = `${siteUrl}/essays/${post.slug}`;
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    datePublished: post.published_at,
    dateModified: post.updated_at,
    author: {
      '@type': 'Person',
      name: post.author,
    },
    ...(post.cover_image_url ? { image: post.cover_image_url } : {}),
  };

  return (
    <article className="flex-1">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleJsonLd).replace(/</g, '\\u003c'),
        }}
      />
      {/* Header */}
      <header className="border-b border-rule bg-parchment-dim">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 flex flex-col items-center gap-3">
              <span className="font-ui text-xs font-semibold uppercase tracking-[0.08em] text-brass">
                {sectionLabel(post.section)}
              </span>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <DocketBadge
                  docketNo={post.docket_no}
                  readingTimeMinutes={post.reading_time_minutes}
                />
                <LocationBadge location={post.location} />
              </div>
            </div>

            <h1 className="font-display text-3xl font-medium leading-tight text-ink sm:text-4xl lg:text-5xl">
              {post.title}
            </h1>

            {post.dek && (
              <p className="mx-auto mt-6 max-w-2xl font-body text-lg italic leading-relaxed text-slate sm:text-xl">
                {post.dek}
              </p>
            )}

            <div className="mt-8 flex items-center justify-center gap-3 font-mono text-sm text-slate">
              <span className="font-mono-smallcaps">{post.author}</span>
              <span aria-hidden="true">·</span>
              <time dateTime={post.published_at}>
                {formatPostDate(post.published_at)}
              </time>
            </div>
          </div>
        </div>
      </header>

      {/* Cover image */}
      {post.cover_image_url && (
        <div className="mx-auto max-w-5xl px-4 pt-12 sm:px-6 lg:px-8 lg:pt-16">
          <div
            className="aspect-[16/9] w-full bg-parchment-dim bg-center bg-contain bg-no-repeat"
            style={{ backgroundImage: `url(${post.cover_image_url})` }}
            role="img"
            aria-label={`Cover image for ${post.title}`}
          />
        </div>
      )}

      {/* Body */}
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="mx-auto max-w-3xl">
          <div
            className="essay-body"
            dangerouslySetInnerHTML={{ __html: post.body_html }}
          />

          {/* Share row */}
          <div className="mt-12 flex items-center justify-between border-t border-rule pt-6">
            <span className="font-ui text-sm text-slate">Share this post</span>
            <ShareRow url={canonicalUrl} title={post.title} />
          </div>
        </div>
      </div>

      {/* Related posts */}
      {related.length > 0 && (
        <aside className="border-t border-rule bg-parchment-dim">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
            <h2 className="mb-8 font-display text-2xl font-medium text-ink">
              Read next
            </h2>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((relatedPost) => (
                <PostCard key={relatedPost.id} post={relatedPost} />
              ))}
            </div>
          </div>
        </aside>
      )}
    </article>
  );
}

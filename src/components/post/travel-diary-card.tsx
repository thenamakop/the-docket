import Link from 'next/link';
import type { Post } from '@/lib/posts';
import { formatPostDate } from '@/lib/posts';
import { LocationBadge } from './location-badge';

interface TravelDiaryCardProps {
  post: Post;
}

const imagePositions = {
  top: 'center top',
  center: 'center',
  bottom: 'center bottom',
};

/**
 * Photo-forward card used exclusively on the Travel Diary section index.
 * Cover image leads at a consistent 3:2 aspect ratio; falls back to a
 * solid parchment-dim panel. Location badge + date sit below the image;
 * docket number is present but visually de-emphasised.
 */
export function TravelDiaryCard({ post }: TravelDiaryCardProps) {
  return (
    <article className="group flex flex-col">
      <Link
        href={`/essays/${post.slug}`}
        className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-oxblood focus-visible:ring-offset-2 focus-visible:ring-offset-parchment"
      >
        {/* Cover image — 3:2 aspect ratio */}
        <div className="relative aspect-[3/2] w-full overflow-hidden rounded-sm bg-parchment-dim">
          {post.cover_image_url ? (
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-[1.03]"
              style={{
                backgroundImage: `url(${post.cover_image_url})`,
                backgroundPosition:
                  imagePositions[post.cover_image_position ?? 'center'],
              }}
              role="img"
              aria-label={`Cover image for ${post.title}`}
            />
          ) : (
            /* Fallback: solid parchment-dim panel, same convention as homepage hero */
            <div className="absolute inset-0 flex items-end bg-parchment-dim p-4">
              <span className="font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-slate/60">
                {post.docket_no}
              </span>
            </div>
          )}
        </div>

        {/* Card body */}
        <div className="mt-3 space-y-1.5">
          {/* Location + date line */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <LocationBadge location={post.location} />
            {post.location && (
              <span
                className="text-slate/40 font-mono text-xs"
                aria-hidden="true"
              >
                ·
              </span>
            )}
            <time
              dateTime={post.published_at}
              className="font-mono text-xs font-medium text-slate font-mono-smallcaps"
            >
              {formatPostDate(post.published_at)}
            </time>
          </div>

          {/* Title */}
          <h3 className="font-display text-lg font-medium leading-snug text-ink transition-colors group-hover:text-oxblood">
            {post.title}
          </h3>

          {/* Dek — capped at 2 lines */}
          {post.dek && (
            <p className="line-clamp-2 font-body text-sm leading-relaxed text-slate">
              {post.dek}
            </p>
          )}

          {/* Docket number — de-emphasised; photo draws the eye first */}
          <span className="font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-slate/50">
            {post.docket_no}
          </span>
        </div>
      </Link>
    </article>
  );
}

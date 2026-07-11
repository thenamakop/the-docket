import Link from 'next/link';
import type { Post } from '@/lib/posts';
import { sectionLabel, formatPostDate } from '@/lib/posts';
import { DocketBadge } from './docket-badge';

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  return (
    <article className="group">
      <Link
        href={`/essays/${post.slug}`}
        className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-oxblood focus-visible:ring-offset-2 focus-visible:ring-offset-parchment"
      >
        <div className="space-y-2">
          <DocketBadge
            docketNo={post.docket_no}
            readingTimeMinutes={post.reading_time_minutes}
          />

          <h3 className="font-display text-xl font-medium leading-snug text-ink transition-colors group-hover:text-oxblood">
            {post.title}
          </h3>

          {post.dek && (
            <p className="font-body text-base leading-relaxed text-slate">
              {post.dek}
            </p>
          )}

          <div className="flex items-center gap-3 pt-1 font-ui text-xs text-slate">
            <span className="text-brass">{sectionLabel(post.section)}</span>
            <span aria-hidden="true">·</span>
            <time dateTime={post.published_at}>
              {formatPostDate(post.published_at)}
            </time>
          </div>
        </div>
      </Link>
    </article>
  );
}

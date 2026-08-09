import Image from 'next/image';
import type { CurrentlyReadingBook } from '@/lib/goodreads';

interface BookCardProps {
  book: CurrentlyReadingBook;
  size?: 'compact' | 'default';
}

export function BookCard({ book, size = 'default' }: BookCardProps) {
  const isCompact = size === 'compact';

  const inner = (
    <div
      className={`group ${isCompact ? 'flex gap-3' : 'flex flex-col gap-3'}`}
    >
      <div
        className={`relative shrink-0 overflow-hidden rounded-sm bg-parchment-dim ${
          isCompact
            ? 'h-[72px] w-[48px]'
            : 'aspect-[2/3] w-full'
        }`}
      >
        {book.cover_url ? (
          <Image
            src={book.cover_url}
            alt={`Cover of ${book.title}`}
            fill
            sizes={
              isCompact
                ? '48px'
                : '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw'
            }
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="font-ui text-xs text-slate">No cover</span>
          </div>
        )}
      </div>

      <div className={isCompact ? 'min-w-0' : ''}>
        <h3
          className={`font-display font-medium leading-snug text-ink transition-colors group-hover:text-oxblood ${
            isCompact ? 'text-sm' : 'text-lg'
          }`}
        >
          {book.title}
        </h3>
        {book.author && (
          <p
            className={`font-body text-slate ${
              isCompact ? 'text-sm' : 'text-base'
            }`}
          >
            {book.author}
          </p>
        )}
      </div>
    </div>
  );

  if (book.book_url) {
    return (
      <a
        href={book.book_url}
        target="_blank"
        rel="noopener noreferrer"
        className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-oxblood focus-visible:ring-offset-2 focus-visible:ring-offset-parchment"
      >
        {inner}
      </a>
    );
  }

  return <article>{inner}</article>;
}

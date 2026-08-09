import Link from 'next/link';
import { Rss } from 'lucide-react';
import { getCurrentlyReading } from '@/lib/goodreads';
import { BookCard } from '@/components/reading/book-card';
import { SubscribeForm } from './subscribe-form';

export async function Footer() {
  const books = await getCurrentlyReading();
  const readingPreview = books.slice(0, 2);
  const showReadingColumn = readingPreview.length > 0;

  return (
    <footer className="mt-auto border-t border-rule bg-parchment-dim">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div
          className={`grid gap-10 ${
            showReadingColumn
              ? 'md:grid-cols-2 lg:grid-cols-4'
              : 'md:grid-cols-3'
          }`}
        >
          <div className="space-y-3">
            <h2 className="font-ui text-xs font-semibold uppercase tracking-[0.08em] text-ink">
              About
            </h2>
            <p className="font-body text-base leading-relaxed text-slate">
              DaalBaatiChurma is a personal editorial blog for book reviews and
              travel diaries. Written, edited, and published by Pradyumn Singh
              Mephawat.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="font-ui text-xs font-semibold uppercase tracking-[0.08em] text-ink">
              Subscribe
            </h2>
            <p className="font-body text-base leading-relaxed text-slate">
              Get new posts by email. No analytics, no tracking.
            </p>
            <SubscribeForm />
          </div>

          <div className="space-y-3">
            <h2 className="font-ui text-xs font-semibold uppercase tracking-[0.08em] text-ink">
              Elsewhere
            </h2>
            <div className="flex gap-4">
              <Link
                href="/rss.xml"
                className="inline-flex items-center gap-1.5 font-ui text-sm text-slate transition-colors hover:text-oxblood focus:outline-none focus-visible:ring-2 focus-visible:ring-oxblood focus-visible:ring-offset-2 focus-visible:ring-offset-parchment-dim"
              >
                <Rss className="h-4 w-4" aria-hidden="true" />
                RSS
              </Link>
            </div>
          </div>

          {showReadingColumn && (
            <div className="space-y-3">
              <h2 className="font-ui text-xs font-semibold uppercase tracking-[0.08em] text-ink">
                Currently Reading
              </h2>
              <div className="space-y-4">
                {readingPreview.map((book) => (
                  <BookCard
                    key={book.goodreads_id}
                    book={book}
                    size="compact"
                  />
                ))}
              </div>
              <Link
                href="/reading"
                className="inline-block font-ui text-sm text-oxblood transition-colors hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-oxblood focus-visible:ring-offset-2 focus-visible:ring-offset-parchment-dim"
              >
                See all &rarr;
              </Link>
            </div>
          )}
        </div>

        <div className="mt-12 border-t border-rule pt-10">
          <blockquote className="mx-auto max-w-3xl text-center">
            <p className="font-display text-2xl font-normal italic leading-snug text-ink sm:text-3xl">
              &ldquo;Good writing is slow food: made with care, eaten without
              hurry, and remembered long after the meal.&rdquo;
            </p>
          </blockquote>
        </div>
      </div>
    </footer>
  );
}

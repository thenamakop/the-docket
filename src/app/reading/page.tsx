import type { Metadata } from 'next';
import { getCurrentlyReading } from '@/lib/goodreads';
import { BookCard } from '@/components/reading/book-card';

export const metadata: Metadata = {
  title: 'Currently Reading | DaalBaatiChurma',
  description:
    'Books Pradyumn Singh Mephawat is reading now: history, philosophy, non-fiction, and the occasional novel.',
  alternates: {
    canonical: '/reading',
  },
};

export default async function ReadingPage() {
  const books = await getCurrentlyReading();

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-3xl">
        <h1 className="font-display text-3xl font-medium leading-tight text-ink sm:text-4xl">
          Currently Reading
        </h1>
        <p className="mt-4 font-body text-lg leading-relaxed text-slate">
          A shelf of what is open at the moment — history, philosophy, and
          non-fiction that argues rather than merely informs. Updated from
          Goodreads once a day.
        </p>
      </div>

      <div className="mx-auto mt-12 max-w-3xl">
        {books.length > 0 ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {books.map((book) => (
              <BookCard key={book.goodreads_id} book={book} />
            ))}
          </div>
        ) : (
          <div className="rounded-sm border border-rule bg-parchment-dim p-8 text-center">
            <p className="font-display text-lg italic text-ink">
              The shelf is empty right now.
            </p>
            <p className="mt-2 font-body text-base text-slate">
              Check back once the next reading list syncs.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

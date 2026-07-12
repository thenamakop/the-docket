import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About — the-docket',
  description:
    'The Docket is a personal editorial blog for essays, book reviews, poetry, and personal writing.',
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <h1 className="font-display text-3xl font-medium text-ink sm:text-4xl">
        About
      </h1>
      <div className="prose prose-lg mt-8 font-body text-ink">
        <p>
          The Docket is a personal editorial blog for essays, book reviews,
          poetry, and the occasional personal note. It is written, edited, and
          published by one person from a quiet room.
        </p>
        <p>
          The name refers to the list of cases waiting to be heard in a court.
          Here, the docket is a list of ideas waiting to be written: arguments
          with themselves, books that refuse to be forgotten, places that keep
          their hold, and the small observations that accumulate into something
          worth sharing.
        </p>
        <p>
          No analytics, no tracking, no comments. If you would like to get in
          touch, the best way is to subscribe by email or follow the RSS feed.
        </p>
      </div>
    </div>
  );
}

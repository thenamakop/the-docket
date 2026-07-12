import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About — DaalBaatiChurma',
  description:
    'DaalBaatiChurma is a personal editorial blog for essays, book reviews, poetry, and personal writing.',
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <h1 className="font-display text-3xl font-medium text-ink sm:text-4xl">
        About
      </h1>
      <div className="prose prose-lg mt-8 font-body text-ink">
        <p>
          DaalBaatiChurma is a personal editorial blog for essays, book reviews,
          poetry, and the occasional personal note. It is written, edited, and
          published by Pradyumn Singh Mephawat from a quiet room.
        </p>
        <p>
          The name is a nod to a dish that takes time: slow heat, careful
          assembly, and the comfort that comes from things made without
          shortcuts. This site works the same way — ideas arrived at slowly,
          written carefully, and left here as a record worth keeping.
        </p>
        <p>
          No analytics, no tracking, no comments. If you would like to get in
          touch, the best way is to subscribe by email or follow the RSS feed.
        </p>
      </div>
    </div>
  );
}

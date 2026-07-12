import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About — DaalBaatiChurma',
  description:
    'Pradyumn Singh Mephawat is an advocate and JGLS class of 2023 — writing on history, philosophy, non-fiction books, and the occasional personal essay.',
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      {/* Page header — matches essay page header spacing */}
      <div className="mx-auto max-w-3xl">
        <h1 className="font-display text-3xl font-medium leading-tight text-ink sm:text-4xl">
          About
        </h1>
      </div>

      {/* Body — uses the same .essay-body class as essay pages */}
      <div className="mx-auto max-w-3xl mt-10">
        <div className="essay-body">
          <p>
            Pradyumn Singh Mephawat is an advocate, a graduate of Jindal Global
            Law School (class of 2023). This site is where he reads, thinks, and
            occasionally writes things down — not to perform expertise, but
            because some ideas only become clear once you have had to put words
            around them.
          </p>

          <p>
            His interests run toward history, philosophy, and non-fiction of the
            kind that treats a serious subject seriously — books that argue
            rather than merely inform, that have a point of view and defend it.
            The Book Reviews section exists because reading carefully is its own
            form of writing: to describe what a book does and whether it does it
            well requires you to have understood it, which requires you to have
            sat with it long enough to disagree.
          </p>

          <blockquote>
            <p>
              He is also — slowly, honestly — trying to develop an interest in
              science. The trying is real; the interest is not yet automatic.
            </p>
          </blockquote>

          <p>
            The Personal Essays section is harder to describe. It is the record
            of someone who trained in law but finds himself drawn to the
            questions that law reaches for and rarely quite answers: what
            obligations do we carry toward people we will never meet, what makes
            a judgment more than an outcome, why some arguments feel true even
            before they can be proved. These are not legal questions, strictly
            speaking. They are the questions that law inherits from history and
            philosophy and has not yet returned.
          </p>

          <p>
            The name, DaalBaatiChurma, is a nod to something made without
            shortcuts — slow heat, careful assembly, the kind of thing that
            cannot be hurried without changing what it is. That felt like the
            right description for whatever this site is trying to be.
          </p>

          <p>
            No analytics, no comments, no tracking. If you want to follow along,
            the RSS feed and the email subscription in the footer are the two
            ways in.
          </p>
        </div>

        {/* Closing epigraph — Francis Bacon, Essays (1625), public domain */}
        <div className="mt-16 border-t border-rule pt-10">
          <blockquote className="not-italic">
            <p className="font-display text-xl font-normal italic leading-snug text-slate sm:text-2xl">
              &ldquo;Reading maketh a full man; conference a ready man; and
              writing an exact man.&rdquo;
            </p>
            <footer className="mt-3 font-mono text-xs font-medium uppercase tracking-[0.08em] text-brass">
              Francis Bacon, <cite>Essays</cite> (1625)
            </footer>
          </blockquote>
        </div>
      </div>
    </div>
  );
}

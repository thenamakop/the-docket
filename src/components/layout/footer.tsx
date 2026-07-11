'use client';

import Link from 'next/link';
import { Rss, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function Footer() {
  return (
    <footer className="mt-auto border-t border-rule bg-parchment-dim">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-3">
          <div className="space-y-3">
            <h2 className="font-ui text-xs font-semibold uppercase tracking-[0.08em] text-ink">
              About
            </h2>
            <p className="font-body text-base leading-relaxed text-slate">
              The Docket is a personal editorial blog for essays, book reviews,
              poetry, and the occasional personal note. It is written, edited,
              and published by one person from a quiet room.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="font-ui text-xs font-semibold uppercase tracking-[0.08em] text-ink">
              Subscribe
            </h2>
            <p className="font-body text-base leading-relaxed text-slate">
              Get new essays by email. No analytics, no tracking.
            </p>
            <form
              className="flex gap-2"
              onSubmit={(event) => {
                event.preventDefault();
              }}
            >
              <Input
                type="email"
                placeholder="your@email.com"
                aria-label="Email address"
                className="flex-1 border-rule bg-parchment text-ink placeholder:text-slate focus-visible:ring-oxblood"
              />
              <Button
                type="submit"
                className="bg-oxblood text-parchment hover:bg-oxblood/90 focus-visible:ring-oxblood"
              >
                Join
              </Button>
            </form>
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
              <Link
                href="#"
                className="inline-flex items-center gap-1.5 font-ui text-sm text-slate transition-colors hover:text-oxblood focus:outline-none focus-visible:ring-2 focus-visible:ring-oxblood focus-visible:ring-offset-2 focus-visible:ring-offset-parchment-dim"
              >
                <X className="h-4 w-4" aria-hidden="true" />X / Twitter
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-rule pt-10">
          <blockquote className="mx-auto max-w-3xl text-center">
            <p className="font-display text-2xl font-normal italic leading-snug text-ink sm:text-3xl">
              &ldquo;A blog is a labor of love: a place to think slowly, write
              carefully, and leave a record behind.&rdquo;
            </p>
          </blockquote>
        </div>
      </div>
    </footer>
  );
}

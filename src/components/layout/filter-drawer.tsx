'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import type { SectionSlug } from '@/lib/post-data';
import { sectionLabels } from '@/lib/post-data';

// Active sections shown in the drawer — new content is published to these.
const activeSections: SectionSlug[] = ['book-reviews', 'travel-diary'];

interface FilterDrawerProps {
  sectionCounts: Record<SectionSlug, number>;
  archiveYears: number[];
}

export function FilterDrawer({
  sectionCounts,
  archiveYears,
}: FilterDrawerProps) {
  const [archiveOpen, setArchiveOpen] = useState(false);
  const sections = activeSections.map(
    (slug) => [slug, sectionLabels[slug]] as [SectionSlug, string]
  );

  return (
    <div className="flex h-full flex-col px-6 py-8">
      <h2 className="mb-6 font-display text-2xl font-medium text-ink">
        Sections
      </h2>

      <nav aria-label="Sections">
        <ul className="space-y-1">
          {sections.map(([slug, label]) => {
            const count = sectionCounts[slug] ?? 0;
            return (
              <li key={slug}>
                <Link
                  href={`/section/${slug}`}
                  className="flex items-center justify-between rounded-lg px-3 py-3 font-ui text-sm font-medium text-ink transition-colors hover:bg-parchment-dim focus:outline-none focus-visible:ring-2 focus-visible:ring-oxblood focus-visible:ring-offset-2 focus-visible:ring-offset-parchment"
                >
                  <span>{label}</span>
                  <span className="rounded-full bg-parchment-dim px-2 py-0.5 font-mono text-xs text-slate">
                    {count}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="mt-8 border-t border-rule pt-6">
        <button
          type="button"
          onClick={() => setArchiveOpen(!archiveOpen)}
          aria-expanded={archiveOpen}
          aria-controls="archive-list"
          className="flex w-full items-center justify-between rounded-lg px-3 py-3 font-ui text-sm font-medium text-ink transition-colors hover:bg-parchment-dim focus:outline-none focus-visible:ring-2 focus-visible:ring-oxblood focus-visible:ring-offset-2 focus-visible:ring-offset-parchment"
        >
          <span>Archive</span>
          <ChevronDown
            className={`h-4 w-4 text-slate transition-transform ${
              archiveOpen ? 'rotate-180' : ''
            }`}
            aria-hidden="true"
          />
        </button>

        {archiveOpen && (
          <nav id="archive-list" aria-label="Archive years" className="mt-2">
            <ul className="space-y-1 pl-3">
              {archiveYears.length === 0 ? (
                <li className="px-3 py-2 font-ui text-sm text-slate">
                  No published posts yet.
                </li>
              ) : (
                archiveYears.map((year) => (
                  <li key={year}>
                    <Link
                      href={`/archive/${year}`}
                      className="block rounded-lg px-3 py-2 font-ui text-sm text-ink transition-colors hover:bg-parchment-dim focus:outline-none focus-visible:ring-2 focus-visible:ring-oxblood focus-visible:ring-offset-2 focus-visible:ring-offset-parchment"
                    >
                      {year}
                    </Link>
                  </li>
                ))
              )}
            </ul>
          </nav>
        )}
      </div>

      <div className="mt-auto pt-8">
        <Link
          href="/"
          className="block rounded-lg px-3 py-3 font-ui text-sm font-medium text-slate transition-colors hover:bg-parchment-dim hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-oxblood focus-visible:ring-offset-2 focus-visible:ring-offset-parchment"
        >
          Back to all posts
        </Link>
      </div>
    </div>
  );
}

import type { Metadata } from 'next';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { PostCard } from '@/components/post/post-card';
import { searchPosts } from '@/lib/posts';

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export const metadata: Metadata = {
  title: 'Search — the-docket',
  description:
    'Search essays, reviews, and poems from the-docket by title, description, or body text.',
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const query = q?.trim() ?? '';
  const results = query ? await searchPosts(query, 8) : [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <div className="mb-10 border-b border-rule pb-4">
        <Link
          href="/"
          className="font-ui text-sm text-slate transition-colors hover:text-oxblood"
        >
          ← Back to all essays
        </Link>
        <h1 className="mt-4 font-display text-3xl font-medium text-ink sm:text-4xl">
          Search
        </h1>
      </div>

      <form action="/search" method="GET" className="mb-10 max-w-xl">
        <div className="relative">
          <Search
            className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate"
            aria-hidden="true"
          />
          <Input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Search by title, description, or body text"
            className="pl-10"
            aria-label="Search essays"
          />
        </div>
      </form>

      {query && results.length === 0 && (
        <p className="font-body text-base text-slate">
          No essays found for &ldquo;{query}&rdquo;.
        </p>
      )}

      {!query && (
        <p className="font-body text-base text-slate">
          Enter a word or phrase above to search published essays.
        </p>
      )}

      {results.length > 0 && (
        <div>
          <p className="mb-6 font-ui text-sm text-slate">
            {results.length} {results.length === 1 ? 'result' : 'results'} for
            &ldquo;{query}&rdquo;
          </p>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

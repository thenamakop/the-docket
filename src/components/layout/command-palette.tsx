'use client';

import { useEffect, useState, useTransition, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { sectionLabel } from '@/lib/post-data';
import type { Post } from '@/lib/post-data';

interface CommandPaletteProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CommandPalette({
  open: openProp,
  onOpenChange,
}: CommandPaletteProps) {
  const router = useRouter();
  const [internalOpen, setInternalOpen] = useState(false);
  const open = openProp ?? internalOpen;
  const setOpen = useCallback(
    (value: boolean) => {
      if (onOpenChange) {
        onOpenChange(value);
      } else {
        setInternalOpen(value);
      }
    },
    [onOpenChange]
  );
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Post[]>([]);
  const [isPending, startTransition] = useTransition();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen(!open);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, setOpen]);

  const fetchResults = (term: string) => {
    startTransition(async () => {
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(term.trim())}`
        );
        if (!res.ok) {
          setResults([]);
          return;
        }
        const data = (await res.json()) as { results: Post[] };
        setResults(data.results);
      } catch {
        setResults([]);
      }
    });
  };

  const handleQueryChange = (value: string) => {
    setQuery(value);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (!value.trim()) {
      setResults([]);
      return;
    }

    debounceRef.current = setTimeout(() => {
      fetchResults(value);
    }, 200);
  };

  const handleSelect = (slug: string) => {
    setOpen(false);
    router.push(`/essays/${slug}`);
  };

  const loading = isPending;

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title="Search essays"
      description="Search by title, description, or body text"
    >
      <Command shouldFilter={false}>
        <CommandInput
          placeholder="Search essays..."
          value={query}
          onValueChange={handleQueryChange}
        />
        <CommandList>
          {query.trim() && !loading && results.length === 0 && (
            <CommandEmpty>No essays found.</CommandEmpty>
          )}
          {!query.trim() && (
            <CommandEmpty>Start typing to search essays.</CommandEmpty>
          )}
          {results.length > 0 && (
            <CommandGroup heading="Essays">
              {results.map((post) => (
                <CommandItem
                  key={post.id}
                  value={post.slug}
                  onSelect={() => handleSelect(post.slug)}
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <span className="shrink-0 rounded bg-parchment-dim px-1.5 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wider text-oxblood">
                      {post.docket_no}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-display text-sm font-medium text-ink">
                        {post.title}
                      </p>
                      <p className="truncate font-ui text-xs text-slate">
                        {sectionLabel(post.section)}
                      </p>
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          {loading && (
            <div className="py-6 text-center text-sm text-slate">
              Searching...
            </div>
          )}
        </CommandList>
      </Command>
    </CommandDialog>
  );
}

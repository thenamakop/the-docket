'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Search, Moon, Sun, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { FilterDrawer } from './filter-drawer';
import { CommandPalette } from './command-palette';
import type { SectionSlug } from '@/lib/post-data';

const navLinks = [
  { label: 'Essays', href: '/' },
  { label: 'Book Reviews', href: '/section/book-reviews' },
  { label: 'Personal', href: '/section/personal-essays' },
  { label: 'Poetry', href: '/section/poetry-fiction' },
];

interface HeaderProps {
  sectionCounts: Record<SectionSlug, number>;
  archiveYears: number[];
}

export function Header({ sectionCounts, archiveYears }: HeaderProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 0);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header
      className={`sticky top-0 z-50 bg-parchment/95 backdrop-blur-sm transition-colors duration-200 ${
        scrolled ? 'border-b border-rule' : 'border-b border-transparent'
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="font-display text-2xl font-medium tracking-tight text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-oxblood focus-visible:ring-offset-2 focus-visible:ring-offset-parchment"
        >
          the-docket
        </Link>

        <nav className="hidden items-center gap-6 md:flex" aria-label="Primary">
          {navLinks.map((link) => (
            <Link
              key={link.href + link.label}
              href={link.href}
              className="font-ui text-xs font-medium uppercase tracking-[0.08em] text-slate transition-colors hover:text-oxblood focus:outline-none focus-visible:ring-2 focus-visible:ring-oxblood focus-visible:ring-offset-2 focus-visible:ring-offset-parchment"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label="Open sections menu"
                  className="items-center gap-2 font-ui text-xs font-medium uppercase tracking-[0.08em] text-slate hover:bg-parchment-dim hover:text-oxblood focus-visible:ring-oxblood"
                >
                  <Menu className="h-4 w-4" aria-hidden="true" />
                  <span className="hidden md:inline">Sections</span>
                </Button>
              }
            />
            <SheetContent side="right">
              <FilterDrawer
                sectionCounts={sectionCounts}
                archiveYears={archiveYears}
              />
            </SheetContent>
          </Sheet>

          <Button
            variant="ghost"
            size="icon"
            aria-label="Search"
            onClick={() => setSearchOpen(true)}
            className="text-slate hover:bg-parchment-dim hover:text-oxblood focus-visible:ring-oxblood"
          >
            <Search className="h-5 w-5" aria-hidden="true" />
          </Button>

          <CommandPalette open={searchOpen} onOpenChange={setSearchOpen} />

          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle dark mode"
            onClick={toggleTheme}
            className="text-slate hover:bg-parchment-dim hover:text-oxblood focus-visible:ring-oxblood"
          >
            <Sun className="hidden h-5 w-5 dark:block" aria-hidden="true" />
            <Moon className="block h-5 w-5 dark:hidden" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </header>
  );
}

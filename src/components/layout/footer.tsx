'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Rss } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function Footer() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus('loading');
    setMessage('');

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = (await res.json()) as {
        success: boolean;
        error?: string;
      };

      if (res.ok && data.success) {
        setStatus('success');
        setMessage("You're subscribed. Thank you!");
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.error ?? 'Something went wrong. Please try again.');
      }
    } catch {
      setStatus('error');
      setMessage('Unable to subscribe right now. Please try again.');
    }
  };

  return (
    <footer className="mt-auto border-t border-rule bg-parchment-dim">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-3">
          <div className="space-y-3">
            <h2 className="font-ui text-xs font-semibold uppercase tracking-[0.08em] text-ink">
              About
            </h2>
            <p className="font-body text-base leading-relaxed text-slate">
              DaalBaatiChurma is a personal editorial blog for essays, book
              reviews, and the occasional personal note. Written, edited, and
              published by Pradyumn Singh Mephawat.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="font-ui text-xs font-semibold uppercase tracking-[0.08em] text-ink">
              Subscribe
            </h2>
            <p className="font-body text-base leading-relaxed text-slate">
              Get new essays by email. No analytics, no tracking.
            </p>
            <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
              <div className="flex gap-2">
                <Input
                  type="email"
                  name="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-label="Email address"
                  required
                  className="flex-1 border-rule bg-parchment text-ink placeholder:text-slate focus-visible:ring-oxblood"
                />
                <Button
                  type="submit"
                  disabled={status === 'loading'}
                  className="bg-oxblood text-parchment hover:bg-oxblood/90 focus-visible:ring-oxblood disabled:opacity-60"
                >
                  {status === 'loading' ? '...' : 'Join'}
                </Button>
              </div>
              {status === 'success' && (
                <p className="font-ui text-sm text-brass">{message}</p>
              )}
              {status === 'error' && (
                <p className="font-ui text-sm text-oxblood">{message}</p>
              )}
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
            </div>
          </div>
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

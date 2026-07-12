'use client';

import { useState } from 'react';
import { Link2 } from 'lucide-react';

interface ShareRowProps {
  url: string;
  title: string;
}

export function ShareRow({ url }: ShareRowProps) {
  const [feedback, setFeedback] = useState<string | null>(null);

  const copyLink = async () => {
    if (typeof navigator === 'undefined' || !navigator.clipboard) {
      setFeedback('Copy unavailable');
      setTimeout(() => setFeedback(null), 2500);
      return;
    }

    try {
      await navigator.clipboard.writeText(url);
      setFeedback('Link copied');
    } catch {
      setFeedback('Copy unavailable');
    }

    setTimeout(() => setFeedback(null), 2500);
  };

  return (
    <div className="flex items-center justify-center">
      <div className="relative">
        <button
          type="button"
          onClick={copyLink}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-rule bg-parchment text-slate transition-colors hover:border-oxblood hover:text-oxblood focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oxblood focus-visible:ring-offset-2 focus-visible:ring-offset-parchment"
          aria-label="Copy link to clipboard"
        >
          <Link2 className="h-4 w-4" aria-hidden="true" />
        </button>

        {feedback && (
          <span className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-oxblood px-2 py-1 font-ui text-xs text-parchment shadow-lg">
            {feedback}
            <span className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-oxblood" />
          </span>
        )}
      </div>
    </div>
  );
}

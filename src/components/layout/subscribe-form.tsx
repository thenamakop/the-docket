'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function SubscribeForm() {
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
  );
}

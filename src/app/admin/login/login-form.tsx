'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      console.error('Sign-in error:', signInError);
      setError("Email or password didn't match — try again.");
      setLoading(false);
      return;
    }

    router.push('/admin');
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <label
            htmlFor="email"
            className="font-ui text-sm font-medium text-ink"
          >
            Email
          </label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border-rule bg-parchment text-ink placeholder:text-slate focus-visible:ring-oxblood"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="password"
            className="font-ui text-sm font-medium text-ink"
          >
            Password
          </label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border-rule bg-parchment text-ink placeholder:text-slate focus-visible:ring-oxblood"
          />
        </div>
      </div>

      {error && (
        <p className="rounded-md bg-oxblood/10 px-3 py-2 font-ui text-sm text-oxblood">
          {error}
        </p>
      )}

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-oxblood text-parchment hover:bg-oxblood/90 focus-visible:ring-oxblood"
      >
        {loading ? 'Signing in…' : 'Log in'}
      </Button>
    </form>
  );
}

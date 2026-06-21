'use client';

import { Check, Mail } from 'lucide-react';
import { useState } from 'react';
import { Reveal } from './reveal';

type Status = 'idle' | 'loading' | 'done' | 'error';

export function Waitlist() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      setStatus(res.ok ? 'done' : 'error');
    } catch {
      setStatus('error');
    }
  };

  return (
    <section className="mx-auto max-w-3xl px-6 py-20 text-center">
      <Reveal>
        <div className="glass-strong rounded-3xl p-10 md:p-14">
          <h2 className="text-h2 text-foreground mb-3">Get early drops</h2>
          <p className="text-muted mb-8 max-w-md mx-auto">
            New styles, featured artists, and product updates — straight to your inbox. No spam.
          </p>

          {status === 'done' ? (
            <p className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
              <Check className="h-5 w-5 text-success" />
              You&apos;re on the list.
            </p>
          ) : (
            <form onSubmit={submit} className="mx-auto flex max-w-md flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  aria-label="Email address"
                  className="glass w-full rounded-xl py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <button
                type="submit"
                disabled={status === 'loading'}
                className="rounded-xl bg-primary/90 px-6 py-3 text-sm font-medium text-white border border-primary-light/30 transition-colors hover:bg-primary disabled:opacity-60"
              >
                {status === 'loading' ? 'Joining…' : 'Join'}
              </button>
            </form>
          )}

          {status === 'error' && (
            <p className="mt-3 text-sm text-danger">Something went wrong. Try again.</p>
          )}
        </div>
      </Reveal>
    </section>
  );
}

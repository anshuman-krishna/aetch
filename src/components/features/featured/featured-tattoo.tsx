'use client';

import { BadgeCheck, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface Featured {
  title: string;
  slug: string;
  imageUrl: string;
  styles: string[];
  artist: { name: string; slug: string; verified: boolean };
}

type State = 'loading' | 'ready' | 'hidden';

// self-contained: fetches /api/featured and hides itself when empty or failing
export function FeaturedTattoo() {
  const [data, setData] = useState<Featured | null>(null);
  const [state, setState] = useState<State>('loading');

  useEffect(() => {
    let active = true;
    fetch('/api/featured')
      .then((r) => r.json())
      .then((json) => {
        if (!active) return;
        if (json?.tattoo) {
          setData(json.tattoo);
          setState('ready');
        } else {
          setState('hidden');
        }
      })
      .catch(() => active && setState('hidden'));
    return () => {
      active = false;
    };
  }, []);

  if (state === 'hidden') return null;

  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <div className="mb-8 flex items-center justify-center gap-2 text-sm font-medium text-primary">
        <Sparkles className="h-4 w-4" />
        Tattoo of the Day
      </div>

      <div className="glass-strong grid overflow-hidden rounded-3xl md:grid-cols-2">
        <div className="relative aspect-square bg-foreground/5 md:aspect-auto">
          {state === 'ready' && data ? (
            // plain img avoids next/image remote-domain config for user uploads
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={data.imageUrl}
              alt={data.title}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="h-full w-full animate-pulse bg-foreground/10" />
          )}
        </div>

        <div className="flex flex-col justify-center gap-4 p-8 md:p-12">
          {state === 'ready' && data ? (
            <>
              <div className="flex flex-wrap gap-2">
                {data.styles.slice(0, 3).map((s) => (
                  <span key={s} className="glass rounded-full px-3 py-1 text-xs text-foreground/70">
                    {s.toLowerCase()}
                  </span>
                ))}
              </div>
              <h3 className="text-h3 text-foreground">{data.title}</h3>
              <p className="flex items-center gap-1.5 text-sm text-muted">
                by <span className="font-medium text-foreground">{data.artist.name}</span>
                {data.artist.verified && <BadgeCheck className="h-4 w-4 text-primary" />}
              </p>
              <Link
                href={`/app/tattoo/${data.slug}`}
                className="mt-2 inline-flex w-fit rounded-xl bg-primary/90 px-6 py-3 text-sm font-medium text-white border border-primary-light/30 transition-colors hover:bg-primary"
              >
                View design
              </Link>
            </>
          ) : (
            <div className="space-y-3">
              <div className="h-4 w-1/3 animate-pulse rounded bg-foreground/10" />
              <div className="h-7 w-2/3 animate-pulse rounded bg-foreground/10" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-foreground/10" />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

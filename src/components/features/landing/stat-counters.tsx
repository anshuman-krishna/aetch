'use client';

import { useEffect, useRef, useState } from 'react';

interface Stat {
  target?: number;
  suffix?: string;
  display?: string;
  label: string;
}

const stats: Stat[] = [
  { target: 15, suffix: '+', label: 'Tattoo Styles' },
  { target: 200, suffix: '+', label: 'Verified Artists' },
  { display: '∞', label: 'AI Concepts' },
  { display: '24/7', label: 'Booking' },
];

// counts from 0 to target once the row scrolls into view
function useCountUp(target: number, run: boolean, duration = 1200) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!run) return;
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(eased * target));
      if (p < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, run, duration]);

  return value;
}

function Counter({ stat, run }: { stat: Stat; run: boolean }) {
  const value = useCountUp(stat.target ?? 0, run);
  return (
    <div className="glass rounded-2xl p-5">
      <p className="text-h2 text-primary tabular-nums">
        {stat.display ?? `${value}${stat.suffix ?? ''}`}
      </p>
      <p className="text-sm text-muted mt-1">{stat.label}</p>
    </div>
  );
}

export function StatCounters() {
  const ref = useRef<HTMLDivElement>(null);
  const [run, setRun] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRun(true);
          observer.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <div className="glass-strong rounded-3xl p-10 md:p-16 text-center">
        <h2 className="text-h1 text-foreground mb-4">A Living Marketplace</h2>
        <p className="text-muted max-w-2xl mx-auto mb-8">
          Browse curated galleries, find verified artists by style and location, book sessions
          directly, and share your ink with the community.
        </p>
        <div ref={ref} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 max-w-3xl mx-auto">
          {stats.map((s) => (
            <Counter key={s.label} stat={s} run={run} />
          ))}
        </div>
      </div>
    </section>
  );
}

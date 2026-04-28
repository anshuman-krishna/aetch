'use client';

import { useState } from 'react';
import { GlassButton } from '@/components/ui/glass-button';
import { cn } from '@/utils/cn';

type RsvpStatus = 'GOING' | 'INTERESTED' | 'NOT_GOING';

interface Props {
  slug: string;
  initialStatus?: RsvpStatus;
}

const OPTIONS: { value: RsvpStatus; label: string }[] = [
  { value: 'GOING', label: 'Going' },
  { value: 'INTERESTED', label: 'Interested' },
  { value: 'NOT_GOING', label: 'Not going' },
];

export function EventRsvpControls({ slug, initialStatus }: Props) {
  const [status, setStatus] = useState<RsvpStatus | undefined>(initialStatus);
  const [busy, setBusy] = useState(false);

  const choose = async (value: RsvpStatus) => {
    setBusy(true);
    try {
      const res = await fetch(`/api/events/${slug}/rsvp`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ status: value }),
      });
      if (res.ok) setStatus(value);
    } finally {
      setBusy(false);
    }
  };

  const cancel = async () => {
    setBusy(true);
    try {
      const res = await fetch(`/api/events/${slug}/rsvp`, { method: 'DELETE' });
      if (res.ok) setStatus(undefined);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => choose(opt.value)}
          disabled={busy}
          className={cn(
            'rounded-full px-3 py-1.5 text-xs font-medium transition',
            status === opt.value ? 'bg-primary/90 text-white' : 'glass text-foreground/80',
          )}
        >
          {opt.label}
        </button>
      ))}
      {status && (
        <GlassButton variant="ghost" size="sm" onClick={cancel} loading={busy}>
          Clear
        </GlassButton>
      )}
    </div>
  );
}

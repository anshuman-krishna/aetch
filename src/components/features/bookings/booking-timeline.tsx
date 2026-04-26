'use client';

import { Clock, CheckCircle, XCircle, AlertTriangle, Calendar } from 'lucide-react';
import { cn } from '@/utils/cn';

type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';

interface BookingTimelineProps {
  status: BookingStatus;
  createdAt: string;
  updatedAt: string;
}

// timeline step definition
interface Step {
  key: string;
  label: string;
  icon: React.ElementType;
}

const MAIN_STEPS: Step[] = [
  { key: 'PENDING', label: 'Request Submitted', icon: Clock },
  { key: 'CONFIRMED', label: 'Confirmed', icon: Calendar },
  { key: 'COMPLETED', label: 'Completed', icon: CheckCircle },
];

const ALT_ENDINGS: Record<string, Step> = {
  CANCELLED: { key: 'CANCELLED', label: 'Cancelled', icon: XCircle },
  NO_SHOW: { key: 'NO_SHOW', label: 'No Show', icon: AlertTriangle },
};

// resolve visible steps for status
function resolveSteps(status: BookingStatus): Step[] {
  if (status === 'CANCELLED' || status === 'NO_SHOW')
    return [...MAIN_STEPS.slice(0, 2), ALT_ENDINGS[status]];
  return MAIN_STEPS;
}

// map status to active index
const STATUS_INDEX: Record<BookingStatus, number> = {
  PENDING: 0,
  CONFIRMED: 1,
  CANCELLED: 2,
  COMPLETED: 2,
  NO_SHOW: 2,
};

// determine step visual state
function stepState(idx: number, activeIdx: number, status: BookingStatus) {
  if (idx < activeIdx) return 'completed';
  if (idx === activeIdx) return status === 'CANCELLED' || status === 'NO_SHOW' ? 'error' : 'active';
  return 'upcoming';
}

// format timestamp for display
function formatTime(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function BookingTimeline({ status, createdAt, updatedAt }: BookingTimelineProps) {
  const steps = resolveSteps(status);
  const activeIdx = STATUS_INDEX[status];

  return (
    <div className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-5">
      {steps.map((step, idx) => {
        const state = stepState(idx, activeIdx, status);
        const Icon = step.icon;
        const isLast = idx === steps.length - 1;
        const timestamp = idx === 0 ? createdAt : idx === activeIdx ? updatedAt : null;

        return (
          <div key={step.key} className="flex gap-3">
            {/* icon and connector line */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full shrink-0',
                  state === 'completed' && 'bg-emerald-500/20 text-emerald-400',
                  state === 'active' && 'bg-sky-500/20 text-sky-400 ring-2 ring-sky-400/40',
                  state === 'error' && 'bg-red-500/20 text-red-400 ring-2 ring-red-400/40',
                  state === 'upcoming' && 'bg-white/5 text-white/30',
                )}
              >
                <Icon className="h-4 w-4" />
              </div>
              {!isLast && (
                <div
                  className={cn(
                    'w-px flex-1 min-h-[24px]',
                    idx < activeIdx ? 'bg-emerald-500/40' : 'bg-white/10',
                  )}
                />
              )}
            </div>
            <div className={cn('pb-6', isLast && 'pb-0')}>
              <p
                className={cn(
                  'text-sm font-medium leading-8',
                  state === 'upcoming' ? 'text-white/30' : 'text-foreground/90',
                  state === 'error' && 'text-red-400',
                )}
              >
                {step.label}
              </p>
              {timestamp && (
                <p className="text-xs text-foreground/50 -mt-1">{formatTime(timestamp)}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default BookingTimeline;

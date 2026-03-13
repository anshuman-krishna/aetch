'use client';

import { BODY_PLACEMENTS, PLACEMENT_LABELS } from '@/lib/validations';
import { cn } from '@/utils/cn';

interface AIPlacementSelectorProps {
  value: string;
  onChange: (placement: string) => void;
}

export function AIPlacementSelector({ value, onChange }: AIPlacementSelectorProps) {
  return (
    <div>
      <label className="text-sm font-medium text-foreground/80 mb-2 block">Body Placement</label>
      <div className="flex flex-wrap gap-2">
        {BODY_PLACEMENTS.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onChange(value === p ? '' : p)}
            className={cn(
              'rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200',
              value === p
                ? 'bg-primary/90 text-white border border-primary-light/30'
                : 'glass hover:bg-white/20 text-foreground/80',
            )}
          >
            {PLACEMENT_LABELS[p]}
          </button>
        ))}
      </div>
    </div>
  );
}

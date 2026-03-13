'use client';

import { TATTOO_STYLES, STYLE_LABELS } from '@/lib/validations';
import { cn } from '@/utils/cn';

interface AIStyleSelectorProps {
  value: string;
  onChange: (style: string) => void;
}

export function AIStyleSelector({ value, onChange }: AIStyleSelectorProps) {
  return (
    <div>
      <label className="text-sm font-medium text-foreground/80 mb-2 block">Style</label>
      <div className="flex flex-wrap gap-2">
        {TATTOO_STYLES.map((style) => (
          <button
            key={style}
            type="button"
            onClick={() => onChange(value === style ? '' : style)}
            className={cn(
              'rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200',
              value === style
                ? 'bg-primary/90 text-white border border-primary-light/30'
                : 'glass hover:bg-white/20 text-foreground/80',
            )}
          >
            {STYLE_LABELS[style] ?? style}
          </button>
        ))}
      </div>
    </div>
  );
}

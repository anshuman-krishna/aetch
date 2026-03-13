'use client';

import { cn } from '@/utils/cn';
import { GlassCard } from '@/components/ui/glass-card';
import { GlassButton } from '@/components/ui/glass-button';
import { SlidersHorizontal } from 'lucide-react';
import {
  TATTOO_STYLES,
  BODY_PLACEMENTS,
  COLOR_TYPES,
  STYLE_LABELS,
  PLACEMENT_LABELS,
} from '@/lib/validations';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface FilterState {
  styles: string[];
  bodyPlacement: string;
  colorType: string;
  sort: 'latest' | 'popular' | 'trending';
}

interface TattooFiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  className?: string;
}

// shared chip button classes
const chipBase = 'rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200';
const chipActive = 'bg-primary/90 text-white border border-primary-light/30';
const chipInactive = 'glass hover:bg-white/20 text-foreground/80';

export function TattooFilters({ filters, onChange, className }: TattooFiltersProps) {
  const [expanded, setExpanded] = useState(false);

  const activeCount =
    filters.styles.length +
    (filters.bodyPlacement ? 1 : 0) +
    (filters.colorType ? 1 : 0);

  const toggleStyle = (style: string) => {
    const updated = filters.styles.includes(style)
      ? filters.styles.filter((s) => s !== style)
      : [...filters.styles, style];
    onChange({ ...filters, styles: updated });
  };

  const clearAll = () => {
    onChange({ styles: [], bodyPlacement: '', colorType: '', sort: 'latest' });
  };

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <GlassButton
            variant={expanded ? 'primary' : 'default'}
            size="sm"
            onClick={() => setExpanded(!expanded)}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {activeCount > 0 && (
              <span className="ml-1 rounded-full bg-white/20 px-1.5 py-0.5 text-xs">
                {activeCount}
              </span>
            )}
          </GlassButton>

          {activeCount > 0 && (
            <GlassButton variant="ghost" size="sm" onClick={clearAll}>
              Clear all
            </GlassButton>
          )}
        </div>

        <div className="flex gap-1">
          {(['latest', 'popular', 'trending'] as const).map((sort) => (
            <GlassButton
              key={sort}
              variant={filters.sort === sort ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => onChange({ ...filters, sort })}
            >
              {sort.charAt(0).toUpperCase() + sort.slice(1)}
            </GlassButton>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <GlassCard variant="subtle" padding="md" className="space-y-5">
              <FilterSection title="Style">
                {TATTOO_STYLES.map((style) => (
                  <button
                    key={style}
                    onClick={() => toggleStyle(style)}
                    className={cn(chipBase, filters.styles.includes(style) ? chipActive : chipInactive)}
                  >
                    {STYLE_LABELS[style]}
                  </button>
                ))}
              </FilterSection>

              <FilterSection title="Body Placement">
                {BODY_PLACEMENTS.map((p) => (
                  <button
                    key={p}
                    onClick={() => onChange({ ...filters, bodyPlacement: filters.bodyPlacement === p ? '' : p })}
                    className={cn(chipBase, filters.bodyPlacement === p ? chipActive : chipInactive)}
                  >
                    {PLACEMENT_LABELS[p]}
                  </button>
                ))}
              </FilterSection>

              <FilterSection title="Color Type">
                {COLOR_TYPES.map((type) => (
                  <button
                    key={type}
                    onClick={() => onChange({ ...filters, colorType: filters.colorType === type ? '' : type })}
                    className={cn(chipBase, filters.colorType === type ? chipActive : chipInactive)}
                  >
                    {type === 'BLACK_AND_GREY' ? 'Black & Grey' : type.charAt(0) + type.slice(1).toLowerCase()}
                  </button>
                ))}
              </FilterSection>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-xs font-semibold text-foreground/70 uppercase tracking-wider mb-2">
        {title}
      </h4>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

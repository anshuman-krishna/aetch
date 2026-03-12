'use client';

import { cn } from '@/utils/cn';
import { GlassCard } from '@/components/ui/glass-card';
import { GlassButton } from '@/components/ui/glass-button';
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
      {/* Sort + Toggle Row */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <GlassButton
            variant={expanded ? 'primary' : 'default'}
            size="sm"
            onClick={() => setExpanded(!expanded)}
          >
            <FilterIcon className="h-4 w-4" />
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

      {/* Expanded Filter Panel */}
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
              {/* Styles */}
              <div>
                <h4 className="text-xs font-semibold text-foreground/70 uppercase tracking-wider mb-2">
                  Style
                </h4>
                <div className="flex flex-wrap gap-2">
                  {TATTOO_STYLES.map((style) => (
                    <button
                      key={style}
                      onClick={() => toggleStyle(style)}
                      className={cn(
                        'rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200',
                        filters.styles.includes(style)
                          ? 'bg-primary/90 text-white border border-primary-light/30'
                          : 'glass hover:bg-white/20 text-foreground/80',
                      )}
                    >
                      {STYLE_LABELS[style]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Body Placement */}
              <div>
                <h4 className="text-xs font-semibold text-foreground/70 uppercase tracking-wider mb-2">
                  Body Placement
                </h4>
                <div className="flex flex-wrap gap-2">
                  {BODY_PLACEMENTS.map((placement) => (
                    <button
                      key={placement}
                      onClick={() =>
                        onChange({
                          ...filters,
                          bodyPlacement: filters.bodyPlacement === placement ? '' : placement,
                        })
                      }
                      className={cn(
                        'rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200',
                        filters.bodyPlacement === placement
                          ? 'bg-primary/90 text-white border border-primary-light/30'
                          : 'glass hover:bg-white/20 text-foreground/80',
                      )}
                    >
                      {PLACEMENT_LABELS[placement]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Type */}
              <div>
                <h4 className="text-xs font-semibold text-foreground/70 uppercase tracking-wider mb-2">
                  Color Type
                </h4>
                <div className="flex gap-2">
                  {COLOR_TYPES.map((type) => (
                    <button
                      key={type}
                      onClick={() =>
                        onChange({
                          ...filters,
                          colorType: filters.colorType === type ? '' : type,
                        })
                      }
                      className={cn(
                        'rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200',
                        filters.colorType === type
                          ? 'bg-primary/90 text-white border border-primary-light/30'
                          : 'glass hover:bg-white/20 text-foreground/80',
                      )}
                    >
                      {type === 'BLACK_AND_GREY'
                        ? 'Black & Grey'
                        : type.charAt(0) + type.slice(1).toLowerCase()}
                    </button>
                  ))}
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FilterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor">
      <path
        fillRule="evenodd"
        d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z"
        clipRule="evenodd"
      />
    </svg>
  );
}

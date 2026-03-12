'use client';

import { cn } from '@/utils/cn';
import { forwardRef } from 'react';

interface GlassSliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  showValue?: boolean;
}

export const GlassSlider = forwardRef<HTMLInputElement, GlassSliderProps>(
  ({ label, showValue = false, className, value, id, ...props }, ref) => {
    const sliderId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className={cn('flex flex-col gap-1.5', className)}>
        {(label || showValue) && (
          <div className="flex items-center justify-between">
            {label && (
              <label htmlFor={sliderId} className="text-sm font-medium text-foreground/80">
                {label}
              </label>
            )}
            {showValue && (
              <span className="text-sm tabular-nums text-muted">{value}</span>
            )}
          </div>
        )}
        <input
          ref={ref}
          id={sliderId}
          type="range"
          value={value}
          className={cn(
            'h-2 w-full cursor-pointer appearance-none rounded-full bg-foreground/10',
            '[&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5',
            '[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full',
            '[&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-md',
            '[&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white',
            '[&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110',
          )}
          {...props}
        />
      </div>
    );
  },
);

GlassSlider.displayName = 'GlassSlider';

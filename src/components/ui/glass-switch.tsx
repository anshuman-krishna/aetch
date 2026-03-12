'use client';

import { cn } from '@/utils/cn';
import { motion } from 'framer-motion';

interface GlassSwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export function GlassSwitch({
  checked,
  onCheckedChange,
  label,
  disabled = false,
  className,
}: GlassSwitchProps) {
  return (
    <label
      className={cn(
        'inline-flex items-center gap-2.5 cursor-pointer select-none',
        disabled && 'opacity-50 pointer-events-none',
        className,
      )}
    >
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onCheckedChange(!checked)}
        disabled={disabled}
        className={cn(
          'relative h-6 w-11 rounded-full transition-colors duration-200',
          checked ? 'bg-primary/80' : 'glass',
        )}
      >
        <motion.div
          layout
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className={cn(
            'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm',
            checked ? 'left-[22px]' : 'left-0.5',
          )}
        />
      </button>
      {label && <span className="text-sm text-foreground/80">{label}</span>}
    </label>
  );
}

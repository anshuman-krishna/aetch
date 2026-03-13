'use client';

import { GlassCard } from '@/components/ui/glass-card';
import { type PreviewTransform } from './tattoo-preview-canvas';
import { RotateCw, Maximize2, Eye } from 'lucide-react';

interface PreviewControlsProps {
  transform: PreviewTransform;
  onChange: (t: PreviewTransform) => void;
  disabled?: boolean;
}

export function PreviewControls({ transform, onChange, disabled }: PreviewControlsProps) {
  const update = (key: keyof PreviewTransform, value: number) => {
    onChange({ ...transform, [key]: value });
  };

  return (
    <GlassCard padding="sm" className="space-y-4">
      <p className="text-sm font-medium text-foreground">Adjust</p>

      {/* scale */}
      <ControlSlider
        icon={<Maximize2 className="h-4 w-4" />}
        label="Size"
        value={transform.scale}
        min={0.1}
        max={3}
        step={0.05}
        displayValue={`${Math.round(transform.scale * 100)}%`}
        onChange={(v) => update('scale', v)}
        disabled={disabled}
      />

      {/* rotation */}
      <ControlSlider
        icon={<RotateCw className="h-4 w-4" />}
        label="Rotation"
        value={transform.rotation}
        min={-180}
        max={180}
        step={1}
        displayValue={`${Math.round(transform.rotation)}°`}
        onChange={(v) => update('rotation', v)}
        disabled={disabled}
      />

      {/* opacity */}
      <ControlSlider
        icon={<Eye className="h-4 w-4" />}
        label="Opacity"
        value={transform.opacity}
        min={0.1}
        max={1}
        step={0.05}
        displayValue={`${Math.round(transform.opacity * 100)}%`}
        onChange={(v) => update('opacity', v)}
        disabled={disabled}
      />
    </GlassCard>
  );
}

interface ControlSliderProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  displayValue: string;
  onChange: (v: number) => void;
  disabled?: boolean;
}

function ControlSlider({
  icon,
  label,
  value,
  min,
  max,
  step,
  displayValue,
  onChange,
  disabled,
}: ControlSliderProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-muted">
          {icon} {label}
        </div>
        <span className="text-xs font-mono text-foreground/70">{displayValue}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        disabled={disabled}
        className="w-full accent-primary h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer disabled:opacity-40"
      />
    </div>
  );
}

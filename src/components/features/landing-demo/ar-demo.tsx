'use client';

import { GlassSlider } from '@/components/ui/glass-slider';
import { cn } from '@/utils/cn';
import { ImagePlus, RotateCcw } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { designs } from './designs';

interface Transform {
  x: number;
  y: number;
  scale: number;
  rotation: number;
  opacity: number;
}

const initial: Transform = { x: 0, y: 0, scale: 1, rotation: 0, opacity: 0.85 };

// client-only teaser of the ar feature — nothing leaves the browser
export function ArDemo() {
  const [design, setDesign] = useState(0);
  const [t, setT] = useState<Transform>(initial);
  const [photo, setPhoto] = useState<string | null>(null);
  const dragRef = useRef<{ px: number; py: number } | null>(null);

  // uploaded photo stays local; release the object url when it changes
  useEffect(() => {
    return () => {
      if (photo) URL.revokeObjectURL(photo);
    };
  }, [photo]);

  const onUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhoto((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
  };

  const onPointerDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { px: e.clientX, py: e.clientY };
  };

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragRef.current) return;
    const { px, py } = dragRef.current;
    const dx = e.clientX - px;
    const dy = e.clientY - py;
    dragRef.current = { px: e.clientX, py: e.clientY };
    setT((prev) => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
  }, []);

  const onPointerUp = (e: React.PointerEvent) => {
    e.currentTarget.releasePointerCapture(e.pointerId);
    dragRef.current = null;
  };

  return (
    <div className="grid gap-6 md:grid-cols-[1.2fr_1fr]">
      {/* stage */}
      <div
        className="relative aspect-[4/5] w-full touch-none overflow-hidden rounded-2xl border border-white/15"
        style={
          photo
            ? undefined
            : { background: 'linear-gradient(150deg, #f8d9c4 0%, #f1b69b 55%, #d98e75 100%)' }
        }
      >
        {photo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo} alt="Your photo" className="absolute inset-0 h-full w-full object-cover" />
        )}
        <div
          role="button"
          tabIndex={0}
          aria-label="Drag to position the tattoo"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          className="absolute left-1/2 top-1/2 h-2/5 w-2/5 cursor-grab text-[#1a1a2e] active:cursor-grabbing"
          style={{
            transform: `translate(-50%, -50%) translate(${t.x}px, ${t.y}px) scale(${t.scale}) rotate(${t.rotation}deg)`,
            opacity: t.opacity,
          }}
        >
          <svg viewBox="0 0 100 100" className="h-full w-full select-none drop-shadow-sm">
            {designs[design].art}
          </svg>
        </div>

        <label className="glass absolute bottom-3 right-3 inline-flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-white/20">
          <ImagePlus className="h-4 w-4" />
          {photo ? 'Change photo' : 'Use your photo'}
          <input type="file" accept="image/*" onChange={onUpload} className="sr-only" />
        </label>
      </div>

      {/* controls */}
      <div className="flex flex-col gap-5">
        <div>
          <p className="mb-2 text-sm font-medium text-foreground/80">Design</p>
          <div className="flex flex-wrap gap-2">
            {designs.map((d, i) => (
              <button
                key={d.id}
                onClick={() => setDesign(i)}
                aria-label={d.name}
                aria-pressed={i === design}
                className={cn(
                  'flex h-12 w-12 items-center justify-center rounded-xl border text-foreground transition-colors',
                  i === design
                    ? 'border-primary/50 bg-primary/15'
                    : 'border-white/15 hover:bg-white/10',
                )}
              >
                <svg viewBox="0 0 100 100" className="h-7 w-7">
                  {d.art}
                </svg>
              </button>
            ))}
          </div>
        </div>

        <GlassSlider
          label="Size"
          min={0.4}
          max={2}
          step={0.01}
          value={t.scale}
          onChange={(e) => setT((p) => ({ ...p, scale: Number(e.target.value) }))}
        />
        <GlassSlider
          label="Rotation"
          min={-180}
          max={180}
          step={1}
          value={t.rotation}
          onChange={(e) => setT((p) => ({ ...p, rotation: Number(e.target.value) }))}
        />
        <GlassSlider
          label="Opacity"
          min={0.2}
          max={1}
          step={0.01}
          value={t.opacity}
          onChange={(e) => setT((p) => ({ ...p, opacity: Number(e.target.value) }))}
        />

        <button
          onClick={() => setT(initial)}
          className="glass inline-flex items-center justify-center gap-2 self-start rounded-xl px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-white/20"
        >
          <RotateCcw className="h-4 w-4" />
          Reset
        </button>
      </div>
    </div>
  );
}

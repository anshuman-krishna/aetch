'use client';

import { GlassCard } from '@/components/ui/glass-card';
import { GlassBadge } from '@/components/ui/glass-badge';
import { GlassButton } from '@/components/ui/glass-button';
import { STYLE_LABELS, PLACEMENT_LABELS } from '@/lib/validations';
import { Bookmark, Download } from 'lucide-react';
import Image from 'next/image';

export interface AIGenerationData {
  id: string;
  prompt: string;
  imageUrl: string | null;
  style: string | null;
  placement: string | null;
  colorType: string | null;
  status: string;
  createdAt: string;
}

interface AIGenerationCardProps {
  generation: AIGenerationData;
  onSave?: (gen: AIGenerationData) => void;
}

export function AIGenerationCard({ generation, onSave }: AIGenerationCardProps) {
  const styleLabel = generation.style ? STYLE_LABELS[generation.style] : null;
  const placementLabel = generation.placement ? PLACEMENT_LABELS[generation.placement] : null;
  const isPending = generation.status === 'PENDING';
  const isFailed = generation.status === 'FAILED';

  return (
    <GlassCard padding="sm" className="overflow-hidden">
      {/* image */}
      {generation.imageUrl ? (
        <div className="relative aspect-square rounded-xl overflow-hidden bg-black/20">
          <Image
            src={generation.imageUrl}
            alt={generation.prompt}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 400px"
          />
        </div>
      ) : (
        <div className="aspect-square rounded-xl bg-white/5 flex items-center justify-center">
          <p className="text-sm text-muted">
            {isPending ? 'Generating...' : isFailed ? 'Failed' : 'No image'}
          </p>
        </div>
      )}

      {/* meta */}
      <div className="p-3 space-y-2">
        <p className="text-sm text-foreground line-clamp-2">{generation.prompt}</p>

        <div className="flex flex-wrap gap-1">
          {styleLabel && <GlassBadge size="sm">{styleLabel}</GlassBadge>}
          {placementLabel && <GlassBadge size="sm">{placementLabel}</GlassBadge>}
          {isFailed && <GlassBadge variant="warning" size="sm">Failed</GlassBadge>}
        </div>

        <p className="text-xs text-muted">
          {new Date(generation.createdAt).toLocaleDateString()}
        </p>

        {/* actions */}
        {generation.imageUrl && (
          <div className="flex gap-2 pt-1">
            {onSave && (
              <GlassButton variant="ghost" size="sm" onClick={() => onSave(generation)}>
                <Bookmark className="h-3.5 w-3.5" /> Save
              </GlassButton>
            )}
            <a href={generation.imageUrl} target="_blank" rel="noopener noreferrer">
              <GlassButton variant="ghost" size="sm">
                <Download className="h-3.5 w-3.5" /> Download
              </GlassButton>
            </a>
          </div>
        )}
      </div>
    </GlassCard>
  );
}

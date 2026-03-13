'use client';

import { GlassCard } from '@/components/ui/glass-card';
import { GlassBadge } from '@/components/ui/glass-badge';
import { GlassButton } from '@/components/ui/glass-button';
import { PLACEMENT_LABELS } from '@/lib/validations';
import { Trash2, Download } from 'lucide-react';
import Image from 'next/image';

export interface PreviewData {
  id: string;
  bodyImageUrl: string;
  tattooImageUrl: string;
  previewImageUrl: string | null;
  placement: string | null;
  positionX: number;
  positionY: number;
  scale: number;
  rotation: number;
  opacity: number;
  createdAt: string;
}

interface PreviewHistoryCardProps {
  preview: PreviewData;
  onDelete?: (id: string) => void;
}

export function PreviewHistoryCard({ preview, onDelete }: PreviewHistoryCardProps) {
  const displayUrl = preview.previewImageUrl ?? preview.bodyImageUrl;
  const placementLabel = preview.placement ? PLACEMENT_LABELS[preview.placement] : null;

  return (
    <GlassCard padding="sm" className="overflow-hidden">
      <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-black/20">
        <Image
          src={displayUrl}
          alt="tattoo preview"
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, 400px"
        />
      </div>

      <div className="p-3 space-y-2">
        <div className="flex flex-wrap gap-1">
          {placementLabel && <GlassBadge size="sm">{placementLabel}</GlassBadge>}
          <GlassBadge size="sm">{Math.round(preview.scale * 100)}% size</GlassBadge>
        </div>

        <p className="text-xs text-muted">
          {new Date(preview.createdAt).toLocaleDateString()}
        </p>

        <div className="flex gap-2 pt-1">
          {preview.previewImageUrl && (
            <a href={preview.previewImageUrl} target="_blank" rel="noopener noreferrer">
              <GlassButton variant="ghost" size="sm">
                <Download className="h-3.5 w-3.5" />
              </GlassButton>
            </a>
          )}
          {onDelete && (
            <GlassButton variant="ghost" size="sm" onClick={() => onDelete(preview.id)}>
              <Trash2 className="h-3.5 w-3.5" />
            </GlassButton>
          )}
        </div>
      </div>
    </GlassCard>
  );
}

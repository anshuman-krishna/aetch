'use client';

import { useEffect, useState } from 'react';
import { GlassCard } from '@/components/ui/glass-card';

interface PreviewData {
  url: string;
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
}

interface Props {
  url: string;
  className?: string;
}

export function LinkPreviewCard({ url, className }: Props) {
  const [preview, setPreview] = useState<PreviewData | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/link-preview?url=${encodeURIComponent(url)}`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (data?.preview) setPreview(data.preview);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [url]);

  if (!preview || (!preview.title && !preview.description && !preview.image)) return null;

  return (
    <a
      href={preview.url}
      target="_blank"
      rel="noopener noreferrer"
      className={className ?? 'block'}
    >
      <GlassCard padding="sm" className="overflow-hidden hover:bg-white/10 transition">
        <div className="flex gap-3">
          {preview.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview.image}
              alt={preview.title ?? 'Link preview'}
              className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
              loading="lazy"
            />
          )}
          <div className="min-w-0 flex-1">
            {preview.siteName && (
              <p className="text-[10px] uppercase tracking-wider text-muted">{preview.siteName}</p>
            )}
            {preview.title && (
              <p className="text-sm font-medium text-foreground line-clamp-2 mt-0.5">
                {preview.title}
              </p>
            )}
            {preview.description && (
              <p className="text-xs text-muted line-clamp-2 mt-1">{preview.description}</p>
            )}
          </div>
        </div>
      </GlassCard>
    </a>
  );
}

'use client';

import { useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { PageContainer } from '@/components/layouts/page-container';
import { GlassButton } from '@/components/ui/glass-button';
import { GlassCard } from '@/components/ui/glass-card';
import { useToast } from '@/components/ui/glass-toast';
import { BodyImageUploader } from '@/components/features/ar/body-image-uploader';
import { TattooSelector } from '@/components/features/ar/tattoo-selector';
import {
  TattooPreviewCanvas,
  type PreviewTransform,
} from '@/components/features/ar/tattoo-preview-canvas';
import { PreviewControls } from '@/components/features/ar/preview-controls';
import { PreviewExportButton } from '@/components/features/ar/preview-export-button';
import { History, ScanEye } from 'lucide-react';
import Link from 'next/link';
import { BODY_PLACEMENTS, PLACEMENT_LABELS } from '@/lib/validations';

const DEFAULT_TRANSFORM: PreviewTransform = {
  positionX: 50,
  positionY: 50,
  scale: 1,
  rotation: 0,
  opacity: 0.85,
};

export default function ARPreviewPage() {
  const { data: session, status } = useSession();
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [bodyImage, setBodyImage] = useState<string | null>(null);
  const [tattooImage, setTattooImage] = useState<string | null>(null);
  const [transform, setTransform] = useState<PreviewTransform>(DEFAULT_TRANSFORM);
  const [placement, setPlacement] = useState<string>('');
  const [saving, setSaving] = useState(false);

  if (status === 'loading') return null;
  if (!session?.user) redirect('/login?callbackUrl=/app/ar-preview');

  const canPreview = !!bodyImage && !!tattooImage;

  const handleSave = async (dataUrl: string) => {
    setSaving(true);
    try {
      const res = await fetch('/api/ar-preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bodyImageUrl: bodyImage,
          tattooImageUrl: tattooImage,
          previewImageUrl: dataUrl,
          placement: placement || undefined,
          ...transform,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? 'Save failed');
      }

      toast('Preview saved!', 'success');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Save failed';
      toast(msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setTransform(DEFAULT_TRANSFORM);
  };

  return (
    <PageContainer size="xl">
      <div className="py-8 sm:py-12 space-y-8">
        {/* header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-h2 text-foreground">AR Tattoo Preview</h1>
            <p className="mt-1 text-muted">See how a tattoo looks on your body</p>
          </div>
          <Link href="/app/ar-preview/history">
            <GlassButton variant="ghost" size="sm">
              <History className="h-4 w-4" /> History
            </GlassButton>
          </Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr,400px]">
          {/* canvas area */}
          <div className="space-y-4">
            {canPreview ? (
              <GlassCard padding="sm">
                <TattooPreviewCanvas
                  bodyImageUrl={bodyImage}
                  tattooImageUrl={tattooImage}
                  transform={transform}
                  onTransformChange={setTransform}
                  className="w-full h-auto rounded-xl"
                  ref={canvasRef}
                />
              </GlassCard>
            ) : (
              <GlassCard padding="lg">
                <div className="flex flex-col items-center gap-4 py-16 text-center">
                  <div className="rounded-full glass-strong p-6">
                    <ScanEye className="h-12 w-12 text-muted" />
                  </div>
                  <div>
                    <p className="text-foreground font-medium">Upload both images</p>
                    <p className="text-sm text-muted mt-1">
                      Add a body photo and tattoo design to preview
                    </p>
                  </div>
                </div>
              </GlassCard>
            )}

            {/* actions */}
            {canPreview && (
              <div className="flex items-center justify-between">
                <PreviewExportButton canvasRef={canvasRef} onSave={handleSave} />
                <GlassButton variant="ghost" size="sm" onClick={handleReset}>
                  Reset Position
                </GlassButton>
              </div>
            )}
          </div>

          {/* sidebar controls */}
          <div className="space-y-4">
            <BodyImageUploader imageUrl={bodyImage} onImageSelect={setBodyImage} />
            <TattooSelector selectedUrl={tattooImage} onSelect={setTattooImage} />

            {/* placement selector */}
            <GlassCard padding="sm" className="space-y-2">
              <p className="text-sm font-medium text-foreground">Body Placement</p>
              <select
                value={placement}
                onChange={(e) => setPlacement(e.target.value)}
                className="w-full glass rounded-xl px-4 py-2.5 text-sm text-foreground bg-transparent"
              >
                <option value="">Select placement</option>
                {BODY_PLACEMENTS.map((p) => (
                  <option key={p} value={p}>
                    {PLACEMENT_LABELS[p]}
                  </option>
                ))}
              </select>
            </GlassCard>

            {canPreview && (
              <PreviewControls transform={transform} onChange={setTransform} disabled={saving} />
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

'use client';

import { useState } from 'react';
import { GlassButton } from '@/components/ui/glass-button';
import { Download, Save } from 'lucide-react';

interface PreviewExportButtonProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  onSave?: (dataUrl: string) => void;
}

export function PreviewExportButton({ canvasRef, onSave }: PreviewExportButtonProps) {
  const [saving, setSaving] = useState(false);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `tattoo-preview-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
  };

  const handleSave = async () => {
    if (!onSave || !canvasRef.current) return;
    setSaving(true);
    try {
      const dataUrl = canvasRef.current.toDataURL('image/png');
      onSave(dataUrl);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex gap-2">
      <GlassButton variant="ghost" size="sm" onClick={handleDownload}>
        <Download className="h-4 w-4" /> Download
      </GlassButton>
      {onSave && (
        <GlassButton variant="primary" size="sm" onClick={handleSave} loading={saving}>
          <Save className="h-4 w-4" /> Save Preview
        </GlassButton>
      )}
    </div>
  );
}

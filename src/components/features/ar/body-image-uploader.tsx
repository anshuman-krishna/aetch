'use client';

import { useRef, useState } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { GlassButton } from '@/components/ui/glass-button';
import { Upload, X } from 'lucide-react';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 10 * 1024 * 1024;

interface BodyImageUploaderProps {
  imageUrl: string | null;
  onImageSelect: (url: string | null) => void;
}

export function BodyImageUploader({ imageUrl, onImageSelect }: BodyImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = (file: File) => {
    setError(null);

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Use JPEG, PNG, or WebP');
      return;
    }
    if (file.size > MAX_SIZE) {
      setError('Image must be under 10MB');
      return;
    }

    // create local object url
    const url = URL.createObjectURL(file);
    onImageSelect(url);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const clear = () => {
    onImageSelect(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  if (imageUrl) {
    return (
      <div className="relative">
        <GlassCard padding="sm">
          <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-black/20">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageUrl} alt="body" className="w-full h-full object-cover" />
          </div>
        </GlassCard>
        <GlassButton variant="danger" size="sm" className="absolute top-2 right-2" onClick={clear}>
          <X className="h-3.5 w-3.5" />
        </GlassButton>
      </div>
    );
  }

  return (
    <div>
      <GlassCard
        padding="lg"
        className="cursor-pointer hover:bg-white/10 transition-colors"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <div className="rounded-full glass-strong p-4">
            <Upload className="h-8 w-8 text-muted" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Upload body photo</p>
            <p className="text-xs text-muted mt-1">JPEG, PNG, or WebP up to 10MB</p>
          </div>
        </div>
      </GlassCard>
      {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleChange}
      />
    </div>
  );
}

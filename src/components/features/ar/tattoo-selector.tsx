'use client';

import { useState } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { GlassButton } from '@/components/ui/glass-button';
import { GlassInput } from '@/components/ui/glass-input';
import { Image as ImageIcon, Sparkles, Link2 } from 'lucide-react';

type SourceTab = 'url' | 'upload' | 'ai';

interface TattooSelectorProps {
  onSelect: (url: string) => void;
  selectedUrl: string | null;
}

export function TattooSelector({ onSelect, selectedUrl }: TattooSelectorProps) {
  const [tab, setTab] = useState<SourceTab>('upload');
  const [urlInput, setUrlInput] = useState('');

  const tabs: { key: SourceTab; label: string; icon: React.ReactNode }[] = [
    { key: 'upload', label: 'Upload', icon: <ImageIcon className="h-3.5 w-3.5" /> },
    { key: 'url', label: 'URL', icon: <Link2 className="h-3.5 w-3.5" /> },
    { key: 'ai', label: 'AI Generated', icon: <Sparkles className="h-3.5 w-3.5" /> },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    onSelect(url);
  };

  const handleUrlSubmit = () => {
    if (!urlInput.trim()) return;
    try {
      new URL(urlInput);
      onSelect(urlInput.trim());
    } catch {
      // invalid url
    }
  };

  return (
    <GlassCard padding="sm" className="space-y-3">
      <p className="text-sm font-medium text-foreground">Select Tattoo</p>

      {/* tab bar */}
      <div className="flex gap-1">
        {tabs.map((t) => (
          <GlassButton
            key={t.key}
            variant={tab === t.key ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setTab(t.key)}
          >
            {t.icon} {t.label}
          </GlassButton>
        ))}
      </div>

      {/* tab content */}
      {tab === 'upload' && (
        <div>
          <label className="block cursor-pointer">
            <div className="glass rounded-xl p-6 text-center hover:bg-white/10 transition-colors">
              <ImageIcon className="h-6 w-6 text-muted mx-auto mb-2" />
              <p className="text-xs text-muted">Upload tattoo image</p>
            </div>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleFileUpload}
            />
          </label>
        </div>
      )}

      {tab === 'url' && (
        <div className="flex gap-2">
          <GlassInput
            placeholder="Paste image URL"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            className="flex-1"
          />
          <GlassButton variant="primary" size="sm" onClick={handleUrlSubmit}>
            Load
          </GlassButton>
        </div>
      )}

      {tab === 'ai' && (
        <div className="glass rounded-xl p-6 text-center">
          <Sparkles className="h-6 w-6 text-muted mx-auto mb-2" />
          <p className="text-xs text-muted">
            Generate a tattoo design first, then use it here
          </p>
          <a href="/ai">
            <GlassButton variant="ghost" size="sm" className="mt-2">
              Go to AI Generator
            </GlassButton>
          </a>
        </div>
      )}

      {/* selected preview */}
      {selectedUrl && (
        <div className="relative aspect-square max-w-[120px] rounded-xl overflow-hidden bg-black/20 border-2 border-primary/40">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={selectedUrl} alt="tattoo" className="w-full h-full object-contain" />
        </div>
      )}
    </GlassCard>
  );
}

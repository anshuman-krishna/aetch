'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/utils/cn';
import { GlassCard } from '@/components/ui/glass-card';
import { GlassButton } from '@/components/ui/glass-button';
import { GlassInput } from '@/components/ui/glass-input';
import { GlassTextarea } from '@/components/ui/glass-textarea';
import { FormError } from '@/components/forms/form-error';
import {
  TATTOO_STYLES,
  BODY_PLACEMENTS,
  COLOR_TYPES,
  STYLE_LABELS,
  PLACEMENT_LABELS,
} from '@/lib/validations';
import { Upload } from 'lucide-react';
import Image from 'next/image';

export function TattooUploadForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [bodyPlacement, setBodyPlacement] = useState('');
  const [colorType, setColorType] = useState('COLOR');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggleStyle = (style: string) => {
    setSelectedStyles((prev) =>
      prev.includes(style)
        ? prev.filter((s) => s !== style)
        : prev.length < 5
          ? [...prev, style]
          : prev,
    );
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
    if (!allowedTypes.includes(file.type)) {
      setError('Please select a JPEG, PNG, WebP, or AVIF image.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Image must be under 10MB.');
      return;
    }

    setImageFile(file);
    setError('');
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!imageFile) {
      setError('Please select an image.');
      return;
    }
    if (!title.trim()) {
      setError('Title is required.');
      return;
    }
    if (selectedStyles.length === 0) {
      setError('Select at least one style.');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('title', title.trim());
      if (description.trim()) formData.append('description', description.trim());
      selectedStyles.forEach((s) => formData.append('styles', s));
      if (bodyPlacement) formData.append('bodyPlacement', bodyPlacement);
      formData.append('colorType', colorType);

      const res = await fetch('/api/tattoos', { method: 'POST', body: formData });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Upload failed. Please try again.');
        return;
      }

      router.push(`/app/tattoo/${data.tattoo.slug}`);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <FormError message={error} />}

      {/* Image Upload */}
      <GlassCard variant="subtle" padding="md">
        <h3 className="text-sm font-semibold text-foreground/80 mb-3">Tattoo Image</h3>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          onChange={handleImageSelect}
          className="hidden"
        />

        {imagePreview ? (
          <div className="relative">
            <div className="relative w-full max-w-md mx-auto aspect-[3/4] rounded-xl overflow-hidden glass">
              <Image
                src={imagePreview}
                alt="Preview"
                fill
                className="object-cover"
              />
            </div>
            <div className="flex justify-center mt-3">
              <GlassButton
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setImageFile(null);
                  setImagePreview(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
              >
                Remove image
              </GlassButton>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              'w-full flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border/50 p-12',
              'hover:border-primary/40 hover:bg-white/5 transition-all duration-200 cursor-pointer',
            )}
          >
            <div className="rounded-full glass-strong p-4">
              <Upload className="h-8 w-8 text-muted" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">Click to upload</p>
              <p className="text-xs text-muted mt-1">JPEG, PNG, WebP, AVIF up to 10MB</p>
            </div>
          </button>
        )}
      </GlassCard>

      {/* Title & Description */}
      <GlassCard variant="subtle" padding="md" className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground/80">Details</h3>
        <GlassInput
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Japanese dragon half-sleeve"
          required
          maxLength={120}
        />
        <GlassTextarea
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe this tattoo — inspiration, techniques, story..."
          rows={3}
          maxLength={2000}
        />
      </GlassCard>

      {/* Styles */}
      <GlassCard variant="subtle" padding="md">
        <h3 className="text-sm font-semibold text-foreground/80 mb-1">
          Styles <span className="text-muted font-normal">({selectedStyles.length}/5)</span>
        </h3>
        <p className="text-xs text-muted mb-3">Select 1–5 styles that describe this tattoo.</p>
        <div className="flex flex-wrap gap-2">
          {TATTOO_STYLES.map((style) => (
            <button
              key={style}
              type="button"
              onClick={() => toggleStyle(style)}
              className={cn(
                'rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200',
                selectedStyles.includes(style)
                  ? 'bg-primary/90 text-white border border-primary-light/30'
                  : 'glass hover:bg-white/20 text-foreground/80',
              )}
            >
              {STYLE_LABELS[style]}
            </button>
          ))}
        </div>
      </GlassCard>

      {/* Placement & Color */}
      <GlassCard variant="subtle" padding="md" className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground/80">Placement & Color</h3>

        <div>
          <label className="text-sm font-medium text-foreground/80 mb-2 block">Body Placement</label>
          <div className="flex flex-wrap gap-2">
            {BODY_PLACEMENTS.map((placement) => (
              <button
                key={placement}
                type="button"
                onClick={() => setBodyPlacement(bodyPlacement === placement ? '' : placement)}
                className={cn(
                  'rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200',
                  bodyPlacement === placement
                    ? 'bg-primary/90 text-white border border-primary-light/30'
                    : 'glass hover:bg-white/20 text-foreground/80',
                )}
              >
                {PLACEMENT_LABELS[placement]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-foreground/80 mb-2 block">Color Type</label>
          <div className="flex gap-2">
            {COLOR_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setColorType(type)}
                className={cn(
                  'rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200',
                  colorType === type
                    ? 'bg-primary/90 text-white border border-primary-light/30'
                    : 'glass hover:bg-white/20 text-foreground/80',
                )}
              >
                {type === 'BLACK_AND_GREY'
                  ? 'Black & Grey'
                  : type.charAt(0) + type.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>
      </GlassCard>

      {/* Submit */}
      <GlassButton
        type="submit"
        variant="primary"
        size="lg"
        className="w-full"
        loading={loading}
      >
        Upload Tattoo
      </GlassButton>
    </form>
  );
}

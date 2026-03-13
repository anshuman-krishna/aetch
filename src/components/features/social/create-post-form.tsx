'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GlassCard } from '@/components/ui/glass-card';
import { GlassButton } from '@/components/ui/glass-button';
import { GlassTextarea } from '@/components/ui/glass-textarea';
import { GlassInput } from '@/components/ui/glass-input';
import { FormError } from '@/components/forms/form-error';
import { ImagePlus, X } from 'lucide-react';

export function CreatePostForm() {
  const router = useRouter();
  const [caption, setCaption] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase().replace(/^#/, '');
    if (tag && !tags.includes(tag) && tags.length < 10) {
      setTags([...tags, tag]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!caption.trim() && !imageUrl.trim()) {
      setError('Add a caption or image.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caption: caption.trim() || undefined,
          imageUrl: imageUrl.trim() || undefined,
          tags: tags.length > 0 ? tags : undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? 'Failed to create post.');
        return;
      }

      router.push('/feed');
    } catch {
      setError('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && <FormError message={error} />}

      <GlassCard variant="subtle" padding="md" className="space-y-4">
        <GlassTextarea
          label="Caption"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Share your tattoo story..."
          rows={4}
          maxLength={2000}
        />

        <GlassInput
          label="Image URL"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="https://..."
          type="url"
        />
        {!imageUrl && (
          <p className="text-xs text-muted flex items-center gap-1">
            <ImagePlus className="h-3 w-3" /> paste an image url
          </p>
        )}
      </GlassCard>

      {/* tags */}
      <GlassCard variant="subtle" padding="md">
        <label className="text-sm font-medium text-foreground/80 mb-2 block">Tags</label>
        <div className="flex gap-2">
          <GlassInput
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
            placeholder="Add tags (press Enter)"
            className="flex-1"
          />
          <GlassButton type="button" variant="ghost" size="sm" onClick={addTag}>
            Add
          </GlassButton>
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {tags.map((tag) => (
              <span key={tag} className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs glass text-foreground/80">
                #{tag}
                <button type="button" onClick={() => removeTag(tag)}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </GlassCard>

      <GlassButton type="submit" variant="primary" size="lg" className="w-full" loading={loading}>
        Create Post
      </GlassButton>
    </form>
  );
}

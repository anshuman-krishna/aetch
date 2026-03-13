'use client';

import { useState } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { GlassButton } from '@/components/ui/glass-button';
import { GlassTextarea } from '@/components/ui/glass-textarea';
import { FormError } from '@/components/forms/form-error';
import { AIStyleSelector } from './ai-style-selector';
import { AIPlacementSelector } from './ai-placement-selector';
import { COLOR_TYPES, AI_COMPLEXITIES } from '@/lib/validations';
import { cn } from '@/utils/cn';
import { Sparkles } from 'lucide-react';

const COLOR_LABELS: Record<string, string> = {
  COLOR: 'Full Color',
  BLACK_AND_GREY: 'Black & Grey',
  MIXED: 'Mixed',
};

const COMPLEXITY_LABELS: Record<string, string> = {
  simple: 'Simple',
  moderate: 'Moderate',
  detailed: 'Detailed',
  complex: 'Complex',
};

interface AIPromptFormProps {
  onGenerate: (result: GenerationResult) => void;
}

export interface GenerationResult {
  id: string;
  prompt: string;
  imageUrl: string | null;
  style: string | null;
  placement: string | null;
  status: string;
  createdAt: string;
}

export function AIPromptForm({ onGenerate }: AIPromptFormProps) {
  const [idea, setIdea] = useState('');
  const [style, setStyle] = useState('');
  const [placement, setPlacement] = useState('');
  const [colorType, setColorType] = useState('');
  const [complexity, setComplexity] = useState('moderate');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!idea.trim() || idea.trim().length < 5) {
      setError('Describe your tattoo idea (5+ characters).');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idea: idea.trim(),
          style: style || undefined,
          placement: placement || undefined,
          colorType: colorType || undefined,
          complexity,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Generation failed.');
        return;
      }

      onGenerate(data.generation);
    } catch {
      setError('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && <FormError message={error} />}

      <GlassCard variant="subtle" padding="md">
        <GlassTextarea
          label="Tattoo Idea"
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          placeholder="Describe your tattoo idea... e.g. Japanese dragon with cherry blossoms"
          rows={4}
          maxLength={500}
          required
        />
      </GlassCard>

      <GlassCard variant="subtle" padding="md">
        <AIStyleSelector value={style} onChange={setStyle} />
      </GlassCard>

      <GlassCard variant="subtle" padding="md">
        <AIPlacementSelector value={placement} onChange={setPlacement} />
      </GlassCard>

      {/* color type */}
      <GlassCard variant="subtle" padding="md">
        <label className="text-sm font-medium text-foreground/80 mb-2 block">Color Type</label>
        <div className="flex flex-wrap gap-2">
          {COLOR_TYPES.map((ct) => (
            <button
              key={ct}
              type="button"
              onClick={() => setColorType(colorType === ct ? '' : ct)}
              className={cn(
                'rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200',
                colorType === ct
                  ? 'bg-primary/90 text-white border border-primary-light/30'
                  : 'glass hover:bg-white/20 text-foreground/80',
              )}
            >
              {COLOR_LABELS[ct]}
            </button>
          ))}
        </div>
      </GlassCard>

      {/* complexity */}
      <GlassCard variant="subtle" padding="md">
        <label className="text-sm font-medium text-foreground/80 mb-2 block">Complexity</label>
        <div className="flex flex-wrap gap-2">
          {AI_COMPLEXITIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setComplexity(c)}
              className={cn(
                'rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200',
                complexity === c
                  ? 'bg-primary/90 text-white border border-primary-light/30'
                  : 'glass hover:bg-white/20 text-foreground/80',
              )}
            >
              {COMPLEXITY_LABELS[c]}
            </button>
          ))}
        </div>
      </GlassCard>

      <GlassButton
        type="submit"
        variant="primary"
        size="lg"
        className="w-full"
        loading={loading}
      >
        <Sparkles className="h-4 w-4" /> Generate Tattoo Design
      </GlassButton>
    </form>
  );
}

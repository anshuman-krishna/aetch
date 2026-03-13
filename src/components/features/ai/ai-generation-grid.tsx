'use client';

import { AIGenerationCard, type AIGenerationData } from './ai-generation-card';
import { EmptyState } from '@/components/ui/empty-state';
import { GlassSkeleton } from '@/components/ui/glass-skeleton';
import { Sparkles } from 'lucide-react';

interface AIGenerationGridProps {
  generations: AIGenerationData[];
  loading?: boolean;
  onSave?: (gen: AIGenerationData) => void;
}

export function AIGenerationGrid({ generations, loading = false, onSave }: AIGenerationGridProps) {
  if (loading) return <AIGridSkeleton />;

  if (generations.length === 0) {
    return (
      <EmptyState
        icon={Sparkles}
        title="No generations yet"
        description="Describe your tattoo idea to get started."
      />
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {generations.map((gen) => (
        <AIGenerationCard key={gen.id} generation={gen} onSave={onSave} />
      ))}
    </div>
  );
}

function AIGridSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <GlassSkeleton key={i} className="h-72 rounded-2xl" />
      ))}
    </div>
  );
}

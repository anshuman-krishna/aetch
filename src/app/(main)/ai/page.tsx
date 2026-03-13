'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { PageContainer } from '@/components/layouts/page-container';
import { AIPromptForm, type GenerationResult } from '@/components/features/ai/ai-prompt-form';
import { AIGenerationGrid } from '@/components/features/ai/ai-generation-grid';
import { type AIGenerationData } from '@/components/features/ai/ai-generation-card';
import { GlassButton } from '@/components/ui/glass-button';
import { useToast } from '@/components/ui/glass-toast';
import { History } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default function AIGeneratorPage() {
  const { data: session, status } = useSession();
  const { toast } = useToast();
  const [generations, setGenerations] = useState<AIGenerationData[]>([]);

  if (status === 'loading') return null;
  if (!session?.user) redirect('/login?callbackUrl=/ai');

  const handleGenerate = (result: GenerationResult) => {
    setGenerations((prev) => [result as AIGenerationData, ...prev]);
    toast('Design generated!', 'success');
  };

  const handleSave = async (gen: AIGenerationData) => {
    if (!gen.imageUrl) return;
    toast('Saved to inspiration!', 'success');
  };

  return (
    <PageContainer>
      <div className="py-8 sm:py-12 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-h2 text-foreground">AI Tattoo Generator</h1>
            <p className="mt-1 text-muted">Describe your idea and let AI create it</p>
          </div>
          <Link href="/ai/history">
            <GlassButton variant="ghost" size="sm">
              <History className="h-4 w-4" /> History
            </GlassButton>
          </Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr,1fr]">
          {/* prompt form */}
          <div>
            <AIPromptForm onGenerate={handleGenerate} />
          </div>

          {/* results */}
          <div className="space-y-4">
            <h2 className="text-h4 text-foreground">Generated Designs</h2>
            <AIGenerationGrid generations={generations} onSave={handleSave} />
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import { PageContainer } from '@/components/layouts/page-container';
import { AIGenerationGrid } from '@/components/features/ai/ai-generation-grid';
import { type AIGenerationData } from '@/components/features/ai/ai-generation-card';
import { GlassButton } from '@/components/ui/glass-button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AIHistoryPage() {
  const [generations, setGenerations] = useState<AIGenerationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const fetchHistory = useCallback(async (pageNum: number, reset = false) => {
    setLoading(true);
    const res = await fetch(`/api/ai/history?page=${pageNum}`);
    const data = await res.json();
    const items = data.generations ?? [];

    setGenerations((prev) => reset ? items : [...prev, ...items]);
    setHasMore(data.pagination?.hasNext ?? false);
    setLoading(false);
  }, []);

  useEffect(() => { fetchHistory(1, true); }, [fetchHistory]);

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchHistory(next);
  };

  return (
    <PageContainer>
      <div className="py-8 sm:py-12 space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/app/ai">
            <GlassButton variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </GlassButton>
          </Link>
          <div>
            <h1 className="text-h2 text-foreground">Generation History</h1>
            <p className="mt-1 text-muted">Your past AI tattoo designs</p>
          </div>
        </div>

        <AIGenerationGrid
          generations={generations}
          loading={loading && generations.length === 0}
        />

        {!loading && hasMore && (
          <div className="flex justify-center pt-4">
            <GlassButton variant="ghost" size="md" onClick={loadMore}>
              Load More
            </GlassButton>
          </div>
        )}
      </div>
    </PageContainer>
  );
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import { PageContainer } from '@/components/layouts/page-container';
import { PreviewHistoryCard, type PreviewData } from '@/components/features/ar/preview-history-card';
import { EmptyState } from '@/components/ui/empty-state';
import { GlassButton } from '@/components/ui/glass-button';
import { GlassSkeleton } from '@/components/ui/glass-skeleton';
import { useToast } from '@/components/ui/glass-toast';
import { ArrowLeft, ScanEye } from 'lucide-react';
import Link from 'next/link';

export default function ARPreviewHistoryPage() {
  const { toast } = useToast();
  const [previews, setPreviews] = useState<PreviewData[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const fetchHistory = useCallback(async (pageNum: number, reset = false) => {
    setLoading(true);
    const res = await fetch(`/api/ar-preview/history?page=${pageNum}`);
    const data = await res.json();
    const items = data.previews ?? [];

    setPreviews((prev) => reset ? items : [...prev, ...items]);
    setHasMore(data.pagination?.hasNext ?? false);
    setLoading(false);
  }, []);

  useEffect(() => { fetchHistory(1, true); }, [fetchHistory]);

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchHistory(next);
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/ar-preview/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setPreviews((prev) => prev.filter((p) => p.id !== id));
      toast('Preview deleted', 'success');
    } else {
      toast('Failed to delete', 'error');
    }
  };

  return (
    <PageContainer>
      <div className="py-8 sm:py-12 space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/ar-preview">
            <GlassButton variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </GlassButton>
          </Link>
          <div>
            <h1 className="text-h2 text-foreground">Preview History</h1>
            <p className="mt-1 text-muted">Your saved AR tattoo previews</p>
          </div>
        </div>

        {loading && previews.length === 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <GlassSkeleton key={i} className="h-80 rounded-2xl" />
            ))}
          </div>
        ) : previews.length === 0 ? (
          <EmptyState
            icon={ScanEye}
            title="No previews yet"
            description="Create your first AR tattoo preview to see it here."
            action={
              <Link href="/ar-preview">
                <GlassButton variant="primary" size="sm">Create Preview</GlassButton>
              </Link>
            }
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {previews.map((preview) => (
              <PreviewHistoryCard key={preview.id} preview={preview} onDelete={handleDelete} />
            ))}
          </div>
        )}

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

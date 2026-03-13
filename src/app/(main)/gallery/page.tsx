'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { PageContainer } from '@/components/layouts/page-container';
import { TattooGrid } from '@/components/features/gallery/tattoo-grid';
import { TattooFilters, type FilterState } from '@/components/features/gallery/tattoo-filters';
import { GlassButton } from '@/components/ui/glass-button';
import { GlassInput } from '@/components/ui/glass-input';
import type { TattooCardData } from '@/components/features/gallery/tattoo-card';
import type { PaginationMeta } from '@/utils/pagination';

export default function GalleryPage() {
  const [tattoos, setTattoos] = useState<TattooCardData[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    styles: [],
    bodyPlacement: '',
    colorType: '',
    sort: 'latest',
  });
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const buildQueryString = useCallback(
    (page: number) => {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', '20');
      params.set('sort', filters.sort);
      if (search) params.set('search', search);
      if (filters.bodyPlacement) params.set('bodyPlacement', filters.bodyPlacement);
      if (filters.colorType) params.set('colorType', filters.colorType);
      filters.styles.forEach((s) => params.append('styles', s));
      return params.toString();
    },
    [filters, search],
  );

  const fetchTattoos = useCallback(
    async (page: number, append = false) => {
      if (append) setLoadingMore(true);
      else setLoading(true);

      try {
        const res = await fetch(`/api/tattoos?${buildQueryString(page)}`);
        const data = await res.json();

        if (data.success) {
          setTattoos((prev) => (append ? [...prev, ...data.tattoos] : data.tattoos));
          setPagination(data.pagination);
        }
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [buildQueryString],
  );

  // fetch on filter/search change
  useEffect(() => {
    fetchTattoos(1);
  }, [fetchTattoos]);

  // infinite scroll observer
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && pagination?.hasNext && !loadingMore) {
          fetchTattoos(pagination.page + 1, true);
        }
      },
      { rootMargin: '200px' },
    );

    if (sentinelRef.current) {
      observerRef.current.observe(sentinelRef.current);
    }

    return () => observerRef.current?.disconnect();
  }, [pagination, loadingMore, fetchTattoos]);

  // debounced search
  const [searchInput, setSearchInput] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  return (
    <PageContainer size="xl" animate={false}>
      <div className="py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-h2 text-foreground">Discover Tattoos</h1>
          <p className="mt-2 text-muted">
            Explore thousands of tattoo designs from artists worldwide.
          </p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <GlassInput
            placeholder="Search tattoos..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="max-w-md"
          />
        </div>

        {/* Filters */}
        <TattooFilters filters={filters} onChange={setFilters} className="mb-8" />

        {/* Grid */}
        <TattooGrid tattoos={tattoos} loading={loading} />

        {/* Infinite Scroll Sentinel */}
        {pagination?.hasNext && (
          <div ref={sentinelRef} className="flex justify-center py-8">
            {loadingMore && (
              <GlassButton variant="ghost" size="sm" loading>
                Loading more...
              </GlassButton>
            )}
          </div>
        )}

        {/* End of results */}
        {pagination && !pagination.hasNext && tattoos.length > 0 && (
          <p className="text-center text-sm text-muted py-8">
            You&apos;ve seen all {pagination.total} tattoos
          </p>
        )}
      </div>
    </PageContainer>
  );
}

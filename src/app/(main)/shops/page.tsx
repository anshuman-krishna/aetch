'use client';

import { useState, useEffect, useCallback } from 'react';
import { PageContainer } from '@/components/layouts/page-container';
import { ShopGrid } from '@/components/features/shops/shop-grid';
import { GlassInput } from '@/components/ui/glass-input';
import { GlassButton } from '@/components/ui/glass-button';
import { type ShopCardData } from '@/components/features/shops/shop-card';
import { Search, MapPin } from 'lucide-react';

export default function ShopsPage() {
  const [shops, setShops] = useState<ShopCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchShops = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set('page', String(page));
    if (search.trim()) params.set('search', search.trim());
    if (city.trim()) params.set('city', city.trim());

    const res = await fetch(`/api/shops?${params}`);
    const data = await res.json();
    setShops(data.shops ?? []);
    setTotalPages(data.pagination?.totalPages ?? 1);
    setLoading(false);
  }, [page, search, city]);

  useEffect(() => { fetchShops(); }, [fetchShops]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchShops();
  };

  return (
    <PageContainer>
      <div className="py-8 sm:py-12 space-y-6">
        <div>
          <h1 className="text-h2 text-foreground">Tattoo Shops</h1>
          <p className="mt-1 text-muted">Discover shops and book your next tattoo</p>
        </div>

        {/* filters */}
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted pointer-events-none" />
            <GlassInput
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search shops..."
              className="pl-9"
            />
          </div>
          <div className="relative flex-1 sm:max-w-[200px]">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted pointer-events-none" />
            <GlassInput
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="City"
              className="pl-9"
            />
          </div>
          <GlassButton type="submit" variant="primary" size="md">
            Search
          </GlassButton>
        </form>

        <ShopGrid shops={shops} loading={loading} />

        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            <GlassButton
              variant="ghost"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </GlassButton>
            <span className="flex items-center text-sm text-muted px-3">
              {page} / {totalPages}
            </span>
            <GlassButton
              variant="ghost"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </GlassButton>
          </div>
        )}
      </div>
    </PageContainer>
  );
}

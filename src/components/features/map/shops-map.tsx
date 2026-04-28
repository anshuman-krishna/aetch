'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import { GlassCard } from '@/components/ui/glass-card';
import { GlassBadge } from '@/components/ui/glass-badge';
import { GlassInput } from '@/components/ui/glass-input';

interface ShopFeature {
  id: string;
  slug: string;
  name: string;
  city?: string | null;
  country?: string | null;
  image?: string | null;
  verified: boolean;
  lng: number;
  lat: number;
}

interface ShopsMapProps {
  styleUrl?: string;
}

interface MaplibreMarker {
  setLngLat: (l: [number, number]) => MaplibreMarker;
  setPopup: (p: unknown) => MaplibreMarker;
  addTo: (m: unknown) => MaplibreMarker;
}

interface MaplibreLib {
  Map: new (opts: unknown) => unknown;
  Marker: new () => MaplibreMarker;
  Popup: new (opts?: unknown) => { setHTML: (s: string) => unknown };
  LngLatBounds: new () => {
    extend: (l: [number, number]) => unknown;
    isEmpty: () => boolean;
  };
}

declare global {
  interface Window {
    maplibregl?: MaplibreLib;
  }
}

const FALLBACK_STYLE = 'https://demotiles.maplibre.org/style.json';

export function ShopsMap({ styleUrl }: ShopsMapProps) {
  const [shops, setShops] = useState<ShopFeature[]>([]);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState<ShopFeature | null>(null);
  const [scriptReady, setScriptReady] = useState(false);

  useEffect(() => {
    fetch('/api/shops/map')
      .then((r) => r.json())
      .then((data) => setShops(data.shops ?? []))
      .catch(() => setShops([]));
  }, []);

  // initialize maplibre once both shop data + script have loaded
  useEffect(() => {
    if (!scriptReady || !shops.length) return;
    const ml = window.maplibregl;
    if (!ml) return;
    const map = new ml.Map({
      container: 'shops-map',
      style: styleUrl || FALLBACK_STYLE,
      center: [shops[0].lng, shops[0].lat],
      zoom: 1.5,
      cooperativeGestures: true,
    });
    const bounds = new ml.LngLatBounds();
    for (const s of shops) {
      const popup = new ml.Popup({ offset: 24 }).setHTML(
        `<a href="/app/shop/${s.slug}" class="font-medium underline">${escapeHtml(s.name)}</a>` +
          (s.city ? `<div class="text-xs text-muted">${escapeHtml(s.city)}</div>` : ''),
      );
      new ml.Marker().setLngLat([s.lng, s.lat]).setPopup(popup).addTo(map);
      bounds.extend([s.lng, s.lat]);
    }
    if (!bounds.isEmpty()) {
      // @ts-expect-error map is the maplibre instance, fitBounds exists at runtime
      map.fitBounds(bounds, { padding: 40, maxZoom: 6, duration: 0 });
    }
  }, [scriptReady, shops, styleUrl]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return shops;
    return shops.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.city?.toLowerCase().includes(q) ||
        s.country?.toLowerCase().includes(q),
    );
  }, [query, shops]);

  return (
    <div className="space-y-4">
      <Script
        src="https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.js"
        strategy="afterInteractive"
        onLoad={() => setScriptReady(true)}
      />
      <link
        rel="stylesheet"
        href="https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.css"
      />

      <GlassCard padding="md">
        <GlassInput
          placeholder="Filter by name, city, country…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </GlassCard>

      <div className="grid lg:grid-cols-[2fr,1fr] gap-4">
        <div
          id="shops-map"
          className="h-[500px] rounded-2xl overflow-hidden border border-white/10 glass"
          aria-label="Map of tattoo shops worldwide"
        />

        <GlassCard padding="md" className="space-y-3 max-h-[500px] overflow-y-auto">
          <p className="text-xs text-muted">
            {filtered.length} shop{filtered.length === 1 ? '' : 's'}
          </p>
          {filtered.map((shop) => (
            <button
              key={shop.id}
              onClick={() => setActive(shop)}
              className="w-full text-left rounded-lg p-2 hover:bg-white/10 transition"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">{shop.name}</span>
                {shop.verified && <GlassBadge variant="success">Verified</GlassBadge>}
              </div>
              {shop.city && <p className="text-xs text-muted">{shop.city}</p>}
            </button>
          ))}
          {active && (
            <Link
              href={`/app/shop/${active.slug}`}
              className="block text-center text-sm text-primary mt-2 underline"
            >
              View {active.name} →
            </Link>
          )}
        </GlassCard>
      </div>
    </div>
  );
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

import { GlassCard } from '@/components/ui/glass-card';
import { ShopsMap } from '@/components/features/map/shops-map';
import { isFeatureEnabled } from '@/lib/feature-flags';

export const metadata = {
  title: 'Tattoo Shops Map — AETCH',
  description: 'Discover tattoo shops near you on the global AETCH map.',
};

export default function MapPage() {
  if (!isFeatureEnabled('MAP_ENABLED')) {
    return (
      <div className="mx-auto max-w-xl px-6 py-16">
        <GlassCard padding="lg" className="text-center">
          <h1 className="text-h2 text-foreground mb-2">Shops Map</h1>
          <p className="text-muted">
            This feature is coming soon. Set <code>FF_MAP=true</code> to enable it.
          </p>
        </GlassCard>
      </div>
    );
  }

  const styleUrl = process.env.NEXT_PUBLIC_MAP_STYLE_URL;

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 space-y-6">
      <div>
        <h1 className="text-h2 text-foreground">Tattoo Shops</h1>
        <p className="mt-1 text-muted">Browse studios on the global map.</p>
      </div>
      <ShopsMap styleUrl={styleUrl} />
    </div>
  );
}

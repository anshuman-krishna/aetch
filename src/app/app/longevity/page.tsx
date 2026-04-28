import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { isFeatureEnabled } from '@/lib/feature-flags';
import { GlassCard } from '@/components/ui/glass-card';
import { LongevitySimulator } from '@/components/features/longevity/longevity-simulator';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Longevity Simulator — AETCH',
  description: 'See how a tattoo will age over 1, 5, and 10 years.',
};

export default async function LongevityPage() {
  const session = await auth();
  if (!session?.user) redirect('/login?callbackUrl=/app/longevity');

  if (!isFeatureEnabled('LONGEVITY_ENABLED')) {
    return (
      <div className="mx-auto max-w-xl px-6 py-16">
        <GlassCard padding="lg" className="text-center">
          <h1 className="text-h2 text-foreground mb-2">Longevity Simulator</h1>
          <p className="text-muted">
            This feature is coming soon. Set <code>FF_LONGEVITY=true</code> to enable it.
          </p>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-10 space-y-6">
      <div>
        <h1 className="text-h2 text-foreground">Longevity Simulator</h1>
        <p className="mt-1 text-muted">Preview how a tattoo will age over time.</p>
      </div>
      <LongevitySimulator />
    </div>
  );
}

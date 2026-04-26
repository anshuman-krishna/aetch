import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { isFeatureEnabled } from '@/lib/feature-flags';
import { GlassCard } from '@/components/ui/glass-card';
import { CoverupForm } from '@/components/features/coverup/coverup-form';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Coverup Finder — AETCH',
  description: 'Generate coverup design ideas for an existing tattoo.',
};

export default async function CoverupPage() {
  const session = await auth();
  if (!session?.user) redirect('/login?callbackUrl=/app/coverup');

  if (!isFeatureEnabled('COVERUP_ENABLED')) {
    return (
      <div className="mx-auto max-w-xl px-6 py-16">
        <GlassCard padding="lg" className="text-center">
          <h1 className="text-h2 text-foreground mb-2">Coverup Finder</h1>
          <p className="text-muted">
            This feature is coming soon. Set <code>FF_COVERUP=true</code> to enable it.
          </p>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-10 space-y-6">
      <div>
        <h1 className="text-h2 text-foreground">Coverup Finder</h1>
        <p className="mt-1 text-muted">
          Describe your existing tattoo and we&apos;ll generate coverup design ideas.
        </p>
      </div>
      <CoverupForm />
    </div>
  );
}

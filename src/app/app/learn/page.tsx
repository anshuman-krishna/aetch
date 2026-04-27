import Link from 'next/link';
import { GlassCard } from '@/components/ui/glass-card';
import { listLearnEntries } from '@/backend/services/learn-service';
import { isFeatureEnabled } from '@/lib/feature-flags';

export const metadata = {
  title: 'Tattoo Learn — AETCH',
  description: 'Tattoo education hub: prep, aftercare, styles, and more.',
};

export default async function LearnPage() {
  if (!isFeatureEnabled('LEARN_ENABLED')) {
    return (
      <div className="mx-auto max-w-xl px-6 py-16">
        <GlassCard padding="lg" className="text-center">
          <h1 className="text-h2 text-foreground mb-2">Learn</h1>
          <p className="text-muted">Coming soon. Set <code>FF_LEARN=true</code> to enable.</p>
        </GlassCard>
      </div>
    );
  }

  const entries = await listLearnEntries();

  return (
    <div className="mx-auto max-w-3xl px-6 py-10 space-y-6">
      <div>
        <h1 className="text-h2 text-foreground">Tattoo Learn</h1>
        <p className="mt-1 text-muted">
          Short, opinionated guides curated by AETCH artists.
        </p>
      </div>

      <div className="grid gap-3">
        {entries.map((entry) => (
          <Link key={entry.slug} href={`/app/learn/${entry.slug}`}>
            <GlassCard padding="md" className="hover:bg-white/10 transition">
              <h2 className="text-h4 text-foreground">{entry.title}</h2>
              {entry.description && (
                <p className="text-sm text-muted mt-1">{entry.description}</p>
              )}
            </GlassCard>
          </Link>
        ))}
      </div>
    </div>
  );
}

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { GlassCard } from '@/components/ui/glass-card';
import { getLearnEntry, renderMarkdown, listLearnEntries } from '@/backend/services/learn-service';
import { isFeatureEnabled } from '@/lib/feature-flags';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const entries = await listLearnEntries();
  return entries.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const entry = await getLearnEntry(slug);
  if (!entry) return { title: 'Not found' };
  return {
    title: `${entry.title} — AETCH Learn`,
    description: entry.description,
  };
}

export default async function LearnEntryPage({ params }: Props) {
  if (!isFeatureEnabled('LEARN_ENABLED')) notFound();

  const { slug } = await params;
  const entry = await getLearnEntry(slug);
  if (!entry) notFound();

  const html = renderMarkdown(entry.body);

  return (
    <div className="mx-auto max-w-2xl px-6 py-10 space-y-6">
      <Link href="/app/learn" className="text-sm text-muted hover:text-foreground">
        ← Back to Learn
      </Link>
      <GlassCard padding="lg">
        <article
          className="prose-aetch text-foreground/90 text-sm leading-relaxed"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </GlassCard>
    </div>
  );
}

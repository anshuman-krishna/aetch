import Link from 'next/link';
import { GlassCard } from '@/components/ui/glass-card';

export default function AppNotFound() {
  return (
    <div className="mx-auto max-w-md px-6 py-20">
      <GlassCard variant="strong" padding="lg" className="text-center">
        <h2 className="text-h2 text-foreground mb-2">Page Not Found</h2>
        <p className="text-sm text-muted mb-6">
          The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link
          href="/app/gallery"
          className="inline-flex rounded-xl bg-primary/90 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary"
        >
          Go to Gallery
        </Link>
      </GlassCard>
    </div>
  );
}

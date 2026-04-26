import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { GlassCard } from '@/components/ui/glass-card';
import { GlassBadge } from '@/components/ui/glass-badge';
import { getPostsByTag } from '@/backend/services/post-service';
import { getPaginationParams } from '@/utils/pagination';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `#${slug} — AETCH`,
    description: `Posts tagged #${slug} on AETCH.`,
    openGraph: {
      title: `#${slug} on AETCH`,
      description: `Discover tattoos and posts tagged #${slug}.`,
    },
  };
}

export default async function HashtagPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const sp = await searchParams;
  if (!/^[a-z0-9_-]{1,50}$/i.test(slug)) notFound();

  const pagination = getPaginationParams(Number(sp.page ?? 1) || 1, 24);
  const result = await getPostsByTag(slug, pagination);

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 space-y-6">
      <div className="flex items-baseline gap-3">
        <h1 className="text-h2 text-foreground">#{result.tag}</h1>
        <GlassBadge variant="primary">{result.pagination.total} posts</GlassBadge>
      </div>

      {result.posts.length === 0 ? (
        <GlassCard padding="lg" className="text-center text-muted">
          No posts yet. Be the first to tag something with{' '}
          <span className="text-foreground">#{result.tag}</span>.
        </GlassCard>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {result.posts.map((post) => (
            <li key={post.id}>
              <Link href={`/app/post/${post.id}`}>
                <GlassCard padding="md" className="hover:bg-white/15 transition-colors">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm text-foreground">
                      {post.author.username ?? post.author.name ?? 'user'}
                    </span>
                  </div>
                  {post.caption && (
                    <p className="text-sm text-muted line-clamp-3">{post.caption}</p>
                  )}
                </GlassCard>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

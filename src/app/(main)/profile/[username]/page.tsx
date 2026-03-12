import { notFound } from 'next/navigation';
import { getUserByUsername } from '@/backend/services/user-service';
import { GlassCard } from '@/components/ui/glass-card';
import { GlassAvatar } from '@/components/ui/glass-avatar';
import { GlassBadge } from '@/components/ui/glass-badge';
import { PageContainer } from '@/components/layouts/page-container';

interface Props {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { username } = await params;
  const user = await getUserByUsername(username);
  if (!user) return { title: 'User not found' };
  return { title: user.name ?? user.username };
}

export default async function ProfilePage({ params }: Props) {
  const { username } = await params;
  const user = await getUserByUsername(username);
  if (!user) notFound();

  const roleLabel = {
    USER: 'Enthusiast',
    ARTIST: 'Artist',
    SHOP_OWNER: 'Shop Owner',
    ADMIN: 'Admin',
  }[user.role];

  return (
    <PageContainer animate={false}>
      <div className="py-12">
        <GlassCard variant="strong" padding="lg" className="text-center">
          <GlassAvatar
            src={user.image}
            alt={user.name ?? user.username ?? ''}
            size="xl"
            className="mx-auto"
          />
          <h1 className="mt-4 text-h3 text-foreground">{user.name ?? user.username}</h1>
          {user.username && (
            <p className="text-sm text-muted">@{user.username}</p>
          )}
          <div className="mt-2 flex justify-center gap-2">
            <GlassBadge variant="primary">{roleLabel}</GlassBadge>
            {user.artist?.verified && <GlassBadge variant="success">Verified</GlassBadge>}
          </div>
          {user.bio && <p className="mt-4 text-sm text-muted max-w-md mx-auto">{user.bio}</p>}

          {/* Stats */}
          <div className="mt-6 flex justify-center gap-8">
            <div className="text-center">
              <p className="text-lg font-bold text-foreground">{user._count.posts}</p>
              <p className="text-xs text-muted">Posts</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-foreground">{user._count.followers}</p>
              <p className="text-xs text-muted">Followers</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-foreground">{user._count.following}</p>
              <p className="text-xs text-muted">Following</p>
            </div>
          </div>
        </GlassCard>

        {/* Favorite Styles */}
        {user.favoriteStyles.length > 0 && (
          <GlassCard padding="md" className="mt-6">
            <h2 className="text-h4 text-foreground mb-3">Favorite Styles</h2>
            <div className="flex flex-wrap gap-2">
              {user.favoriteStyles.map((style) => (
                <GlassBadge key={style}>{style}</GlassBadge>
              ))}
            </div>
          </GlassCard>
        )}
      </div>
    </PageContainer>
  );
}

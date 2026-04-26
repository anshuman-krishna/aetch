import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getUserByUsername } from '@/backend/services/user-service';
import { isFollowing } from '@/backend/services/follow-service';
import { GlassCard } from '@/components/ui/glass-card';
import { GlassAvatar } from '@/components/ui/glass-avatar';
import { GlassBadge } from '@/components/ui/glass-badge';
import { PageContainer } from '@/components/layouts/page-container';
import { FollowButton } from '@/components/features/social/follow-button';
import { ProfileTabs } from '@/components/features/social/profile-tabs';

export const dynamic = 'force-dynamic';

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

  const session = await auth();
  const isOwnProfile = session?.user?.id === user.id;
  const followingUser =
    session?.user && !isOwnProfile ? await isFollowing(session.user.id, user.id) : false;

  const roleLabels: Record<string, string> = {
    USER: 'Enthusiast',
    ARTIST: 'Artist',
    SHOP_OWNER: 'Shop Owner',
    ADMIN: 'Admin',
  };
  const primaryRole = (user.roles ?? ['USER'])[0];
  const roleLabel = roleLabels[primaryRole] ?? 'Enthusiast';

  return (
    <PageContainer animate={false}>
      <div className="py-12 space-y-6">
        <GlassCard variant="strong" padding="lg" className="text-center">
          <GlassAvatar
            src={user.image}
            alt={user.name ?? user.username ?? ''}
            size="xl"
            className="mx-auto"
          />
          <h1 className="mt-4 text-h3 text-foreground">{user.name ?? user.username}</h1>
          {user.username && <p className="text-sm text-muted">@{user.username}</p>}
          <div className="mt-2 flex justify-center gap-2">
            <GlassBadge variant="primary">{roleLabel}</GlassBadge>
            {user.artist?.verified && <GlassBadge variant="success">Verified</GlassBadge>}
          </div>
          {user.bio && <p className="mt-4 text-sm text-muted max-w-md mx-auto">{user.bio}</p>}

          {/* stats */}
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

          {/* follow button */}
          {!isOwnProfile && session?.user && (
            <div className="mt-4">
              <FollowButton userId={user.id} initialFollowing={followingUser} />
            </div>
          )}
        </GlassCard>

        {/* styles */}
        {user.favoriteStyles.length > 0 && (
          <GlassCard padding="md">
            <h2 className="text-h4 text-foreground mb-3">Favorite Styles</h2>
            <div className="flex flex-wrap gap-2">
              {user.favoriteStyles.map((style) => (
                <GlassBadge key={style}>{style}</GlassBadge>
              ))}
            </div>
          </GlassCard>
        )}

        {/* social tabs */}
        <ProfileTabs userId={user.id} />
      </div>
    </PageContainer>
  );
}

'use client';

import { GlassCard } from '@/components/ui/glass-card';
import { GlassAvatar } from '@/components/ui/glass-avatar';
import { GlassBadge } from '@/components/ui/glass-badge';
import { GlassButton } from '@/components/ui/glass-button';
import { Trash2 } from 'lucide-react';
import Link from 'next/link';

interface ShopArtistItem {
  id: string;
  role: string;
  artist: {
    id: string;
    displayName: string;
    slug: string;
    specialties: string[];
    user: { name: string | null; image: string | null; username: string | null };
    _count?: { tattoos: number; reviews: number };
  };
}

interface ShopArtistsListProps {
  artists: ShopArtistItem[];
  editable?: boolean;
  onRemove?: (artistId: string) => void;
}

const roleBadge: Record<string, 'primary' | 'success' | 'warning' | 'default'> = {
  OWNER: 'primary',
  LEAD_ARTIST: 'success',
  ARTIST: 'default',
  GUEST: 'warning',
  APPRENTICE: 'default',
};

export function ShopArtistsList({ artists, editable = false, onRemove }: ShopArtistsListProps) {
  if (artists.length === 0) {
    return <p className="text-sm text-muted py-4">No artists in this shop yet.</p>;
  }

  return (
    <div className="space-y-3">
      {artists.map((sa) => (
        <GlassCard key={sa.id} padding="sm" className="flex items-center gap-3">
          <Link href={`/app/artist/${sa.artist.slug}`} className="flex items-center gap-3 flex-1 min-w-0">
            <GlassAvatar
              src={sa.artist.user.image}
              alt={sa.artist.displayName}
              size="md"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground truncate">
                  {sa.artist.displayName}
                </span>
                <GlassBadge variant={roleBadge[sa.role] ?? 'default'} size="sm">
                  {sa.role.replace('_', ' ').toLowerCase()}
                </GlassBadge>
              </div>
              {sa.artist.specialties.length > 0 && (
                <p className="text-xs text-muted truncate">
                  {sa.artist.specialties.slice(0, 3).join(', ')}
                </p>
              )}
            </div>
          </Link>

          {editable && sa.role !== 'OWNER' && onRemove && (
            <GlassButton
              variant="ghost"
              size="sm"
              onClick={() => onRemove(sa.artist.id)}
            >
              <Trash2 className="h-4 w-4" />
            </GlassButton>
          )}
        </GlassCard>
      ))}
    </div>
  );
}

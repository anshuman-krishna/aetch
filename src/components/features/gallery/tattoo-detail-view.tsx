'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { GlassCard } from '@/components/ui/glass-card';
import { GlassButton } from '@/components/ui/glass-button';
import { GlassBadge } from '@/components/ui/glass-badge';
import { GlassAvatar } from '@/components/ui/glass-avatar';
import { STYLE_LABELS, PLACEMENT_LABELS } from '@/lib/validations';
import { Heart, Eye, Bookmark, BadgeCheck } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface TattooDetailArtist {
  id: string;
  displayName: string;
  slug: string;
  verified: boolean;
  user: {
    image: string | null;
    username: string | null;
  };
}

interface TattooDetailData {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  imageUrl: string;
  blurDataUrl: string | null;
  styles: string[];
  bodyPlacement: string | null;
  colorType: string;
  likesCount: number;
  viewsCount: number;
  artist: TattooDetailArtist;
}

interface TattooDetailViewProps {
  tattoo: TattooDetailData;
  initialLiked: boolean;
  initialSaved: boolean;
}

export function TattooDetailView({ tattoo, initialLiked, initialSaved }: TattooDetailViewProps) {
  const { data: session } = useSession();
  const [liked, setLiked] = useState(initialLiked);
  const [saved, setSaved] = useState(initialSaved);
  const [likesCount, setLikesCount] = useState(tattoo.likesCount);
  const [likeLoading, setLikeLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  const handleLike = async () => {
    if (!session || likeLoading) return;
    setLikeLoading(true);
    try {
      const res = await fetch(`/api/tattoos/${tattoo.id}/like`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setLiked(data.liked);
        setLikesCount((c) => (data.liked ? c + 1 : c - 1));
      }
    } finally {
      setLikeLoading(false);
    }
  };

  const handleSave = async () => {
    if (!session || saveLoading) return;
    setSaveLoading(true);
    try {
      const res = await fetch(`/api/tattoos/${tattoo.id}/save`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setSaved(data.saved);
      }
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
      {/* Image Column */}
      <div className="lg:col-span-3">
        <GlassCard variant="subtle" padding="sm" className="overflow-hidden">
          <div className="relative w-full rounded-xl overflow-hidden" style={{ minHeight: '400px' }}>
            <Image
              src={tattoo.imageUrl}
              alt={tattoo.title}
              fill
              sizes="(max-width: 1024px) 100vw, 60vw"
              className="object-contain"
              placeholder={tattoo.blurDataUrl ? 'blur' : 'empty'}
              blurDataURL={tattoo.blurDataUrl ?? undefined}
              priority
            />
          </div>
        </GlassCard>
      </div>

      {/* Info Column */}
      <div className="lg:col-span-2 space-y-5">
        {/* Title + Actions */}
        <GlassCard variant="strong" padding="md">
          <h1 className="text-h3 text-foreground">{tattoo.title}</h1>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 mt-4">
            <GlassButton
              variant={liked ? 'primary' : 'default'}
              size="sm"
              onClick={handleLike}
              disabled={!session}
            >
              <Heart className={`h-4 w-4 ${liked ? 'fill-current' : ''}`} />
              {likesCount}
            </GlassButton>

            <GlassButton
              variant={saved ? 'secondary' : 'default'}
              size="sm"
              onClick={handleSave}
              disabled={!session}
            >
              <Bookmark className={`h-4 w-4 ${saved ? 'fill-current' : ''}`} />
              {saved ? 'Saved' : 'Save'}
            </GlassButton>

            <div className="flex items-center gap-1 text-xs text-muted ml-auto">
              <Eye className="h-4 w-4" />
              {tattoo.viewsCount} views
            </div>
          </div>
        </GlassCard>

        {/* Artist Card */}
        <Link href={`/app/artist/${tattoo.artist.slug}`}>
          <GlassCard padding="md" className="hover:bg-white/20 transition-colors">
            <div className="flex items-center gap-3">
              <GlassAvatar
                src={tattoo.artist.user.image}
                alt={tattoo.artist.displayName}
                size="lg"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-foreground">
                    {tattoo.artist.displayName}
                  </span>
                  {tattoo.artist.verified && (
                    <BadgeCheck className="h-4 w-4 text-primary" />
                  )}
                </div>
                {tattoo.artist.user.username && (
                  <p className="text-xs text-muted">@{tattoo.artist.user.username}</p>
                )}
              </div>
              <GlassButton variant="ghost" size="sm" className="ml-auto">
                View Profile
              </GlassButton>
            </div>
          </GlassCard>
        </Link>

        {/* Description */}
        {tattoo.description && (
          <GlassCard padding="md">
            <h3 className="text-sm font-semibold text-foreground/80 mb-2">Description</h3>
            <p className="text-sm text-muted whitespace-pre-line">{tattoo.description}</p>
          </GlassCard>
        )}

        {/* Styles */}
        <GlassCard padding="md">
          <h3 className="text-sm font-semibold text-foreground/80 mb-2">Styles</h3>
          <div className="flex flex-wrap gap-2">
            {tattoo.styles.map((style) => (
              <Link key={style} href={`/app/gallery?styles=${style}`}>
                <GlassBadge variant="primary" size="md">
                  {STYLE_LABELS[style] ?? style}
                </GlassBadge>
              </Link>
            ))}
          </div>
        </GlassCard>

        {/* Details */}
        <GlassCard padding="md">
          <h3 className="text-sm font-semibold text-foreground/80 mb-2">Details</h3>
          <div className="space-y-2 text-sm">
            {tattoo.bodyPlacement && (
              <div className="flex justify-between">
                <span className="text-muted">Placement</span>
                <span className="text-foreground">
                  {PLACEMENT_LABELS[tattoo.bodyPlacement] ?? tattoo.bodyPlacement}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted">Color Type</span>
              <span className="text-foreground">
                {tattoo.colorType === 'BLACK_AND_GREY'
                  ? 'Black & Grey'
                  : tattoo.colorType.charAt(0) + tattoo.colorType.slice(1).toLowerCase()}
              </span>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}


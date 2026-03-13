'use client';

import { cn } from '@/utils/cn';
import { GlassBadge } from '@/components/ui/glass-badge';
import { GlassAvatar } from '@/components/ui/glass-avatar';
import { STYLE_LABELS } from '@/lib/validations';
import { Heart, Eye, BadgeCheck } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useState } from 'react';

interface TattooCardArtist {
  displayName: string;
  slug: string;
  verified: boolean;
  user: {
    image: string | null;
    username: string | null;
  };
}

export interface TattooCardData {
  id: string;
  title: string;
  slug: string;
  imageUrl: string;
  thumbnailUrl: string | null;
  blurDataUrl: string | null;
  styles: string[];
  bodyPlacement: string | null;
  likesCount: number;
  viewsCount: number;
  artist: TattooCardArtist;
}

interface TattooCardProps {
  tattoo: TattooCardData;
  priority?: boolean;
  className?: string;
}

export function TattooCard({ tattoo, priority = false, className }: TattooCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className={cn('group relative', className)}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      layout
    >
      <Link href={`/tattoo/${tattoo.slug}`} className="block">
        <div className="relative overflow-hidden rounded-2xl glass">
          <div className="relative aspect-[3/4]">
            <Image
              src={tattoo.thumbnailUrl ?? tattoo.imageUrl}
              alt={tattoo.title}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className={cn(
                'object-cover transition-all duration-500',
                imageLoaded ? 'opacity-100' : 'opacity-0',
                'group-hover:scale-105',
              )}
              placeholder={tattoo.blurDataUrl ? 'blur' : 'empty'}
              blurDataURL={tattoo.blurDataUrl ?? undefined}
              priority={priority}
              onLoad={() => setImageLoaded(true)}
            />

            {!imageLoaded && (
              <div className="absolute inset-0 animate-pulse bg-foreground/5" />
            )}

            {/* hover overlay */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent"
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered ? 1 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="font-semibold text-white text-sm line-clamp-1">
                  {tattoo.title}
                </h3>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="flex items-center gap-1 text-xs text-white/80">
                    <Heart className="h-3.5 w-3.5" />
                    {tattoo.likesCount}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-white/80">
                    <Eye className="h-3.5 w-3.5" />
                    {tattoo.viewsCount}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </Link>

      {/* artist info */}
      <div className="mt-2.5 px-0.5">
        <Link
          href={`/artist/${tattoo.artist.slug}`}
          className="flex items-center gap-2 group/artist"
        >
          <GlassAvatar
            src={tattoo.artist.user.image}
            alt={tattoo.artist.displayName}
            size="sm"
          />
          <span className="text-xs text-muted group-hover/artist:text-foreground transition-colors truncate">
            {tattoo.artist.displayName}
          </span>
          {tattoo.artist.verified && (
            <BadgeCheck className="h-3.5 w-3.5 text-primary shrink-0" />
          )}
        </Link>

        {tattoo.styles.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {tattoo.styles.slice(0, 2).map((style) => (
              <GlassBadge key={style} variant="default" size="sm">
                {STYLE_LABELS[style] ?? style}
              </GlassBadge>
            ))}
            {tattoo.styles.length > 2 && (
              <GlassBadge variant="default" size="sm">
                +{tattoo.styles.length - 2}
              </GlassBadge>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

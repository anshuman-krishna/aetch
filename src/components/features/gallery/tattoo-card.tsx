'use client';

import { cn } from '@/utils/cn';
import { GlassBadge } from '@/components/ui/glass-badge';
import { GlassAvatar } from '@/components/ui/glass-avatar';
import { STYLE_LABELS } from '@/lib/validations';
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
        {/* Image Container */}
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

            {/* Skeleton */}
            {!imageLoaded && (
              <div className="absolute inset-0 animate-pulse bg-foreground/5" />
            )}

            {/* Hover Overlay */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent"
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered ? 1 : 0 }}
              transition={{ duration: 0.2 }}
            >
              {/* Bottom Info */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="font-semibold text-white text-sm line-clamp-1">
                  {tattoo.title}
                </h3>

                {/* Stats */}
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="flex items-center gap-1 text-xs text-white/80">
                    <HeartIcon className="h-3.5 w-3.5" />
                    {tattoo.likesCount}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-white/80">
                    <EyeIcon className="h-3.5 w-3.5" />
                    {tattoo.viewsCount}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </Link>

      {/* Below Card Info */}
      <div className="mt-2.5 px-0.5">
        {/* Artist */}
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
            <VerifiedIcon className="h-3.5 w-3.5 text-primary shrink-0" />
          )}
        </Link>

        {/* Style Tags */}
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

function HeartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor">
      <path
        fillRule="evenodd"
        d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor">
      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
      <path
        fillRule="evenodd"
        d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function VerifiedIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor">
      <path
        fillRule="evenodd"
        d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
        clipRule="evenodd"
      />
    </svg>
  );
}

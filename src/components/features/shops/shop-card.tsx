import { GlassCard } from '@/components/ui/glass-card';
import { GlassAvatar } from '@/components/ui/glass-avatar';
import { GlassBadge } from '@/components/ui/glass-badge';
import { MapPin, Users, Star } from 'lucide-react';
import Link from 'next/link';

export interface ShopCardData {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  city: string | null;
  country: string | null;
  verified: boolean;
  shopArtists: { id: string }[];
  _count: { reviews: number; bookings: number };
}

interface ShopCardProps {
  shop: ShopCardData;
}

export function ShopCard({ shop }: ShopCardProps) {
  const location = [shop.city, shop.country].filter(Boolean).join(', ');

  return (
    <Link href={`/shop/${shop.slug}`}>
      <GlassCard padding="md" className="hover:bg-white/15 transition-colors h-full">
        <div className="flex items-start gap-4">
          <GlassAvatar
            src={shop.image}
            alt={shop.name}
            fallback={shop.name.slice(0, 2).toUpperCase()}
            size="lg"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-foreground truncate">{shop.name}</h3>
              {shop.verified && <GlassBadge variant="success" size="sm">Verified</GlassBadge>}
            </div>

            {location && (
              <p className="flex items-center gap-1 text-xs text-muted mt-1">
                <MapPin className="h-3 w-3" />
                {location}
              </p>
            )}

            <div className="flex items-center gap-4 mt-3">
              <span className="flex items-center gap-1 text-xs text-muted">
                <Users className="h-3.5 w-3.5" />
                {shop.shopArtists.length} artists
              </span>
              <span className="flex items-center gap-1 text-xs text-muted">
                <Star className="h-3.5 w-3.5" />
                {shop._count.reviews} reviews
              </span>
            </div>
          </div>
        </div>
      </GlassCard>
    </Link>
  );
}

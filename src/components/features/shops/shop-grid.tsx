'use client';

import { ShopCard, type ShopCardData } from './shop-card';
import { EmptyState } from '@/components/ui/empty-state';
import { GlassSkeleton } from '@/components/ui/glass-skeleton';
import { Store } from 'lucide-react';
import { motion } from 'framer-motion';
import { staggerContainer, staggerItem } from '@/lib/animations';

interface ShopGridProps {
  shops: ShopCardData[];
  loading?: boolean;
}

export function ShopGrid({ shops, loading = false }: ShopGridProps) {
  if (loading) return <ShopGridSkeleton />;

  if (shops.length === 0) {
    return (
      <EmptyState
        icon={Store}
        title="No shops found"
        description="Try adjusting your search or check back later."
      />
    );
  }

  return (
    <motion.div
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      {shops.map((shop) => (
        <motion.div key={shop.id} variants={staggerItem}>
          <ShopCard shop={shop} />
        </motion.div>
      ))}
    </motion.div>
  );
}

function ShopGridSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <GlassSkeleton key={i} className="h-32 rounded-2xl" />
      ))}
    </div>
  );
}

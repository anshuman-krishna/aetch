import { Skeleton } from '@/components/ui/skeleton';

// gallery skeleton grid
const heights = ['h-64', 'h-80', 'h-72', 'h-60', 'h-76', 'h-68', 'h-80', 'h-64', 'h-72'];

export default function GalleryLoading() {
  return (
    <div className="p-6">
      <Skeleton className="h-10 w-48 mb-6" />
      <div className="flex gap-3 mb-8">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-24 rounded-full" />
        ))}
      </div>
      <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
        {heights.map((h, i) => (
          <Skeleton key={i} className={`${h} w-full rounded-2xl break-inside-avoid`} />
        ))}
      </div>
    </div>
  );
}

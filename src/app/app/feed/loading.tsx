import { Skeleton } from '@/components/ui/skeleton';

// feed post card placeholder
function PostSkeleton() {
  return (
    <div className="glass-card p-4 space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      <Skeleton className="h-72 w-full rounded-xl" />
      <div className="flex gap-4">
        <Skeleton className="h-8 w-16 rounded-lg" />
        <Skeleton className="h-8 w-16 rounded-lg" />
        <Skeleton className="h-8 w-16 rounded-lg" />
      </div>
    </div>
  );
}

export default function FeedLoading() {
  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <PostSkeleton key={i} />
      ))}
    </div>
  );
}

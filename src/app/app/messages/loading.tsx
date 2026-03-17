import { Skeleton } from '@/components/ui/skeleton';

// conversation list placeholder
function ConversationSkeleton() {
  return (
    <div className="flex items-center gap-3 p-3">
      <Skeleton className="h-12 w-12 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-3 w-48" />
      </div>
      <Skeleton className="h-3 w-10" />
    </div>
  );
}

export default function MessagesLoading() {
  return (
    <div className="flex h-full">
      <div className="w-80 border-r border-white/10 p-4 space-y-1">
        <Skeleton className="h-10 w-full rounded-xl mb-4" />
        {Array.from({ length: 6 }).map((_, i) => (
          <ConversationSkeleton key={i} />
        ))}
      </div>
      <div className="flex-1 flex items-center justify-center">
        <Skeleton className="h-5 w-48 rounded-lg" />
      </div>
    </div>
  );
}

import { Skeleton } from '@/components/ui/skeleton';

// dashboard skeleton layout
export default function DashboardLoading() {
  return (
    <div className="p-6 space-y-6">
      <Skeleton className="h-8 w-56" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="glass-card p-5 space-y-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-3 w-32" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-5 space-y-4">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
        <div className="glass-card p-5 space-y-4">
          <Skeleton className="h-5 w-36" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-4 w-40" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

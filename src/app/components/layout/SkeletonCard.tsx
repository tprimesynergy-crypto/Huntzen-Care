import { Skeleton } from '@/app/components/ui/skeleton';
import { Card } from '@/app/components/ui/card';

export function SkeletonCard() {
  return (
    <Card className="p-6">
      <div className="flex items-start gap-4">
        <Skeleton className="w-16 h-16 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-full" />
        </div>
      </div>
    </Card>
  );
}

export function SkeletonStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="p-5">
          <div className="flex items-start gap-4">
            <Skeleton className="w-12 h-12 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

export function SkeletonProfile() {
  return (
    <div className="space-y-6">
      {/* Cover */}
      <Card className="overflow-hidden">
        <Skeleton className="w-full h-64" />
        <div className="px-6 pb-6">
          <div className="flex gap-6 -mt-16 relative">
            <Skeleton className="w-32 h-32 rounded-full border-4 border-white" />
            <div className="flex-1 pt-20 space-y-2">
              <Skeleton className="h-8 w-1/3" />
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-4 w-2/3 mt-4" />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

export function SkeletonTable() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <Card key={i} className="p-4">
          <div className="flex items-center gap-4">
            <Skeleton className="w-12 h-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-10 w-24 rounded-md" />
          </div>
        </Card>
      ))}
    </div>
  );
}

import { Skeleton } from "@/components/ui/skeleton";

export function LoadingSkeleton() {
  return (
    <div className="flex flex-col space-y-3">
      <Skeleton className="h-80 min-w-full" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 transition-opacity mt-12">
        <Skeleton className="h-12 min-w-full" />
        <Skeleton className="h-12 min-w-full" />
        <Skeleton className="h-12 min-w-full" />
        <Skeleton className="h-12 min-w-full" />
        <Skeleton className="h-12 min-w-full" />
        <Skeleton className="h-12 min-w-full" />
        <Skeleton className="h-12 min-w-full" />
        <Skeleton className="h-12 min-w-full" />
        <Skeleton className="h-12 min-w-full" />
        <Skeleton className="h-12 min-w-full" />
        <Skeleton className="h-12 min-w-full" />
        <Skeleton className="h-12 min-w-full" />
      </div>
    </div>
  );
}

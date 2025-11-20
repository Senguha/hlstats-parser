import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "./ui/card";

type Props = {
  message: string;
};

export function LoadingSkeleton({ message }: Props) {
  return (
    <div className="flex flex-col space-y-3 relative">
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
      <Card className="border-primary bg-muted absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <CardContent className="flex items-center gap-4 py-6">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <div>
            <p className="font-medium">{message}</p>
            <p className="text-sm text-muted-foreground">
              Please wait while we fetch the latest data...
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

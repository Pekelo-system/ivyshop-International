import { Skeleton } from "@/components/ui/skeleton";

export function ProductTableSkeleton() {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-4 w-[30%]" />
          <Skeleton className="h-4 w-[15%]" />
          <Skeleton className="h-4 w-[10%]" />
          <Skeleton className="h-4 w-[10%]" />
          <Skeleton className="h-4 w-[15%]" />
        </div>
      ))}
    </div>
  );
}

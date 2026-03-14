import { Skeleton } from "@/components/ui/skeleton";

export function MenuCardSkeleton() {
  return (
    <div className="relative flex flex-col bg-white dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-800 overflow-hidden shadow-sm">
      <Skeleton className="aspect-[5/4] w-full rounded-none" />

      <div className="flex flex-col p-3.5 space-y-3">
        <div className="flex justify-between items-center">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-10" />
        </div>

        <div className="space-y-2">
          <Skeleton className="h-5 w-3/4" />
        </div>

        <div className="space-y-1.5">
          <Skeleton className="h-2.5 w-full" />
          <Skeleton className="h-2.5 w-2/3" />
        </div>

        <div className="flex items-center justify-between mt-auto pt-2">
          <div className="space-y-1.5">
            <Skeleton className="h-2.5 w-12" />
            <Skeleton className="h-5 w-20" />
          </div>
          <Skeleton className="w-9 h-9 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function MenuListSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6">
      {Array.from({ length: 10 }).map((_, i) => (
        <MenuCardSkeleton key={i} />
      ))}
    </div>
  );
}
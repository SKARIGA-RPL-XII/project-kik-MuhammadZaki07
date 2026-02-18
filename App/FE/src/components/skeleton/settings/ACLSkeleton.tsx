import { Skeleton } from "@/components/ui/skeleton";

export default function ACLSkeleton() {
  return (
    <div className="w-full space-y-8 animate-pulse">
      <div className="flex items-center justify-between pb-8 border-b border-neutral-100 dark:border-neutral-800">
        <div className="space-y-2">
          <Skeleton className="h-8 w-56 rounded-lg" />
          <Skeleton className="h-4 w-40 rounded-md" />
        </div>
        <div className="flex gap-4">
          <Skeleton className="h-11 w-64 rounded-xl hidden xl:block" />
          <Skeleton className="h-11 w-44 rounded-xl" />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-72 space-y-4">
          <Skeleton className="h-3 w-24 ml-4" />
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        </div>

        <div className="flex-1 space-y-6">
          <Skeleton className="h-24 w-full rounded-2xl" />
          <div className="space-y-4">
            <Skeleton className="h-3 w-32 ml-1" />
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-5 rounded-2xl border border-neutral-100 dark:border-neutral-800">
                <div className="flex items-center gap-5">
                  <Skeleton className="h-12 w-12 rounded-xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32 rounded-md" />
                    <Skeleton className="h-3 w-20 rounded-md" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-14 w-16 rounded-xl" />
                  <Skeleton className="h-14 w-16 rounded-xl" />
                  <Skeleton className="h-14 w-16 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
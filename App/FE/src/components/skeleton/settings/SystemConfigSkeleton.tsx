import { Skeleton } from "@/components/ui/skeleton";

export default function SystemConfigSkeleton() {
  return (
    <div className="w-full space-y-8 animate-pulse">
      <div className="flex items-center justify-between pb-8 border-b border-neutral-100 dark:border-neutral-800">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48 rounded-lg" />
          <Skeleton className="h-4 w-72 rounded-md" />
        </div>
        <Skeleton className="h-11 w-40 rounded-xl" />
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        <div className="w-full lg:w-64 space-y-6">
          <Skeleton className="h-3 w-32 ml-4" />
          <div className="space-y-1">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-14 w-full rounded-xl" />
            ))}
          </div>
        </div>

        <div className="flex-1 max-w-2xl space-y-10">
          <div className="space-y-4">
            <div className="pb-6 border-b border-neutral-100 dark:border-neutral-800">
              <Skeleton className="h-7 w-40 mb-2" />
              <Skeleton className="h-3 w-64" />
            </div>
            <div className="space-y-3">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
          </div>
          
          <div className="space-y-6">
             <div className="flex justify-between items-center p-6 border border-neutral-100 dark:border-neutral-800 rounded-2xl">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
                <Skeleton className="h-6 w-10 rounded-full" />
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
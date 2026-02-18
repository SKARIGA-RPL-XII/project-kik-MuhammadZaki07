import { Skeleton } from "@/components/ui/skeleton";

export default function GeneralConfigSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="pb-6 border-b border-neutral-100 dark:border-neutral-800">
        <Skeleton className="h-7 w-48 rounded-md mb-2" />
        <Skeleton className="h-3 w-72 rounded-sm" />
      </div>

      <div className="space-y-6">
        <div className="grid gap-3">
          <Skeleton className="h-3 w-32 rounded-sm ml-1" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>

        <div className="grid gap-3">
          <Skeleton className="h-3 w-28 rounded-sm ml-1" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      </div>

      <div className="mt-10 p-6 bg-neutral-50 dark:bg-neutral-900/50 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl flex gap-4">
        <Skeleton className="h-5 w-5 rounded-full shrink-0" />
        <div className="space-y-2 w-full">
          <Skeleton className="h-3 w-full rounded-sm" />
          <Skeleton className="h-3 w-3/4 rounded-sm" />
        </div>
      </div>
    </div>
  );
}
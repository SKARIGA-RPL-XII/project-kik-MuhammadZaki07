import { Skeleton } from "@/components/ui/skeleton";

export default function UserProfileSkeleton() {
  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20 animate-in fade-in duration-500">
      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-lg  p-8 flex flex-col items-center text-center space-y-4">
            <Skeleton className="w-28 h-28 rounded-lg" />

            <div className="space-y-2 w-full flex flex-col items-center">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-40" />
            </div>

            <Skeleton className="h-10 w-full rounded-md" />
          </div>

          <div className="bg-slate-50 dark:bg-neutral-900/50 border border-slate-200 dark:border-neutral-800 rounded-lg p-5 space-y-3">
            <Skeleton className="h-3 w-24" />

            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-5/6" />
          </div>
        </div>

        <div className="col-span-12 lg:col-span-8">
          <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-lg  overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-neutral-800">
              <Skeleton className="h-3 w-40" />
            </div>

            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-y-10 gap-x-16">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-4 w-40" />
                </div>
              ))}

              <div className="col-span-full pt-8 border-t border-slate-50 dark:border-neutral-800 space-y-3">
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

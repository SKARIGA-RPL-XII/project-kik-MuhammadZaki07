import ComponentCard from "@/components/common/ComponentCard";
import { Skeleton } from "@/components/ui/skeleton";

function MenuEditSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="mb-6">
        <Skeleton className="h-9 w-64 mb-2" />
        <Skeleton className="h-4 w-40" />
      </div>

      <ComponentCard title="" desc="">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          
          <div className="space-y-4">
            <Skeleton className="h-5 w-28" />
            <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl min-h-[400px] flex items-center justify-center p-4">
              <Skeleton className="w-full h-full max-h-[450px] rounded-xl" />
            </div>
            <Skeleton className="h-3 w-40 mx-auto" />
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 lg:col-span-1 space-y-2">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-11 w-full rounded-xl" />
              </div>
              <div className="col-span-2 lg:col-span-1 space-y-2">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-11 w-full rounded-xl" />
              </div>
              <div className="col-span-2 lg:col-span-1 space-y-2">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-11 w-full rounded-xl" />
              </div>
            </div>

            <div className="space-y-2">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-32 w-full rounded-xl" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-11 w-full rounded-xl" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-11 w-full rounded-xl" />
              </div>
            </div>

            <div className="p-5 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-6 w-12 rounded-full" />
                  <Skeleton className="h-5 w-32" />
                </div>
              </div>
              <Skeleton className="h-3 w-56 ml-14" />
            </div>

            <div className="space-y-4 border-t pt-6 dark:border-gray-800">
              <Skeleton className="h-6 w-44" />
              <div className="flex gap-3 flex-wrap">
                <Skeleton className="h-10 w-28 rounded-xl" />
                <Skeleton className="h-10 w-28 rounded-xl" />
                <Skeleton className="h-10 w-28 rounded-xl" />
              </div>

              <div className="mt-4 p-6 border border-gray-100 dark:border-gray-800 rounded-2xl space-y-4 bg-white dark:bg-gray-900">
                <Skeleton className="h-4 w-32" />
                <div className="flex gap-4">
                  <Skeleton className="h-9 w-24 rounded-lg" />
                  <Skeleton className="h-9 w-24 rounded-lg" />
                </div>
              </div>
            </div>

            <div className="pt-6">
              <Skeleton className="h-14 w-full rounded-2xl shadow-md" />
            </div>
          </div>
        </div>
      </ComponentCard>
    </div>
  );
}

export default MenuEditSkeleton;
import ComponentCard from "@/components/common/ComponentCard";
import { Skeleton } from "@/components/ui/skeleton";

function MenuShowSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="mb-6">
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-32" />
      </div>

      <ComponentCard title="" desc="">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          
          <div className="space-y-4">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="w-full aspect-square lg:h-[500px] rounded-2xl" />
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 lg:col-span-1 space-y-2">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
              <div className="col-span-2 lg:col-span-1 space-y-2">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
              <div className="col-span-2 lg:col-span-1 space-y-2">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
            </div>

            <div className="space-y-2">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-32 w-full rounded-xl" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
            </div>

            <div className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="h-6 w-10 rounded-full" />
                <Skeleton className="h-5 w-32" />
              </div>
            </div>

            <div className="space-y-4">
              <Skeleton className="h-6 w-40 border-b pb-2" />
              <div className="flex gap-3 flex-wrap">
                <Skeleton className="h-10 w-24 rounded-xl" />
                <Skeleton className="h-10 w-24 rounded-xl" />
                <Skeleton className="h-10 w-24 rounded-xl" />
              </div>

              <div className="mt-4 p-5 border border-gray-100 dark:border-gray-800 rounded-2xl space-y-4">
                <Skeleton className="h-4 w-32" />
                <div className="flex gap-4">
                  <Skeleton className="h-8 w-20 rounded-lg" />
                  <Skeleton className="h-8 w-20 rounded-lg" />
                  <Skeleton className="h-8 w-20 rounded-lg" />
                </div>
              </div>
            </div>

            <div className="pt-4">
              <Skeleton className="h-14 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </ComponentCard>
    </div>
  );
}

export default MenuShowSkeleton;
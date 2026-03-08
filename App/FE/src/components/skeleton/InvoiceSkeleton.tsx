import { Skeleton } from "@/components/ui/skeleton";

export default function InvoiceSkeleton() {
  return (
    <div className="min-h-screen flex flex-col items-center py-5">
      <div className="mb-6 bg-white w-32 h-10">
        <Skeleton className="h-full w-full rounded-full" />
      </div>

      <div className="w-full max-w-xl relative">
        <div className="h-14 rounded-xl p-2 mx-auto max-w-xl">
          <Skeleton className="h-full w-full rounded-lg" />
        </div>

        <div className="max-w-lg w-[90%] sm:w-full mx-auto -mt-7 p-8 relative shadow-sm">
          <div className="flex flex-col items-start mb-10">
            <Skeleton className="w-20 h-20 mb-5 rounded-md" />
            <Skeleton className="h-6 w-48 mb-3" />
            <div className="space-y-2">
              <Skeleton className="h-3 w-64" />
              <Skeleton className="h-3 w-40" />
            </div>
          </div>

          <div className="space-y-4 mb-8 border-t pt-6">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-24" />
            </div>
            <div className="flex justify-between">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-12" />
            </div>
          </div>

          <div className="border-t py-6 space-y-5">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex justify-between">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-8" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>

          <div className="border-t-2 pt-6 space-y-3">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-24" />
            </div>
            <div className="flex justify-between pt-4 border-t border-dashed">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-10 w-40" />
            </div>
          </div>
        </div>
      </div>

      <div className="w-full max-w-xl flex gap-3 px-4 mt-8">
        <Skeleton className="flex-1 h-12 rounded-md" />
        <Skeleton className="flex-1 h-12 rounded-md" />
        <Skeleton className="flex-1 h-12 rounded-md" />
      </div>
    </div>
  );
}
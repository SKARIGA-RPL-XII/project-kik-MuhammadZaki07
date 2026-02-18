import { Skeleton } from "@/components/ui/skeleton";

export default function TaxPaymentSkeleton() {
  return (
    <div className="w-full space-y-8 animate-pulse">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-neutral-100 dark:border-neutral-800">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48 rounded-lg" />
          <Skeleton className="h-4 w-64 rounded-md" />
        </div>
        <Skeleton className="h-11 w-40 rounded-xl" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 space-y-6">
            <div className="flex justify-between items-start">
              <div className="flex gap-4">
                <Skeleton className="h-12 w-12 rounded-2xl" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-32 rounded-md" />
                  <Skeleton className="h-3 w-24 rounded-md" />
                </div>
              </div>
              <Skeleton className="h-6 w-10 rounded-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-3 w-20 ml-1" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
import PageMeta from "../common/PageMeta";
import { Card } from "../ui/card";
import { Skeleton } from "../ui/skeleton";

export const TransactionDetailSkeleton = () => (
  <div className="space-y-6 font-sans">
    <PageMeta title="Loading... | Gagal-Lapar" description="Sedang memuat data transaksi." />
    
    <div className="flex gap-2">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-4 w-4" />
      <Skeleton className="h-4 w-32" />
    </div>

    <Card className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-6 shadow-none border">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:flex gap-3">
        <Skeleton className="h-10 w-full sm:w-32" />
        <Skeleton className="h-10 w-full sm:w-32" />
      </div>
    </Card>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <Card className="border p-6 shadow-none">
          <Skeleton className="h-7 w-48 mb-6" />
          <div className="space-y-4">
            <div className="border-b pb-4 flex justify-between">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-20" />
            </div>
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center gap-4 py-2">
                <Skeleton className="w-13 h-13 rounded-md" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
          <div className="mt-10 flex justify-end">
            <div className="w-full max-w-xs space-y-4">
              <div className="flex justify-between"><Skeleton className="h-4 w-20" /><Skeleton className="h-4 w-24" /></div>
              <div className="flex justify-between"><Skeleton className="h-4 w-20" /><Skeleton className="h-4 w-24" /></div>
              <div className="pt-3 border-t flex justify-between"><Skeleton className="h-6 w-20" /><Skeleton className="h-6 w-32" /></div>
            </div>
          </div>
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="border p-6 shadow-none">
          <Skeleton className="h-6 w-40 mb-6" />
          <div className="space-y-5">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-32" />
              </div>
            ))}
          </div>
          <div className="pt-4 mt-4 border-t space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-4 w-32" />
          </div>
        </Card>

        <Card className="p-6 shadow-none border">
          <Skeleton className="h-4 w-32 mb-5" />
          <div className="p-4 border rounded flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Skeleton className="w-12 h-12 rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            <Skeleton className="h-6 w-16 rounded-lg" />
          </div>
        </Card>
      </div>
    </div>
  </div>
);
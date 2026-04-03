import { Skeleton } from "@/components/ui/skeleton";

export const AdminDashboardSkeleton = () => (
  <div className="grid grid-cols-12 gap-4 md:gap-6">
    <div className="col-span-12">
      <Skeleton className="h-32 w-full rounded-3xl" />
    </div>

    <div className="col-span-12 lg:col-span-8 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 w-full rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-80 w-full rounded-3xl" />
    </div>

    <div className="col-span-12 lg:col-span-4 space-y-4">
      <Skeleton className="h-64 w-full rounded-3xl" />
      <Skeleton className="h-48 w-full rounded-3xl" />
    </div>

    <div className="col-span-12">
      <Skeleton className="h-64 w-full rounded-3xl" />
    </div>
  </div>
);

export const CashierDashboardSkeleton = () => (
  <div className="grid grid-cols-12 gap-6">
    <div className="col-span-12">
      <Skeleton className="h-28 w-full rounded-3xl" />
    </div>

    <div className="col-span-12 md:col-span-4">
      <Skeleton className="h-24 w-full rounded-2xl" />
    </div>
    <div className="col-span-12 md:col-span-4">
      <Skeleton className="h-24 w-full rounded-2xl" />
    </div>
    <div className="col-span-12 md:col-span-4">
      <Skeleton className="h-24 w-full rounded-2xl" />
    </div>

    <div className="col-span-12 lg:col-span-8">
      <Skeleton className="h-[500px] w-full rounded-3xl" />
    </div>

    <div className="col-span-12 lg:col-span-4 space-y-4">
      <Skeleton className="h-64 w-full rounded-3xl" />
      <Skeleton className="h-40 w-full rounded-3xl" />
    </div>
  </div>
);

export const EmployeeDashboardSkeleton = () => (
  <div className="grid grid-cols-12 gap-6">
    <div className="col-span-12">
      <Skeleton className="h-28 w-full rounded-3xl" />
    </div>

    <div className="col-span-12 lg:col-span-5">
      <Skeleton className="h-64 w-full rounded-3xl" />
    </div>

    <div className="col-span-12 lg:col-span-7 grid grid-cols-2 gap-4">
      <Skeleton className="h-64 w-full rounded-3xl" />
      <Skeleton className="h-64 w-full rounded-3xl" />
    </div>

    <div className="col-span-12">
      <Skeleton className="h-80 w-full rounded-3xl" />
    </div>
  </div>
);

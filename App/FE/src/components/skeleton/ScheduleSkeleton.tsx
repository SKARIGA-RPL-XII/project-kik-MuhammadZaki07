import { Skeleton } from "@/components/ui/skeleton";

const ScheduleSkeleton = () => (
  <div className="flex h-[calc(100vh-140px)] min-h-0 w-full overflow-hidden bg-muted/20">
    <div className="flex w-72 shrink-0 flex-col border-r border-border p-4">
      <Skeleton className="mb-4 h-10 w-2/3 rounded-lg" />
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-14 w-full rounded-lg" />
        ))}
      </div>
    </div>
    <div className="min-h-0 min-w-0 flex-1 overflow-x-auto overflow-y-hidden p-4 scroll-custom">
      <div className="flex h-full min-h-0 w-max items-stretch gap-3">
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <Skeleton key={i} className="h-full w-80 shrink-0 rounded-xl" />
        ))}
      </div>
    </div>
  </div>
);

export default ScheduleSkeleton;

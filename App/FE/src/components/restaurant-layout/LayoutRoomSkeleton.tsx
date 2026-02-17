import { Skeleton } from "@/components/ui/skeleton";

export default function LayoutRoomSkeleton() {
  return (
    <div className="w-full h-screen relative overflow-hidden bg-white dark:bg-[#0a0a0a] flex flex-col p-6">
      
      <div className="flex items-center justify-between mb-8">
        <div className="flex gap-4">
          <Skeleton className="h-10 w-32 rounded-sm" />
          <Skeleton className="h-10 w-32 rounded-sm" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-10 rounded-sm" />
          <Skeleton className="h-10 w-10 rounded-sm" />
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center border-2 border-dashed border-neutral-100 dark:border-neutral-900 rounded-xl relative bg-neutral-50/50 dark:bg-neutral-900/20">
        
        <div className="absolute top-6 right-6 flex flex-col gap-2">
          <Skeleton className="h-10 w-10 rounded-sm" />
          <Skeleton className="h-10 w-10 rounded-sm" />
          <Skeleton className="h-10 w-10 rounded-sm" />
        </div>

        <div className="flex gap-20">
          <div className="relative h-[400px] w-[300px] border border-neutral-200 dark:border-neutral-800 rounded-lg p-4">
            <Skeleton className="absolute -top-6 left-0 h-4 w-24" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-16 w-16 rounded-xl" />
              <Skeleton className="h-16 w-16 rounded-full" />
              <Skeleton className="h-16 w-16 rounded-lg" />
              <Skeleton className="h-16 w-16 rounded-xl" />
            </div>
          </div>
          
          <div className="relative h-[400px] w-[300px] border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 hidden md:block">
            <Skeleton className="absolute -top-6 left-0 h-4 w-20" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <Skeleton className="h-16 w-16 rounded-xl" />
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 right-8 flex items-center gap-4">
        <Skeleton className="h-12 w-48 rounded-md" />
        <Skeleton className="h-12 w-12 rounded-full" />
      </div>
    </div>
  );
}
export function ProfileSkeleton() {
  return (
    <div className="max-w-2xl mx-auto px-5 py-8 animate-pulse">
      <div className="flex flex-col items-center mb-10">
        <div className="w-32 h-32 rounded-full bg-neutral-200" />
        <div className="h-3 w-24 bg-neutral-200 mt-4 rounded" />
      </div>
      <div className="flex bg-neutral-100 p-1 rounded-xl mb-8 gap-2">
        <div className="flex-1 h-9 bg-neutral-200 rounded-lg" />
        <div className="flex-1 h-9 bg-neutral-200 rounded-lg" />
        <div className="flex-1 h-9 bg-neutral-200 rounded-lg" />
      </div>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-neutral-200" />
          <div className="space-y-2">
            <div className="h-4 w-32 bg-neutral-200 rounded" />
            <div className="h-3 w-48 bg-neutral-200 rounded" />
          </div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 w-full bg-neutral-100 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
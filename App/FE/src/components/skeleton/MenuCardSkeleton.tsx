import { motion } from "framer-motion";

export function MenuCardSkeleton() {
  return (
    <div className="relative flex flex-col bg-white rounded-2xl border border-neutral-100 overflow-hidden shadow-sm">
      <div className="relative aspect-[5/4] bg-neutral-100 overflow-hidden">
        <motion.div
          animate={{ x: ["-100%", "100%"] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
        />
      </div>

      <div className="flex flex-col p-3.5 space-y-3">
        <div className="flex justify-between items-center">
          <div className="h-2 w-16 bg-neutral-100 rounded-full" />
          <div className="h-2 w-10 bg-neutral-100 rounded-full" />
        </div>

        <div className="space-y-2">
          <div className="h-4 w-3/4 bg-neutral-100 rounded-lg" />
        </div>

        <div className="space-y-1.5">
          <div className="h-2 w-full bg-neutral-50 rounded-full" />
          <div className="h-2 w-2/3 bg-neutral-50 rounded-full" />
        </div>

        <div className="flex items-center justify-between mt-auto pt-2">
          <div className="space-y-1.5">
            <div className="h-2 w-12 bg-neutral-100 rounded-full" />
            <div className="h-4 w-20 bg-neutral-100 rounded-lg" />
          </div>
          <div className="w-8 h-8 bg-neutral-100 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function MenuListSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <MenuCardSkeleton key={i} />
      ))}
    </div>
  );
}
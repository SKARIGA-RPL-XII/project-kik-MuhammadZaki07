'use client'

import { motion } from 'framer-motion'

export function MenuCardSkeleton() {
  return (
    <motion.div
      animate={{ opacity: [0.6, 1, 0.6] }}
      transition={{ repeat: Infinity, duration: 2 }}
      className="rounded-3xl overflow-hidden bg-white border border-slate-100 shadow-md"
    >
      {/* Image Skeleton */}
      <div className="w-full h-48 bg-gradient-to-br from-slate-200 to-slate-300" />

      {/* Content Skeleton */}
      <div className="p-4 md:p-5 space-y-4">
        <div className="space-y-2">
          <div className="h-6 bg-slate-200 rounded-lg w-3/4" />
          <div className="h-4 bg-slate-100 rounded-lg w-full" />
          <div className="h-4 bg-slate-100 rounded-lg w-5/6" />
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="h-8 bg-slate-200 rounded-lg w-20" />
          <div className="h-10 bg-slate-200 rounded-full w-10" />
        </div>
      </div>
    </motion.div>
  )
}

export function HeroSkeleton() {
  return (
    <motion.div
      animate={{ opacity: [0.6, 1, 0.6] }}
      transition={{ repeat: Infinity, duration: 2 }}
      className="h-48 md:h-64 bg-gradient-to-br from-slate-200 to-slate-300 rounded-3xl shadow-lg"
    />
  )
}

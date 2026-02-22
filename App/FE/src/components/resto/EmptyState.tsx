import { motion } from 'framer-motion'
import { SearchX, UtensilsCrossed, Sparkles } from 'lucide-react'

export function EmptyState() {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-24 px-6 text-center"
    >
      <div className="relative mb-8">
        {/* Decorative Background Elements */}
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 scale-150 opacity-20"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-indigo-500 rounded-full" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-indigo-500 rounded-full" />
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1 bg-indigo-500 rounded-full" />
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-1 bg-indigo-500 rounded-full" />
        </motion.div>

        <div className="relative z-10 w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center border border-slate-100 shadow-inner">
          <SearchX size={40} className="text-slate-300" strokeWidth={1.5} />
          
          <motion.div
            animate={{ 
              y: [0, -10, 0],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute -top-2 -right-2 bg-white p-2 rounded-xl shadow-lg border border-slate-50 text-amber-400"
          >
            <Sparkles size={16} fill="currentColor" />
          </motion.div>
        </div>
      </div>

      <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">
        Duh, Menunya Gak Ketemu!
      </h3>
      
      <p className="max-w-[280px] text-slate-500 font-medium leading-relaxed mb-8">
        Kayaknya koki kita belum masak menu itu. Coba cari kata kunci lain atau ganti kategori, yuk?
      </p>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => window.location.reload()}
        className="group flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-[1.5rem] font-bold text-sm shadow-xl shadow-slate-200 transition-all hover:bg-indigo-600"
      >
        <UtensilsCrossed size={18} className="group-hover:rotate-12 transition-transform" />
        Lihat Semua Menu
      </motion.button>
    </motion.div>
  )
}
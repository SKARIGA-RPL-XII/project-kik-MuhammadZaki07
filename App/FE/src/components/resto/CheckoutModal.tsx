import { motion, AnimatePresence } from 'framer-motion'
import { Utensils, ShoppingBag, X, CheckCircle2 } from 'lucide-react'
import { useState } from 'react'

export function CheckoutModal({ isOpen, onClose, onConfirm }: any) {
  const [method, setMethod] = useState<'dine-in' | 'take-away' | null>(null)

  const handleFinalize = () => {
    if (method) {
      onConfirm?.(method)
      onClose?.()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-xl bg-white rounded-[3rem] p-10 shadow-2xl overflow-hidden"
          >
            <div className="text-center mb-10">
              <h2 className="text-3xl font-black text-slate-900 mb-2">Dining Choice</h2>
              <p className="text-slate-500 font-medium">How would you like to enjoy your meal?</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { id: 'dine-in', label: 'Dine In', icon: Utensils, desc: 'Enjoy the vibe at our place' },
                { id: 'take-away', label: 'Take Away', icon: ShoppingBag, desc: 'Pack it up for the road' }
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setMethod(opt.id as any)}
                  className={`relative p-8 rounded-[2.5rem] border-2 transition-all text-left flex flex-col gap-4 group ${
                    method === opt.id 
                    ? 'border-indigo-600 bg-indigo-50/50 shadow-lg shadow-indigo-100' 
                    : 'border-slate-100 hover:border-slate-200'
                  }`}
                >
                  {method === opt.id && (
                    <div className="absolute top-4 right-4 text-indigo-600">
                      <CheckCircle2 size={24} fill="currentColor" className="text-white" />
                    </div>
                  )}
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${
                    method === opt.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'
                  }`}>
                    <opt.icon size={28} />
                  </div>
                  <div>
                    <p className={`font-black text-lg ${method === opt.id ? 'text-indigo-900' : 'text-slate-900'}`}>{opt.label}</p>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed">{opt.desc}</p>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-10 flex gap-4">
              <button
                onClick={onClose}
                className="flex-1 py-5 rounded-[2rem] font-bold text-slate-500 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={!method}
                onClick={handleFinalize}
                className="flex-[2] bg-slate-900 text-white py-5 rounded-[2rem] font-black text-lg shadow-xl shadow-slate-200 disabled:opacity-30 transition-all active:scale-[0.98]"
              >
                Place Order
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
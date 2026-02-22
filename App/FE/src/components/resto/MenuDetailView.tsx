'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useMemo } from 'react'
import { X, Minus, Plus, ShoppingBag } from 'lucide-react'

export function MenuDetailView({ menu, isOpen, onClose, onAddToCart }: any) {
  const [quantity, setQuantity] = useState(1)
  const [selectedAttributes, setSelectedAttributes] = useState<Record<number, number>>({})

  const uniqueAttributes = useMemo(() => {
    if (!menu?.attributes) return []
    const seen = new Set()
    return menu.attributes.filter((attr: any) => {
      const duplicate = seen.has(attr.id)
      seen.add(attr.id)
      return !duplicate
    })
  }, [menu])

  useEffect(() => {
    if (isOpen) {
      setQuantity(1)
      setSelectedAttributes({})
    }
  }, [isOpen])

  if (!menu) return null

  const handleAdd = () => {
    onAddToCart({ 
      ...menu, 
      selectedAttributes, 
      quantity 
    })
    onClose()
  }

  const imageUrl = `${import.meta.env.VITE_STORAGE_URL}/${menu.menu_image}`

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-[480px] bg-white rounded-2xl overflow-hidden flex flex-col max-h-[90vh] shadow-2xl"
          >
            <div className="relative h-72 w-full flex-shrink-0 bg-neutral-100">
              <img 
                src={imageUrl} 
                className="w-full h-full object-center" 
                alt={menu.name} 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white to-transparent" />
              
              <button 
                onClick={onClose}
                className="absolute top-4 right-4 z-20 p-2.5 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-xl text-white transition-all border border-white/20"
              >
                <X size={20} />
              </button>

              <div className="absolute bottom-6 left-6 right-6">
                <span className="bg-brand-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider mb-2 inline-block">
                  {menu.category?.name}
                </span>
                <h2 className="text-3xl font-black text-brand-500 tracking-tight drop-shadow-sm">
                  {menu.name}
                </h2>
              </div>
            </div>

            <div className="p-8 overflow-y-auto custom-scrollbar bg-white">
              <div className="flex justify-between items-center mb-6">
                <p className="text-2xl font-black text-neutral-900">
                  Rp {menu.price.toLocaleString('id-ID')}
                </p>
                <div className="h-px flex-1 mx-4 bg-neutral-100" />
              </div>

              <p className="text-neutral-500 text-sm leading-relaxed mb-10 font-medium">
                {menu.description}
              </p>

              <div className="space-y-10">
                {uniqueAttributes.map((attr: any) => (
                  <div key={attr.id} className="space-y-4">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-[0.1em]">
                        {attr.name}
                      </h4>
                      <span className="text-[10px] text-neutral-400 font-medium">Required</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-2.5">
                      {attr.levels?.map((level: any) => {
                        const isSelected = selectedAttributes[attr.id] === level.id
                        return (
                          <button
                            key={level.id}
                            onClick={() => setSelectedAttributes(prev => ({ ...prev, [attr.id]: level.id }))}
                            className={`px-4 py-2 rounded-sm border-2 text-sm font-bold transition-all duration-200 ${
                              isSelected 
                              ? 'border-brand-600 bg-brand-50 text-brand-700 shadow-sm' 
                              : 'border-neutral-100 bg-white text-neutral-500 hover:border-neutral-200'
                            }`}
                          >
                            {level.name}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-5 border-t border-neutral-100 flex flex-col sm:flex-row items-center gap-4 bg-white">
              <div className="flex items-center bg-neutral-50 rounded-sm border border-neutral-200 p-1 w-full sm:w-auto justify-between">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-3 text-neutral-400 hover:text-neutral-900 transition-colors"
                >
                  <Minus size={18} />
                </button>
                <span className="px-4 text-base font-black text-neutral-900 min-w-[40px] text-center">
                  {quantity}
                </span>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-3 text-neutral-400 hover:text-neutral-900 transition-colors"
                >
                  <Plus size={18} />
                </button>
              </div>

              <button
                onClick={handleAdd}
                className="w-full bg-brand-600 hover:bg-brand-700 text-white py-4 px-6 rounded-sm font-bold text-sm transition-all flex items-center justify-center gap-3 active:scale-[0.98] shadow-lg shadow-brand-100"
              >
                <ShoppingBag size={18} />
                Add to Cart — Rp {(menu.price * quantity).toLocaleString('id-ID')}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
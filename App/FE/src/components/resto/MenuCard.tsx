import { motion } from 'framer-motion'
import { Plus, Minus, Star } from 'lucide-react'
import { useState } from 'react'

export interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  image: string
  isBestSeller?: boolean
  rating?: number
  category: string
}

interface MenuCardProps {
  item: MenuItem
  onAddToCart?: (item: MenuItem, quantity: number) => void
  isAdded?: boolean
}

export function MenuCard({ item, onAddToCart, isAdded = false }: MenuCardProps) {
  const [quantity, setQuantity] = useState(0)
  const [isHovering, setIsHovering] = useState(false)

  const handleAdd = () => {
    if (quantity === 0) {
      setQuantity(1)
    }
    window.navigator?.vibrate?.(50)
  }

  const handleQuantityChange = (newQuantity: number) => {
    setQuantity(Math.max(0, newQuantity))
    if (newQuantity === 0) {
      window.navigator?.vibrate?.(50)
    }
    window.navigator?.vibrate?.(30)
  }

  const handleConfirm = () => {
    if (quantity > 0) {
      onAddToCart?.(item, quantity)
      setQuantity(0)
      window.navigator?.vibrate?.(50)
    }
  }

  return (
    <motion.div
      whileHover={{ y: -8 }}
      onHoverStart={() => setIsHovering(true)}
      onHoverEnd={() => setIsHovering(false)}
      className="group rounded-xl overflow-hidden bg-white border border-slate-100 shadow-sm"
    >
      <motion.div
        className="relative w-full h-40 md:h-48 bg-brand-25 overflow-hidden"
      >
        <img
          src={item.image || ""}
          alt={item.name}
          loading='lazy'
          className="object-cover group-hover:scale-110 transition-transform duration-300"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />

        <div className="absolute top-3 left-3 flex gap-2">
          {item.isBestSeller && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="px-3 py-1 rounded-full bg-red-500 text-white text-xs font-bold flex items-center gap-2"
            >
              <Star fill='yellow' stroke='yellow' size={20}/> Best Seller
            </motion.span>
          )}
        </div>

        {item.rating && (
          <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-white/90 backdrop-blur-sm flex items-center gap-1">
            <span className="text-sm font-bold text-slate-900">{item.rating}</span>
            <span className="text-xs">
               <Star fill='yellow' stroke='yellow' size={20}/>
            </span>
          </div>
        )}

        <motion.div
          animate={{
            bottom: isHovering ? 12 : 12,
            right: isHovering ? 12 : 12,
          }}
          className="absolute z-10"
        >
          {quantity === 0 ? (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAdd}
              className="w-10 h-10 rounded-full bg-brand-500 text-white shadow-lg hover:shadow-xl flex items-center justify-center transition-all"
            >
              <Plus className="w-6 h-6" />
            </motion.button>
          ) : (
            <motion.div
              layout
              className="flex items-center gap-2 bg-white rounded-full px-3 py-2 shadow-lg border-2 border-brand-600"
            >
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={() => handleQuantityChange(quantity - 1)}
                className="p-1 hover:bg-slate-100 rounded-full transition-colors"
              >
                <Minus className="w-4 h-4 text-brand-600" />
              </motion.button>
              <span className="w-6 text-center font-bold text-slate-900">{quantity}</span>
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={() => handleQuantityChange(quantity + 1)}
                className="p-1 hover:bg-slate-100 rounded-full transition-colors"
              >
                <Plus className="w-4 h-4 text-brand-600" />
              </motion.button>
            </motion.div>
          )}
        </motion.div>
      </motion.div>

      <div className="p-4 md:p-5">
        <h3 className="font-bold text-slate-900 text-lg md:text-xl mb-1 line-clamp-1">
          {item.name}
        </h3>
        <p className="text-slate-600 text-sm mb-4 line-clamp-2">{item.description}</p>

        <div className="flex items-center justify-between">
          <motion.div
            className="text-2xl font-bold text-brand-600"
          >
            Rp. {item.price}
          </motion.div>

          {quantity > 0 && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={handleConfirm}
              className="px-4 py-2 rounded-full bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 transition-colors"
            >
              Add to Cart
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  )
}

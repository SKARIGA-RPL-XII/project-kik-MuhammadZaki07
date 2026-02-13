'use client'

import { motion } from 'framer-motion'
import { ShoppingBag, Trash, Trash2, X } from 'lucide-react'
import { MenuItem } from './MenuCard'

export interface CartItem {
  item: MenuItem
  quantity: number
}

interface CartSummaryProps {
  items: CartItem[]
  onCheckout?: () => void
  onRemoveItem?: (itemId: string) => void
  isOpen?: boolean
  onToggle?: () => void
}

export function CartSummary({
  items,
  onCheckout,
  onRemoveItem,
  isOpen = false,
  onToggle,
}: CartSummaryProps) {
  const total = items.reduce((sum, cartItem) => sum + cartItem.item.price * cartItem.quantity, 0)
  const itemCount = items.reduce((sum, cartItem) => sum + cartItem.quantity, 0)

  return (
    <>
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed bottom-0 left-0 right-0 z-30"
      >
        <motion.button
          onClick={onToggle}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full px-4 py-4 backdrop-blur-xl bg-white/80 border-t border-slate-200 shadow-2xl"
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{
                  scale: itemCount > 0 ? 1 : 0.8,
                }}
                className="relative"
              >
                <ShoppingBag className="w-6 h-6 text-indigo-600" />
                {itemCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center"
                  >
                    {itemCount}
                  </motion.span>
                )}
              </motion.div>
              <span className="text-slate-700 font-semibold hidden sm:inline">
                {itemCount === 0 ? 'Start ordering' : `${itemCount} item${itemCount !== 1 ? 's' : ''}`}
              </span>
            </div>

            <motion.div
              animate={{
                opacity: itemCount > 0 ? 1 : 0.5,
              }}
              className="flex flex-col items-center"
            >
              <span className="text-sm text-slate-600">Total</span>
              <span className="text-2xl font-bold text-indigo-600">
                Rp. {total.toFixed(2)}
              </span>
            </motion.div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                if (itemCount > 0) {
                  onCheckout?.()
                  window.navigator?.vibrate?.(50)
                }
              }}
              disabled={itemCount === 0}
              className="px-6 py-2 rounded-full bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-shadow"
            >
              Check Out
            </motion.button>
          </div>
        </motion.button>
      </motion.div>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onToggle}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        />
      )}

      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: isOpen ? 0 : '100%' }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl max-h-[80vh] overflow-y-auto"
      >
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Your Order</h2>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={onToggle}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-slate-600" />
            </motion.button>
          </div>

          {/* Items List */}
          {items.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <ShoppingBag className="w-16 h-16 mx-auto text-slate-300 mb-4" />
              <p className="text-slate-600 font-semibold">Your cart is empty</p>
              <p className="text-slate-500 text-sm">Start adding dishes to place an order</p>
            </motion.div>
          ) : (
            <motion.div className="space-y-3 mb-6">
              {items.map((cartItem) => (
                <motion.div
                  key={cartItem.item.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900">{cartItem.item.name}</h3>
                    <p className="text-sm text-slate-600">
                      Rp. {(cartItem.item.price * cartItem.quantity).toFixed(2)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-indigo-600 min-w-8 text-center">
                      {cartItem.quantity}
                    </span>
                    <span className="text-slate-400">×</span>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      onRemoveItem?.(cartItem.item.id)
                      window.navigator?.vibrate?.(50)
                    }}
                    className="p-2 hover:bg-red-100 rounded-full transition-colors"
                  >
                    <Trash2 className="w-5 h-5 text-red-500" />
                  </motion.button>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Summary */}
          {items.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4 pt-6 border-t border-slate-200"
            >
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span>Rp. {total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Service Fee (10%)</span>
                <span>Rp. {(total * 0.1).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-slate-900 pt-4 border-t border-slate-200">
                <span>Total</span>
                <span className="text-indigo-600">Rp. {(total * 1.1).toFixed(2)}</span>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  onCheckout?.()
                  window.navigator?.vibrate?.(50)
                }}
                className="w-full mt-6 py-3 rounded-full bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-bold hover:shadow-lg transition-shadow"
              >
                Proceed to Checkout
              </motion.button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </>
  )
}

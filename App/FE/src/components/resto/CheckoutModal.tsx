'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingBag, Utensils, X } from 'lucide-react'
import { useState } from 'react'
import { TableMap } from './TableMap'

interface CheckoutModalProps {
  isOpen: boolean
  onClose?: () => void
  onConfirm?: (method: 'dine-in' | 'take-away', tableId?: number) => void
}

export function CheckoutModal({ isOpen, onClose, onConfirm }: CheckoutModalProps) {
  const [step, setStep] = useState<'method' | 'table'>('method')
  const [selectedMethod, setSelectedMethod] = useState<'dine-in' | 'take-away' | null>(null)
  const [selectedTable, setSelectedTable] = useState<number | null>(null)

  const handleMethodSelect = (method: 'dine-in' | 'take-away') => {
    setSelectedMethod(method)
    if (method === 'take-away') {
      onConfirm?.(method)
      handleClose()
    } else {
      setStep('table')
      window.navigator?.vibrate?.(50)
    }
  }

  const handleTableSelect = (tableNumber: number) => {
    setSelectedTable(tableNumber)
  }

  const handleConfirmOrder = () => {
    if (selectedTable) {
      onConfirm?.(selectedMethod as 'dine-in', selectedTable)
      handleClose()
      window.navigator?.vibrate?.(50)
    }
  }

  const handleClose = () => {
    setStep('method')
    setSelectedMethod(null)
    setSelectedTable(null)
    onClose?.()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <motion.div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-200 sticky top-0 bg-white">
                <h2 className="text-2xl font-bold text-slate-900">
                  {step === 'method' ? 'How would you like to order?' : 'Choose Your Table'}
                </h2>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleClose}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-slate-600" />
                </motion.button>
              </div>

              {/* Content */}
              <div className="p-6">
                <AnimatePresence mode="wait">
                  {step === 'method' ? (
                    <motion.div
                      key="method"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="space-y-4"
                    >
                      {/* Dine-In Option */}
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleMethodSelect('dine-in')}
                        className="w-full p-6 rounded-2xl border-2 border-slate-200 hover:border-brand-600 hover:bg-brand-50 transition-all group"
                      >
                        <div className="flex items-start gap-4">
                          <div className="text-4xl"><Utensils className='text-brand-500' size={50}/></div>
                          <div className="text-left flex-1">
                            <h3 className="text-lg font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                              Dine In
                            </h3>
                            <p className="text-slate-600 text-sm">
                              Enjoy your meal at our restaurant. Select your preferred table.
                            </p>
                          </div>
                          <div className="text-2xl group-hover:translate-x-1 transition-transform">→</div>
                        </div>
                      </motion.button>

                      {/* Take Away Option */}
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleMethodSelect('take-away')}
                        className="w-full p-6 rounded-2xl border-2 border-slate-200 hover:border-brand-600 hover:bg-brand-50 transition-all group"
                      >
                        <div className="flex items-start gap-4">
                          <div className="text-4xl"><ShoppingBag size={50} className='text-brand-500'/></div>
                          <div className="text-left flex-1">
                            <h3 className="text-lg font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                              Take Away
                            </h3>
                            <p className="text-slate-600 text-sm">
                              Get your order ready for pickup at the counter.
                            </p>
                          </div>
                          <div className="text-2xl group-hover:translate-x-1 transition-transform">→</div>
                        </div>
                      </motion.button>

                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="p-4 bg-blue-50 rounded-2xl border border-blue-200"
                      >
                        <p className="text-sm text-blue-700">
                          <span className="font-semibold">💡 Tip:</span> You can update your preferred dining method anytime during checkout.
                        </p>
                      </motion.div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="table"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      <TableMap selectedTable={selectedTable} onSelectTable={handleTableSelect} />

                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="mt-6 flex gap-3"
                      >
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setStep('method')}
                          className="flex-1 px-4 py-3 rounded-full border-2 border-slate-200 text-slate-900 font-semibold hover:bg-slate-50 transition-colors"
                        >
                          Back
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleConfirmOrder}
                          disabled={!selectedTable}
                          className="flex-1 px-4 py-3 rounded-full bg-gradient-to-r from-brand-600 to-brand-700 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-shadow"
                        >
                          Confirm Table
                        </motion.button>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

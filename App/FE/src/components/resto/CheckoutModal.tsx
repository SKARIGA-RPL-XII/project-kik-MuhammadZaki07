import { motion, AnimatePresence } from 'framer-motion';
import { Utensils, ShoppingBag, X, Check, ArrowRight } from 'lucide-react';
import { useState } from 'react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (method: 'dine-in' | 'take-away') => void;
}

export function CheckoutModal({ isOpen, onClose, onConfirm }: CheckoutModalProps) {
  const [method, setMethod] = useState<'dine-in' | 'take-away' | null>(null);

  const handleConfirm = () => {
    if (method) {
      onConfirm(method);
      onClose();
    }
  };

  const options = [
    {
      id: 'dine-in',
      title: 'Dine-In',
      description: 'Reservation & table service',
      icon: Utensils,
    },
    {
      id: 'take-away',
      title: 'Take-Away',
      description: 'Fast pickup & secure packaging',
      icon: ShoppingBag,
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-neutral-950/40 backdrop-blur-[2px]"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-lg bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-neutral-100 overflow-hidden"
          >
            <div className="px-8 pt-8 pb-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-neutral-900">How will you be dining?</h2>
                  <p className="mt-1 text-sm text-neutral-500">Select your preference to proceed to payment.</p>
                </div>
                <button 
                  onClick={onClose}
                  className="p-2 -mt-2 -mr-2 text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="mt-8 space-y-3">
                {options.map((opt) => {
                  const isActive = method === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => setMethod(opt.id as any)}
                      className={`relative w-full flex items-center p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                        isActive 
                          ? 'border-brand-600 bg-brand-50/30' 
                          : 'border-neutral-100 bg-white hover:border-neutral-200'
                      }`}
                    >
                      <div className={`flex h-12 w-12 items-center justify-center rounded-lg border ${
                        isActive 
                          ? 'bg-brand-600 border-brand-600 text-white' 
                          : 'bg-neutral-50 border-neutral-100 text-neutral-500'
                      }`}>
                        <opt.icon size={24} />
                      </div>
                      
                      <div className="ml-4 flex-1">
                        <p className={`text-sm font-bold ${isActive ? 'text-brand-900' : 'text-neutral-900'}`}>
                          {opt.title}
                        </p>
                        <p className="text-xs text-neutral-500">{opt.description}</p>
                      </div>

                      <div className={`flex h-5 w-5 items-center justify-center rounded-full border transition-colors ${
                        isActive ? 'bg-brand-600 border-brand-600 text-white' : 'border-neutral-300 bg-white'
                      }`}>
                        {isActive && <Check size={12} strokeWidth={4} />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="bg-neutral-50 px-8 py-6 flex items-center justify-between border-t border-neutral-100">
              <button
                onClick={onClose}
                className="text-sm font-semibold text-neutral-600 hover:text-neutral-900 transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={!method}
                onClick={handleConfirm}
                className="inline-flex items-center gap-2 bg-neutral-900 px-6 py-2.5 rounded-lg text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
              >
                Continue
                <ArrowRight size={16} />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
import { X, Minus, Plus, ShoppingBag, Clock, Info, Star } from "lucide-react";
import Button from "../ui/button/Button";

export function MenuDetailView({ menu, isOpen, onClose, onAddToCart }: any) {
  const [quantity, setQuantity] = useState(1);
  const [selectedAttributes, setSelectedAttributes] = useState<
    Record<number, number>
  >({});

  const uniqueAttributes = useMemo(() => {
    if (!menu?.attributes) return [];
    const seen = new Set();
    return menu.attributes.filter((attr: any) => {
      const duplicate = seen.has(attr.id);
      seen.add(attr.id);
      return !duplicate;
    });
  }, [menu]);

  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
      setSelectedAttributes({});
    }
  }, [isOpen]);

  if (!menu) return null;

  const handleAdd = () => {
    onAddToCart({
      ...menu,
      selectedAttributes,
      quantity,
    });
    onClose();
  };

  const imageUrl = `${import.meta.env.VITE_STORAGE_URL}/${menu.menu_image}`;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-neutral-900/80 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-[900px] bg-white rounded-[2rem] overflow-hidden flex flex-col md:flex-row h-auto max-h-[90vh] shadow-2xl"
          >
            <div className="relative w-full md:w-[45%] h-64 md:h-auto bg-neutral-100 overflow-hidden">
              <img
                src={imageUrl}
                className="w-full h-full object-cover transition-transform duration-700 scale-110 hover:scale-125"
                alt={menu.name}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent md:hidden" />

              <div className="absolute top-6 left-6">
                <span className="bg-white/90 backdrop-blur-md text-neutral-900 text-xs px-3 py-1.5 rounded-full shadow-lg">
                  {menu.category?.name}
                </span>
              </div>
            </div>

            <div className="flex-1 flex flex-col min-w-0 bg-white">
              <div className="p-8 pb-4 flex justify-between items-start">
                <div className="space-y-1">
                  <h2 className="text-3xl font-bold text-neutral-900 tracking-tight">
                    {menu.name}
                  </h2>
                  <div className="flex items-center gap-2 text-neutral-400 text-xs font-medium">
                      <Clock size={14} /> 15 Min
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
                >
                  <X size={24} className="text-neutral-400" />
                </button>
              </div>

              <div className="px-8 py-2 overflow-y-auto custom-scrollbar flex-1">
                <p className="text-neutral-500 text-sm leading-relaxed mb-8 font-normal">
                  {menu.description}
                </p>

                <div className="space-y-8">
                  {uniqueAttributes.map((attr: any) => (
                    <div key={attr.id} className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-semibold text-neutral-900 uppercase tracking-widest">
                          {attr.name}
                        </h4>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {attr.levels?.map((level: any) => {
                          const isSelected =
                            selectedAttributes[attr.id] === level.id;
                          return (
                            <button
                              key={level.id}
                              onClick={() =>
                                setSelectedAttributes((prev) => ({
                                  ...prev,
                                  [attr.id]: level.id,
                                }))
                              }
                              className={`px-5 py-2.5 rounded-sm border-2 text-xs font-semibold transition-all duration-300 ${
                                isSelected
                                  ? "border-brand-600 bg-brand-600 text-white shadow-md shadow-brand-100"
                                  : "border-neutral-100 bg-white text-neutral-400 hover:border-neutral-200"
                              }`}
                            >
                              {level.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-8 pt-4 border-t border-neutral-50 bg-neutral-50/50">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest">
                    Total Price
                  </span>
                  <p className="text-2xl font-bold text-brand-600">
                    Rp {(menu.price * quantity).toLocaleString("id-ID")}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center bg-white rounded-sm border border-neutral-200">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 flex items-center justify-center text-neutral-400 hover:text-brand-600 transition-colors"
                    >
                      <Minus size={18} />
                    </button>
                    <span className="px-2 text-base font-semibold text-neutral-900 min-w-[30px] text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-10 h-10 flex items-center justify-center text-neutral-400 hover:text-brand-600 transition-colors"
                    >
                      <Plus size={18} />
                    </button>
                  </div>

                  <Button
                  className="w-full h-10"
                    onClick={handleAdd}
                  >
                    <ShoppingBag size={18} />
                    Tambahkan
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

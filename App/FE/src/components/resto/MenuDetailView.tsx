import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
import { X, Minus, Plus, ShoppingBag, Clock, Tag, ChevronRight } from "lucide-react";
import Button from "../ui/button/Button";

export function MenuDetailView({ menu, isOpen, onClose, onAddToCart }: any) {
  const [quantity, setQuantity] = useState(1);
  const [selectedAttributes, setSelectedAttributes] = useState<
    Record<number, number>
  >({});

  const discountValue = menu?.discount?.value_discount || 0;
  const discountAmount = (menu?.price * discountValue) / 100;
  const activePrice = Math.round((menu?.price || 0) - discountAmount);
  const hasDiscount = discountValue > 0;

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
      discount_price: activePrice,
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
            className="absolute inset-0 bg-neutral-900/90 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-[1000px] bg-white rounded-xl overflow-hidden flex flex-col md:flex-row h-auto max-h-[90vh] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)]"
          >
            <div className="relative w-full md:w-[48%] h-72 md:h-auto bg-neutral-100 overflow-hidden">
              <img
                src={imageUrl}
                className="w-full h-full object-cover transition-transform duration-1000 scale-105 hover:scale-110"
                alt={menu.name}
              />
              
              {hasDiscount && (
                <motion.div 
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="absolute top-8 right-8 bg-red-600 text-white p-4 rounded-3xl shadow-2xl z-10 flex flex-col items-center justify-center min-w-[70px] border-4 border-white/20"
                >
                  <span className="text-[10px] font-medium opacity-90">Hemat</span>
                  <span className="text-2xl font-medium leading-none">{discountValue}%</span>
                </motion.div>
              )}

              <div className="absolute bottom-8 left-8">
                <span className="bg-white/20 backdrop-blur-xl text-white text-[10px] px-4 py-2 rounded-full font-medium border border-white/30 shadow-2xl">
                  {menu.category?.name}
                </span>
              </div>
            </div>

            <div className="flex-1 flex flex-col min-w-0 bg-white">
              <div className="px-10 py-8 pb-6 flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 text-red-600">
                    <div className="h-1 w-20 bg-red-600 rounded-full" />
                  </div>
                  <h2 className="text-4xl font-bold text-neutral-900 leading-none">
                    {menu.name}
                  </h2>
                </div>

                <button
                  onClick={onClose}
                  className="p-2 bg-neutral-50 hover:bg-red-50 text-neutral-300 hover:text-red-500 rounded-lg"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="px-10 overflow-y-auto custom-scrollbar flex-1">
                <p className="text-neutral-500 text-sm leading-relaxed mb-10 font-normal max-w-md">
                  {menu.description}
                </p>

                <div className="space-y-10 mb-10">
                  {uniqueAttributes.map((attr: any) => (
                    <div key={attr.id} className="space-y-5">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-neutral-900">Pilih {attr.name}</span>
                        <div className="flex-1 h-[1px] bg-neutral-200" />
                      </div>

                      <div className="flex flex-wrap gap-3">
                        {attr.levels?.map((level: any) => {
                          const isSelected = selectedAttributes[attr.id] === level.id;
                          return (
                            <button
                              key={level.id}
                              onClick={() => setSelectedAttributes((prev) => ({ ...prev, [attr.id]: level.id }))}
                              className={`group relative px-5 py-2 rounded-lg border-2 text-sm font-normal transition-all duration-300 ${
                                isSelected
                                  ? "border-red-600 bg-red-600 text-white -translate-y-1"
                                  : "border-neutral-100 bg-neutral-50/50 text-neutral-400 hover:border-neutral-200 hover:bg-white hover:text-neutral-600"
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

              <div className="p-8 pt-6 border-t border-neutral-100 bg-white">
                <div className="flex items-end justify-between mb-8">
                  <div className="space-y-1">
                    <span className="text-sm font-medium text-neutral-400 block">Subtotal</span>
                    <div className="flex items-center gap-3">
                      <p className="text-4xl font-bold text-neutral-900 tracking-tighter">
                        Rp {(activePrice * quantity).toLocaleString("id-ID")}
                      </p>
                      {hasDiscount && (
                        <div className="flex flex-col">
                          <span className="text-sm text-neutral-300 line-through font-bold decoration-red-500/30">
                            Rp {(menu.price * quantity).toLocaleString("id-ID")}
                          </span>
                          <span className="flex items-center gap-1 text-[10px] font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-lg border border-red-100">
                           Hemat Rp {(discountAmount * quantity).toLocaleString("id-ID")}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center bg-neutral-100 rounded-sm p-1.5">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-8 h-8 flex items-center justify-center rounded bg-white text-neutral-400 hover:text-red-600 transition-all active:scale-90"
                    >
                      <Minus size={18} />
                    </button>
                    <span className="px-5 text-lg font-medium text-neutral-900 min-w-[50px] text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center rounded bg-white text-neutral-400 hover:text-red-600 transition-all active:scale-90"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                </div>

                <Button
                  className="w-full py-4 bg-neutral-900 hover:bg-red-600 text-white font-medium rounded-lg text-md flex items-center justify-center gap-4 group"
                  onClick={handleAdd}
                >
                  <ShoppingBag size={20} className="group-hover:rotate-12 transition-transform" />
                  Konfirmasi Pesanan
                  <ChevronRight size={20} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all" />
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
import { X, Minus, Plus, ShoppingBag, ChevronRight } from "lucide-react";
import Button from "../ui/button/Button";
import { useTranslation } from "react-i18next";
import { Badge } from "../ui/badge";
import { getMenuItemStatus } from "@/utils/getMenuItemStatus";
import { formatCurrency } from "@/lib/currency";

export function MenuDetailView({ menu, isOpen, onClose, onAddToCart }: any) {
  const { t } = useTranslation();
  const [quantity, setQuantity] = useState(1);
  const [selectedAttributes, setSelectedAttributes] = useState<
    Record<number, number>
  >({});

  const {
    hasDiscount,
    discountedPrice: activePrice,
    imagePath: imageUrl,
  } = useMemo(() => getMenuItemStatus(menu || {}), [menu]);

  const discountValue = menu?.discount?.value_discount || 0;

  const uniqueAttributes = useMemo(() => {
    if (!menu?.attributes) return [];
    const seen = new Set();
    return menu.attributes.filter((attr: any) => {
      const duplicate = seen.has(attr.id);
      seen.add(attr.id);
      return !duplicate;
    });
  }, [menu]);

  const isAllAttributesSelected = useMemo(() => {
    return uniqueAttributes.every((attr: any) => selectedAttributes[attr.id]);
  }, [uniqueAttributes, selectedAttributes]);

  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
      setSelectedAttributes({});
    }
  }, [isOpen]);

  if (!menu) return null;

  const handleAdd = () => {
    if (!isAllAttributesSelected) {
      return;
    }

    onAddToCart({
      ...menu,
      selectedAttributes,
      quantity,
      discount_price: activePrice,
      total_price: activePrice * quantity,
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 h-screen z-[200] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-neutral-900/60"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-[1000px] bg-white dark:bg-neutral-900 rounded-xl overflow-hidden flex flex-col md:flex-row h-[60vh] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)]"
          >
            <div className="relative w-full md:w-[48%] h-72 md:h-auto bg-neutral-100 dark:bg-neutral-900 overflow-hidden">
              <img
                src={imageUrl}
                className="w-full h-full object-cover transition-transform duration-1000 scale-105 hover:scale-110"
                alt={menu.name}
              />

              {hasDiscount && (
                <motion.div
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="absolute top-5 right-5 bg-red-600 text-white p-4 rounded-xl shadow-2xl z-10 flex flex-col items-center justify-center min-w-[70px] border-4 border-white/20"
                >
                  <span className="text-[10px] font-medium opacity-90">
                    {t("mv_save")}
                  </span>
                  <span className="text-2xl font-medium leading-none">
                    {discountValue}%
                  </span>
                </motion.div>
              )}
            </div>

            <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-neutral-900">
              <div className="px-5 py-5 flex justify-between items-start">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-red-600">
                    <div className="">
                      <Badge variant={"outline"}>{menu.category?.name}</Badge>
                    </div>
                    <div className="h-1 w-20 bg-red-600 rounded-full" />
                  </div>
                  <h2 className="text-4xl font-bold text-neutral-900 dark:text-neutral-300 leading-none">
                    {menu.name}
                  </h2>
                </div>

                <button
                  onClick={onClose}
                  className="p-2 text-neutral-300 hover:text-red-500"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="px-5 overflow-y-auto custom-scrollbar flex-1">
                <p className="text-neutral-500 dark:text-neutral-300 text-sm leading-relaxed mb-10 font-normal max-w-md">
                  {menu.description}
                </p>

                <div className="space-y-10 mb-5">
                  {uniqueAttributes.map((attr: any) => (
                    <div key={attr.id} className="space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-neutral-900 dark:text-neutral-300">
                          {t("mv_select_prefix")} {attr.name}
                        </span>
                        <div className="flex-1 h-[1px] bg-neutral-200" />
                      </div>

                      <div className="flex flex-wrap gap-3">
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
                              className={`group relative w-25 h-8 rounded border text-xs font-normal transition-all duration-300 ${
                                isSelected
                                  ? "border-red-600 bg-red-600 text-white dark:text-neutral-300 -translate-y-1"
                                  : "bg-neutral-50/50 dark:bg-neutral-900 text-neutral-400"
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

              <div className="px-5 py-3.5 border-t bg-white dark:bg-neutral-900 shadow-lg">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="lg:text-2xl text-xl font-bold text-neutral-900 dark:text-white tracking-tighter leading-none">
                        {formatCurrency(activePrice * quantity)}
                      </p>
                      {hasDiscount && (
                        <span className="text-[9px] font-medium text-white bg-red-600 px-1.5 py-0.5 rounded-md animate-bounce-short">
                          PROMO
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 mt-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-yellow-300 animate-pulse" />
                      <span className="lg:text-[10px] text-[8px] font-normal text-neutral-400 dark:text-neutral-500 italic leading-none">
                        {quantity > 1
                          ? `Harga update otomatis (${quantity} item)`
                          : "Belum termasuk pajak & layanan"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center bg-neutral-100 dark:bg-neutral-800 rounded-sm h-10 p-1 shrink-0">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-7 h-7 flex items-center justify-center rounded-sm bg-white dark:bg-neutral-700 shadow-sm text-neutral-500 hover:text-red-600 active:scale-90 transition-all"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="px-3 text-sm font-bold text-neutral-900 dark:text-neutral-200 tabular-nums">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="w-7 h-7 flex items-center justify-center rounded-sm bg-white dark:bg-neutral-700 shadow-sm text-neutral-500 hover:text-red-600 active:scale-90 transition-all"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <Button
                      className={`lg:text-sm text-xs rounded-sm h-10 flex font-medium items-center gap-2 group transition-all duration-300 ${
                        isAllAttributesSelected
                          ? "bg-red-600 hover:bg-red-700 text-white"
                          : "bg-neutral-100 text-neutral-400 cursor-not-allowed"
                      }`}
                      onClick={handleAdd}
                      disabled={!isAllAttributesSelected}
                    >
                      <ShoppingBag
                        size={18}
                        className={`transition-transform group-hover:rotate-12 ${
                          isAllAttributesSelected ? "block" : "hidden"
                        }`}
                      />
                      <span>
                        {isAllAttributesSelected
                          ? t("mv_btn_confirm")
                          : "Pilih Opsi"}
                      </span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

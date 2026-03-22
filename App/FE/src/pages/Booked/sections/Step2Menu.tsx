import { useEffect, useState, useMemo } from "react";
import {
  ArrowLeft,
  ChevronRight,
  ChevronUp,
  FastForward,
  Trash2,
  Minus,
  Plus,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { MenuCard, NavigationBar } from "@/components/resto";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { calculateOrder } from "@/utils/calculator";
import { MenuDetailView } from "@/components/resto/MenuDetailView";
import { formatCurrency } from "@/lib/currency";
import { useCustomerPageLogic } from "@/hooks/useCustomerPage";
import { MenuListSkeleton } from "@/components/skeleton/MenuCardSkeleton";

export default function Step2Menu({ onNext, onSkip, onBack, settings, initialCart = [] }: any) {
  const { t } = useTranslation();
  const { state, actions } = useCustomerPageLogic();

const [cart, setCart] = useState<any[]>(() => {
    const savedBooking = localStorage.getItem("booking_data");
    if (savedBooking) {
      const parsed = JSON.parse(savedBooking);
      return parsed.items || [];
    }
    return [];
  });
  const [isExpanded, setIsExpanded] = useState(false);

  const { total } = useMemo(() => calculateOrder(cart, settings), [cart, settings]);

  const addToCart = (menuItem: any, quantity: number) => {
    const attrKey = Object.values(menuItem.selectedAttributes || {}).join("-");
    const idUnique = `${menuItem.id}-${attrKey}`;

    setCart((prev) => {
      const existing = prev.find((i) => i.id_unique === idUnique);
      if (existing) {
        return prev.map((i) =>
          i.id_unique === idUnique
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }
      return [...prev, { ...menuItem, id_unique: idUnique, quantity }];
    });
  };

  const updateQuantity = (idUnique: string, delta: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.id_unique === idUnique) {
          const newQty = Math.max(1, item.quantity + delta);
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  };

  const removeItem = (idUnique: string) => {
    setCart((prev) => {
      const newCart = prev.filter((i) => i.id_unique !== idUnique);
      if (newCart.length === 0) setIsExpanded(false);
      return newCart;
    });
  };

  const getAttributeLabels = (item: any) => {
    if (!item.selectedAttributes || !item.attributes) return "";
    return Object.entries(item.selectedAttributes)
      .map(([attrId, levelId]) => {
        const attribute = item.attributes.find((a: any) => a.id === parseInt(attrId));
        const level = attribute?.levels.find((l: any) => l.id === parseInt(levelId as string));
        return level ? `${attribute.name}: ${level.name}` : null;
      })
      .filter(Boolean)
      .join(", ");
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 pb-40">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <Button
          variant="ghost"
          onClick={onBack}
          className="w-fit p-0 hover:bg-transparent text-neutral-500"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> {t("booking.common.back")}
        </Button>
        <div className="md:text-right">
          <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100 leading-tight">
            {t("booking.step2.title")}
          </h2>
          <p className="text-sm text-neutral-500 mt-1">
            {t("booking.step2.description")}
          </p>
        </div>
      </div>

      <NavigationBar
        selectedCategory={state.selectedCategory}
        selectedSorts={state.selectedSorts}
        onCategoryChange={(cat: string) => {
          actions.setSelectedCategory(cat);
          actions.setPage(1);
        }}
        onSearch={actions.setSearchQuery}
        onSortChange={(sorts: string[]) => {
          actions.setSelectedSorts(sorts);
          actions.setPage(1);
        }}
      />

      {state.loadingMenu ? (
        <MenuListSkeleton />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {state.menuData.map((item: any) => (
            <MenuCard
              key={item.id}
              item={item}
              onOpenDetail={() => actions.handleOpenDetail(item)}
            />
          ))}
        </div>
      )}

      <MenuDetailView
        menu={state.selectedMenu}
        isOpen={state.isModalOpen}
        onClose={actions.handleCloseDetail}
        onAddToCart={(data: any) => {
          const { quantity, ...menuItem } = data;
          addToCart(menuItem, quantity);
        }}
      />

      <AnimatePresence>
        {cart.length > 0 && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[95%] max-w-5xl z-50">
            <motion.div
              layout
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl border border-neutral-200 dark:border-white/10 rounded-xl shadow-lg overflow-hidden"
            >
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-b border-neutral-100 dark:border-white/5"
                  >
                    <div className="p-6 lg:max-h-[300px] max-h-[200px] overflow-y-auto custom-scrollbar">
                      <div className="flex sticky top-0 bg-inherit items-center justify-between mb-4 z-10">
                        <h3 className="text-sm font-semibold text-neutral-500">
                          Detail Pesanan
                        </h3>
                        <button
                          onClick={() => {
                            setCart([]);
                            setIsExpanded(false);
                          }}
                          className="text-xs text-red-500 hover:underline"
                        >
                          Hapus Semua
                        </button>
                      </div>
                      <div className="space-y-4">
                        {cart.map((item) => (
                          <div
                            key={item.id_unique}
                            className="flex items-center justify-between group border-b border-neutral-50 dark:border-white/5 pb-4 last:border-0"
                          >
                            <div className="flex items-center gap-4">
                              <div className="relative w-16 h-16 shrink-0">
                                <img
                                  src={item.image_url || `${import.meta.env.VITE_STORAGE_URL}/${item.menu_image}`}
                                  className="w-full h-full object-cover rounded-2xl"
                                  alt={item.name}
                                />
                              </div>
                              <div>
                                <h4 className="text-md font-bold text-neutral-800 dark:text-neutral-200">
                                  {item.name}
                                </h4>
                                <div className="flex flex-col gap-0.5 mt-1">
                                  <span className="text-[10px] text-neutral-400 italic">
                                    {getAttributeLabels(item)}
                                  </span>
                                </div>
                                <p className="text-sm font-black mt-1">
                                  {formatCurrency(item.total_price * item.quantity)}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="flex items-center bg-neutral-100 dark:bg-white/5 rounded-xl p-1 px-2">
                                <button onClick={() => updateQuantity(item.id_unique, -1)} className="p-1">
                                  <Minus size={14} />
                                </button>
                                <span className="text-xs font-black w-6 text-center">
                                  {item.quantity}
                                </span>
                                <button onClick={() => updateQuantity(item.id_unique, 1)} className="p-1">
                                  <Plus size={14} />
                                </button>
                              </div>
                              <button
                                onClick={() => removeItem(item.id_unique)}
                                className="text-neutral-300 hover:text-red-500"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="p-4 flex items-center justify-between gap-6">
                <div
                  className="flex-1 flex items-center gap-5 cursor-pointer"
                  onClick={() => setIsExpanded(!isExpanded)}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-neutral-500 font-medium">Total Estimasi</p>
                      <motion.div animate={{ rotate: isExpanded ? 180 : 0 }}>
                        <ChevronUp size={14} />
                      </motion.div>
                    </div>
                    <p className="text-lg font-bold">{formatCurrency(total)}</p>
                  </div>
                </div>

                <Button
                  onClick={() => onNext(cart)}
                  className="bg-red-600 hover:bg-red-700 text-white gap-2"
                >
                  Konfirmasi Pesanan
                  <ChevronRight size={18} />
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {cart.length === 0 && (
        <div className="fixed bottom-10 right-10">
          <Button
            variant="outline"
            onClick={onSkip}
            className="rounded-full h-12 shadow-xl backdrop-blur-md gap-2"
          >
            Skip Pemesanan Menu <FastForward size={16} />
          </Button>
        </div>
      )}
    </div>
  );
}
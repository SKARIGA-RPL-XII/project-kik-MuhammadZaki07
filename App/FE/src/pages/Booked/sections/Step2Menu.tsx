import { useState } from "react";
import {
  ArrowLeft,
  ChevronRight,
  ChevronUp,
  FastForward,
  Loader2,
  ShoppingBasket,
  Trash2,
  Minus,
  Plus,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useMenus } from "@/hooks/react-query/useMenu";
import { MenuCard, NavigationBar } from "@/components/resto";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { calculateOrder } from "@/utils/calculator";
import { MenuDetailView } from "@/components/resto/MenuDetailView";
import { formatCurrency } from "@/lib/currency";
import { useCustomerPageLogic } from "@/hooks/useCustomerPage";
import { MenuListSkeleton } from "@/components/skeleton/MenuCardSkeleton";

export default function Step2Menu({ onNext, onSkip, onBack, settings }: any) {
  const { t } = useTranslation();
  const { state, actions } = useCustomerPageLogic();

  const [cart, setCart] = useState<any[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  const addToCart = (menuItem: any, quantity: number) => {
    console.log(menuItem);
    const attrKey = Object.values(menuItem.selectedAttributes || {}).join("-");
    const idUnique = `${menuItem.id}-${attrKey}`;

    setCart((prev) => {
      const existing = prev.find((i) => i.id_unique === idUnique);
      if (existing) {
        return prev.map((i) =>
          i.id_unique === idUnique
            ? { ...i, quantity: i.quantity + quantity }
            : i,
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
      }),
    );
  };

  const removeItem = (idUnique: string) => {
    setCart((prev) => prev.filter((i) => i.id_unique !== idUnique));
    if (cart.length <= 1) setIsExpanded(false);
  };

  const { total } = calculateOrder(cart, settings);
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

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
                      <div className="flex sticky items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-neutral-500">
                          Detail Pesanan
                        </h3>
                        <button
                          onClick={() => setCart([])}
                          className="text-xs text-red-500 hover:underline"
                        >
                          Hapus Semua
                        </button>
                      </div>
                      <div className="space-y-4">
                        {cart.map((item) => {
                          const hasDiscount =
                            item.discount && item.discount.is_active;

                          const getSelectedAttributeNames = () => {
                            if (!item.selectedAttributes || !item.attributes)
                              return "";

                            return Object.entries(item.selectedAttributes)
                              .map(([attrId, levelId]) => {
                                const attribute = item.attributes.find(
                                  (a) => a.id === parseInt(attrId),
                                );
                                if (!attribute) return null;

                                const level = attribute.levels.find(
                                  (l) => l.id === parseInt(levelId as string),
                                );

                                return level
                                  ? `${attribute.name}: ${level.name}`
                                  : null;
                              })
                              .filter(Boolean)
                              .join(", ");
                          };

                          const attributeLabels = getSelectedAttributeNames();

                          return (
                            <div
                              key={item.id_unique}
                              className="flex items-center justify-between group animate-in fade-in slide-in-from-left-2 border-b border-neutral-50 dark:border-white/5 pb-4 last:border-0"
                            >
                              <div className="flex items-center gap-4">
                                <div className="relative w-16 h-16 shrink-0">
                                  <div className="w-full h-full rounded-2xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 border border-neutral-100 dark:border-white/5">
                                    <img
                                      src={
                                        item.image_url ||
                                        `${import.meta.env.VITE_STORAGE_URL}/${item.menu_image}`
                                      }
                                      className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                      alt={item.name}
                                    />
                                  </div>
                                  {item.is_best_seller && (
                                    <div className="absolute -top-1 -left-1 bg-amber-500 text-white text-[8px] font-medium px-1.5 py-0.5 rounded-lg border uppercase tracking-tighter">
                                      Best Seller
                                    </div>
                                  )}
                                </div>

                                <div>
                                  <h4 className="text-md font-bold text-neutral-800 dark:text-neutral-200 leading-tight">
                                    {item.name}
                                  </h4>

                                  <div className="flex flex-col gap-0.5 mt-1">
                                    <span className="text-[10px] font-bold text-red-500 uppercase">
                                      {item.category.name ?? "-"}
                                    </span>

                                    {attributeLabels && (
                                      <span className="text-[10px] text-neutral-400 font-medium bg-neutral-50 dark:bg-white/5 px-2 py-0.5 rounded-md w-fit italic">
                                        {attributeLabels}
                                      </span>
                                    )}
                                  </div>

                                  {/* Logic Harga */}
                                  <div className="flex items-center gap-2 mt-1.5">
                                    <p className="text-sm font-black text-neutral-900 dark:text-white">
                                      Rp{" "}
                                      {(
                                        item.total_price * item.quantity
                                      ).toLocaleString("id-ID")}
                                    </p>
                                    {hasDiscount && (
                                      <span className="text-[10px] text-neutral-400 line-through decoration-red-400/50 font-bold">
                                        Rp{" "}
                                        {(
                                          item.price * item.quantity
                                        ).toLocaleString("id-ID")}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-4">
                                {/* Stepper */}
                                <div className="flex items-center bg-neutral-100 dark:bg-white/5 rounded-xl p-1 px-2 border border-neutral-100 dark:border-white/5">
                                  <button
                                    onClick={() =>
                                      updateQuantity(item.id_unique, -1)
                                    }
                                    className="p-1 text-neutral-400 hover:text-red-500 transition-colors"
                                  >
                                    <Minus size={14} strokeWidth={3} />
                                  </button>
                                  <span className="text-xs font-black w-6 text-center tabular-nums">
                                    {item.quantity}
                                  </span>
                                  <button
                                    onClick={() =>
                                      updateQuantity(item.id_unique, 1)
                                    }
                                    className="p-1 text-neutral-400 hover:text-red-600 transition-colors"
                                  >
                                    <Plus size={14} strokeWidth={3} />
                                  </button>
                                </div>

                                <button
                                  onClick={() => removeItem(item.id_unique)}
                                  className="p-2 text-neutral-300 hover:text-red-500 transition-colors"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="p-4 flex items-center justify-between gap-6">
                <div
                  className="flex-1 relative flex items-center gap-5 overflow-hidden cursor-pointer group"
                  onClick={() => setIsExpanded(!isExpanded)}
                >
                  <div className="shrink-0">
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-neutral-500 font-medium">
                        Total Estimasi
                      </p>
                      <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        className="text-neutral-400"
                      >
                        <ChevronUp size={14} />
                      </motion.div>
                    </div>
                    <p className="text-lg font-bold text-neutral-900 dark:text-white leading-none">
                      {formatCurrency(total)}
                    </p>
                  </div>

                  <div className="h-10 w-[1px] bg-neutral-200 dark:bg-white/10 hidden md:block" />

                  {!isExpanded && (
                    <div className="hidden md:flex gap-2 overflow-x-auto no-scrollbar py-1">
                      {cart.slice(0, 3).map((item) => (
                        <div
                          key={item.id_unique}
                          className="flex items-center gap-2 bg-neutral-50 dark:bg-white/5 px-2 py-1 rounded-lg border border-neutral-100 dark:border-white/5 shrink-0"
                        >
                          <div className="w-6 h-6 rounded-md overflow-hidden bg-neutral-200">
                            <img
                              src={
                                item.image_url ||
                                `${import.meta.env.VITE_STORAGE_URL}/${item.menu_image}`
                              }
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <span className="text-[11px] font-bold text-neutral-700 dark:text-neutral-300">
                            {item.quantity}x
                          </span>
                        </div>
                      ))}
                      {cart.length > 3 && (
                        <span className="text-[11px] text-neutral-400 self-center">
                          +{cart.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <Button
                    onClick={() => onNext(cart)}
                    className="bg-red-600 hover:bg-red-700 text-white font-medium gap-2 active:scale-95"
                  >
                    Konfirmasi Pesanan
                    <ChevronRight size={18} />
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* {cart.length === 0 && (
        <div className="fixed bottom-10 right-10 animate-in fade-in zoom-in duration-500">
          <Button
            variant="outline"
            onClick={onSkip}
            className="rounded-full h-12 shadow-xl bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border-neutral-200 dark:border-white/10 text-neutral-500 font-medium gap-2 hover:bg-white dark:hover:bg-neutral-800 transition-all"
          >
            Skip Pemesanan Menu <FastForward size={16} />
          </Button>
        </div>
      )} */}
    </div>
  );
}

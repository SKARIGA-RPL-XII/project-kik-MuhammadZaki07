import {
  Trash2,
  Minus,
  Plus,
  X,
  CheckCircle2,
  Loader2,
  Utensils,
  ShoppingBag,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useSettings } from "@/context/SettingsContext";
import { useLocation, useNavigate, useSearchParams } from "react-router";
import { useTranslation } from "react-i18next"; // + Import

interface CartSummaryProps {
  isOpen?: boolean;
  onToggle: () => void;
  items: any[];
  onRemoveItem?: (key: string) => void;
  onUpdateQuantity?: (key: string, qty: number) => void;
  onClear?: () => void;
  onCheckout?: (orderType: string) => void;
  isPending?: boolean;
}

export function CartSummary({
  isOpen,
  onToggle,
  items = [],
}: CartSummaryProps) {
  const { t } = useTranslation();
  const location = useLocation();
  const itemCount = items.reduce((acc, item) => acc + (item.quantity || 0), 0);
  const total = items.reduce((acc, item) => {
    const price = item.discount_price || item.price || 0;
    return acc + Math.round(price * (item.quantity || 0));
  }, 0);

  const hideCartPaths = ["/profile-customer", "/transaction"];

  const shouldHide = hideCartPaths.some((path) =>
    location.pathname.includes(path),
  );

  if (shouldHide) return null;

  return (
    <AnimatePresence mode="wait">
      {!isOpen && (
        <motion.div
          key="premium-cart-bar"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[60] flex justify-center px-4 w-full max-w-lg"
        >
          <div
            onClick={onToggle}
            className="w-full max-w-lg dark:bg-neutral-900 bg-white border drop-shadow-2xl rounded-full px-4 py-2.5 flex items-center justify-between cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
          >
            <div className="flex items-center gap-4 ml-2">
              <div className="flex items-center -space-x-3">
                {items.length > 0 ? (
                  items.slice(0, 3).map((item, idx) => (
                    <motion.img
                      layoutId={`cart-img-${item.key || idx}`}
                      key={item.key || idx}
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 20,
                      }}
                      src={`${import.meta.env.VITE_STORAGE_URL}/${item.image}`}
                      className="w-10 h-10 rounded-full border-2 object-cover bg-white shadow-sm"
                      style={{ zIndex: 10 - idx }}
                      alt="item"
                    />
                  ))
                ) : (
                  <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center">
                    <ShoppingBag size={18} className="text-neutral-200" />
                  </div>
                )}
              </div>

              <div className="flex flex-col">
                <span className="dark:text-white font-bold text-sm leading-none mb-1">
                  {items.length > 0
                    ? t("cart_items_count", { count: itemCount })
                    : t("cart_empty")}
                </span>
                <span className="text-zinc-400 text-[10px] font-normal">
                  {items.length > 0
                    ? `Rp ${total.toLocaleString("id-ID")}`
                    : t("cart_start_ordering")}
                </span>
              </div>
            </div>

            <Button
              variant="ghost"
              className="text-white hover:bg-transparent hover:text-white font-bold text-xs gap-2"
              onClick={(e) => {
                e.stopPropagation();
                onToggle();
              }}
            >
              {items.length > 0 ? t("cart_btn_review") : t("cart_btn_open")}
              <ChevronRight size={16} className="text-red-500" />
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

CartSummary.SidebarContent = function SidebarContent({
  onToggle,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClear,
  isPending,
}: CartSummaryProps) {
  const { t } = useTranslation();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [orderType, setOrderType] = useState<string>("dine_in");
  const { settings } = useSettings();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tableIdFromUrl = searchParams.get("table");

  const toggleSelectAll = () => {
    if (selectedItems.length === items.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(items.map((item) => item.key));
    }
  };

  const toggleItem = (key: string) => {
    setSelectedItems((prev) =>
      prev.includes(key) ? prev.filter((i) => i !== key) : [...prev, key],
    );
  };

  const handleBulkDelete = () => {
    selectedItems.forEach((key) => onRemoveItem(key));
    setSelectedItems([]);
  };

  const currentSubtotal = items.reduce((acc, item) => {
    const price = item.discount_price || item.price;
    return acc + Math.round(price * item.quantity);
  }, 0);

  const taxRate = settings?.is_tax_active ? settings.tax_percent / 100 : 0;
  const serviceRate = settings?.is_service_active
    ? settings.service_percent / 100
    : 0;
  const serviceAmount = Math.round(currentSubtotal * serviceRate);
  const taxAmount = Math.round(currentSubtotal * taxRate);
  const totalAmount = currentSubtotal + taxAmount + serviceAmount;

  const onConfirmAction = () => {
    if (orderType === "dine_in" && !tableIdFromUrl) {
      navigate("/tables-customer", {
        state: { fromCart: true, items: items },
      });
    } else {
      navigate("/payment-customer", {
        state: {
          orderType,
          totalAmount,
          tableId: tableIdFromUrl,
          items: items,
        },
      });
    }
  };

  return (
    <div className="h-full bg-white dark:bg-neutral-950 flex flex-col">
      <div className="p-4 bg-white dark:bg-neutral-900 border-b space-y-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggle}
              className="h-9 w-9"
            >
              <X className="h-5 w-5" />
            </Button>
            <h2 className="font-bold text-lg uppercase tracking-tighter">
              {t("cart_order_summary")}
            </h2>
          </div>
          {selectedItems.length > 0 ? (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkDelete}
              className="h-8 text-[10px] font-bold px-4"
            >
              {t("cart_btn_remove_selected", { count: selectedItems.length })}
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClear}
              className="text-zinc-400 hover:text-red-500 h-9 w-9"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-800/50 px-3 py-2 rounded-md border">
          <div className="flex items-center gap-2">
            <Checkbox
              id="select-all"
              checked={
                selectedItems.length === items.length && items.length > 0
              }
              onCheckedChange={toggleSelectAll}
              className="border-zinc-300 dark:border-zinc-600 data-[state=checked]:bg-red-500"
            />
            <label
              htmlFor="select-all"
              className="text-sm font-medium text-zinc-500 cursor-pointer"
            >
              {t("cart_select_all")}
            </label>
          </div>
          <span className="text-sm font-medium text-zinc-400">
            {t("cart_total_items", { count: items.length })}
          </span>
        </div>
      </div>

      <ScrollArea className="flex-1 bg-zinc-50/50 dark:bg-zinc-950">
        <div className="p-3 space-y-2">
          {items.map((item) => {
            const hasDiscount =
              item.discount_price && item.discount_price < item.price;
            const activePrice = hasDiscount ? item.discount_price : item.price;

            return (
              <div
                key={item.key}
                className={`group relative p-3 rounded-sm border transition-all flex gap-3 bg-white dark:bg-zinc-900 ${
                  selectedItems.includes(item.key)
                    ? "border-red-500 shadow-sm"
                    : "border-zinc-200 dark:border-zinc-800"
                }`}
              >
                <div className="pt-0.5">
                  <Checkbox
                    checked={selectedItems.includes(item.key)}
                    onCheckedChange={() => toggleItem(item.key)}
                    className="border-zinc-300 dark:border-zinc-600 data-[state=checked]:bg-red-500"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-3 min-w-0">
                      <div className="h-12 w-12 rounded-lg bg-zinc-100 overflow-hidden shrink-0 border border-zinc-200">
                        <img
                          src={`${import.meta.env.VITE_STORAGE_URL}/${item.image}`}
                          className="h-full w-full object-cover"
                          alt={item.name}
                        />
                      </div>
                      <div className="truncate">
                        <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-xs truncate uppercase tracking-tight">
                          {item.name}
                        </h4>
                        <div className="flex items-center gap-2">
                          <p className="font-black text-red-600 text-[10px]">
                            Rp {activePrice.toLocaleString("id-ID")}
                          </p>
                          {hasDiscount && (
                            <p className="text-[9px] text-zinc-400 line-through decoration-zinc-400">
                              Rp {item.price.toLocaleString("id-ID")}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <p className="font-black text-zinc-900 dark:text-zinc-100 text-xs whitespace-nowrap ml-2">
                      Rp {(activePrice * item.quantity).toLocaleString("id-ID")}
                    </p>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-1 bg-zinc-50 dark:bg-zinc-800 border rounded-lg p-0.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() =>
                          onUpdateQuantity(item.key, item.quantity - 1)
                        }
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-6 text-center font-black text-[10px]">
                        {item.quantity}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() =>
                          onUpdateQuantity(item.key, item.quantity + 1)
                        }
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-zinc-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => onRemoveItem(item.key)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      <div className="bg-white dark:bg-zinc-900 border-t p-6 space-y-4 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
        <div className="grid grid-cols-2 gap-2 mb-2">
          <Button
            variant="outline"
            className={`h-12 flex flex-col gap-1 border-2 transition-all ${orderType === "dine_in" ? "border-red-600 bg-red-50 text-red-600" : "hover:text-red-500"}`}
            onClick={() => setOrderType("dine_in")}
          >
            <Utensils className="h-4 w-4" />
            <span className="text-xs font-semibold">
              {t("cart_order_type_dinein")}
            </span>
          </Button>
          <Button
            variant="outline"
            className={`h-12 flex flex-col gap-1 border-2 transition-all ${orderType === "take_away" ? "border-red-600 bg-red-50 text-red-600" : "hover:text-red-500"}`}
            onClick={() => setOrderType("take_away")}
          >
            <ShoppingBag className="h-4 w-4" />
            <span className="text-xs font-semibold">
              {t("cart_order_type_takeaway")}
            </span>
          </Button>
        </div>

        <div className="space-y-1.5 border-b  pb-3">
          <div className="flex justify-between text-[10px] font-bold text-zinc-400 dark:text-neutral-300 uppercase">
            <span>{t("cart_label_subtotal")}</span>
            <span className="text-zinc-900 font-black dark:text-neutral-300">
              Rp {currentSubtotal.toLocaleString("id-ID")}
            </span>
          </div>
          {settings?.is_service_active && (
            <div className="flex justify-between text-[10px] font-bold text-zinc-400 uppercase">
              <span>{t("cart_label_service")} ({settings.service_percent}%)</span>
              <span className="text-zinc-900 dark:text-neutral-300">
                Rp {serviceAmount.toLocaleString("id-ID")}
              </span>
            </div>
          )}
          {settings?.is_tax_active && (
            <div className="flex justify-between text-[10px] font-bold text-zinc-400 uppercase">
              <span>{t("cart_label_tax")} ({settings.tax_percent}%)</span>
              <span className="text-zinc-900 dark:text-neutral-300">
                Rp {taxAmount.toLocaleString("id-ID")}
              </span>
            </div>
          )}
        </div>

        <div className="flex justify-between items-end">
          <span className="text-xs font-bold text-red-600">{t("cart_label_total_payment")}</span>
          <span className="text-3xl font-black text-zinc-900 dark:text-neutral-300 tracking-tighter">
            Rp {totalAmount.toLocaleString("id-ID")}
          </span>
        </div>

        <Button
          className="w-full h-10 bg-red-600 hover:bg-red-700 text-white font-normal rounded-lg flex items-center justify-center gap-3 active:scale-[0.98] transition-transform"
          disabled={items.length === 0 || isPending}
          onClick={onConfirmAction}
        >
          <span className="text-md">
            {orderType === "dine_in" && !tableIdFromUrl
              ? t("cart_btn_select_table")
              : t("cart_btn_checkout")}
          </span>
          {isPending ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <CheckCircle2 className="h-5 w-5" />
          )}
        </Button>
      </div>
    </div>
  );
};
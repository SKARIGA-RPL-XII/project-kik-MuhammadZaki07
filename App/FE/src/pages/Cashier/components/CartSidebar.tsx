import {
  Trash2,
  Minus,
  Plus,
  ShoppingCart,
  X,
  CheckCircle2,
  Loader2,
  Utensils,
  ShoppingBag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useSettings } from "@/context/SettingsContext";
import { useNavigate } from "react-router";

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  items: any[];
  onUpdateQty: (key: string, qty: number) => void;
  onRemove: (key: string) => void;
  onClear: () => void;
  handleCheckout: (orderType: string) => Promise<void>;
  isPending: boolean;
}

export function CartSidebar({
  isOpen,
  onClose,
  items,
  onUpdateQty,
  onRemove,
  onClear,
  handleCheckout,
  isPending,
}: CartSidebarProps) {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [orderType, setOrderType] = useState<string>("dine_in");
  const { settings } = useSettings();
  const navigate = useNavigate();

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
    selectedItems.forEach((key) => onRemove(key));
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
    if (orderType === "dine_in") {
      navigate("/tables", { state: { fromCart: true } });
    } else {
      handleCheckout("take_away");
    }
  };

  return (
    <>
      {!isOpen && (
        <motion.button
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onClose}
          className="fixed right-8 bottom-8 z-[60] bg-red-600 dark:bg-red-500 text-white p-5 rounded-full shadow-xl flex items-center gap-4 border border-white/10"
        >
          <div className="relative flex justify-center items-center">
            <ShoppingCart className="h-6 w-6" />
            <span className="absolute -top-3 -right-3 bg-white dark:bg-zinc-900 text-red-600 dark:text-red-400 text-[10px] font-black h-5 w-5 rounded-full flex items-center justify-center border-2 border-red-600 dark:border-red-500">
              {items.length}
            </span>
          </div>
        </motion.button>
      )}

      <AnimatePresence mode="wait">
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/40 dark:bg-black/60 z-[999]"
            />

            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 right-0 w-full sm:w-[420px] h-full bg-white dark:bg-zinc-950 flex flex-col shadow-2xl z-[1000] border-l border-zinc-200 dark:border-zinc-800"
            >
              <div className="p-4 bg-white dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800 space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={onClose}
                      className="h-9 w-9 dark:text-zinc-400"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                    <h2 className="font-bold text-lg text-zinc-900 dark:text-zinc-100 uppercase tracking-tighter">
                      Order Summary
                    </h2>
                  </div>
                  {selectedItems.length > 0 ? (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleBulkDelete}
                      className="h-8 text-[10px] font-bold px-4"
                    >
                      REMOVE ({selectedItems.length})
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

                <div className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-800/50 px-3 py-2 rounded-lg border border-zinc-100 dark:border-zinc-800">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="select-all"
                      checked={
                        selectedItems.length === items.length &&
                        items.length > 0
                      }
                      onCheckedChange={toggleSelectAll}
                      className="border-zinc-300 dark:border-zinc-600 data-[state=checked]:bg-red-500"
                    />
                    <label
                      htmlFor="select-all"
                      className="text-sm font-medium text-zinc-500 dark:text-zinc-400 cursor-pointer"
                    >
                      Select All
                    </label>
                  </div>
                  <span className="text-sm font-medium text-zinc-400 dark:text-zinc-500">
                    {items.length} Items
                  </span>
                </div>
              </div>

              <ScrollArea className="flex-1 bg-zinc-50/50 dark:bg-zinc-950">
                <div className="p-3 space-y-2">
                  <AnimatePresence>
                    {items.map((item) => {
                      const activePrice = item.discount_price || item.price;
                      return (
                        <motion.div
                          layout
                          key={item.key}
                          className={`group relative p-3 rounded-sm border transition-all flex gap-3 
                            ${selectedItems.includes(item.key) ? "bg-white dark:bg-zinc-900 border-red-500" : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"}`}
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
                                <div className="h-10 w-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 overflow-hidden shrink-0 border border-zinc-200 dark:border-zinc-700">
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
                                    <p className="font-black text-red-600 dark:text-red-400 text-[10px]">
                                      Rp {activePrice.toLocaleString()}
                                    </p>
                                    {item.discount_price && (
                                      <span className="text-sm text-zinc-400">
                                        Rp {item.price.toLocaleString()}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <p className="font-black text-zinc-900 dark:text-zinc-100 text-xs whitespace-nowrap ml-2">
                                Rp{" "}
                                {Math.round(
                                  activePrice * item.quantity,
                                ).toLocaleString()}
                              </p>
                            </div>
                            <div className="flex items-center justify-between mt-3">
                              <div className="flex items-center gap-1 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-0.5">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() =>
                                    onUpdateQty(item.key, item.quantity - 1)
                                  }
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="w-6 text-center font-black text-[10px] dark:text-zinc-200">
                                  {item.quantity}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() =>
                                    onUpdateQty(item.key, item.quantity + 1)
                                  }
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-zinc-300 dark:text-zinc-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => onRemove(item.key)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </ScrollArea>

              <div className="bg-white dark:bg-zinc-900 border-t p-6 space-y-4 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <Button
                    variant="outline"
                    className={`h-12 flex hover:text-red-500 hover:bg-red-100/50 flex-col gap-1 items-center justify-center border-2 transition-all ${orderType === "dine_in" ? "border-red-600 bg-red-50 text-red-600" : "border-zinc-100"}`}
                    onClick={() => setOrderType("dine_in")}
                  >
                    <Utensils className="h-4 w-4" />
                    <span className="text-sm font-medium">Dine In</span>
                  </Button>
                  <Button
                    variant="outline"
                    className={`h-12 flex hover:text-red-500 hover:bg-red-100/50 flex-col gap-1 items-center justify-center border-2 transition-all ${orderType === "take_away" ? "border-red-600 bg-red-50 text-red-600" : "border-zinc-100"}`}
                    onClick={() => setOrderType("take_away")}
                  >
                    <ShoppingBag className="h-4 w-4" />
                    <span className="text-sm font-medium">Take Away</span>
                  </Button>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-zinc-400 uppercase">
                    <span>Subtotal</span>
                    <span className="text-zinc-900 dark:text-zinc-200 text-xs font-black">
                      Rp {currentSubtotal.toLocaleString()}
                    </span>
                  </div>
                  {settings?.is_service_active && (
                    <div className="flex justify-between text-xs font-semibold text-zinc-400 uppercase">
                      <span>Service ({settings.service_percent}%)</span>
                      <span className="text-zinc-900 dark:text-zinc-200 text-xs font-black">
                        Rp {serviceAmount.toLocaleString()}
                      </span>
                    </div>
                  )}
                  {settings?.is_tax_active && (
                    <div className="flex justify-between text-xs font-semibold text-zinc-400 uppercase">
                      <span>Tax ({settings.tax_percent}%)</span>
                      <span className="text-zinc-900 dark:text-zinc-200 text-xs font-black">
                        Rp {taxAmount.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-end pt-2 border-t border-zinc-100 dark:border-zinc-800">
                  <span className="text-md font-bold text-red-600">
                    Total Amount
                  </span>
                  <span className="text-3xl font-black text-zinc-900 dark:text-zinc-50 tracking-tighter">
                    Rp {totalAmount.toLocaleString()}
                  </span>
                </div>

                <Button
                  className="w-full h-14 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-3 group"
                  disabled={items.length === 0 || isPending}
                  onClick={onConfirmAction}
                >
                  <span className="font-medium text-lg">
                    {orderType === "dine_in" ? "Select Table" : "Confirm Order"}
                  </span>
                  {isPending ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-5 w-5 group-hover:scale-110 transition-transform" />
                  )}
                </Button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
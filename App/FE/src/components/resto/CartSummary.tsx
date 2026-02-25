import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  Trash2,
  X,
  Minus,
  Plus,
  ChevronRight,
  CreditCard,
} from "lucide-react";
import { CartItem } from "@/hooks/useCart";
import { useSettings } from "@/context/SettingsContext";
import Button from "../ui/button/Button";

interface CartSummaryProps {
  items: CartItem[];
  onCheckout?: () => void;
  onRemoveItem?: (key: string) => void;
  onUpdateQuantity?: (key: string, quantity: number) => void;
  isOpen?: boolean;
  onToggle?: () => void;
}

export function CartSummary({
  items = [],
  onCheckout,
  isOpen = false,
  onToggle,
}: CartSummaryProps) {
  const { settings } = useSettings();

  const subtotal = items.reduce(
    (sum, ci) => sum + (ci.price || 0) * ci.quantity,
    0,
  );

  const taxRate = settings?.is_tax_active ? settings.tax_percent / 100 : 0;
  const serviceRate = settings?.is_service_active
    ? settings.service_percent / 100
    : 0;

  const taxAmount = subtotal * taxRate;
  const serviceAmount = subtotal * serviceRate;
  const total = subtotal + taxAmount + serviceAmount;

  const itemCount = items.reduce((sum, ci) => sum + ci.quantity, 0);
  const currency = settings?.currency_symbol || "Rp";

  const getImageUrl = (path: string) => {
    if (!path) return "/placeholder.png";
    return path.startsWith("http")
      ? path
      : `${import.meta.env.VITE_STORAGE_URL}/${path}`;
  };

  return (
    <AnimatePresence mode="wait">
      {!isOpen && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="fixed bottom-8 left-0 right-0 z-[60] flex justify-center px-4"
        >
          <div
            onClick={onToggle}
            className="w-full max-w-lg bg-brand-500 drop-shadow-2xl rounded-full px-4 py-2.5 flex items-center justify-between cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
          >
            <div className="flex items-center gap-4 ml-2">
              <div className="flex items-center -space-x-3">
                {itemCount > 0 ? (
                  items
                    .slice(0, 3)
                    .map((item, idx) => (
                      <img
                        key={item.key}
                        src={getImageUrl(item.image)}
                        className="w-10 h-10 rounded-full border-2 border-neutral-900 object-center bg-white shadow-sm"
                        style={{ zIndex: 10 - idx }}
                      />
                    ))
                ) : (
                  <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center">
                    <ShoppingBag size={18} className="text-neutral-400" />
                  </div>
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-white font-bold text-lg leading-none mb-1">
                  {itemCount > 0 ? `${itemCount} Selected` : "Your Cart"}
                </span>
                <span className="text-white text-[10px] font-bold">
                  {itemCount > 0
                    ? `${currency} ${total.toLocaleString("id-ID")}`
                    : "Empty"}
                </span>
              </div>
            </div>

            <Button
              onClick={(e: any) => {
                e.stopPropagation();
                if (itemCount > 0) onCheckout?.();
                else onToggle?.();
              }}
              className="hover:bg-transparent"
            >
              {itemCount > 0 ? "Review Order" : "Start Ordering"}{" "}
              <ChevronRight size={14} className="ml-1" />
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

CartSummary.SidebarContent = function SidebarContent({
  items,
  onToggle,
  onRemoveItem,
  onUpdateQuantity,
  onCheckout,
}: any) {
  const { settings } = useSettings();

  const subtotal = items.reduce(
    (sum: number, ci: any) => sum + (ci.price || 0) * ci.quantity,
    0,
  );
  const taxRate = settings?.is_tax_active ? settings.tax_percent / 100 : 0;
  const serviceRate = settings?.is_service_active
    ? settings.service_percent / 100
    : 0;

  const taxAmount = subtotal * taxRate;
  const serviceAmount = subtotal * serviceRate;
  const total = subtotal + taxAmount + serviceAmount;
  const currency = settings?.currency_symbol || "Rp";

  const getImageUrl = (path: string) => {
    if (!path) return "/placeholder.png";
    return path.startsWith("http")
      ? path
      : `${import.meta.env.VITE_STORAGE_URL}/${path}`;
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-8 h-20 flex items-center justify-between border-b border-neutral-100">
        <h2 className="text-xl font-bold">Summary</h2>

        <button
          onClick={onToggle}
          className="p-2 bg-red-50 rounded-sm"
        >
          <X
            size={20}
            className="text-red-400"
          />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 rounded-full bg-neutral-50 flex items-center justify-center mb-6">
              <ShoppingBag size={32} className="text-neutral-200" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 mb-1">
              Your cart is empty
            </p>
            <p className="text-[9px] text-neutral-300 uppercase tracking-widest font-bold">
              Add some delicious items
            </p>
          </div>
        ) : (
          items.map((ci: any) => (
            <div key={ci.key} className="flex gap-5 group">
              <div className="relative w-16 h-16 overflow-hidden rounded-xl border border-neutral-100 flex-shrink-0">
                <img
                  src={getImageUrl(ci.image)}
                  className="object-center w-full h-full bg-neutral-50 transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <div className="flex-1 min-w-0 flex flex-col py-0.5">
                <div className="flex justify-between items-start mb-1">
                  <div className="flex flex-col min-w-0">
                    <h3 className="font-black text-neutral-900 text-[11px] uppercase truncate leading-tight">
                      {ci.name}
                    </h3>
                    {ci.selectedAttributes &&
                      ci.selectedAttributes.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {ci.selectedAttributes.map(
                            (attr: any, idx: number) => (
                              <span
                                key={idx}
                                className="text-[9px] font-bold text-brand-500 bg-brand-50 px-1.5 py-0.5 rounded-md uppercase tracking-tighter"
                              >
                                {attr.name || attr}
                              </span>
                            ),
                          )}
                        </div>
                      )}
                  </div>
                  <button
                    onClick={() => onRemoveItem?.(ci.key)}
                    className="text-neutral-300 hover:text-rose-500 transition-colors ml-2 flex-shrink-0"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className="flex items-center justify-between mt-auto">
                  <div className="flex items-center bg-neutral-50 rounded-xl p-0.5 border border-neutral-100">
                    <button
                      onClick={() =>
                        onUpdateQuantity?.(ci.key, ci.quantity - 1)
                      }
                      className="w-7 h-7 flex items-center justify-center rounded-lg bg-white text-neutral-600 hover:text-brand-600 transition-all active:scale-90"
                    >
                      <Minus size={10} strokeWidth={3} />
                    </button>
                    <span className="text-[10px] font-black text-neutral-900 min-w-[32px] text-center">
                      {ci.quantity}
                    </span>
                    <button
                      onClick={() =>
                        onUpdateQuantity?.(ci.key, ci.quantity + 1)
                      }
                      className="w-7 h-7 flex items-center justify-center rounded-lg bg-white text-neutral-600 hover:text-brand-600 transition-all active:scale-90"
                    >
                      <Plus size={10} strokeWidth={3} />
                    </button>
                  </div>
                  <span className="font-black text-neutral-900 text-[11px] tracking-tight">
                    {currency}{" "}
                    {(ci.price * ci.quantity).toLocaleString("id-ID")}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-8 bg-neutral-50 border-t border-neutral-100">
        <div className="space-y-3 mb-8">
          <div className="flex justify-between text-[12px] font-bold uppercase tracking-widest text-neutral-400">
            <span>Subtotal</span>
            <span className="text-neutral-900 font-black tracking-normal">
              {currency} {subtotal.toLocaleString("id-ID")}
            </span>
          </div>

          {settings?.is_service_active && (
            <div className="flex justify-between text-[12px] font-bold uppercase tracking-widest text-neutral-400">
              <span>Service ({settings.service_percent}%)</span>
              <span className="text-neutral-900 font-black tracking-normal">
                {currency}. {serviceAmount.toLocaleString("id-ID")}
              </span>
            </div>
          )}

          {settings?.is_tax_active && (
            <div className="flex justify-between text-[12px] font-bold uppercase tracking-widest text-neutral-400">
              <span>Tax ({settings.tax_percent}%)</span>
              <span className="text-neutral-900 font-black tracking-normal">
                {currency} {taxAmount.toLocaleString("id-ID")}
              </span>
            </div>
          )}

          <div className="pt-6 mt-6 border-t border-neutral-200 flex justify-between items-center">
            <span className="font-black text-neutral-900 text-xs tracking-widest uppercase">
              Total Bill
            </span>
            <div className="flex flex-col items-end">
              <span className="text-3xl font-black text-brand-600 tracking-tighter">
                {currency} {total.toLocaleString("id-ID")}
              </span>
              <span className="text-xs text-neutral-400 font-bold uppercase leading-none mt-1">
                Include All Taxes
              </span>
            </div>
          </div>
        </div>
        <Button
          onClick={onCheckout}
          disabled={items.length === 0}
          className="w-full"
        >
          Proceed to Payment <CreditCard size={16} className="ml-2" />
        </Button>
      </div>
    </div>
  );
};

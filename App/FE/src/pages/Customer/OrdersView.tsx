import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useOrdersLogic } from "@/hooks/useOrdersLogic";
import { ChevronLeft, Receipt, Utensils, CreditCard, Calendar } from "lucide-react";
import dayjs from "dayjs";
import { useSettings } from "@/context/SettingsContext";
import { useTranslation } from "react-i18next";

export function OrdersView() {
  const { t } = useTranslation();
  const { orders, loading } = useOrdersLogic();
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const { settings } = useSettings();

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 w-full rounded-2xl dark:bg-neutral-800" />
        ))}
      </div>
    );
  }

  if (selectedOrder) {
    const isPaid = ["paid", "completed"].includes(selectedOrder.status);
    const taxPercent = settings?.tax_percent;
    const servicePercent = settings?.service_percent;
    const isTaxActive = settings?.is_tax_active;
    const isServiceActive = settings?.is_service_active;
    const subtotal = selectedOrder.total_amount;
const taxAmount = isTaxActive ? Math.round((subtotal * taxPercent) / 100) : 0;
    const serviceAmount = isServiceActive ? Math.round((subtotal * servicePercent) / 100) : 0;
    
    const grandTotal = subtotal + taxAmount + serviceAmount;

    return (
      <div className="space-y-6 pb-10 animate-in fade-in slide-in-from-right-4 duration-300">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setSelectedOrder(null)}
            className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors"
          >
            <ChevronLeft size={20} className="text-neutral-600 dark:text-neutral-400" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-neutral-800 dark:text-neutral-100">{t("ov_detail_title")}</h1>
            <p className="text-xs text-neutral-400 font-medium font-mono">#{selectedOrder.transaction_code}</p>
          </div>
        </div>

        <Card className={`p-5 border-none rounded-xl shadow-lg shadow-red-500/10 ${isPaid ? 'bg-red-600 text-white' : 'bg-yellow-500 text-white'}`}>
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <p className="text-sm opacity-80 font-medium">{t("ov_status_label")}</p>
              <h2 className="text-2xl font-bold capitalize tracking-tight">{selectedOrder.status}</h2>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          <Card className="p-4 border-neutral-100 dark:border-neutral-800 rounded-xl shadow-none bg-neutral-50/50 dark:bg-neutral-900/50">
            <Calendar size={16} className="text-red-600 mb-2" />
            <p className="text-neutral-400 dark:text-neutral-500 text-sm">{t("ov_label_date")}</p>
            <p className="text-md font-bold text-neutral-800 dark:text-neutral-200">{dayjs(selectedOrder.created_at).format("DD MMM YYYY")}</p>
          </Card>
          <Card className="p-4 border-neutral-100 dark:border-neutral-800 rounded-xl shadow-none bg-neutral-50/50 dark:bg-neutral-900/50">
            <CreditCard size={16} className="text-red-600 mb-2" />
            <p className="text-neutral-400 dark:text-neutral-500 text-sm">{t("ov_label_method")}</p>
            <p className="text-md font-bold text-neutral-800 dark:text-neutral-200 uppercase">{selectedOrder.payment_method || 'QRIS'}</p>
          </Card>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <Utensils size={16} className="text-red-600" />
            <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-200 font-display">{t("ov_section_items")}</h3>
          </div>
          <Card className="overflow-hidden border-neutral-100 dark:border-neutral-800 rounded-lg shadow-none border">
            <div className="divide-y divide-neutral-50 dark:divide-neutral-800 max-h-[300px] overflow-y-auto">
              {selectedOrder.details.map((item: any, idx: number) => (
                <div key={idx} className="p-4 flex justify-between items-center bg-white dark:bg-neutral-900">
                  <div className="flex gap-4 items-center">
                    <div className="w-10 h-10 bg-red-50 dark:bg-red-950/30 rounded flex items-center justify-center">
                      <img src={`${import.meta.env.VITE_STORAGE_URL}/${item.menu.menu_image}`} alt={item.menu?.name} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-neutral-800 dark:text-neutral-200">{item.menu?.name}</p>
                      <p className="text-[11px] text-neutral-400 dark:text-neutral-500">Rp {new Intl.NumberFormat("id-ID").format(item.price)}</p>
                    </div>
                  </div>
                  <p className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
                    Rp {new Intl.NumberFormat("id-ID").format(item.subtotal)}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <Receipt size={16} className="text-red-600" />
            <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-200 font-display">{t("ov_section_bill")}</h3>
          </div>
          <Card className="p-6 border-neutral-100 dark:border-neutral-800 rounded-lg shadow-none bg-white dark:bg-neutral-900 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-neutral-400 dark:text-neutral-500">{t("ov_bill_subtotal")}</span>
              <span className="font-bold text-neutral-800 dark:text-neutral-200">
                Rp {new Intl.NumberFormat("id-ID").format(subtotal)}
              </span>
            </div>

            {isServiceActive && (
              <div className="flex justify-between text-sm">
                <span className="text-neutral-400 dark:text-neutral-500">{t("ov_bill_service")} ({servicePercent}%)</span>
                <span className="font-bold text-neutral-800 dark:text-neutral-200">
                  Rp {new Intl.NumberFormat("id-ID").format(serviceAmount)}
                </span>
              </div>
            )}

            {isTaxActive && (
              <div className="flex justify-between text-sm">
                <span className="text-neutral-400 dark:text-neutral-500">{t("ov_bill_tax")} ({taxPercent}%)</span>
                <span className="font-bold text-neutral-800 dark:text-neutral-200">
                  Rp {new Intl.NumberFormat("id-ID").format(taxAmount)}
                </span>
              </div>
            )}

            <div className="pt-3 border-t border-dashed border-neutral-200 dark:border-neutral-700 flex justify-between items-center">
              <span className="text-base font-bold text-neutral-800 dark:text-neutral-200">{t("ov_bill_total")}</span>
              <span className="text-xl font-black text-red-600 dark:text-red-500">
                Rp {new Intl.NumberFormat("id-ID").format(grandTotal)}
              </span>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-neutral-400 dark:text-neutral-600">
        <p className="text-xl font-normal">{t("ov_empty")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 animate-in fade-in duration-300">
      <h2 className="text-sm font-semibold text-neutral-400 dark:text-neutral-500 px-1 mb-2">{t("ov_title")}</h2>
      {orders.map((order) => (
        <div key={order.id} onClick={() => setSelectedOrder(order)} className="block cursor-pointer">
          <Card className="p-4 border-neutral-100 dark:border-neutral-800 shadow-none rounded-2xl bg-white dark:bg-neutral-900 hover:border-red-200 dark:hover:border-red-900/50 hover:shadow-md hover:shadow-red-500/5 transition-all group">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-xs text-neutral-400 dark:text-neutral-500 font-medium mb-1 font-mono">
                  #{order.transaction_code}
                </p>
                <h4 className="text-sm font-bold text-neutral-800 dark:text-neutral-200 leading-tight group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                  {order.details.length > 0 ? order.details[0]?.menu?.name : `Transaksi #${order.transaction_code}`}
                  {order.details.length > 1 && ` +${t("ov_item_count", { count: order.details.length - 1 })}`}
                </h4>
              </div>
              <span
                className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
                  ["paid", "completed"].includes(order.status)
                    ? "bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400"
                    : "bg-yellow-50 dark:bg-yellow-950/30 text-yellow-600 dark:text-yellow-400"
                }`}
              >
                {order.status.toUpperCase()}
              </span>
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-neutral-50 dark:border-neutral-800 mt-2">
              <span className="text-[11px] text-neutral-400 dark:text-neutral-500 font-medium">
                {dayjs(order.created_at).format("DD MMM YYYY")}
              </span>
              <span className="text-sm font-bold text-red-600 dark:text-red-500">
                Rp {new Intl.NumberFormat("id-ID").format(order.total_amount)}
              </span>
            </div>
          </Card>
        </div>
      ))}
    </div>
  );
}
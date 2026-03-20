import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useOrdersLogic } from "@/hooks/useOrdersLogic";
import {
  ChevronLeft,
  Receipt,
  Utensils,
  CreditCard,
  Calendar,
  Loader2,
} from "lucide-react";
import dayjs from "dayjs";
import { useSettings } from "@/context/SettingsContext";
import { useTranslation } from "react-i18next";
import { useToast } from "@/context/ToastContext";
import { openSnapPopup } from "@/utils/midtransHandler";
import { useLocation, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { TransactionService } from "@/services/transaction.service";
import { useCart } from "@/hooks/useCart";

export function OrdersView() {
  const { t } = useTranslation();
  const { orders, loading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useOrdersLogic();
  const [isRetrying, setIsRetrying] = useState(false);
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const {clearCart} = useCart();

  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const { settings } = useSettings();
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

const handleRetryPayment = async (orderId: number) => {
  setIsRetrying(true);
  try {
    const res = await TransactionService.getSnapToken(orderId);
    const snapToken = res.data.snap_token;

    await openSnapPopup(snapToken, {
      onSuccess: () => {
        toast(
          "success",
          "Pembayaran Berhasil",
          "Pesanan Anda sedang diproses.",
        );
        
        clearCart();
        navigate(`/invoice/${selectedOrder?.id}`, {
          state: { transactionData: selectedOrder },
        });
      },
      onPending: () =>
        toast("warning", "Pending", "Selesaikan pembayaran Anda."),
      onClose: () => toast("info", "Batal", "Segera selesaikan pembayaran."),
    });
  } catch (err: any) {
    toast("error", "Gagal", err.message || "Gagal memuat pembayaran.");
  } finally {
    setIsRetrying(false);
  }
};

  useEffect(() => {
    if (location.state?.selectedOrder) {
      setSelectedOrder(location.state.selectedOrder);

      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  if (loading && orders.length === 0) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton
            key={i}
            className="h-28 w-full rounded-2xl dark:bg-neutral-800"
          />
        ))}
      </div>
    );
  }

  if (selectedOrder) {
    const isPaid = ["paid", "completed"].includes(selectedOrder.status);
    const taxPercent = settings?.tax_percent || 0;
    const servicePercent = settings?.service_percent || 0;
    const isTaxActive = settings?.is_tax_active;
    const isServiceActive = settings?.is_service_active;

    const subtotal = selectedOrder.total_amount;
    const taxAmount = isTaxActive
      ? Math.round((subtotal * taxPercent) / 100)
      : 0;
    const serviceAmount = isServiceActive
      ? Math.round((subtotal * servicePercent) / 100)
      : 0;
    const grandTotal = subtotal + taxAmount + serviceAmount;

    return (
      <div className="space-y-6 pb-10 animate-in fade-in slide-in-from-right-4 duration-300">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSelectedOrder(null)}
            className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors"
          >
            <ChevronLeft
              size={20}
              className="text-neutral-600 dark:text-neutral-400"
            />
          </button>
          <div>
            <h1 className="text-lg font-bold text-neutral-800 dark:text-neutral-100">
              {t("ov_detail_title")}
            </h1>
            <p className="text-xs text-neutral-400 font-medium font-mono">
              #{selectedOrder.transaction_code}
            </p>
          </div>
        </div>

        <Card
          className={`p-5 border-none shadow-none dark:bg-neutral-950 ${isPaid ? "bg-green-500 text-white" : "bg-yellow-400 text-white"}`}
        >
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <p className="text-sm font-medium">
                {t("ov_status_label")}
              </p>
              <h2 className="text-2xl font-bold capitalize tracking-tight">
                {selectedOrder.status.replace("_", " ")}
              </h2>
            </div>

            {!isPaid && selectedOrder.status === "pending_payment" && (
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRetryPayment(selectedOrder.id);
                }}
                disabled={isRetrying}
              >
                {isRetrying ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <CreditCard size={16} />
                )}
                {t("Pay Now")}
              </Button>
            )}
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          <Card className="p-4 border-neutral-100 dark:border-neutral-800 rounded-xl shadow-none bg-neutral-50/50 dark:bg-neutral-900/50">
            <Calendar size={16} className="text-red-600 mb-2" />
            <p className="text-neutral-400 dark:text-neutral-500 text-xs">
              {t("ov_label_date")}
            </p>
            <p className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
              {dayjs(selectedOrder.created_at).format("DD MMM YYYY")}
            </p>
          </Card>
          <Card className="p-4 border-neutral-100 dark:border-neutral-800 rounded-xl shadow-none bg-neutral-50/50 dark:bg-neutral-900/50">
            <CreditCard size={16} className="text-red-600 mb-2" />
            <p className="text-neutral-400 dark:text-neutral-500 text-xs">
              {t("ov_label_method")}
            </p>
            <p className="text-sm font-bold text-neutral-800 dark:text-neutral-200 uppercase">
              {selectedOrder.payment_method || "QRIS"}
            </p>
          </Card>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <Utensils size={16} className="text-red-600" />
            <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
              {t("ov_section_items")}
            </h3>
          </div>
          <Card className="overflow-hidden border-neutral-100 dark:border-neutral-800 rounded-lg shadow-none border">
            <div className="divide-y divide-neutral-50 dark:divide-neutral-800 max-h-[300px] overflow-y-auto">
              {selectedOrder?.details?.map((item: any, idx: number) => (
                <div
                  key={idx}
                  className="p-4 flex justify-between items-center bg-white dark:bg-neutral-900"
                >
                  <div className="flex gap-3 items-center">
                    <div className="w-10 h-10 bg-neutral-50 dark:bg-neutral-800 rounded-lg overflow-hidden border border-neutral-100 dark:border-neutral-700">
                      <img
                        src={`${import.meta.env.VITE_STORAGE_URL}/${item.menu?.menu_image}`}
                        alt={item.menu?.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
                        {item.menu?.name}
                      </p>
                      <p className="text-[10px] text-neutral-400">
                        {item.quantity}x Rp{" "}
                        {new Intl.NumberFormat("id-ID").format(item.price)}
                      </p>
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
            <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
              {t("ov_section_bill")}
            </h3>
          </div>
          <Card className="p-5 border-neutral-100 dark:border-neutral-800 rounded-lg shadow-none bg-white dark:bg-neutral-900 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-neutral-400">{t("ov_bill_subtotal")}</span>
              <span className="font-bold text-neutral-800 dark:text-neutral-200">
                Rp {new Intl.NumberFormat("id-ID").format(subtotal)}
              </span>
            </div>
            {isServiceActive && (
              <div className="flex justify-between text-sm">
                <span className="text-neutral-400">
                  {t("ov_bill_service")} ({servicePercent}%)
                </span>
                <span className="font-bold text-neutral-800 dark:text-neutral-200">
                  Rp {new Intl.NumberFormat("id-ID").format(serviceAmount)}
                </span>
              </div>
            )}
            {isTaxActive && (
              <div className="flex justify-between text-sm">
                <span className="text-neutral-400">
                  {t("ov_bill_tax")} ({taxPercent}%)
                </span>
                <span className="font-bold text-neutral-800 dark:text-neutral-200">
                  Rp {new Intl.NumberFormat("id-ID").format(taxAmount)}
                </span>
              </div>
            )}
            <div className="pt-3 border-t border-dashed border-neutral-200 dark:border-neutral-700 flex justify-between items-center">
              <span className="text-base font-bold text-neutral-800 dark:text-neutral-200">
                {t("ov_bill_total")}
              </span>
              <span className="text-xl font-black text-red-600">
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
      <div className="flex flex-col items-center justify-center py-20 text-neutral-400">
        <Receipt size={48} className="mb-4 opacity-20" />
        <p className="text-lg font-medium">{t("ov_empty")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 animate-in fade-in duration-300 pb-10">
      <h2 className="text-xs font-bold text-neutral-400 uppercase tracking-widest px-1 mb-4">
        {t("ov_title")}
      </h2>

      {orders.map((order) => (
        <div
          key={order.id}
          onClick={() => setSelectedOrder(order)}
          className="cursor-pointer"
        >
          <Card className="p-4 border-neutral-100 dark:border-neutral-800 shadow-none rounded-2xl bg-white dark:bg-neutral-900 hover:border-red-200 dark:hover:border-red-900/50 hover:shadow-md hover:shadow-red-500/5 transition-all group">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-[10px] text-neutral-400 font-mono mb-1">
                  #{order.transaction_code}
                </p>
                <h4 className="text-sm font-bold text-neutral-800 dark:text-neutral-200 leading-tight group-hover:text-red-600 transition-colors">
                  {order?.details?.length > 0
                    ? order?.details[0]?.menu?.name
                    : `Order #${order.id}`}
                  {order?.details?.length > 1 &&
                    ` +${order.details.length - 1} ${t("ov_item_more")}`}
                </h4>
              </div>
              <span
                className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${["paid", "completed"].includes(order.status) ? "bg-green-50 text-green-600 dark:bg-green-950/30" : "bg-yellow-50 text-yellow-600 dark:bg-yellow-950/30"}`}
              >
                {order.status}
              </span>
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-neutral-50 dark:border-neutral-800 mt-2">
              <span className="text-[10px] text-neutral-400 font-medium">
                {dayjs(order.created_at).format("DD MMM YYYY, HH:mm")}
              </span>
              <span className="text-sm font-bold text-red-600">
                Rp {new Intl.NumberFormat("id-ID").format(order.total_amount)}
              </span>
            </div>
          </Card>
        </div>
      ))}

      <div ref={loadMoreRef} className="py-6 flex justify-center w-full">
        {isFetchingNextPage ? (
          <div className="flex items-center gap-2 text-red-600 text-xs font-bold bg-red-50 dark:bg-red-950/30 px-6 py-2 rounded-full animate-pulse">
            <Loader2 className="h-3 w-3 animate-spin" />
            {t("ov_loading_more")}
          </div>
        ) : hasNextPage ? (
          <div className="h-1" />
        ) : (
          <p className="text-[10px] text-neutral-400 italic font-medium">
            {t("ov_no_more")}
          </p>
        )}
      </div>
    </div>
  );
}

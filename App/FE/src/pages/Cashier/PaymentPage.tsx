import { useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router";
import { useCashierCart } from "@/hooks/useCashierCart";
import { useTransaction } from "@/hooks/react-query/useTransaction";
import { useSettings } from "@/context/SettingsContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CreditCard,
  Banknote,
  Loader2,
  ChevronLeft,
  ShieldCheck,
  Wallet,
  Info,
} from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/context/AuthContext";

declare global {
  interface Window {
    snap: any;
  }
}

export default function PaymentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartItems: cashierItems, clearCart: clearCashierCart } =
    useCashierCart();
  const { settings } = useSettings();
  const { useCreateTransaction } = useTransaction();
  const createMutation = useCreateTransaction();
  const { toast } = useToast();
  const { clearCart } = useCart();
  const { user } = useAuth();
  const [customerName, setCustomerName] = useState("");
  const isRequiredToInputName = !user || user.role_name !== "customer";

  const isCustomer = location.pathname.includes("customer");
  const isBookingOnline = location.state?.is_booking_via_online || false;

  const items = useMemo(() => {
    return isCustomer ? location.state?.items || [] : cashierItems || [];
  }, [isCustomer, location.state?.items, cashierItems]);

  const currency = settings?.currency_symbol || "Rp";

  const formatCurrency = (value: number) =>
    `${currency} ${Math.round(value).toLocaleString()}`;

  const [paymentMethod, setPaymentMethod] = useState(
    isBookingOnline || isCustomer ? "midtrans" : "cash",
  );
  const [amountPaid, setAmountPaid] = useState("");

  const orderData = {
    tableId:
      location.state?.selectedTableObject?.id ||
      location.state?.tableId ||
      null,

    tableName: location.state?.selectedTableObject
      ? `Table ${location.state.selectedTableObject.table_number}`
      : location.state?.tableName ||
        (location.state?.orderType === "take_away" ? "Take Away" : "No Table"),

    orderType: location.state?.orderType || "take_away",
  };
  const subtotal = useMemo(
    () =>
      Math.round(
        items.reduce(
          (acc: number, item: any) =>
            acc + (item.discount_price || item.price) * item.quantity,
          0,
        ),
      ),
    [items],
  );

  const tax = settings?.is_tax_active
    ? Math.round(subtotal * (settings.tax_percent / 100))
    : 0;

  const service = settings?.is_service_active
    ? Math.round(subtotal * (settings.service_percent / 100))
    : 0;

  const total = Math.round(subtotal + tax + service);

  const change = Math.max(0, (parseInt(amountPaid) || 0) - total);

  const quickCash = [total, 50000, 100000]
    .map((v) => Math.round(v))
    .filter((v) => v >= total);

  const handleProcessTransaction = async () => {
    const paidAmountNumeric = parseInt(amountPaid) || 0;

    if (!isCustomer && paymentMethod === "cash" && paidAmountNumeric < total) {
      toast("error", "Payment Error", "Insufficient amount");
      return;
    }

    const payload = {
      table_id: orderData.tableId,
      order_type: orderData.orderType,
      order_source: isCustomer ? "qr_code" : "cashier_direct",
      payment_method: paymentMethod,
      amount_paid:
        isCustomer && paymentMethod === "cash"
          ? 0
          : Math.round(paymentMethod === "cash" ? paidAmountNumeric : total),
      total_amount: Math.round(total),
      customer_name:
        user && user.role_name === "customer" ? user.username : customerName,
      settings: settings,
      items: items.map((item: any) => ({
        menu_id: item.id,
        quantity: item.quantity,
        price_at_transaction: Math.round(item.discount_price || item.price),
        subtotal: Math.round(
          (item.discount_price || item.price) * item.quantity,
        ),
        attributes: Object.values(item.selectedAttributes || {}),
      })),
    };

    try {
      const response = await createMutation.mutateAsync(payload);
      const transactionResult = response?.transaction || response?.data;
      const snapToken = response?.snap_token;

      if (paymentMethod === "cash") {
        if (transactionResult?.id) {
          if (!isCustomer) clearCashierCart();
          clearCart();
          toast(
            "success",
            "Success",
            isCustomer ? "Order Sent Successfully" : "Transaction completed",
          );

          if (isCustomer) {
            navigate("/order-success", { state: { order: transactionResult } });
          } else {
            navigate(`/invoice/${transactionResult.id}`, {
              state: {
                transactionData: transactionResult,
                changeAmount: change,
              },
            });
          }
        }
      } else if (snapToken) {
        window.snap.pay(snapToken, {
          onSuccess: () => {
            if (!isCustomer) clearCashierCart();
            clearCart();
            toast("success", "Success", "Payment Successful");
            navigate(`/invoice/${transactionResult?.id}`,
              {
                state: { transactionData: transactionResult },
              },
            );
          },
          onPending: () => {
            if (!isCustomer) clearCashierCart();
            clearCart();
            toast("warning", "Pending", "Waiting for payment");
            navigate(isCustomer ? "/customer/orders" : "/cashier");
          },
          onError: () => toast("error", "Failed", "Payment failed"),
          onClose: () => toast("info", "Cancelled", "Payment popup closed"),
        });
      }
    } catch (error: any) {
      toast("error", "Failed", `Error: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>

          <div className="flex items-center gap-2 text-sm text-emerald-600">
            <ShieldCheck className="h-4 w-4" />
            Secure Checkout
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5">
            <div className="bg-white rounded-xl border shadow-sm">
              <div className="p-6 border-b">
                <h2 className="text-sm text-slate-500">Order Summary</h2>
                <h1 className="text-xl font-semibold mt-1">
                  {orderData.tableName}
                </h1>
                <span className="text-xs text-red-600 mt-2 inline-block font-medium">
                  {isBookingOnline
                    ? "Booking - Dine In"
                    : orderData.orderType.replace("_", " ")}
                </span>
              </div>

              <div className="p-6 space-y-3 text-sm">
                {items.map((item: any, i: number) => (
                  <div key={i} className="flex justify-between">
                    <span>
                      <span className="font-medium mr-1">{item.quantity}x</span>
                      {item.name}
                    </span>
                    <span>
                      {formatCurrency(
                        (item.discount_price || item.price) * item.quantity,
                      )}
                    </span>
                  </div>
                ))}
              </div>

              <div className="p-6 border-t space-y-2 text-sm">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Tax & Service</span>
                  <span>{formatCurrency(tax + service)}</span>
                </div>
                <div className="flex justify-between font-semibold text-base pt-3 border-t">
                  <span>Total</span>
                  <span className="text-red-600">{formatCurrency(total)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-6">
            {isRequiredToInputName && (
              <div className="">
                <label className="text-sm font-semibold text-slate-700 block mb-2">
                  Nama Pelanggan <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  placeholder={
                    user?.role_name === "cashier"
                      ? "Masukkan nama pembeli..."
                      : "Masukkan nama Anda..."
                  }
                  className="h-12 border-slate-200 focus:ring-red-500"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
                <p className="text-[10px] text-slate-400 mt-2">
                  {user?.role_name === "cashier"
                    ? "Wajib diisi oleh kasir untuk keperluan laporan."
                    : "Nama diperlukan untuk identifikasi pesanan Anda."}
                </p>
              </div>
            )}

            <div>
              <h3 className="text-sm font-medium text-slate-600 mb-3">
                Payment Method
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { id: "cash", label: "Cash", icon: Banknote },
                  { id: "midtrans", label: "Digital / QRIS", icon: CreditCard },
                ]
                  .filter((method) =>
                    isBookingOnline ? method.id !== "cash" : true,
                  )
                  .map((method) => (
                    <button
                      key={method.id}
                      onClick={() => {
                        setPaymentMethod(method.id);
                        if (method.id !== "cash") setAmountPaid("");
                      }}
                      className={`p-4 rounded-lg border text-left transition ${
                        paymentMethod === method.id
                          ? "border-red-600 bg-red-50"
                          : "border-slate-200 bg-white hover:bg-slate-50"
                      }`}
                    >
                      <method.icon className="h-5 w-5 mb-2" />
                      <span className="text-sm font-medium">
                        {method.label}
                      </span>
                    </button>
                  ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border shadow-sm space-y-6">
              {paymentMethod === "cash" ? (
                <>
                  {!isCustomer ? (
                    <>
                      <div>
                        <label className="text-sm text-slate-600 block mb-2">
                          Amount Received
                        </label>
                        <div className="relative overflow-hidden rounded-lg">
                          <div className="absolute inset-y-0 left-0 bg-neutral-200 p-5 flex items-center pointer-events-none">
                            <span className="text-2xl font-semibold text-muted-foreground">
                              {currency}
                            </span>
                          </div>
                          <Input
                            type="number"
                            placeholder="0"
                            className="h-14 pl-20 text-4xl font-semibold rounded-lg"
                            value={amountPaid}
                            onChange={(e) => setAmountPaid(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {quickCash.map((val) => (
                          <Button
                            key={val}
                            variant="outline"
                            onClick={() => setAmountPaid(val.toString())}
                            className="text-sm"
                          >
                            {formatCurrency(val)}
                          </Button>
                        ))}
                      </div>
                      <div className="p-6 rounded-lg bg-slate-100 flex justify-between items-center">
                        <div>
                          <span className="text-xs text-slate-500">Change</span>
                          <div className="text-2xl font-semibold text-red-600">
                            {formatCurrency(change)}
                          </div>
                        </div>
                        <Wallet className="h-6 w-6 text-slate-400" />
                      </div>
                    </>
                  ) : (
                    <div className="p-6 rounded-xl bg-orange-50 border border-orange-200 flex gap-4 items-start">
                      <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
                        <Info className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="font-semibold text-orange-900 text-sm">
                          Pay at Cashier
                        </p>
                        <p className="text-xs text-orange-700 leading-relaxed">
                          Your order will be sent to the kitchen after you
                          complete the payment at the cashier counter by showing
                          your order barcode.
                        </p>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="py-12 flex flex-col items-center justify-center text-slate-500 gap-4">
                  <div className="p-4 bg-red-50 rounded-full text-red-600">
                    <CreditCard className="h-8 w-8" />
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-slate-900">
                      Digital Payment
                    </p>
                    <p className="text-xs">Secure payment via Midtrans Snap</p>
                  </div>
                </div>
              )}

              <Button
                disabled={
                  createMutation.isPending ||
                  items.length === 0 ||
                  // Logic Tambahan: Jika wajib isi nama tapi nama kosong, matikan tombol
                  (isRequiredToInputName && !customerName.trim()) ||
                  (!isCustomer &&
                    paymentMethod === "cash" &&
                    (!amountPaid || parseInt(amountPaid) < total))
                }
                onClick={handleProcessTransaction}
                className="w-full h-14 text-base font-semibold"
              >
                {createMutation.isPending ? (
                  <Loader2 className="animate-spin h-5 w-5" />
                ) : isCustomer && paymentMethod === "cash" ? (
                  "Confirm Order"
                ) : (
                  "Finalize Transaction"
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

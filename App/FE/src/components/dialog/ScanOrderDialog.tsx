import { useState, useEffect } from "react";
import { Search, Loader2, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useToast } from "@/context/ToastContext";
import { apiClient } from "@/lib/apiClient";
import { useSettings } from "@/context/SettingsContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { calculateOrder } from "@/utils/calculator";
import { useNavigate } from "react-router";
import { formatCurrency } from "@/lib/currency";

// export function formatCurrency(amount: number): string {
//   const roundedAmount = Math.round(amount);

//   return new Intl.NumberFormat("id-ID", {
//     style: "currency",
//     currency: "IDR",
//     minimumFractionDigits: 0,
//   }).format(roundedAmount);
// }

export default function OrderScanner() {
  const [transactionCode, setTransactionCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [transaction, setTransaction] = useState<any>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [amountPaid, setAmountPaid] = useState("");
  const { toast } = useToast();
  const { settings } = useSettings();
  const navigate = useNavigate();

  const { subtotal, taxAmount, serviceAmount, total } = transaction
    ? calculateOrder(
        transaction.details.map((d: any) => ({
          price: d.price,
          discount_price: null,
          quantity: d.menu_qty,
        })),
        settings,
      )
    : { subtotal: 0, taxAmount: 0, serviceAmount: 0, total: 0 };

  useEffect(() => {
    if (!isScanning) return;

    let html5QrCode: any;
    let scanned = false;

    const startScanner = async () => {
      const { Html5Qrcode } = await import("html5-qrcode");

      html5QrCode = new Html5Qrcode("reader");

      try {
        await html5QrCode.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 350 },
          },
          async (decodedText: string) => {
            if (scanned) return;
            scanned = true;

            try {
              await html5QrCode.stop();
            } catch {}

            setIsScanning(false);
            setTransactionCode(decodedText);
            fetchOrder(decodedText);
          },
          () => {},
        );
      } catch (err) {
        console.error("Camera error:", err);
      }
    };

    startScanner();

    return () => {
      scanned = true;
      try {
        html5QrCode?.stop();
      } catch {}
    };
  }, [isScanning]);

  const fetchOrder = async (code: string) => {
    if (!code) return;
    setLoading(true);

    try {
      const res = await apiClient(`/transactions/search/${code}`);
      const order = res.data.data;

      setTransaction(order);

      const items = order.details.map((d: any) => ({
        price: d.price,
        discount_price: null,
        quantity: d.menu_qty,
      }));

      const { total: calculatedTotal } = calculateOrder(items, settings);

      setAmountPaid(Math.round(calculatedTotal).toString());
    } catch {
      toast("error", "Tidak Ditemukan", "Kode transaksi tidak valid.");
      setTransactionCode("");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!transaction) return;

    if (parseFloat(amountPaid) < total) {
      return toast("error", "Pembayaran Gagal", "Uang tidak mencukupi.");
    }

    setLoading(true);
    try {
      const response = await apiClient.post(
        `/transactions/${transaction.id}/confirm-payment`,
        {
          amount_paid: amountPaid,
        },
      );

      const transactionResult = response.data.data;

      toast("success", "Berhasil", "Pembayaran terverifikasi.");

      navigate(`/invoice/${transactionResult.id}`, {
        state: { transactionData: transactionResult },
      });

      setTransaction(null);
      setTransactionCode("");
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Kesalahan sistem.";
      toast("error", "Gagal", errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const change = parseFloat(amountPaid || "0") - total;

  return (
    <div>
      <div className="group relative flex gap-3 items-center">
        <div className="flex items-center flex-1 relative">
          <div className="absolute left-4 pointer-events-none">
            <Search
              className="text-zinc-400 group-focus-within:text-red-500 transition-colors"
              size={18}
            />
          </div>
          <Input
            placeholder="Masukkan nomor transaksi..."
            value={transactionCode}
            className="pl-12 pr-4 border bg-transparent shadow-none focus-visible:ring-0 text-zinc-700 dark:text-neutral-200 text-base placeholder:text-zinc-400 w-full"
            onChange={(e) => setTransactionCode(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchOrder(transactionCode)}
          />
        </div>

        <div className="flex items-center gap-1">
          <Button
            onClick={() => fetchOrder(transactionCode)}
            disabled={loading}
            className="px-5 bg-red-600 hover:bg-red-700 text-white font-medium transition-all shadow-sm active:scale-95 disabled:opacity-50"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : "Cari"}
          </Button>
          <Button
            variant="secondary"
            type="button"
            onClick={() => setIsScanning(true)}
            className="text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-all active:scale-90"
          >
            <Camera size={20} />
          </Button>
        </div>
      </div>

      <Dialog open={isScanning} onOpenChange={setIsScanning}>
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden rounded-[2.5rem] border-none shadow-2xl">
          <div className="relative bg-neutral-950/50 aspect-video flex items-center justify-center overflow-hidden">
            <div id="reader" className="w-full h-full"></div>

            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="relative w-64 h-64 overflow-hidden">
                {/* scan line */}
                <div className="absolute left-0 w-full h-[2px] bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.8)] animate-scan-vertical"></div>

                {/* corner */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-red-500 rounded-tl-2xl"></div>
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-red-500 rounded-tr-2xl"></div>
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-red-500 rounded-bl-2xl"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-red-500 rounded-br-2xl"></div>

                {/* overlay */}
                <div className="absolute inset-0 bg-red-500/5 rounded-2xl animate-pulse"></div>
              </div>
            </div>
          </div>
          <div className="p-6 bg-zinc-50 dark:bg-neutral-900 flex justify-center gap-3">
            <Button
              onClick={() => setIsScanning(false)}
              className="font-normal dark:bg-neutral-800 dark:text-zinc-500 bg-red-500 text-white hover:text-red-600 transition-colors"
            >
              Tutup Scanner
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!transaction}
        onOpenChange={(open) => !open && setTransaction(null)}
      >
        <AlertDialogContent className="max-w-xl p-0 overflow-hidden shadow-xl rounded-xl bg-white dark:bg-neutral-900">
          <div className="p-8 space-y-6">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <AlertDialogTitle className="text-xl font-semibold text-zinc-800 dark:text-neutral-100">
                  Detail Pembayaran
                </AlertDialogTitle>
                <p className="text-sm text-zinc-500">
                  Pesanan #{transaction?.transaction_code} •{" "}
                  {transaction?.customer_name || "Umum"}
                </p>
              </div>
              <div className="bg-zinc-50 dark:bg-neutral-800 px-3 py-1 rounded-full">
                <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                  Meja {transaction?.table?.table_number || "TA"}
                </span>
              </div>
            </div>

            <div className="h-px bg-zinc-100 dark:bg-neutral-800 w-full" />

            <div className="max-h-[25vh] overflow-y-auto space-y-4 pr-3 custom-scrollbar">
              {transaction?.details.map((item: any, i: number) => (
                <div
                  key={i}
                  className="flex justify-between items-center text-sm gap-4"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="h-10 w-10 rounded-lg bg-zinc-50 dark:bg-neutral-800 border border-zinc-100 dark:border-neutral-700 overflow-hidden flex-shrink-0">
                      <img
                        src={`${import.meta.env.VITE_STORAGE_URL}/${
                          item.menu.menu_image
                        }`}
                        className="h-full w-full object-cover"
                        alt={item.menu?.name}
                      />
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="text-[10px] text-zinc-400 font-medium uppercase">
                        {item.menu_qty}x — {formatCurrency(item.price)}
                      </span>
                      <span className="text-sm font-medium text-zinc-700 dark:text-neutral-300 line-clamp-1 uppercase">
                        {item.menu?.name}
                      </span>
                    </div>
                  </div>
                  <span className="font-semibold text-zinc-900 dark:text-neutral-100 tabular-nums text-right">
                    {formatCurrency(item.subtotal)}
                  </span>
                </div>
              ))}
            </div>

            <div className="bg-zinc-50 dark:bg-neutral-800/50 rounded-xl p-6 space-y-3">
              <div className="space-y-1.5 border-b border-zinc-200 dark:border-neutral-700 pb-3">
                <div className="flex justify-between text-sm font-medium text-zinc-400">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                {settings?.is_service_active && (
                  <div className="flex justify-between text-sm font-medium text-zinc-400">
                    <span>Service ({settings.service_percent}%)</span>
                    <span>{formatCurrency(serviceAmount)}</span>
                  </div>
                )}
                {settings?.is_tax_active && (
                  <div className="flex justify-between text-sm font-medium text-zinc-400">
                    <span>Tax ({settings.tax_percent}%)</span>
                    <span>{formatCurrency(taxAmount)}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center text-sm text-zinc-500 pt-1">
                <span className="font-medium text-red-600">Total Tagihan</span>
                <span className="font-bold text-zinc-900 dark:text-neutral-100 text-2xl">
                  {formatCurrency(total)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-2">
                  <label className="text-sm text-zinc-400 font-medium">
                    Uang Tunai
                  </label>
                  <Input
                    type="number"
                    autoFocus
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(e.target.value)}
                    className="h-11 bg-white dark:bg-neutral-800 rounded-lg focus-visible:ring-1 focus-visible:ring-red-500 font-medium text-lg"
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-zinc-400 font-medium">
                    Kembalian
                  </label>
                  <div
                    className={`h-11 flex items-center px-3 rounded-lg text-lg font-medium ${
                      change < 0
                        ? "text-red-500 bg-red-50/50"
                        : "text-emerald-600 bg-emerald-50/50 dark:bg-transparent dark:border"
                    }`}
                  >
                    {formatCurrency(change > 0 ? change : 0)}
                  </div>
                </div>
              </div>
            </div>

            <AlertDialogFooter className="gap-2 pt-2">
              <AlertDialogCancel
                onClick={() => setTransaction(null)}
                className="h-11 border-none text-zinc-500 hover:bg-zinc-100 transition-colors bg-transparent shadow-none"
              >
                Batal
              </AlertDialogCancel>
              <AlertDialogAction
                disabled={loading || change < 0 || !amountPaid}
                onClick={(e) => {
                  e.preventDefault();
                  handleConfirm();
                }}
                className="h-11 px-6 bg-red-500 hover:bg-red-600 dark:bg-zinc-100 dark:text-zinc-900 text-white font-medium transition-all active:scale-95 disabled:opacity-30 flex-1"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Proses Pembayaran"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

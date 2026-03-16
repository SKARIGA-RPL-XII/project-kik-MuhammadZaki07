import { useState, useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import {
  Search,
  Loader2,
  Camera,
  X,
  Receipt,
  Wallet,
  CheckCircle2,
  QrCode,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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

export default function OrderScanner() {
  const [transactionCode, setTransactionCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [transaction, setTransaction] = useState<any>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [amountPaid, setAmountPaid] = useState("");
  const { toast } = useToast();
  const { settings } = useSettings();

  useEffect(() => {
    let scanner: any = null;

    if (isScanning) {
      const timer = setTimeout(() => {
        scanner = new Html5QrcodeScanner(
          "reader",
          {
            fps: 20,
            qrbox: { width: 380, height: 160 },
            aspectRatio: 1.777778,
          },
          false,
        );

        scanner.render(
          async (decodedText: string) => {
            await scanner.clear();
            setIsScanning(false);
            setTransactionCode(decodedText);
            fetchOrder(decodedText);
          },
          () => {},
        );
      }, 300);

      return () => {
        clearTimeout(timer);
        if (scanner) {
          scanner.clear().catch((err: any) => console.error(err));
        }
      };
    }
  }, [isScanning]);

  const fetchOrder = async (code: string) => {
    if (!code) return;
    setLoading(true);
    try {
      const res = await apiClient(`/transactions/search/${code}`);
      setTransaction(res.data.data);
      const initialTotal = calculateTotal(res.data.data);
      setAmountPaid(initialTotal.toString());
    } catch {
      toast("error", "Tidak Ditemukan", "Kode transaksi tidak valid.");
      setTransactionCode("");
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = (data: any) => {
    const subtotal = data?.total_amount || 0;
    const tax =
      settings.is_tax_active === 1
        ? (subtotal * settings.tax_percent) / 100
        : 0;
    const service =
      settings.is_service_active === 1
        ? (subtotal * settings.service_percent) / 100
        : 0;
    return Math.round(subtotal + tax + service);
  };

  const handleConfirm = async () => {
    if (!transaction) return;
    const total = calculateTotal(transaction);
    if (parseFloat(amountPaid) < total) {
      return toast("error", "Pembayaran Gagal", "Uang tidak mencukupi.");
    }

    setLoading(true);
    try {
      await apiClient.post(`/transactions/${transaction.id}/confirm-payment`, {
        amount_paid: amountPaid,
      });
      toast("success", "Berhasil", "Pembayaran terverifikasi.");
      setTransaction(null);
      setTransactionCode("");
    } catch {
      toast("error", "Gagal", "Kesalahan sistem.");
    } finally {
      setLoading(false);
    }
  };

  const currency = settings.currency_symbol || "Rp";
  const subtotal = transaction?.total_amount || 0;
  const tax =
    settings.is_tax_active === 1
      ? Math.round((subtotal * settings.tax_percent) / 100)
      : 0;
  const service =
    settings.is_service_active === 1
      ? Math.round((subtotal * settings.service_percent) / 100)
      : 0;
  const total = subtotal + tax + service;
  const change = parseFloat(amountPaid || "0") - total;

  console.log(transaction);
  

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
            <div id="reader" className="w-full h-full scale-110"></div>
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-6">
              <div className="relative w-full h-40 max-w-[380px]">
                <div className="absolute top-1/2 left-0 w-full h-[2px] bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.8)] z-10 animate-scan-line"></div>

                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-red-500 rounded-tl-2xl"></div>
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-red-500 rounded-tr-2xl"></div>
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-red-500 rounded-bl-2xl"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-red-500 rounded-br-2xl"></div>

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
  <AlertDialogContent className="max-w-xl p-0 overflow-hidden border border-zinc-100 shadow-xl rounded-xl bg-white dark:bg-neutral-900">
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <AlertDialogTitle className="text-xl font-semibold text-zinc-800 dark:text-neutral-100">
            Detail Pembayaran
          </AlertDialogTitle>
          <p className="text-sm text-zinc-500">
            Pesanan #{transaction?.transaction_code} • {transaction?.customer_name || 'Umum'}
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
          <div key={i} className="flex justify-between items-center text-sm gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="h-10 w-10 rounded-lg bg-zinc-50 dark:bg-neutral-800 border border-zinc-100 dark:border-neutral-700 overflow-hidden flex-shrink-0">
                <img
                  src={`${import.meta.env.VITE_STORAGE_URL}/${item.menu.menu_image}`}
                  className="h-full w-full object-cover"
                  alt={item.menu?.name}
                />
              </div>
              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-xs text-zinc-400 font-medium">
                  {item.menu_qty}x — {currency} {item.price.toLocaleString()}
                </span>
                <span className="text-sm font-medium text-zinc-700 dark:text-neutral-300 line-clamp-1 uppercase">
                  {item.menu?.name}
                </span>
              </div>
            </div>
            <span className="font-semibold text-zinc-900 dark:text-neutral-100 tabular-nums text-right">
              {currency} {item.subtotal.toLocaleString()}
            </span>
          </div>
        ))}
      </div>

      <div className="bg-zinc-50 dark:bg-neutral-800/50 rounded-xl p-6 space-y-3">
        <div className="flex justify-between text-sm text-zinc-500">
          <span>Total Tagihan</span>
          <span className="font-semibold text-zinc-900 dark:text-neutral-100 text-lg">
            {currency} {total.toLocaleString()}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="space-y-1.5">
            <label className="text-xs text-zinc-400 font-medium">Uang Tunai</label>
            <Input
              type="number"
              autoFocus
              value={amountPaid}
              onChange={(e) => setAmountPaid(e.target.value)}
              className="h-10 bg-white dark:bg-neutral-800 border-zinc-200 rounded-lg focus-visible:ring-1 focus-visible:ring-zinc-400"
              placeholder="0"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-zinc-400 font-medium">Kembalian</label>
            <div className={`h-10 flex items-center px-3 rounded-lg text-sm font-semibold ${change < 0 ? "text-red-500 bg-red-50" : "text-emerald-600 bg-emerald-50"}`}>
              {currency} {change > 0 ? change.toLocaleString() : 0}
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
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Proses Pembayaran"}
        </AlertDialogAction>
      </AlertDialogFooter>
    </div>
  </AlertDialogContent>
</AlertDialog>
    </div>
  );
}

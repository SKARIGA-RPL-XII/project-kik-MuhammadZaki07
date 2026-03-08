import { useState, useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { Search, Loader2, Camera, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/context/ToastContext";
import { apiClient } from "@/lib/apiClient";
import { useSettings } from "@/context/SettingsContext";

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
      scanner = new Html5QrcodeScanner(
        "reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false
      );

      scanner.render(
        (decodedText: string) => {
          setTransactionCode(decodedText);
          setIsScanning(false);
          fetchOrder(decodedText);
          scanner.clear();
        },
        () => {}
      );
    }

    return () => {
      if (scanner) scanner.clear();
    };
  }, [isScanning]);

  const fetchOrder = async (code: string) => {
    if (!code) return;
    setLoading(true);

    try {
      const res = await apiClient(`/transactions/search/${code}`);
      setTransaction(res.data.data);
      setAmountPaid(res.data.data.total_amount.toString());
    } catch {
      toast("error", "Not Found", "Transaction code is invalid or already paid.");
      setTransactionCode("");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!transaction) return;

    if (parseFloat(amountPaid) < total) {
      return toast("error", "Payment Error", "Insufficient payment amount.");
    }

    setLoading(true);

    try {
      await apiClient.post(`/transactions/${transaction.id}/confirm-payment`, {
        amount_paid: amountPaid,
      });

      toast("success", "Payment Success", "Transaction completed!");
      setTransaction(null);
      setTransactionCode("");
    } catch {
      toast("error", "Gagal", "System error or connection lost.");
    } finally {
      setLoading(false);
    }
  };

  const currency = settings.currency_symbol || "Rp";

  const subtotal = transaction?.total_amount || 0;

  const tax =
    settings.is_tax_active === 1
      ? (subtotal * settings.tax_percent) / 100
      : 0;

  const service =
    settings.is_service_active === 1
      ? (subtotal * settings.service_percent) / 100
      : 0;

  const total = subtotal + tax + service;

  const change = parseFloat(amountPaid || "0") - total;

  return (
    <div className="space-y-4 max-w-xl mx-auto">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            placeholder="Scan or type Transaction Code..."
            value={transactionCode}
            className="h-12 pl-4 font-mono"
            onChange={(e) => setTransactionCode(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchOrder(transactionCode)}
          />
        </div>

        <Button
          variant={isScanning ? "destructive" : "secondary"}
          onClick={() => setIsScanning(!isScanning)}
          className="h-12 px-4"
        >
          {isScanning ? <X className="w-5 h-5" /> : <Camera className="w-5 h-5" />}
        </Button>

        <Button onClick={() => fetchOrder(transactionCode)} className="h-12 bg-red-600">
          <Search className="w-5 h-5" />
        </Button>
      </div>

      {isScanning && (
        <div className="overflow-hidden rounded-2xl border-2 border-red-500 bg-black">
          <div id="reader" className="w-full"></div>
        </div>
      )}

      {transaction && (
        <div className="bg-white border border-zinc-100 p-8 rounded-[2rem] shadow-2xl animate-in fade-in zoom-in-95">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="font-black text-2xl italic tracking-tighter uppercase">
                {transaction.transaction_code}
              </h3>
              <p className="text-[10px] font-bold text-zinc-400">
                ORDER ID #{transaction.id}
              </p>
            </div>

            <span className="text-[10px] font-black px-3 py-1 bg-zinc-900 text-white rounded-full italic uppercase">
              TABLE {transaction.table?.name || "TA"}
            </span>
          </div>

          <div className="space-y-3 mb-6 text-sm">
            {transaction.details.map((item: any, i: number) => (
              <div key={i} className="flex justify-between border-b border-zinc-50 pb-2">
                <span className="font-medium text-zinc-600">
                  {item.menu_qty}x {item.menu?.name}
                </span>

                <span className="font-bold">
                  {currency} {item.subtotal.toLocaleString()}
                </span>
              </div>
            ))}
          </div>

          <div className="space-y-2 mb-8 text-sm">
            <div className="flex justify-between text-zinc-600">
              <span>Subtotal</span>
              <span>{currency} {subtotal.toLocaleString()}</span>
            </div>

            {settings.is_tax_active === 1 && (
              <div className="flex justify-between text-zinc-600">
                <span>Tax ({settings.tax_percent}%)</span>
                <span>{currency} {tax.toLocaleString()}</span>
              </div>
            )}

            {settings.is_service_active === 1 && (
              <div className="flex justify-between text-zinc-600">
                <span>Service ({settings.service_percent}%)</span>
                <span>{currency} {service.toLocaleString()}</span>
              </div>
            )}

            <div className="flex justify-between pt-3">
              <span className="text-lg font-black italic">TOTAL DUE</span>

              <span className="text-3xl font-black text-red-600 tracking-tighter">
                {currency} {total.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                  Amount Received
                </label>

                <Input
                  type="number"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                  className="h-14 text-xl font-black border-2 border-zinc-900 focus-visible:ring-0"
                />
              </div>

              <div className="space-y-1 text-right">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                  Change
                </label>

                <div
                  className={`h-14 flex items-center justify-end text-xl font-black italic ${
                    change < 0 ? "text-red-500" : "text-emerald-500"
                  }`}
                >
                  {currency} {change > 0 ? change.toLocaleString() : 0}
                </div>
              </div>
            </div>

            <Button
              className="w-full h-16 bg-zinc-900 hover:bg-black text-white text-lg font-black italic tracking-tighter rounded-2xl transition-all active:scale-95"
              onClick={handleConfirm}
              disabled={loading}
            >
              {loading ? <Loader2 className="animate-spin" /> : "PROCESS PAYMENT"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
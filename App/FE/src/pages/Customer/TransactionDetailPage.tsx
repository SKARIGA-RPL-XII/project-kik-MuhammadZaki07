import { useState, useEffect } from "react";
import { 
  ChevronLeft, MapPin, CreditCard, ReceiptText, 
  UtensilsCrossed, CheckCircle2, CircleDot, Loader2 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useNavigate, useParams } from "react-router";
import { UserService } from "@/services/user.service";
import { Skeleton } from "@/components/ui/skeleton";

export default function TransactionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        // Pastikan UserService punya method ini
        const data = await UserService.getTransactionById(id);
        setOrder(data);
      } catch (err) {
        console.error("Gagal ambil detail:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  if (loading) return <TransactionDetailSkeleton />;
  if (!order) return <div className="text-center py-20 text-neutral-400">Pesanan tidak ditemukan.</div>;

  return (
    <div className="max-w-2xl mx-auto pb-20 px-4 pt-4 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate(-1)}
          className="rounded-xl bg-neutral-50"
        >
          <ChevronLeft size={20} />
        </Button>
        <h1 className="text-lg font-semibold text-neutral-900">Detail Pesanan</h1>
      </div>

      <div className="space-y-6">
        {/* 1. Status & Timeline */}
        <Card className="p-6 border-neutral-100 shadow-sm rounded-2xl overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4">
             <span className={`text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wider ${
               ['paid', 'completed'].includes(order.status) ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
             }`}>
               {order.status}
             </span>
          </div>

          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white">
                  <CheckCircle2 size={16} />
                </div>
                <div className={`w-0.5 h-10 ${order.status !== 'pending' ? 'bg-red-200' : 'bg-neutral-100'}`}></div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  order.status !== 'pending' ? 'bg-red-50 text-red-600' : 'bg-neutral-50 text-neutral-300'
                }`}>
                  <CircleDot size={16} className={order.status === 'process' ? "animate-pulse" : ""} />
                </div>
              </div>
              
              <div className="flex flex-col gap-8 pt-1">
                <div>
                  <p className="text-sm font-semibold text-neutral-900 leading-none">Pesanan Diterima</p>
                  <p className="text-xs text-neutral-400 mt-1">
                    {new Date(order.created_at).toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-neutral-900 leading-none">
                    {order.status === 'completed' ? 'Sudah Disajikan' : 'Sedang Dimasak'}
                  </p>
                  <p className="text-xs text-neutral-400 mt-1">
                    {order.status === 'completed' ? 'Selamat menikmati hidanganmu!' : 'Koki sedang menyiapkan hidanganmu'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* 2. Rincian Menu (Receipt Style) */}
        <Card className="border-neutral-100 shadow-sm rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-neutral-50 bg-neutral-50/30">
            <div className="flex items-center gap-2 text-neutral-500 mb-1">
              <ReceiptText size={14} />
              <span className="text-[11px] font-medium uppercase tracking-widest">Rincian Menu</span>
            </div>
            <h3 className="text-sm font-bold text-neutral-900">{order.transaction_code}</h3>
          </div>

          <div className="p-5 space-y-5">
            {order.details?.map((item: any) => (
              <div key={item.id} className="flex justify-between items-start">
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-xl bg-neutral-50 flex items-center justify-center text-neutral-400 border border-neutral-100 overflow-hidden">
                    {item.menu?.image ? (
                      <img src={item.menu.image} className="w-full h-full object-cover" />
                    ) : (
                      <UtensilsCrossed size={18} />
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-neutral-900">{item.menu?.name}</h4>
                    <p className="text-xs text-neutral-400">
                      {item.qty}x • Rp {new Intl.NumberFormat("id-ID").format(item.price)}
                    </p>
                  </div>
                </div>
                <span className="text-sm font-bold text-neutral-900">
                  Rp {new Intl.NumberFormat("id-ID").format(item.qty * item.price)}
                </span>
              </div>
            ))}

            <Separator className="bg-neutral-100" />

            <div className="space-y-2">
              <div className="flex justify-between text-sm text-neutral-500">
                <span>Subtotal</span>
                <span>Rp {new Intl.NumberFormat("id-ID").format(order.total_amount * 0.9)}</span>
              </div>
              <div className="flex justify-between text-sm text-neutral-500">
                <span>Pajak (10%)</span>
                <span>Rp {new Intl.NumberFormat("id-ID").format(order.total_amount * 0.1)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-neutral-900 pt-2">
                <span>Total Bayar</span>
                <span className="text-red-600 font-black">
                  Rp {new Intl.NumberFormat("id-ID").format(order.total_amount)}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* 3. Info Lokasi & Payment */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-100">
            <div className="flex items-center gap-2 text-neutral-400 mb-2">
              <MapPin size={14} />
              <span className="text-[10px] font-bold uppercase tracking-wider">Meja</span>
            </div>
            <p className="text-sm font-semibold text-neutral-900">{order.table_number || 'Take Away'}</p>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-100">
            <div className="flex items-center gap-2 text-neutral-400 mb-2">
              <CreditCard size={14} />
              <span className="text-[10px] font-bold uppercase tracking-wider">Metode</span>
            </div>
            <p className="text-sm font-semibold text-neutral-900">{order.payment_method?.toUpperCase() || 'Cash'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Sub-component untuk Loading State
function TransactionDetailSkeleton() {
  return (
    <div className="max-w-2xl mx-auto px-4 pt-4 space-y-6">
      <div className="h-8 w-40 bg-neutral-100 rounded-lg animate-pulse" />
      <Skeleton className="h-40 w-full rounded-2xl" />
      <Skeleton className="h-64 w-full rounded-2xl" />
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-20 rounded-2xl" />
        <Skeleton className="h-20 rounded-2xl" />
      </div>
    </div>
  );
}
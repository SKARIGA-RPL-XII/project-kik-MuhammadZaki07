import { useEffect, useState } from "react";
import { Link } from "react-router"; // Atau 'react-router-dom' tergantung setup lo
import { Card } from "@/components/ui/card";
import { UserService } from "@/services/user.service";
import { Skeleton } from "@/components/ui/skeleton";

export function OrdersView() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await UserService.getTransactions();
        setOrders(data || []);
      } catch (err) { console.error(err); } 
      finally { setLoading(false); }
    };
    fetchOrders();
  }, []);

  if (loading) return <div className="space-y-3">{[1, 2].map((i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}</div>;
  if (orders.length === 0) return <div className="text-center py-12 text-neutral-400 text-xs">Belum ada history pesanan</div>;

  return (
    <div className="space-y-3">
      {orders.map((order) => (
        <Link key={order.id} to={`/transaction/${order.id}`} className="block">
          <Card className="p-4 border-neutral-100 shadow-none rounded-2xl bg-white hover:border-red-200 hover:shadow-md hover:shadow-red-500/5 transition-all cursor-pointer group">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-[10px] text-neutral-400 font-bold mb-1 tracking-tight">#{order.transaction_code}</p>
                <h4 className="text-sm font-bold text-neutral-800 leading-tight group-hover:text-red-600 transition-colors">
                  {order.details[0]?.menu?.name} {order.details.length > 1 && `+${order.details.length - 1}`}
                </h4>
              </div>
              <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
                ['paid', 'completed'].includes(order.status) ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'
              }`}>
                {order.status.toUpperCase()}
              </span>
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-neutral-50 mt-2">
              <span className="text-[11px] text-neutral-400">
                {new Date(order.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
              </span>
              <span className="text-sm font-bold text-red-600">
                Rp {new Intl.NumberFormat("id-ID").format(order.total_amount)}
              </span>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
}
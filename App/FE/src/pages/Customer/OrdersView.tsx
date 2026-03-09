import { Link } from "react-router";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useOrdersLogic } from "@/hooks/useOrdersLogic";

export function OrdersView() {
  const { orders, loading } = useOrdersLogic();

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-neutral-400">
        <p className="text-xl font-normal">No order history found yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => (
        <Link key={order.id} to={`/transaction/${order.id}`} className="block">
          <Card className="p-4 border-neutral-100 shadow-none rounded-2xl bg-white hover:border-red-200 hover:shadow-md hover:shadow-red-500/5 transition-all cursor-pointer group">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-[10px] text-neutral-400 font-bold mb-1 tracking-tight">
                  #{order.transaction_code}
                </p>
                <h4 className="text-sm font-bold text-neutral-800 leading-tight group-hover:text-red-600 transition-colors">
                  {order.details[0]?.menu?.name} 
                  {order.details.length > 1 && ` +${order.details.length - 1} items`}
                </h4>
              </div>
              <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
                ['paid', 'completed'].includes(order.status) 
                ? 'bg-green-50 text-green-600' 
                : 'bg-yellow-50 text-yellow-600'
              }`}>
                {order.status.toUpperCase()}
              </span>
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-neutral-50 mt-2">
              <span className="text-[11px] text-neutral-400 font-medium">
                {new Date(order.created_at).toLocaleDateString('en-US', { day: '2-digit', month: 'short' })}
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
import { BarChart3, Package, Users, Wallet } from "lucide-react";
import { StatCard } from "./StatCard";
import { Skeleton } from "@/components/ui/skeleton"; // Sesuaikan path-nya
import { getProfileImage } from "@/utils/imageHelper";

export function StatCardsContainer({ stats, loading }: { stats: any; loading: boolean }) {
  const ValueSkeleton = () => <Skeleton className="h-7 w-32 rounded-md bg-neutral-100" />;
  const ImageSkeleton = () => <Skeleton className="w-6 h-6 rounded-full bg-neutral-100" />;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 mb-8">
      <StatCard
        label="Revenue Today"
        value={loading ? <ValueSkeleton /> : `Rp ${stats?.revenue_today?.toLocaleString('id-ID') || 0}`}
        icon={Wallet}
        description="Total earnings from today's sales"
      />

      <StatCard
        label="Top Customer"
        value={loading ? (
          <div className="flex items-center gap-2">
            <ImageSkeleton />
            <Skeleton className="h-5 w-24 rounded-md bg-neutral-100" />
          </div>
        ) : (
          <div className="flex items-center gap-2">
            {stats?.top_customer?.image && (
              <img
                src={getProfileImage(stats.top_customer.image)}
                className="w-8 h-8 rounded-full border border-neutral-200 object-cover"
                alt="top-user"
              />
            )}
            <span className="truncate max-w-[220px] font-bold">{stats?.top_customer?.name || "No Data"}</span>
          </div>
        )}
        icon={Users}
        description={loading ? <Skeleton className="h-3 w-20 mt-1" /> : `${stats?.top_customer?.total_orders || 0} total orders`}
      />

      <StatCard
        label="Items Sold"
        value={loading ? <ValueSkeleton /> : `${stats?.items_sold || 0} pcs`}
        icon={Package}
        description="Volume of menu items delivered"
      />

      <StatCard
        label="Total Turn-over"
        value={loading ? <ValueSkeleton /> : `Rp ${stats?.total_revenue?.toLocaleString('id-ID') || 0}`}
        icon={BarChart3}
        description={loading ? <Skeleton className="h-3 w-28 mt-1" /> : `Peak in ${stats?.peak_month || '-'}`}
      />
    </div>
  );
}
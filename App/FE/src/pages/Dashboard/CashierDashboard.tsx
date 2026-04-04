import PageMeta from "../../components/common/PageMeta";
import WelcomeBanner from "@/components/ui/WelcomeBanner";
import CalendarWidget from "@/components/ui/CalendarWidget";
import RecentOrders from "../../components/ecommerce/RecentOrders";
import { ShoppingCart, Clock, DollarSign } from "lucide-react";
import { useDashboard } from "@/hooks/react-query/useDashboard";
import { CashierDashboardSkeleton } from "@/components/skeleton/DashboardSkeleton";
import { Card } from "@/components/ui/card";

export default function CashierDashboard() {
  const { useCashierDashboard } = useDashboard();
  const { data, isLoading } = useCashierDashboard();

  if (isLoading) return <CashierDashboardSkeleton />;

  return (
    <>
      <PageMeta
        title="Cashier Dashboard"
        description="Manage transactions efficiently."
      />

      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12">
          <WelcomeBanner />
        </div>

        <div className="col-span-12 grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="Today's Transactions"
            value={data?.stats.today_transactions || 0}
            icon={<ShoppingCart className="text-blue-500" />}
          />
          <StatCard
            title="Today's Income"
            value={`Rp ${data?.stats.today_income.toLocaleString() || 0}`}
            icon={<DollarSign className="text-green-500" />}
          />
          <StatCard
            title="Pending Orders"
            value={data?.stats.total_pending || 0}
            icon={<Clock className="text-amber-500" />}
          />
        </div>

        <div className="col-span-12 xl:col-span-8 space-y-6">
          <RecentOrders />
        </div>

        <div className="col-span-12 xl:col-span-4 space-y-6">
          <CalendarWidget />
        </div>
      </div>
    </>
  );
}

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: any;
  icon: any;
}) {
  return (
    <Card className="p-5 rounded-xl shadow-none border flex items-center gap-4">
      <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
        {icon}
      </div>
      <div>
        <p className="text-sm text-neubg-neutral-500 dark:text-neubg-neutral-400 font-medium">
          {title}
        </p>
        <h3 className="text-2xl font-bold text-neubg-neutral-900 dark:text-white">
          {value}
        </h3>
      </div>
    </Card>
  );
}

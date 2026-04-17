import EcommerceMetrics from "../../components/ecommerce/EcommerceMetrics";
import MonthlySalesChart from "../../components/ecommerce/MonthlySalesChart";
import StatisticsChart from "../../components/ecommerce/StatisticsChart";
import MonthlyTarget from "../../components/ecommerce/MonthlyTarget";
import RecentOrders from "../../components/ecommerce/RecentOrders";
import PageMeta from "../../components/common/PageMeta";
import AdminTaskCard from "../../components/ecommerce/AdminTaskCard";
import CalendarWidget from "@/components/ui/CalendarWidget";
import WelcomeBanner from "@/components/ui/WelcomeBanner";
import { useDashboard } from "@/hooks/react-query/useDashboard";
import { AdminDashboardSkeleton } from "@/components/skeleton/DashboardSkeleton";
import CustomerChart from "@/components/charts/CustomerChart";
import { useCustomerStats } from "@/hooks/react-query/useCustomers";
import CustomerStatsCards from "@/components/ui/CustomerStatsCards";

export default function AdminDashboard() {
  const { useMetrics } = useDashboard();
  const { isLoading } = useMetrics();
   const { data: statsData, isLoading: statsLoading } = useCustomerStats();


  if (isLoading) {
    return (
      <div className="p-4 md:p-6">
        <AdminDashboardSkeleton />
      </div>
    );
  }
  return (
    <>
      <PageMeta
        title="My Dashboard"
        description="Sistem manajemen restoran terintegrasi."
      />
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12">
          <WelcomeBanner/>
        </div>
        <div className="col-span-12 space-y-6 xl:col-span-7">
          <EcommerceMetrics />
          <MonthlySalesChart />
            <CustomerStatsCards data={statsData} loading={statsLoading} />
        </div>

        <div className="col-span-12 xl:col-span-5 space-y-3">
          <CalendarWidget />
          <MonthlyTarget />
        </div>

        <div className="col-span-12 space-y-3">
          <StatisticsChart />
            <CustomerChart />
        </div>

        <div className="col-span-12 xl:col-span-5">
          <AdminTaskCard />
        </div>

        <div className="col-span-12 xl:col-span-7">
          <RecentOrders />
        </div>
      </div>
    </>
  );
}

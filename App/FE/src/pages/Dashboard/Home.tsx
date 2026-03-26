import EcommerceMetrics from "../../components/ecommerce/EcommerceMetrics";
import MonthlySalesChart from "../../components/ecommerce/MonthlySalesChart";
import StatisticsChart from "../../components/ecommerce/StatisticsChart";
import MonthlyTarget from "../../components/ecommerce/MonthlyTarget";
import RecentOrders from "../../components/ecommerce/RecentOrders";
import PageMeta from "../../components/common/PageMeta";
import AdminTaskCard from "../../components/ecommerce/AdminTaskCard";
import CalendarWidget from "@/components/ui/CalendarWidget";
import WelcomeBanner from "@/components/ui/WelcomeBanner";

export default function Home() {
  return (
    <>
      <PageMeta
        title="Dashboard Utama | Gagal-Lapar"
        description="Sistem manajemen restoran terintegrasi."
      />
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12">
          <WelcomeBanner/>
        </div>
        <div className="col-span-12 space-y-6 xl:col-span-7">
          <EcommerceMetrics />
          <MonthlySalesChart />
        </div>

        <div className="col-span-12 xl:col-span-5 space-y-3">
          <CalendarWidget />
          <MonthlyTarget />
        </div>

        <div className="col-span-12">
          <StatisticsChart />
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

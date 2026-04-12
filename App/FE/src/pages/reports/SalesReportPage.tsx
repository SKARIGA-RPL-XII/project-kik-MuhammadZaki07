import { lazy } from "react";
const Chart = lazy(() => import("react-apexcharts"));
import { useSettings } from "@/context/SettingsContext";
import { ApexOptions } from "apexcharts";
import { useSalesSummary } from "@/hooks/react-query/useReports";
import { ReceiptText, DollarSign, Loader2, Calendar } from "lucide-react";
import PageMeta from "@/components/common/PageMeta";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Card } from "@/components/ui/card";

export default function SalesReportPage() {
  const { settings } = useSettings();
  const { data: response, isLoading } = useSalesSummary(7);
  const summary = response?.data;

  const chartCategories =
    summary?.chart_data?.map((d: any) => {
      const date = new Date(d.date);
      return date.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
      });
    }) || [];

  const chartData =
    summary?.chart_data?.map((d: any) => Number(d.revenue)) || [];

  const chartOptions: ApexOptions = {
    chart: {
      type: "area",
      toolbar: { show: false },
      fontFamily: "inherit",
      dropShadow: {
        enabled: true,
        top: 8,
        left: 0,
        blur: 3,
        color: "#ef4444", // Shadow merah halus
        opacity: 0.15,
      },
    },
    stroke: {
      curve: "smooth",
      width: 3,
      colors: ["#ef4444"],
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0,
        stops: [0, 90, 100],
        colorStops: [
          {
            offset: 0,
            color: "#ef4444",
            opacity: 0.4,
          },
          {
            offset: 100,
            color: "#ffffff",
            opacity: 0,
          },
        ],
      },
    },
    markers: {
      size: 5,
      colors: ["#ffffff"],
      strokeColors: "#ef4444",
      strokeWidth: 3,
      hover: {
        size: 7,
      },
    },
    colors: ["#ef4444"],
    dataLabels: { enabled: false },
    grid: {
      borderColor: "rgba(163, 163, 163, 0.1)",
      strokeDashArray: 4,
      padding: { left: 20 },
    },
    xaxis: {
      categories: chartCategories,
      labels: { style: { colors: "#a3a3a3", fontSize: "11px" } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: { colors: "#a3a3a3", fontSize: "11px" },
        formatter: (val) =>
          `${settings?.currency_symbol || "Rp"} ${val.toLocaleString()}`,
      },
    },
    tooltip: {
      theme: "light",
      x: { show: true },
      marker: { show: true },
    },
    noData: {
      text: "Belum ada data penjualan",
      align: "center",
      verticalAlign: "middle",
      style: { color: "#a3a3a3", fontSize: "14px" },
    },
  };

  const chartSeries = [
    {
      name: "Pendapatan",
      data: chartData,
    },
  ];

  return (
    <div className="p-6 bg-white dark:bg-neutral-900 min-h-screen">
      <PageMeta
        title="Analisis Penjualan | Gagal-Lapar"
        description="Monitor tren pendapatan harian dan volume transaksi operasional."
      />
      <PageBreadcrumb pageTitle="Sales Report" />

      <div className="mt-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800 dark:text-white">
            Statistik Penjualan
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Ikhtisar performa keuangan unit bisnis Anda.
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-neutral-100 dark:bg-white/[0.05] rounded-lg text-neutral-600 dark:text-neutral-400 text-sm font-medium">
          <Calendar size={16} />
          <span>7 Hari Terakhir</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="relative overflow-hidden p-6 shadow-none">
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-xs text-neutral-400 font-medium mb-1">
                Pendapatan Hari Ini
              </p>
              <h2 className="text-3xl font-bold text-neutral-800 dark:text-white">
                {settings?.currency_symbol || "Rp"}{" "}
                {Number(summary?.total_revenue || 0).toLocaleString()}
              </h2>
            </div>
            <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl text-emerald-600 border border-emerald-100 dark:border-emerald-500/20">
              <DollarSign size={24} />
            </div>
          </div>
        </Card>

        <Card className="relative overflow-hidden p-6 shadow-none">
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-xs text-neutral-400 font-medium mb-1">
                Total Transaksi Hari Ini
              </p>
              <h2 className="text-3xl font-bold text-neutral-800 dark:text-white">
                {summary?.total_transactions || 0}{" "}
                <span className="text-sm font-normal text-neutral-400">
                  Nota
                </span>
              </h2>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-500/10 rounded-xl text-blue-600 border border-blue-100 dark:border-blue-500/20">
              <ReceiptText size={24} />
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6 shadow-none">
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100">
            Tren Pendapatan
          </h3>
          <p className="text-xs text-neutral-400">
            Visualisasi arus kas harian berdasarkan transaksi yang berhasil.
          </p>
        </div>

        <div className="h-[350px] w-full">
          {isLoading ? (
            <div className="h-full flex flex-col items-center justify-center gap-3 text-neutral-400">
              <Loader2 className="animate-spin text-emerald-500" size={32} />
              <span className="text-sm animate-pulse text-neutral-500">
                Menyusun data grafik...
              </span>
            </div>
          ) : (
            <Chart
              options={chartOptions}
              series={chartSeries}
              type="area"
              height="100%"
            />
          )}
        </div>
      </Card>
    </div>
  );
}

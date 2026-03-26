import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { useState } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { MoreDotIcon } from "../../icons";
import { useDashboard } from "@/hooks/react-query/useDashboard";
import { formatCurrency } from "@/lib/currency";

export default function MonthlyTarget() {
  const { useTransactionStats, useMetrics } = useDashboard();
  const { data: stats } = useTransactionStats();
  const { data: metrics } = useMetrics();
  
  const [isOpen, setIsOpen] = useState(false);

  const total = stats?.reduce((acc, curr) => acc + curr.count, 0) || 0;
  const success = stats?.filter(s => s.status === 'paid' || s.status === 'completed')
                       .reduce((acc, curr) => acc + curr.count, 0) || 0;
  
  const progressPercentage = total > 0 ? Math.round((success / total) * 100) : 0;

  const series = [progressPercentage];
  
  const options: ApexOptions = {
    colors: ["#FF0000"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "radialBar",
      height: 330,
      sparkline: { enabled: true },
    },
    plotOptions: {
      radialBar: {
        startAngle: -85,
        endAngle: 85,
        hollow: { size: "80%" },
        track: {
          background: "#E4E7EC",
          strokeWidth: "100%",
          margin: 5,
        },
        dataLabels: {
          name: { show: false },
          value: {
            fontSize: "36px",
            fontWeight: "600",
            offsetY: -40,
            color: "#1D2939",
            formatter: (val) => val + "%",
          },
        },
      },
    },
    fill: { type: "solid", colors: ["#FF0000"] },
    stroke: { lineCap: "round" },
    labels: ["Success Rate"],
  };

  return (
    <div className="rounded-2xl border border-neutral-200 bg-neutral-100 dark:border-neutral-800 dark:bg-white/[0.03]">
      <div className="px-5 pt-5 bg-white shadow-default rounded-2xl pb-11 dark:bg-neutral-900 sm:px-6 sm:pt-6">
        <div className="flex justify-between">
          <div>
            <h3 className="text-lg font-semibold text-neutral-800 dark:text-white/90">
              Transaction Success Rate
            </h3>
            <p className="mt-1 text-neutral-500 text-theme-sm dark:text-neutral-400">
              Persentase transaksi berhasil bulan ini
            </p>
          </div>
          <div className="relative inline-block">
            <button onClick={() => setIsOpen(!isOpen)}>
              <MoreDotIcon className="text-neutral-400 size-6" />
            </button>
            <Dropdown isOpen={isOpen} onClose={() => setIsOpen(false)} className="w-40 p-2">
              <DropdownItem onItemClick={() => setIsOpen(false)}>Detail Laporan</DropdownItem>
            </Dropdown>
          </div>
        </div>
        
        <div className="relative">
          <div className="max-h-[330px]">
            <Chart options={options} series={series} type="radialBar" height={330} />
          </div>
          <span className="absolute left-1/2 top-full -translate-x-1/2 -translate-y-[95%] rounded-full bg-success-50 px-3 py-1 text-xs font-medium text-success-600 dark:bg-success-500/15 dark:text-success-500">
            Live Data
          </span>
        </div>

        <p className="mx-auto mt-10 w-full max-w-[380px] text-center text-sm text-neutral-500 sm:text-base">
          Hari ini kamu dapet {formatCurrency(metrics?.income_today || 0)}. Semangat terus kelola Gagal-Lapar!
        </p>
      </div>

      <div className="flex items-center justify-center gap-5 px-6 py-3.5 sm:gap-8 sm:py-5">
        <div>
          <p className="mb-1 text-center text-neutral-500 text-theme-xs sm:text-sm">Target</p>
          <p className="text-base font-semibold text-neutral-800 dark:text-white/90 sm:text-lg">100%</p>
        </div>

        <div className="w-px bg-neutral-200 h-7 dark:bg-neutral-800"></div>

        <div>
          <p className="mb-1 text-center text-neutral-500 text-theme-xs sm:text-sm">Revenue</p>
          <p className="text-base font-semibold text-neutral-800 dark:text-white/90 sm:text-lg">
            {formatCurrency(metrics?.income_month || 0)}
          </p>
        </div>

        <div className="w-px bg-neutral-200 h-7 dark:bg-neutral-800"></div>

        <div>
          <p className="mb-1 text-center text-neutral-500 text-theme-xs sm:text-sm">Today</p>
          <p className="text-base font-semibold text-success-600 sm:text-lg">
            {formatCurrency(metrics?.income_today || 0)}
          </p>
        </div>
      </div>
    </div>
  );
}
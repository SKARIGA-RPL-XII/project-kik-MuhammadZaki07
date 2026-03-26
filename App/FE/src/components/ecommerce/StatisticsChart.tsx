import { useEffect, useRef, useState, useMemo } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import flatpickr from "flatpickr";
import ChartTab from "../common/ChartTab";
import { CalenderIcon } from "../../icons";
import { useDashboard } from "@/hooks/react-query/useDashboard";
import { Skeleton } from "../ui/skeleton";

export default function StatisticsChart() {
  const datePickerRef = useRef<HTMLInputElement>(null);
  const [filter, setFilter] = useState<"monthly" | "quarterly" | "annually">("monthly");
  const [dateRange, setDateRange] = useState<string>("");

  const { useSalesChart } = useDashboard();
  const { data: salesData, isLoading } = useSalesChart(filter, dateRange);

  useEffect(() => {
    if (!datePickerRef.current) return;

    const fp = flatpickr(datePickerRef.current, {
      mode: "range",
      static: true,
      monthSelectorType: "static",
      dateFormat: "Y-m-d",
      onClose: (selectedDates) => {
        if (selectedDates.length === 2) {
          const start = selectedDates[0].toISOString().split('T')[0];
          const end = selectedDates[1].toISOString().split('T')[0];
          setDateRange(`${start},${end}`);
        }
      },
    });

    return () => {
      if (!Array.isArray(fp)) fp.destroy();
    };
  }, []);

  const categories = useMemo(() => {
    return salesData?.map((item) => {
      const d = new Date(item.date);
      return d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
    }) || [];
  }, [salesData]);

  const revenueValues = useMemo(() => {
    return salesData?.map((item) => item.total) || [];
  }, [salesData]);

  const options: ApexOptions = useMemo(() => ({
    legend: { show: false },
    colors: ["#FF0000"], 
    chart: {
      fontFamily: "Outfit, sans-serif",
      height: 310,
      type: "area",
      toolbar: { show: false },
      parentHeightOffset: 0,
    },
    stroke: { curve: "smooth", width: [3] },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.45,
        opacityTo: 0.05,
        stops: [20, 100],
      },
    },
    markers: {
      size: 4,
      strokeColors: "#fff",
      strokeWidth: 2,
      hover: { size: 6 },
    },
    grid: {
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
    },
    dataLabels: { enabled: false },
    tooltip: {
      enabled: true,
      shared: true,
      followCursor: true,
      y: { formatter: (val) => `Rp ${val.toLocaleString("id-ID")}` },
    },
    xaxis: {
      type: "category",
      categories: categories.length > 0 ? categories : ["No Data"],
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: { fontSize: "12px", colors: ["#6B7280"] },
        formatter: (val) => `Rp ${val.toLocaleString("id-ID")}`,
      },
    },
  }), [categories]);

  const series = useMemo(() => [{ 
    name: "Revenue", 
    data: revenueValues 
  }], [revenueValues]);

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white px-5 pb-5 pt-5 dark:border-neutral-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="flex flex-col gap-5 mb-6 sm:flex-row sm:justify-between">
        <div className="w-full">
          <h3 className="text-lg font-semibold text-neutral-800 dark:text-white/90">
            Statistik Penjualan
          </h3>
          <p className="mt-1 text-neutral-500 text-theme-sm dark:text-neutral-400">
            Menampilkan data berdasarkan filter: <span className="font-medium text-red-500 uppercase">{filter}</span>
          </p>
        </div>
        <div className="flex items-center gap-3 sm:justify-end">
          <ChartTab 
            selected={filter} 
            onSelect={(value) => {
                setFilter(value);
                setDateRange(""); 
            }} 
          />
          
          <div className="relative inline-flex items-center">
            <CalenderIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-neutral-500 dark:text-neutral-400 pointer-events-none z-10" />
            <input
              ref={datePickerRef}
              className="h-10 w-10 lg:w-40 lg:h-auto lg:pl-10 lg:pr-3 lg:py-2 rounded-lg border border-neutral-200 bg-white text-sm font-medium text-transparent lg:text-neutral-700 outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:lg:text-neutral-300 cursor-pointer"
              placeholder="Custom Range"
            />
          </div>
        </div>
      </div>

      <div className="max-w-full overflow-hidden custom-scrollbar">
        <div className="min-w-[1000px] xl:min-w-full" style={{ touchAction: "manipulation" }}>
          {isLoading ? (
            <Skeleton className="h-[310px] w-full rounded-xl"/>
          ) : (
            <Chart options={options} series={series} type="area" height={310} />
          )}
        </div>
      </div>
    </div>
  );
}
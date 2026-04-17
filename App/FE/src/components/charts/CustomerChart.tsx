import { useMemo, useState, lazy } from "react";
const Chart = lazy(() => import("react-apexcharts"));
import { ApexOptions } from "apexcharts";
import { Skeleton } from "../ui/skeleton";
import ChartTab from "../common/ChartTab";
import { useCustomerChart } from "@/hooks/react-query/useCustomers";

export default function CustomerChart() {
  const [filter, setFilter] = useState<
    "daily" | "weekly" | "monthly" | "yearly"
  >("monthly");

  const { data, isLoading } = useCustomerChart();

  const chartData = useMemo(() => {
    if (!data) return [];
    return data[filter] || [];
  }, [data, filter]);

  const categories = useMemo(() => {
    return chartData.map((item: any) => item.label);
  }, [chartData]);

  const values = useMemo(() => {
    return chartData.map((item: any) => item.total);
  }, [chartData]);

  const options: ApexOptions = useMemo(
    () => ({
      legend: { show: false },
      colors: ["#10B981"],
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
        y: {
          formatter: (val) => `${val} Users`,
        },
      },
      xaxis: {
        type: "category",
        categories: categories.length ? categories : ["No Data"],
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: {
        labels: {
          style: { fontSize: "12px", colors: ["#6B7280"] },
        },
      },
    }),
    [categories]
  );

  const series = useMemo(
    () => [
      {
        name: "Customers",
        data: values,
      },
    ],
    [values]
  );

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white px-5 pb-5 pt-5 dark:border-neutral-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="flex flex-col gap-5 mb-6 sm:flex-row sm:justify-between">
        <div className="w-full">
          <h3 className="text-lg font-semibold text-neutral-800 dark:text-white/90">
            Customer Registration Chart
          </h3>
          <p className="mt-1 text-neutral-500 text-theme-sm dark:text-neutral-400">
            Filter:{" "}
            <span className="font-medium text-emerald-500 uppercase">
              {filter}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-3 sm:justify-end">
          <ChartTab
            selected={filter}
            onSelect={(value: any) => setFilter(value)}
            options={[
              { label: "Daily", value: "daily" },
              { label: "Weekly", value: "weekly" },
              { label: "Monthly", value: "monthly" },
              { label: "Yearly", value: "yearly" },
            ]}
          />
        </div>
      </div>

      <div className="max-w-full overflow-hidden">
        <div className="min-w-[1000px] xl:min-w-full">
          {isLoading ? (
            <Skeleton className="h-[310px] w-full rounded-xl" />
          ) : (
            <Chart
              options={options}
              series={series}
              type="area"
              height={310}
            />
          )}
        </div>
      </div>
    </div>
  );
}
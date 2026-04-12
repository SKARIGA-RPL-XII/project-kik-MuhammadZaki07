import { ApexOptions } from "apexcharts";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { MoreDotIcon } from "../../icons";
import { lazy, useState } from "react";
const Chart = lazy(() => import("react-apexcharts"));
import { useDashboard } from "@/hooks/react-query/useDashboard";
import { Skeleton } from "../ui/skeleton";

export default function MonthlySalesChart() {
  const { useSalesChart } = useDashboard();
  const { data, isLoading } = useSalesChart();
  const [isOpen, setIsOpen] = useState(false);

  const categories =
    data?.map((item) => {
      const d = new Date(item.date);
      return d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
    }) || [];

  const seriesData = data?.map((item) => item.total) || [];

  const options: ApexOptions = {
    colors: ["#FF0000"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      height: 200,
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "39%",
        borderRadius: 5,
        borderRadiusApplication: "end",
      },
    },
    dataLabels: { enabled: false },
    stroke: {
      show: true,
      width: 4,
      colors: ["transparent"],
    },
    xaxis: {
      categories: categories.length > 0 ? categories : ["No Data"],
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "left",
      fontFamily: "Outfit",
    },
    yaxis: {
      title: { text: undefined },
      labels: {
        formatter: (val: number) => `Rp ${val.toLocaleString("id-ID")}`,
      },
    },
    grid: {
      yaxis: { lines: { show: true } },
    },
    fill: { opacity: 1 },
    tooltip: {
      x: { show: true },
      y: {
        formatter: (val: number) => `Rp ${val.toLocaleString("id-ID")}`,
      },
    },
  };

  const series = [
    {
      name: "Sales",
      data: seriesData,
    },
  ];

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }
  function closeDropdown() {
    setIsOpen(false);
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white px-5 pt-5 dark:border-neutral-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-neutral-800 dark:text-white/90">
          Recent Sales
        </h3>
        <div className="relative inline-block">
          <button className="dropdown-toggle" onClick={toggleDropdown}>
            <MoreDotIcon className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 size-6" />
          </button>
          <Dropdown
            isOpen={isOpen}
            onClose={closeDropdown}
            className="w-40 p-2"
          >
            <DropdownItem
              onItemClick={closeDropdown}
              className="flex w-full font-normal text-left text-neutral-500 rounded-lg hover:bg-neutral-100 hover:text-neutral-700 dark:text-neutral-400 dark:hover:bg-white/5 dark:hover:text-neutral-300"
            >
              Refresh Data
            </DropdownItem>
          </Dropdown>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="-ml-5 min-w-[650px] xl:min-w-full pl-2 overflow-hidden">
          {isLoading ? (
            <Skeleton className="w-full h-[300px] rounded-lg p-5 m-5" />
          ) : (
            <Chart options={options} series={series} type="bar" height={200} />
          )}
        </div>
      </div>
    </div>
  );
}

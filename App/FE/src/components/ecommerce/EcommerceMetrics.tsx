import { useDashboard } from "@/hooks/react-query/useDashboard";
import {
  BoxIconLine,
  GroupIcon,
} from "../../icons";
import Badge from "../ui/badge/Badge";
import { formatCurrency } from "@/lib/currency";
import { ArrowUpIcon } from "lucide-react";

export default function EcommerceMetrics() {
  const { useMetrics } = useDashboard();
  const { data, isLoading, isError } = useMetrics();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 rounded-2xl border border-neutral-200 bg-neutral-100 dark:border-neutral-800 dark:bg-white/[0.03]"></div>
        ))}
      </div>
    );
  }

  if (isError) return <div className="p-4 text-red-500 text-center">Failed to load dashboard statistics.</div>;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
      <div className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-neutral-100 rounded-xl dark:bg-neutral-800">
          <ArrowUpIcon className="text-success-600 size-6" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-neutral-500 dark:text-neutral-400">Today's Income</span>
            <h4 className="mt-2 font-bold text-neutral-800 text-title-sm dark:text-white/90">
              {formatCurrency(data?.income_today || 0)}
            </h4>
          </div>
          <Badge color="success">Daily</Badge>
        </div>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-neutral-100 rounded-xl dark:bg-neutral-800">
          <BoxIconLine className="text-neutral-800 size-6 dark:text-white/90" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-neutral-500 dark:text-neutral-400">Today's Orders</span>
            <h4 className="mt-2 font-bold text-neutral-800 text-title-sm dark:text-white/90">
              {data?.total_transactions_today || 0}
            </h4>
          </div>
          <Badge color="success">Updated</Badge>
        </div>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-neutral-100 rounded-xl dark:bg-neutral-800">
          <GroupIcon className="text-neutral-800 size-6 dark:text-white/90" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-neutral-500 dark:text-neutral-400">Monthly Revenue</span>
            <h4 className="mt-2 font-bold text-neutral-800 text-title-sm dark:text-white/90">
              {formatCurrency(data?.income_month || 0)}
            </h4>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-neutral-100 rounded-xl dark:bg-neutral-800">
          <BoxIconLine className={`${(data?.low_stock_count ?? 0) > 0 ? 'text-error-500' : 'text-neutral-800 dark:text-white'} size-6`} />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-neutral-500 dark:text-neutral-400">Low Stock</span>
            <h4 className="mt-2 font-bold text-neutral-800 text-title-sm dark:text-white/90">
              {data?.low_stock_count || 0} <span className="text-xs font-normal">Items</span>
            </h4>
          </div>
          {(data?.low_stock_count ?? 0) > 0 && (
            <Badge color="error">Check Stock</Badge>
          )}
        </div>
      </div>
    </div>
  );
}
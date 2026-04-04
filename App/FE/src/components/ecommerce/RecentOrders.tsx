import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import { useDashboard } from "@/hooks/react-query/useDashboard";
import { Link } from "react-router";

export default function RecentOrders() {
  const { useLatestTransactions } = useDashboard();
  const { data: transactions, isLoading } = useLatestTransactions();

  const formatIDR = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white px-4 pb-3 pt-4 dark:border-neutral-800 dark:bg-white/[0.03] sm:px-6">
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-neutral-800 dark:text-white/90">
            Recent Orders
          </h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            List of transactions recently added to the system
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to={"/reports/transactions?page=1"}
            className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-neutral-700 shadow-theme-xs hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400"
          >
            View All
          </Link>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-neutral-100 dark:border-neutral-800 border-y">
            <TableRow>
              <TableCell className="py-3 font-medium text-neutral-500 text-start text-theme-xs dark:text-neutral-400">
                Transaction Code
              </TableCell>
              <TableCell className="py-3 font-medium text-neutral-500 text-start text-theme-xs dark:text-neutral-400">
                Time
              </TableCell>
              <TableCell className="py-3 font-medium text-neutral-500 text-start text-theme-xs dark:text-neutral-400">
                Total Price
              </TableCell>
              <TableCell className="py-3 font-medium text-neutral-500 text-start text-theme-xs dark:text-neutral-400">
                Status
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {isLoading
              ? [1, 2, 3].map((i) => (
                  <TableRow key={i} className="animate-pulse">
                    <TableCell className="py-4">
                      <div className="h-4 w-24 bg-neutral-100 rounded"></div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="h-4 w-20 bg-neutral-100 rounded"></div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="h-4 w-24 bg-neutral-100 rounded"></div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="h-6 w-16 bg-neutral-100 rounded-full"></div>
                    </TableCell>
                  </TableRow>
                ))
              : transactions?.map((trx) => (
                  <TableRow key={trx.id}>
                    <TableCell className="py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center h-10 w-10 rounded-md bg-blue-50 text-blue-600 font-bold text-xs dark:bg-blue-500/10">
                          #{trx.id}
                        </div>
                        <div>
                          <p className="font-medium text-neutral-800 text-theme-sm dark:text-white/90">
                            {trx.invoice_number || `TRX-${trx.id}`}
                          </p>
                          <span className="text-neutral-500 text-theme-xs dark:text-neutral-400">
                            Cashier ID: {trx.user_id}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-3 text-neutral-500 text-theme-sm dark:text-neutral-400">
                      {new Date(trx.created_at).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </TableCell>
                    <TableCell className="py-3 font-semibold text-neutral-800 text-theme-sm dark:text-white/90">
                      {formatIDR(trx.total_price)}
                    </TableCell>
                    <TableCell className="py-3 text-neutral-500 text-theme-sm dark:text-neutral-400">
                      <Badge
                        size="sm"
                        color={
                          trx.status === "paid" || trx.status === "completed"
                            ? "success"
                            : trx.status === "pending"
                              ? "warning"
                              : "error"
                        }
                      >
                        {trx.status.toUpperCase()}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}

            {!isLoading && transactions?.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="py-10 text-center text-neutral-500"
                >
                  No transactions today.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

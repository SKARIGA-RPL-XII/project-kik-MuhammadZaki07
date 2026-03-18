import { useNavigate } from "react-router";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  ImageIcon,
  Loader2,
  Receipt,
  User,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileDown,
} from "lucide-react";
import { Button } from "../ui/button";
import { useTransaction } from "@/hooks/react-query/useTransaction";

interface TransactionHistoryTableProps {
  details: any[];
  loading: boolean;
  meta: any;
  currentPage: number;
  onPageChange: (page: number) => void;
}

export function TransactionHistoryTable({
  details,
  loading,
  meta,
  currentPage,
  onPageChange,
}: TransactionHistoryTableProps) {
  const navigate = useNavigate();
  const { exportTransactions, loadingExport } = useTransaction();

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "paid":
        return "secondary";
      case "pending":
        return "outline";
      default:
        return "primary";
    }
  };

  return (
    <div className="space-y-4 font-sans text-neutral-900">
      <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-neutral-100 dark:border-white/[0.05]">
              <TableRow className="hover:bg-transparent">
                <TableHead className="px-5 py-3 text-start text-theme-xs font-sm text-neutral-500">
                  Menu Item
                </TableHead>
                <TableHead className="px-5 py-3 text-start text-theme-xs font-sm text-neutral-500">
                  Transaction
                </TableHead>
                <TableHead className="px-5 py-3 text-start text-theme-xs font-sm text-neutral-500">
                  Customer
                </TableHead>
                <TableHead className="px-5 py-3 text-center text-theme-xs font-sm text-neutral-500">
                  Qty
                </TableHead>
                <TableHead className="px-5 py-3 text-end text-theme-xs font-sm text-neutral-500">
                  Subtotal
                </TableHead>
                <TableHead className="px-5 py-3 text-end text-theme-xs font-sm text-neutral-500">
                  Status
                </TableHead>
                <TableHead className="px-5 py-3 text-center text-theme-xs font-sm text-neutral-500">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-neutral-100 dark:divide-white/[0.05]">
              {loading && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-20 text-neutral-500"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="animate-spin" size={18} />
                      <span className="text-theme-sm">
                        Loading transactions...
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              )}

              {!loading && details.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-20 text-center">
                    <span className="text-neutral-400 text-theme-sm italic">
                      No transaction details found
                    </span>
                  </TableCell>
                </TableRow>
              )}

              {!loading &&
                details.map((item) => (
                  <TableRow
                    key={item.id}
                    className="hover:bg-neutral-50/50 dark:hover:bg-white/[0.02] transition-colors"
                  >
                    <TableCell className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-lg bg-neutral-100 dark:bg-neutral-800 overflow-hidden border border-neutral-200 dark:border-white/[0.05] flex-shrink-0">
                          {item.menu_image ? (
                            <img
                              src={`${import.meta.env.VITE_STORAGE_URL}/${item.menu_image}`}
                              className="w-full h-full object-cover"
                              alt={item.menu_name}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-neutral-300">
                              <ImageIcon size={16} />
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-medium text-neutral-800 dark:text-white/90 text-theme-sm truncate">
                            {item.menu_name}
                          </span>
                          <span className="text-[10px] text-neutral-400 flex items-center gap-1">
                            <Clock size={10} /> {item.time}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="px-5 py-4">
                      <div className="flex items-center gap-1.5 text-neutral-500 dark:text-neutral-400">
                        <Receipt size={13} />
                        <span className="text-theme-xs font-mono font-semibold">
                          #{item.transaction_code}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="px-5 py-4">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                          <User size={12} className="text-neutral-400" />
                          <span className="text-theme-sm font-medium text-neutral-700 dark:text-neutral-300">
                            {item.customer}
                          </span>
                        </div>
                        <span className="text-[10px] text-neutral-400 font-medium ml-4">
                          Table {item.table}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="px-5 py-4 text-center text-theme-sm font-bold text-neutral-800 dark:text-white/90">
                      {item.qty}x
                    </TableCell>

                    <TableCell className="px-5 py-4 text-end font-bold text-theme-sm text-neutral-800 dark:text-white/90">
                      Rp {Number(item.subtotal).toLocaleString("id-ID")}
                    </TableCell>

                    <TableCell className="px-5 py-4 text-end">
                      <Badge
                        variant={getStatusColor(item.status)}
                        color={getStatusColor(item.status)}
                      >
                        {item.status}
                      </Badge>
                    </TableCell>

                    <TableCell className="px-5 py-4">
                      <div className="flex items-center justify-center">
                        <button
                          onClick={() =>
                            navigate(`/reports/transactions/${item.id}`)
                          }
                          className="p-2 rounded-lg text-blue-500 hover:text-neutral-900 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:text-white dark:hover:bg-white/[0.05] transition-all active:scale-95"
                          title="View Detail"
                        >
                          <Eye size={18} />
                        </button>

                        <button
                          disabled={loadingExport}
                          onClick={() => exportTransactions(item.transaction_id)}
                          className="p-2 disabled:opacity-50 rounded-md text-green-500 hover:bg-neutral-100 transition-colors"
                          title="Download Invoice"
                        >
                          <FileDown size={18} />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="flex items-center justify-between mt-6">
        <p className="text-sm text-neutral-500 font-medium">
          Showing {details.length} of {meta?.total || 0} items (Page{" "}
          {currentPage} of {meta?.last_page || 1})
        </p>

        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={currentPage === 1 || loading}
            onClick={() => onPageChange(currentPage - 1)}
          >
            Prev
          </Button>

          <Button
            size="sm"
            variant="outline"
            disabled={currentPage >= (meta?.last_page || 1) || loading}
            onClick={() => onPageChange(currentPage + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

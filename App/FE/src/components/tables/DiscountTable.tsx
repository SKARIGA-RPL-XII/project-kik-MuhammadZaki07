import { useState } from "react";
import Badge from "../ui/badge/Badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { DiscountService } from "../../services/discount.service";
import { Pencil, Trash2, Loader2 } from "lucide-react";
import { ActionGuard } from "../guard/ActionGuard";

interface Discount {
  id: number;
  title: string;
  description: string;
  value_discount: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

interface DiscountTableProps {
  discounts: Discount[];
  loading?: boolean;
  onRefresh?: () => void;
  onEdit?: (discount: Discount) => void;
  onDelete?: (id: number) => void;
}

const DiscountTable: React.FC<DiscountTableProps> = ({
  discounts = [],
  loading = false,
  onRefresh,
  onEdit,
}) => {
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure to delete this discount?")) return;
    setDeletingId(id);
    try {
      const { error } = await DiscountService.deleteDiscount(id);
      if (error) {
        alert(typeof error === "object" ? JSON.stringify(error) : error);
      } else if (onRefresh) {
        onRefresh();
      }
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-b border-neutral-100 dark:border-white/[0.05]">
            <TableRow>
              <TableHead className="px-5 py-3 font-medium text-neutral-500 text-start text-theme-xs dark:text-neutral-400">
                Title
              </TableHead>
              <TableHead className="px-5 py-3 font-medium text-neutral-500 text-start text-theme-xs dark:text-neutral-400">
                Description
              </TableHead>
              <TableHead className="px-5 py-3 font-medium text-neutral-500 text-start text-theme-xs dark:text-neutral-400">
                Value (%)
              </TableHead>
              <TableHead className="px-5 py-3 font-medium text-neutral-500 text-start text-theme-xs dark:text-neutral-400">
                Start Date
              </TableHead>
              <TableHead className="px-5 py-3 font-medium text-neutral-500 text-start text-theme-xs dark:text-neutral-400">
                End Date
              </TableHead>
              <TableHead className="px-5 py-3 font-medium text-neutral-500 text-start text-theme-xs dark:text-neutral-400">
                Status
              </TableHead>
              <TableHead className="px-5 py-3 font-medium text-neutral-500 text-start text-theme-xs dark:text-neutral-400">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-neutral-100 dark:divide-white/[0.05] relative">
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-10 text-neutral-500"
                >
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="animate-spin" size={18} />
                    <span>Loading data...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : discounts.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-10 text-neutral-400"
                >
                  No discount data found
                </TableCell>
              </TableRow>
            ) : (
              discounts.map((discount) => (
                <TableRow key={discount.id}>
                  <TableCell className="px-5 py-4">{discount.title}</TableCell>
                  <TableCell className="px-5 py-4">
                    {discount.description}
                  </TableCell>
                  <TableCell className="px-5 py-4">
                    {discount.value_discount}%
                  </TableCell>
                  <TableCell className="px-5 py-4">
                    {new Date(discount.start_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="px-5 py-4">
                    {new Date(discount.end_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="px-5 py-4">
                    <Badge
                      size="sm"
                      color={discount.is_active ? "success" : "error"}
                    >
                      {discount.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-5 py-4">
                    <div className="flex gap-2">
                      <ActionGuard module="discount" action="write">
                        <button
                          onClick={() => onEdit?.(discount)}
                          className="p-2 text-yellow-500 hover:bg-yellow-50 rounded"
                        >
                          <Pencil size={18} />
                        </button>
                      </ActionGuard>

                      <ActionGuard module="discount" action="delete">
                        <button
                          onClick={() => handleDelete(discount.id)}
                          disabled={deletingId === discount.id}
                          className="p-2 text-red-500 hover:bg-red-50 rounded disabled:opacity-50"
                        >
                          <Trash2 size={18} />
                        </button>
                      </ActionGuard>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default DiscountTable;
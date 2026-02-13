import { useState } from "react";
import Badge from "../ui/badge/Badge";
import { Button } from "../ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import { DiscountService } from "../../services/discount.service";
import { Pencil, Trash2 } from "lucide-react";

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
  discounts,
  loading = false,
  onRefresh,
  onEdit,
  onDelete,
}) => {
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure to delete this discount?")) return;
    setDeletingId(id);
    const { error } = await DiscountService.deleteDiscount(id);
    setDeletingId(null);
    if (error)
      return alert(typeof error === "object" ? JSON.stringify(error) : error);
    onRefresh();
  };

  return (
    <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-b border-neutral-100 dark:border-white/[0.05]">
            <TableRow>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-neutral-500 text-start text-theme-xs dark:text-neutral-400"
              >
                Title
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-neutral-500 text-start text-theme-xs dark:text-neutral-400"
              >
                Description
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-neutral-500 text-start text-theme-xs dark:text-neutral-400"
              >
                Value (%)
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-neutral-500 text-start text-theme-xs dark:text-neutral-400"
              >
                Start Date
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-neutral-500 text-start text-theme-xs dark:text-neutral-400"
              >
                End Date
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-neutral-500 text-start text-theme-xs dark:text-neutral-400"
              >
                Status
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-neutral-500 text-start text-theme-xs dark:text-neutral-400"
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHeader>

          {loading && (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-10 mx-auto">
                <span className="text-neutral-500">Loading data...</span>
              </TableCell>
            </TableRow>
          )}

          {!loading && discounts.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-10">
                <span className="text-neutral-400">No menu data found</span>
              </TableCell>
            </TableRow>
          )}

          <TableBody className="divide-y divide-neutral-100 dark:divide-white/[0.05] relative">
            {discounts.map((discount) => (
              <TableRow key={discount.id}>
                <TableCell className="px-5 py-4 text-start">
                  {discount.title}
                </TableCell>
                <TableCell className="px-5 py-4 text-start">
                  {discount.description}
                </TableCell>
                <TableCell className="px-5 py-4 text-start">
                  {discount.value_discount}%
                </TableCell>
                <TableCell className="px-5 py-4 text-start">
                  {new Date(discount.start_date).toLocaleDateString()}
                </TableCell>
                <TableCell className="px-5 py-4 text-start">
                  {new Date(discount.end_date).toLocaleDateString()}
                </TableCell>
                <TableCell className="px-5 py-4 text-start">
                  <Badge
                    size="sm"
                    color={discount.is_active ? "success" : "error"}
                  >
                    {discount.is_active ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell className="px-5 py-4 text-start flex gap-2">
                  <button
                    title="Edit"
                    className="p-2 rounded text-yellow-500 hover:bg-yellow-50 dark:text-yellow-400 dark:hover:bg-yellow-500/10"
                    onClick={() => onEdit(discount)}
                  >
                    <Pencil size={18} />
                  </button>

                  <button
                    title="Delete"
                    onClick={() => handleDelete(discount.id)}
                    className="p-2 rounded text-red-500 hover:bg-red-50
                        dark:text-red-400 dark:hover:bg-red-500/10"
                  >
                    <Trash2 size={18} />
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default DiscountTable;

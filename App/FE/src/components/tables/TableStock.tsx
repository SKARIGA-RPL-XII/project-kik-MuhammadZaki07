import React, { useState } from "react";
import { Edit, Loader2, Trash2, Eye } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import DeleteAlertDialog from "../dialog/DeleteAlertDialog";
import { Stock } from "@/pages/Stock/StockPage";
import { stockService } from "@/services/stock.service";
import { useToast } from "@/context/ToastContext";
import { ActionGuard } from "../guard/ActionGuard";
import { fromBaseValue } from "@/utils/unitHelper";

interface TableStockProps {
  data: Stock[];
  loading: boolean;
  onEdit: (stock: Stock) => void;
  onRefresh: () => void;
}

const TableStock: React.FC<TableStockProps> = ({
  data,
  loading,
  onEdit,
  onRefresh,
}) => {
  const { toast } = useToast();
  const [viewDetail, setViewDetail] = useState<Stock | null>(null);

  const handleDelete = async (id: number) => {
    try {
      await stockService.delete(id);
      toast(
        "success",
        "Stock Deleted",
        `Stock item has been successfully removed.`,
      );
      onRefresh();
    } catch (error) {
      console.error(error);
      toast("error", "Delete Failed", `There was an error deleting the stock.`);
    }
  };

  return (
    <div className="rounded-md border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-[250px]">Stock Name</TableHead>
            <TableHead>Current Qty</TableHead>
            <TableHead>Supplier</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-20">
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <Loader2 className="w-8 h-8 animate-spin" />
                  <p className="text-sm italic">Fetching inventory data...</p>
                </div>
              </TableCell>
            </TableRow>
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={5}
                className="text-center py-20 text-muted-foreground"
              >
                No stock data available.
              </TableCell>
            </TableRow>
          ) : (
            data.map((item) => (
              <TableRow
                key={item.id}
                className="hover:bg-muted/30 transition-colors"
              >
                <TableCell className="font-semibold text-foreground">
                  {item.name}
                </TableCell>
                <TableCell className="font-medium">
                  {fromBaseValue(
                    Number(item.quantity),
                    Number(item.unit?.multiplier || 1),
                  ).toLocaleString()}{" "}
                  {item.unit?.abbreviation}
                </TableCell>
                <TableCell className="text-sm">
                  {item.supplier?.name || "Personal Purchase"}
                </TableCell>
                <TableCell>
                  {Number(item.quantity) <= Number(item.low_stock_threshold) ? (
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                      </span>
                      <Badge
                        variant="destructive"
                        className="font-medium text-white"
                      >
                        Low Stock
                      </Badge>
                    </div>
                  ) : (
                    <Badge
                      variant="outline"
                      className="text-emerald-600 border-emerald-600 bg-emerald-50 dark:bg-emerald-950/20"
                    >
                      Safe
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100"
                      onClick={() => setViewDetail(item)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>

                    <ActionGuard module="stock list" action="write">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        onClick={() => onEdit(item)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </ActionGuard>

                    <ActionGuard module="stock list" action="delete">
                      <DeleteAlertDialog
                        title={`Delete ${item.name}?`}
                        description="This action will permanently remove this item from your inventory. This cannot be undone."
                        onConfirm={() => handleDelete(item.id)}
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </DeleteAlertDialog>
                    </ActionGuard>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <AlertDialog open={!!viewDetail} onOpenChange={() => setViewDetail(null)}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold">
              Stock Detail
            </AlertDialogTitle>
          </AlertDialogHeader>
          {viewDetail && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-y-3 text-sm border-b pb-4">
                <span className="text-muted-foreground">Item Name</span>
                <span className="font-semibold text-right">
                  {viewDetail.name}
                </span>

                <span className="text-muted-foreground">Total Stock</span>
                <span className="font-semibold text-right">
                  {fromBaseValue(
                    Number(viewDetail.quantity),
                    Number(viewDetail.unit?.multiplier || 1),
                  ).toLocaleString()}{" "}
                  {viewDetail.unit?.name}
                </span>

                <span className="text-muted-foreground">Alert Threshold</span>
                <span className="font-semibold text-right text-red-600">
                  {Number(viewDetail.low_stock_threshold).toLocaleString()}{" "}
                  {viewDetail.unit?.abbreviation}
                </span>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                  Supplier Info
                </h4>
                {viewDetail.supplier ? (
                  <div className="bg-muted/50 p-3 rounded-lg text-sm space-y-1">
                    <p className="font-bold">{viewDetail.supplier.name}</p>
                    <p className="text-xs text-muted-foreground">
                      PIC: {viewDetail.supplier.contact_person}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Phone: {viewDetail.supplier.phone}
                    </p>
                    <p className="text-xs italic">
                      {viewDetail.supplier.address}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm italic text-muted-foreground">
                    No supplier assigned.
                  </p>
                )}
              </div>
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setViewDetail(null)}
              className="w-full"
            >
              Close
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TableStock;

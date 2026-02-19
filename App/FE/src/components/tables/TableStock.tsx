import React from "react";
import { Edit, Loader2, Trash2 } from "lucide-react";
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
import DeleteAlertDialog from "../dialog/DeleteAlertDialog";
import { Stock } from "@/pages/Stock/StockPage";
import { stockService } from "@/services/stock.service";
import { useToast } from "@/context/ToastContext";
import { ActionGuard } from "../guard/ActionGuard";

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

  const handleDelete = async (id: number) => {
    try {
      await stockService.delete(id);
      toast("success", "Stock Deleted", `Stock item has been successfully removed.`);
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
            <TableHead className="w-[300px]">Stock Name</TableHead>
            <TableHead>Qty</TableHead>
            <TableHead>Unit</TableHead>
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
              <TableCell colSpan={5} className="text-center py-20 text-muted-foreground">
                No stock data available.
              </TableCell>
            </TableRow>
          ) : (
            data.map((item) => (
              <TableRow key={item.id} className="hover:bg-muted/30 transition-colors">
                <TableCell className="font-semibold text-foreground">
                  {item.name}
                </TableCell>
                <TableCell className="font-medium">{item.quantity.toLocaleString()}</TableCell>
                <TableCell>{item.unit}</TableCell>
                <TableCell>
                  {item.quantity <= item.low_stock_threshold ? (
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                      </span>
                      <Badge variant="destructive" className="font-medium text-white">
                        Low Stock
                      </Badge>
                    </div>
                  ) : (
                    <Badge variant="outline" className="text-emerald-600 border-emerald-600 bg-emerald-50 dark:bg-emerald-950/20">
                      Safe
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
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
    </div>
  );
};

export default TableStock;
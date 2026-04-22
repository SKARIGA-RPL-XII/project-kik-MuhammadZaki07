import React from "react";
import { Trash2, Loader2, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import { Adjustment } from "@/services/adjustment.service";
import { adjustmentService } from "@/services/adjustment.service";
import DeleteAlertDialog from "../dialog/DeleteAlertDialog";
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
import { useToast } from "@/context/ToastContext";
import { ActionGuard } from "../guard/ActionGuard";
import { formatDate } from "@/utils/dateHelper";
import { fromBaseValue } from "@/utils/unitHelper";

interface TableAdjustmentProps {
  data: Adjustment[];
  loading: boolean;
  onRefresh: () => void;
}

const TableAdjustment: React.FC<TableAdjustmentProps> = ({
  data,
  loading,
  onRefresh,
}) => {
  const { toast } = useToast();

  const handleVoid = async (id: number) => {
    try {
      await adjustmentService.delete(id);
      toast(
        "success",
        "Adjustment Voided",
        "Stock has been reverted successfully.",
      );
      onRefresh();
    } catch (error) {
      console.error(error);
      toast("error", "Failed to Void", "Cannot revert stock adjustment.");
    }
  };

  return (
    <div className="rounded-md border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead>Time</TableHead>
            <TableHead>Stock Item</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Reason</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-20">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
              </TableCell>
            </TableRow>
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className="text-center py-20 text-muted-foreground"
              >
                No adjustment logs found.
              </TableCell>
            </TableRow>
          ) : (
            data.map((item) => (
              <TableRow
                key={item.id}
                className="hover:bg-muted/30 transition-colors"
              >
                <TableCell className="text-xs text-muted-foreground">
                  {formatDate(item.created_at, true)}
                </TableCell>
                <TableCell className="font-medium">
                  {item.stock?.name}
                </TableCell>
                <TableCell>
                  {item.type === "in" ? (
                    <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none flex w-fit items-center gap-1">
                      <ArrowUpCircle className="w-3 h-3" /> In
                    </Badge>
                  ) : (
                    <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 border-none flex w-fit items-center gap-1">
                      <ArrowDownCircle className="w-3 h-3" /> Out
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="font-bold">
                  {item.type === "in" ? "+" : "-"}
                  {fromBaseValue(
                    Number(item.amount),
                    Number(item.stock?.unit?.multiplier || 1),
                  )}{" "}
                  {item.stock?.unit?.abbreviation || "Unit"}
                </TableCell>
                <TableCell className="max-w-[200px] truncate italic text-sm">
                  "{item.reason}"
                </TableCell>
                <TableCell className="text-right">
                  <ActionGuard module="stock adjustment" action="delete">
                    <DeleteAlertDialog
                      title="Void this adjustment?"
                      description="Voiding will revert the stock quantity to its previous state."
                      onConfirm={() => handleVoid(item.id)}
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive h-8 w-8 hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </DeleteAlertDialog>
                  </ActionGuard>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default TableAdjustment;

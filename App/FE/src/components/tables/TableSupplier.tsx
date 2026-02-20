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
import { Supplier } from "@/services/supplier.service";
import { supplierService } from "@/services/supplier.service";
import { useToast } from "@/context/ToastContext";
import { ActionGuard } from "../guard/ActionGuard";
import { formatDate } from "@/utils/dateHelper";

interface TableSupplierProps {
  data: Supplier[];
  loading: boolean;
  onEdit: (supplier: Supplier) => void;
  onRefresh: () => void;
}

const TableSupplier: React.FC<TableSupplierProps> = ({
  data,
  loading,
  onEdit,
  onRefresh,
}) => {
  const { toast } = useToast();

  const handleDelete = async (id: number) => {
    try {
      await supplierService.delete(id);
      toast(
        "success",
        "Supplier Deleted",
        `Supplier has been successfully removed.`,
      );
      onRefresh();
    } catch (error) {
      toast(
        "error",
        "Delete Failed",
        `There was an error deleting the supplier.`,
      );
    }
  };

  return (
    <div className="rounded-md border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-[250px]">Supplier Name</TableHead>
            <TableHead>Contact Person</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Added At</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-20">
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="animate-spin" size={18} />
                  <span>Loading data...</span>
                </div>
              </TableCell>
            </TableRow>
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className="text-center py-20 text-muted-foreground"
              >
                No supplier data available.
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
                <TableCell>{item.contact_person}</TableCell>
                <TableCell>{item.phone}</TableCell>
                <TableCell>
                  {item.is_active ? (
                    <Badge
                      variant="outline"
                      className="text-emerald-600 border-emerald-600 bg-emerald-50"
                    >
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="destructive">Inactive</Badge>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(item.created_at)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <ActionGuard module="suppliers" action="write">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        onClick={() => onEdit(item)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </ActionGuard>

                    <ActionGuard module="suppliers" action="delete">
                      <DeleteAlertDialog
                        title={`Delete ${item.name}?`}
                        description="This action will permanently remove this supplier. This cannot be undone."
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

export default TableSupplier;

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import Badge from "../../components/ui/badge/Badge";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import { ActionGuard } from "../guard/ActionGuard";
import DeleteAlertDialog from "../dialog/DeleteAlertDialog";
import { useToast } from "@/context/ToastContext";
import { UnitService } from "@/services/unit.service";

interface UnitTableProps {
  units: any[];
  loading: boolean;
  onRefresh: () => void;
  onEdit: (unit: any) => void;
}

export default function UnitTable({
  units,
  loading,
  onRefresh,
  onEdit,
}: UnitTableProps) {
  const { toast } = useToast();

  return (
    <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-b border-neutral-100 dark:border-white/[0.05]">
            <TableRow>
              <TableHead className="px-5 py-3 text-start text-theme-xs">Unit Name</TableHead>
              <TableHead className="px-5 py-3 text-start text-theme-xs">Abbr</TableHead>
              <TableHead className="px-5 py-3 text-start text-theme-xs">Category</TableHead>
              <TableHead className="px-5 py-3 text-start text-theme-xs">Multiplier</TableHead>
              <TableHead className="px-5 py-3 text-start text-theme-xs">Action</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-neutral-100 dark:divide-white/[0.05]">
            {loading && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10 text-neutral-500">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="animate-spin" size={18} />
                    <span>Loading data...</span>
                  </div>
                </TableCell>
              </TableRow>
            )}

            {!loading && units.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-neutral-400">
                  No units found
                </TableCell>
              </TableRow>
            )}

            {!loading && units.map((unit) => (
              <TableRow key={unit.id}>
                <TableCell className="px-5 py-4 font-medium text-neutral-800 dark:text-white/90">
                  {unit.name}
                </TableCell>
                <TableCell className="px-4 py-3 text-theme-sm text-neutral-500">
                  {unit.abbreviation}
                </TableCell>
                <TableCell className="px-4 py-3">
                  <Badge color={unit.category === 'weight' ? 'primary' : unit.category === 'volume' ? 'info' : 'success'}>
                    {unit.category.toUpperCase()}
                  </Badge>
                </TableCell>
                <TableCell className="px-4 py-3 text-theme-sm font-mono">
                  {unit.multiplier} x {unit.base_unit?.abbreviation || 'base'}
                </TableCell>
                <TableCell className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <ActionGuard module="units" action="write">
                      <button
                        title="Edit"
                        className="p-2 rounded text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-500/10"
                        onClick={() => onEdit(unit)}
                      >
                        <Pencil size={18} />
                      </button>
                    </ActionGuard>

                    <ActionGuard module="units" action="delete">
                      <DeleteAlertDialog
                        title="Delete Unit?"
                        description={`This will permanently delete "${unit.name}".`}
                        onConfirm={async () => {
                          try {
                            await UnitService.deleteUnit(unit.id);
                            onRefresh();
                          } catch (err: any) {
                            toast("error", "Delete Failed", err?.response?.data?.message || "Failed");
                          }
                        }}
                      >
                        <button className="p-2 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10">
                          <Trash2 size={18} />
                        </button>
                      </DeleteAlertDialog>
                    </ActionGuard>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
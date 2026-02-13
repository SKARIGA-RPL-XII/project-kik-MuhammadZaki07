import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import Badge from "../../components/ui/badge/Badge";
import { Pencil, Trash2 } from "lucide-react";
import { EmployeService } from "../../services/employe.service";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

interface Props {
  employes: any[];
  loading: boolean;
  onRefresh: () => void;
  onEdit: (data: any) => void;
}

export default function EmployeTable({
  employes,
  loading,
  onRefresh,
  onEdit,
}: Props) {
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    await EmployeService.deleteEmploye(deleteId);
    setDeleting(false);
    setDeleteId(null);
    onRefresh();
  };

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-theme-xs text-start"
                >
                  User
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-theme-xs text-start"
                >
                  Employee Position
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-theme-xs text-start"
                >
                  Phone
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-theme-xs text-start"
                >
                  Gender
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-theme-xs text-start"
                >
                  Action
                </TableCell>
              </TableRow>
            </TableHeader>

           <TableBody className="divide-y divide-neutral-100 dark:divide-white/[0.05] relative">
              {loading && (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center ">
                    <span className="text-neutral-400">
                    Loading data...

                    </span>
                  </TableCell>
                </TableRow>
              )}

              {!loading && employes.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center ">
                    <span className="text-neutral-400">
                    No employe found

                    </span>
                  </TableCell>
                </TableRow>
              )}

              {!loading &&
                employes.map((emp) => (
                  <TableRow key={emp.id}>
                    <TableCell className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={`${import.meta.env.VITE_STORAGE_URL}/${emp.profile_image}`}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                        <div>
                          <p className="font-medium">{emp.user?.username}</p>
                          <p className="text-sm text-neutral-500">
                            {emp.user?.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="px-4 py-3 text-theme-sm text-neutral-500 dark:text-neutral-400">
                      <Badge variant="light" color={emp.user?.role?.name == "cashier" ? "warning" : "primary"}>
                        {emp.user?.role?.name}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-theme-sm text-neutral-500 dark:text-neutral-400">{emp.no_tlp}</TableCell>

                    <TableCell className="px-4 py-3 text-theme-sm text-neutral-500 dark:text-neutral-400">
                      <Badge color={emp.gender === "LK" ? "info" : "success"}>
                        {emp.gender === "LK" ? "Laki-laki" : "Perempuan"}
                      </Badge>
                    </TableCell>

                    <TableCell className="px-4 py-3 text-theme-sm text-neutral-500 dark:text-neutral-400">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onEdit(emp)}
                          className="p-2 rounded text-yellow-500 hover:bg-yellow-50 dark:text-yellow-400 dark:hover:bg-yellow-500/10"
                        >
                          <Pencil size={18} />
                        </button>

                        <button
                          onClick={() => setDeleteId(emp.id)}
                          className="p-2 rounded text-red-500 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure want to delete this employe?
            </AlertDialogTitle>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction disabled={deleting} onClick={handleDelete}>
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import Badge from "../../components/ui/badge/Badge";
import { CategoryService } from "../../services/category.service";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import { ActionGuard } from "../guard/ActionGuard";
import DeleteAlertDialog from "../dialog/DeleteAlertDialog";
import { useToast } from "@/context/ToastContext";

interface CategoryTableProps {
  categories: any[];
  loading: boolean;
  onRefresh: () => void;
  onEdit: (cat: any) => void;
}

export default function CategoryTable({
  categories,
  loading,
  onRefresh,
  onEdit,
}: CategoryTableProps) {
  const {toast} = useToast();
  return (
    <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-b border-neutral-100 dark:border-white/[0.05]">
            <TableRow>
              <TableHead className="px-5 py-3 text-start text-theme-xs">
                Category
              </TableHead>
              <TableHead className="px-5 py-3 text-start text-theme-xs">
                Slug
              </TableHead>
              <TableHead className="px-5 py-3 text-start text-theme-xs">
                Status
              </TableHead>
              <TableHead className="px-5 py-3 text-start text-theme-xs">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-neutral-100 dark:divide-white/[0.05]">
            {loading && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center py-10 text-neutral-500"
                >
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="animate-spin" size={18} />
                    <span>Loading data...</span>
                  </div>
                </TableCell>
              </TableRow>
            )}

            {!loading && categories.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="py-10 text-center">
                  <span className="text-neutral-400">No category found</span>
                </TableCell>
              </TableRow>
            )}

            {!loading &&
              categories.map((cat) => (
                <TableRow key={cat.id}>
                  <TableCell className="px-5 py-4">
                    <span className="font-medium text-neutral-800 dark:text-white/90">
                      {cat.name}
                    </span>
                  </TableCell>

                  <TableCell className="px-4 py-3 text-theme-sm text-neutral-500 dark:text-neutral-400">
                    {cat.slug}
                  </TableCell>

                  <TableCell className="px-4 py-3">
                    <Badge color={cat.is_active ? "success" : "error"}>
                      {cat.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>

                  <TableCell className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <ActionGuard module="category" action="write">
                        <button
                          title="Edit"
                          className="p-2 rounded text-yellow-500 hover:bg-yellow-50 dark:text-yellow-400 dark:hover:bg-yellow-500/10"
                          onClick={() => onEdit(cat)}
                        >
                          <Pencil size={18} />
                        </button>
                      </ActionGuard>

                      <ActionGuard module="category" action="delete">
                        <DeleteAlertDialog
                          title="Delete category?"
                          description={`This will permanently delete "${cat.name}".`}
                          onConfirm={async () => {
                            try {
                              await CategoryService.deleteCategory(cat.id);
                              onRefresh();
                            } catch (err: any) {
                              const message =
                                err?.response?.data?.message ||
                                "Failed to delete category";

                              console.log(err);

                              toast("error", "Delete Failed", message);
                            }
                          }}
                        >
                          <button
                            title="Delete"
                            className="p-2 rounded text-red-500 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                          >
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

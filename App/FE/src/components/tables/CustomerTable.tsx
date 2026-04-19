import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import Badge from "../../components/ui/badge/Badge";
import { Loader2, Pencil, Trash2, Ban, CheckCircle, Eye } from "lucide-react";
import { ActionGuard } from "../guard/ActionGuard";
import DeleteAlertDialog from "../dialog/DeleteAlertDialog";
import { useToast } from "@/context/ToastContext";
import {
  useToggleBlockCustomer,
  useDeleteCustomer,
} from "@/hooks/react-query/useCustomers";
import { getProfileImage } from "@/utils/imageHelper";

interface CustomerTableProps {
  customers: any[];
  loading: boolean;
  onRefresh: () => void;
  onEdit: (user: any) => void;
  onView: (user: any) => void;
}

export default function CustomerTable({
  customers,
  loading,
  onRefresh,
  onEdit,
  onView,
}: CustomerTableProps) {
  const { toast } = useToast();

  const toggleBlock = useToggleBlockCustomer();
  const deleteCustomer = useDeleteCustomer();

  return (
    <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-b border-neutral-100 dark:border-white/[0.05]">
            <TableRow>
              <TableHead className="px-5 py-3 text-start text-theme-xs">
                Customer
              </TableHead>
              <TableHead className="px-5 py-3 text-start text-theme-xs">
                Email
              </TableHead>
              <TableHead className="px-5 py-3 text-start text-theme-xs">
                Phone
              </TableHead>
              <TableHead className="px-5 py-3 text-start text-theme-xs">
                Status
              </TableHead>
              <TableHead className="px-5 py-3 text-start text-theme-xs">
                Registered
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
                  colSpan={6}
                  className="text-center py-10 text-neutral-500"
                >
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="animate-spin" size={18} />
                    <span>Loading customers...</span>
                  </div>
                </TableCell>
              </TableRow>
            )}

            {!loading && customers.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center">
                  <span className="text-neutral-400">No customers found</span>
                </TableCell>
              </TableRow>
            )}

            {!loading &&
              customers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="px-5 py-4 flex items-center gap-3">
                    <img
                      src={
                        getProfileImage(user.profile_image) ||
                        "/dummy-image.png"
                      }
                      alt="profile"
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <div className="font-medium text-neutral-800 dark:text-white/90">
                        {user.username || "-"}
                      </div>
                      <div className="text-xs text-neutral-400">
                        ID: {user.id}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="px-4 py-3 text-theme-sm text-neutral-500">
                    {user.email}
                  </TableCell>

                  <TableCell className="px-4 py-3 text-theme-sm text-neutral-500">
                    {user.no_tlp || "-"}
                  </TableCell>

                  <TableCell className="px-4 py-3">
                    <Badge color={user.is_active ? "success" : "error"}>
                      {user.is_active ? "Active" : "Blocked"}
                    </Badge>
                  </TableCell>

                  <TableCell className="px-4 py-3 text-theme-sm text-neutral-500">
                    {new Date(user.created_at).toLocaleDateString()}
                  </TableCell>

                  <TableCell className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <ActionGuard module="customers" action="write">
                        <button
                          title="Edit"
                          className="p-2 rounded text-yellow-500 hover:bg-yellow-50 dark:text-yellow-400 dark:hover:bg-yellow-500/10"
                          onClick={() => onEdit(user)}
                        >
                          <Pencil size={18} />
                        </button>
                      </ActionGuard>
                      <ActionGuard module="customers" action="view">
                        <button
                          title="View"
                          className="p-2 rounded text-blue-500 hover:bgblutext-blue-50 dark:text-blue-400 dark:hover:bg-yellow-500/10"
                          onClick={() => onView(user)}
                        >
                          <Eye size={18} />
                        </button>
                      </ActionGuard>

                      <ActionGuard module="customers" action="write">
                        <button
                          title={user.is_active ? "Block" : "Unblock"}
                          disabled={toggleBlock.isPending}
                          className={`p-2 rounded transition ${
                            toggleBlock.isPending
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          } ${
                            user.is_active
                              ? "text-orange-500 hover:bg-orange-50"
                              : "text-green-500 hover:bg-green-50"
                          }`}
                          onClick={async () => {
                            try {
                              await toggleBlock.mutateAsync(user.id);

                              toast(
                                "success",
                                "Success",
                                user.is_active
                                  ? "User diblokir"
                                  : "User diaktifkan",
                              );

                              onRefresh();
                            } catch (err: any) {
                              toast("error", "Error", "Gagal update status");
                            }
                          }}
                        >
                          {toggleBlock.isPending ? (
                            <Loader2 size={18} className="animate-spin" />
                          ) : user.is_active ? (
                            <Ban size={18} />
                          ) : (
                            <CheckCircle size={18} />
                          )}
                        </button>
                      </ActionGuard>

                      <ActionGuard module="customers" action="delete">
                        <DeleteAlertDialog
                          title="Delete customer?"
                          description={`This will permanently delete "${user.username}".`}
                          onConfirm={async () => {
                            try {
                              await deleteCustomer.mutateAsync(user.id);
                              toast(
                                "success",
                                "Deleted",
                                "Customer berhasil dihapus",
                              );
                              onRefresh();
                            } catch (err: any) {
                              toast(
                                "error",
                                "Delete Failed",
                                "Gagal hapus customer",
                              );
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

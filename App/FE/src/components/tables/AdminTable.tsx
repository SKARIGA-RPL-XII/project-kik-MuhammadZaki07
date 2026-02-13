import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { AdminService } from "@/services/admin.service";
import { Button } from "../ui/button";
import { useAuth } from "@/context/AuthContext";

interface Admin {
  id: number;
  email: string;
  role_id: number;
  created_at: string;
}

interface Props {
  admins: Admin[];
  loading: boolean;
  onRefresh: () => void;
  onEdit: (data: Admin) => void;
}

export default function AdminTable({
  admins,
  loading,
  onRefresh,
  onEdit,
}: Props) {
  const { user } = useAuth(); // 👈 ambil user login
  const currentUserId = user?.id;

  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleDelete = async () => {
    if (!deletingId) return;
    if (deletingId === currentUserId) {
      alert("You cannot delete your own account.");
      return;
    }

    try {
      setSubmitting(true);
      await AdminService.delete(deletingId);
      onRefresh();
    } catch (error) {
      console.error(error);
      alert("Failed to delete admin.");
    } finally {
      setSubmitting(false);
      setDeletingId(null);
    }
  };

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>NO</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {loading && (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-6">
                Loading...
              </TableCell>
            </TableRow>
          )}

          {!loading && admins.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-6">
                No admin data found
              </TableCell>
            </TableRow>
          )}

          {!loading &&
            admins.map((admin, i) => {
              const isSelf = admin.id === currentUserId;

              return (
                <TableRow key={admin.id}>
                  <TableCell>{i + 1}</TableCell>

                  <TableCell className="font-medium">
                    {admin.email}
                    {isSelf && (
                      <span className="ml-2 text-xs text-blue-500">
                        (You)
                      </span>
                    )}
                  </TableCell>

                  <TableCell>
                    {new Date(admin.created_at).toLocaleDateString()}
                  </TableCell>

                  <TableCell className="text-right space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onEdit(admin)}
                      className="bg-yellow-400 hover:bg-yellow-400/50 text-white border-none shadow-none"
                    >
                      <Pencil size={16} />
                    </Button>

                    {!isSelf && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setDeletingId(admin.id)}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </AlertDialogTrigger>

                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Delete Admin
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>

                          <AlertDialogFooter>
                            <AlertDialogCancel disabled={submitting}>
                              Cancel
                            </AlertDialogCancel>

                            <AlertDialogAction
                              variant="destructive"
                              disabled={submitting}
                              onClick={handleDelete}
                            >
                              {submitting ? "Deleting..." : "Delete"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
        </TableBody>
      </Table>
    </div>
  );
}

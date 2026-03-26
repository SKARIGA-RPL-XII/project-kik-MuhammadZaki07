import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import Badge from "../../components/ui/badge/Badge";
import { Eye, Trash2, Loader2, ActivitySquareIcon } from "lucide-react";
import { formatDate } from "@/utils/dateHelper";
import DeleteAlertDialog from "../dialog/DeleteAlertDialog";

interface LogTableProps {
  logs: any[];
  isLoading: boolean;
  onView: (id: number) => void;
  onDelete: (id: number) => Promise<void> | void;
}

export default function LogTable({
  logs,
  isLoading,
  onView,
  onDelete,
}: LogTableProps) {
  const getBadgeColor = (action: string) => {
    switch (action.toLowerCase()) {
      case "create":
        return "success";
      case "update":
        return "warning";
      case "delete":
        return "error";
      case "login":
        return "info";
      default:
        return "light";
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-b border-neutral-100 dark:border-white/[0.05]">
            <TableRow>
              <TableHead className="px-5 py-3 text-start text-theme-xs">
                Waktu
              </TableHead>
              <TableHead className="px-5 py-3 text-start text-theme-xs">
                Pengguna
              </TableHead>
              <TableHead className="px-5 py-3 text-start text-theme-xs">
                Aksi
              </TableHead>
              <TableHead className="px-5 py-3 text-start text-theme-xs">
                Informasi Aktivitas
              </TableHead>
              <TableHead className="px-5 py-3 text-end text-theme-xs">
                Opsi
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-neutral-100 dark:divide-white/[0.05]">
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="py-20 text-center">
                  <Loader2 className="animate-spin mx-auto text-neutral-400" />
                </TableCell>
              </TableRow>
            ) : logs.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-20 text-center text-neutral-500 text-sm"
                >
                  Tidak ada riwayat aktivitas ditemukan.
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow
                  key={log.id}
                  className="hover:bg-neutral-50/50 dark:hover:bg-white/[0.02] transition-colors"
                >
                  <TableCell className="px-5 py-4">
                    <div className="text-sm font-medium text-neutral-800 dark:text-white/90">
                      {formatDate(log.created_at)}
                    </div>
                    <div className="text-xs text-neutral-400 font-mono tracking-tighter">
                      ID: #{log.id}
                    </div>
                  </TableCell>
                  <TableCell className="px-5 py-4 text-sm text-neutral-500">
                    {log.user?.username || "System"}
                  </TableCell>
                  <TableCell className="px-5 py-4">
                    <div className="flex items-center gap-2.5">
                      <span className="text-[12px] font-normal text-neutral-500 dark:text-neutral-400">
                        {log.module}
                      </span>
                      <div className="h-3 w-[1px] bg-neutral-200 dark:bg-white/10" />

                      <Badge
                        variant="light"
                        size="sm"
                        color={getBadgeColor(log.action)}
                      >
                       <ActivitySquareIcon size={10}/> {log.action}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="px-5 py-4 text-sm text-neutral-500 max-w-xs truncate leading-relaxed">
                    {log.message}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-end">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => onView(log.id)}
                        title="Detail"
                        className="p-2 text-blue-500"
                      >
                        <Eye size={18} />
                      </button>

                      <DeleteAlertDialog
                        title="Hapus Log Riwayat?"
                        description="Tindakan ini akan menghapus catatan riwayat secara permanen dari database."
                        onConfirm={() => onDelete(log.id)}
                      >
                        <button title="Hapus" className="p-2 text-red-500">
                          <Trash2 size={18} />
                        </button>
                      </DeleteAlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

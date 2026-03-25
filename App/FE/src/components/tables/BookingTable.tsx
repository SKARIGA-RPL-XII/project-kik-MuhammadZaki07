import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import Badge from "../../components/ui/badge/Badge";
import { Loader2, Pencil, Trash2, CheckCircle, Trash2Icon } from "lucide-react";
import { ActionGuard } from "../guard/ActionGuard";
import { Button } from "../../components/ui/button";
import DeleteAlertDialog from "../dialog/DeleteAlertDialog";

interface BookingTableProps {
  bookings: any[];
  loading: boolean;
  totalItems: number;
  totalPage: number;
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  onRefresh: () => void;
  onConfirm: (id: number) => void;
  onDelete: (id: number) => void;
  onEdit: (id: number) => void;
}

export default function BookingTable({
  bookings,
  loading,
  totalItems,
  totalPage,
  page,
  setPage,
  onRefresh,
  onConfirm,
  onDelete,
  onEdit,
}: BookingTableProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "success";
      case "pending_payment":
        return "warning";
      case "cancelled":
        return "error";
      default:
        return "light";
    }
  };

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-neutral-100 dark:border-white/[0.05]">
              <TableRow>
                <TableHead className="px-5 py-3 text-start text-theme-xs uppercase">
                  Guest Info
                </TableHead>
                <TableHead className="px-5 py-3 text-start text-theme-xs uppercase">
                  Table
                </TableHead>
                <TableHead className="px-5 py-3 text-start text-theme-xs uppercase">
                  Schedule
                </TableHead>
                <TableHead className="px-5 py-3 text-start text-theme-xs uppercase">
                  Guests
                </TableHead>
                <TableHead className="px-5 py-3 text-start text-theme-xs uppercase">
                  Status
                </TableHead>
                <TableHead className="px-5 py-3 text-end text-theme-xs uppercase">
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
                      <span>Loading bookings...</span>
                    </div>
                  </TableCell>
                </TableRow>
              )}

              {!loading && bookings.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center">
                    <span className="text-neutral-400 font-light">
                      No bookings found
                    </span>
                  </TableCell>
                </TableRow>
              )}

              {!loading &&
                bookings.map((booking) => (
                  <TableRow
                    key={booking.id}
                    className="hover:bg-neutral-50/50 dark:hover:bg-white/[0.02] transition-colors"
                  >
                    <TableCell className="px-5 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-neutral-800 dark:text-white/90 text-sm">
                          {booking.user?.username || "Guest"}
                        </span>
                        <span className="text-xs text-neutral-500">
                          {booking.user?.email || "-"}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="px-5 py-4">
                      <span className="px-2 py-1 rounded-lg border border-neutral-200 dark:border-white/[0.08] text-xs font-medium">
                        T-{booking.table?.table_number}
                      </span>
                    </TableCell>

                    <TableCell className="px-5 py-4">
                      <div className="flex flex-col text-theme-sm">
                        <span className="text-neutral-800 dark:text-white/80 font-medium">
                          {new Date(booking.booking_time).toLocaleDateString(
                            "id-ID",
                            { day: "2-digit", month: "short" },
                          )}
                        </span>
                        <span className="text-xs text-neutral-400">
                          {new Date(booking.booking_time).toLocaleTimeString(
                            "id-ID",
                            { hour: "2-digit", minute: "2-digit" },
                          )}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="px-5 py-4 text-theme-sm text-neutral-700 dark:text-neutral-300">
                      {booking.number_of_people} Pax
                    </TableCell>

                    <TableCell className="px-5 py-4">
                      <Badge color={getStatusColor(booking.status)}>
                        {booking.status.replace("_", " ")}
                      </Badge>
                    </TableCell>

                    <TableCell className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1">
                        {booking.status === "pending_payment" && (
                          <ActionGuard module="booking" action="write">
                            <button
                              title="Confirm Payment"
                              className="p-2 rounded text-green-500 hover:bg-green-50 dark:hover:bg-green-500/10 transition-colors"
                              onClick={() => onConfirm(booking.id)}
                            >
                              <CheckCircle size={18} />
                            </button>
                          </ActionGuard>
                        )}

                        {/* <ActionGuard module="reservation" action="write">
                        <button
                          title="Edit / Detail"
                          className="p-2 rounded text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors"
                          onClick={() => onEdit(booking.id)}
                        >
                          <Pencil size={18} />
                        </button>
                      </ActionGuard> */}

                        <ActionGuard module="reservation" action="delete">
                          <DeleteAlertDialog
                            onConfirm={() => onDelete(booking.id)}
                            title="Hapus Booking?"
                            description={`Apakah Anda yakin ingin menghapus booking atas nama ${booking.user?.username || "tamu"}?`}
                          >
                            <button className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                              <Trash2Icon size={18} />
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

      {/* Pagination UI */}
      <div className="flex items-center justify-between mt-6">
        <p className="text-sm text-neutral-500 font-medium italic">
          Showing {bookings.length} of {totalItems} items (Page {page + 1} of{" "}
          {totalPage})
        </p>

        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="rounded-lg px-4"
            disabled={page === 0 || loading}
            onClick={() => setPage((p) => p - 1)}
          >
            Prev
          </Button>

          <Button
            size="sm"
            variant="outline"
            className="rounded-lg px-4"
            disabled={page + 1 >= totalPage || loading}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

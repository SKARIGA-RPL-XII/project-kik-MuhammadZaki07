import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import Badge from "../../components/ui/badge/Badge";
import {
  Loader2,
  Pencil,
  Trash2,
  CheckCircle,
  Trash2Icon,
  XCircle,
  Info,
} from "lucide-react";
import { ActionGuard } from "../guard/ActionGuard";
import { Button } from "../../components/ui/button";
import DeleteAlertDialog from "../dialog/DeleteAlertDialog";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";

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
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
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
                  Code
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
                    className="hover:bg-neutral-50/50 dark:hover:bg-white/[0.02] cursor-pointer transition-colors"
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
                      {booking.transaction.transaction_code} Pax
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
                      <div className="flex items-center justify-end gap-2">
                        {booking.status === "pending_confirmation" && (
                          <ActionGuard module="reservation" action="write">
                            <DeleteAlertDialog
                              trashIcon={false}
                              onConfirm={() => onConfirm(booking.id)}
                              title="Terima Pesanan?"
                              description={`Apakah Anda yakin ingin menyetujui booking atas nama ${
                                booking.user?.username || "tamu"
                              }?`}
                            >
                              <button
                                title="Approve Booking"
                                className="p-2 rounded-lg text-green-500 hover:bg-green-50 dark:hover:bg-green-500/10 transition-colors border border-transparent hover:border-green-200"
                              >
                                <CheckCircle size={18} />
                              </button>
                            </DeleteAlertDialog>
                          </ActionGuard>
                        )}

                        <ActionGuard module="reservation" action="delete">
                          <button
                            title="Reject/Delete"
                            onClick={() => setSelectedBooking(booking)}
                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg border border-transparent hover:border-red-200"
                          >
                            <Info size={18} />
                          </button>
                        </ActionGuard>

                        <ActionGuard module="reservation" action="delete">
                          <DeleteAlertDialog
                            onConfirm={() => onDelete(booking.id)}
                            title="Tolak/Hapus Booking?"
                            description={`Apakah Anda yakin ingin menolak atau menghapus booking atas nama ${
                              booking.user?.username || "tamu"
                            }?`}
                          >
                            <button
                              title="Reject/Delete"
                              className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg border border-transparent hover:border-red-200"
                            >
                              <XCircle size={18} />
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

      <Dialog
        open={!!selectedBooking}
        onOpenChange={() => setSelectedBooking(null)}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Detail Booking</DialogTitle>
          </DialogHeader>

          {selectedBooking && (
            <div className="space-y-3 text-sm mt-2">
              <div className="flex justify-between">
                <span className="text-neutral-500">Nama</span>
                <span className="font-medium">
                  {selectedBooking.user?.username}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-neutral-500">Email</span>
                <span className="font-medium">
                  {selectedBooking.user?.email || "-"}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-neutral-500">Meja</span>
                <span className="font-medium">
                  T-{selectedBooking.table?.table_number}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-neutral-500">Jumlah Tamu</span>
                <span className="font-medium">
                  {selectedBooking.number_of_people}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-neutral-500">Waktu</span>
                <span className="font-medium">
                  {new Date(selectedBooking.booking_time).toLocaleString(
                    "id-ID",
                  )}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-neutral-500">Status</span>
                <span className="font-medium capitalize">
                  {selectedBooking.status}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-neutral-500">Transaction</span>
                <span className="font-mono text-xs">
                  {selectedBooking.transaction?.transaction_code}
                </span>
              </div>

              <div className="flex justify-between border-t pt-3 mt-2">
                <div className="flex flex-col">
                <span className="font-semibold">Total</span>
                  <span className="text-[10px] italic text-neutral-400 font-medium flex items-center gap-1"><Info size={10}/> sudah termasuk pelayanan dan pajak</span>
                </div>
                <span className="font-bold text-red-600">
                  Rp{" "}
                  {new Intl.NumberFormat("id-ID").format(
                    selectedBooking.transaction?.total_amount || 0,
                  )}
                </span>
              </div>

              {selectedBooking?.transaction?.details?.length > 0 && (
                <div className="border-t pt-3 mt-3 space-y-2">
                  <h4 className="font-semibold text-sm">Menu Pesanan</h4>

                  <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                    {selectedBooking.transaction.details.map((item: any) => (
                      <div
                        key={item.id}
                        className="flex justify-between items-center text-sm border rounded-lg p-2"
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {item.menu?.name || "Unknown Menu"}
                          </span>
                          <span className="text-xs text-neutral-500">
                            {item.menu_qty} x Rp{" "}
                            {new Intl.NumberFormat("id-ID").format(item.price)}
                          </span>
                        </div>

                        <span className="font-bold text-red-600">
                          Rp{" "}
                          {new Intl.NumberFormat("id-ID").format(item.subtotal)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-2">
                <span className="text-neutral-500 text-xs">Notes</span>
                <p className="text-sm">{selectedBooking.notes || "-"}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

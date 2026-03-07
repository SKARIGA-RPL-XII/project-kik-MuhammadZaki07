import { useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { useTables, useTableMutations } from "@/hooks/react-query/useTable";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronRight, Search, Users, Armchair, Calendar } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/context/ToastContext";

const TableSkeleton = () => (
  <div className="flex flex-col items-center">
    <div className="flex gap-4 mb-1">
      <Skeleton className="w-6 h-1.5 rounded-t-full" />
      <Skeleton className="w-6 h-1.5 rounded-t-full" />
    </div>
    <Skeleton className="w-24 h-24 rounded-xl border-2" />
    <div className="flex gap-4 mt-1">
      <Skeleton className="w-6 h-1.5 rounded-b-full" />
      <Skeleton className="w-6 h-1.5 rounded-b-full" />
    </div>
  </div>
);

export default function TablePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: tables, isLoading } = useTables({ page: 1, size: 10000 });
  const { updateTable } = useTableMutations();
  const isUpdating = updateTable.isPending;

  const [selectedRoomId, setSelectedRoomId] = useState<string | "all">("all");
  const [selectedTable, setSelectedTable] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isManageDialogOpen, setIsManageDialogOpen] = useState(false);
  const [reservedUntil, setReservedUntil] = useState("");
  const { toast } = useToast();

  const isCustomerSide = location.pathname.includes("customer");
  const isFromCart = location.state?.fromCart || false;

  const handleTableClick = (table: any) => {
    setSelectedTable(table);

    // Kalau bukan dari proses belanja (Kasir/Customer), maka buka dialog Manajemen
    if (!isFromCart && !isCustomerSide) {
      setIsManageDialogOpen(true);
      if (table.reserved_until) {
        const date = new Date(table.reserved_until);
        setReservedUntil(date.toISOString().slice(0, 16));
      } else {
        setReservedUntil("");
      }
    }
  };

  const handleConfirmTable = () => {
    if (!selectedTable) return;

    const targetPath = isCustomerSide ? "/payment-customer" : "/payment";

    navigate(targetPath, {
      state: {
        ...location.state,
        tableId: selectedTable.id,
        tableName: selectedTable.table_number,
        orderType: "dine_in",
        items: location.state?.items || [],
      },
    });
  };
  const handleUpdateStatus = (status: string) => {
    const payload: any = { status };
    if (status === "reserved") {
      if (!reservedUntil)
        return toast("warning", "Warning!", "Pilih waktu reservasi dulu!");
      payload.reserved_until = reservedUntil.replace("T", " ") + ":00";
    } else {
      payload.reserved_until = null;
    }

    updateTable.mutate(
      { id: selectedTable.id, payload: payload },
      {
        onSuccess: () => {
          setIsManageDialogOpen(false);
          setSelectedTable(null);
          setReservedUntil("");
        },
      },
    );
  };

  const rooms = Array.from(
    new Map(
      tables?.data?.tables
        ?.filter((t: any) => t.room)
        ?.map((t: any) => [t.room.id, t.room]),
    ).values(),
  );

  const tableList = (tables?.data?.tables || tables?.data || []).filter(
    (t: any) => {
      const matchesSearch = (t?.table_number?.toString() || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesRoom =
        selectedRoomId === "all" ||
        t.room_id?.toString() === selectedRoomId.toString();
      return matchesSearch && matchesRoom;
    },
  );

  const getStatusStyles = (status: string, isSelected: boolean) => {
    const base = "border-2 transition-all duration-300";
    switch (status) {
      case "occupied":
        return `${base} bg-red-50 hover:border-red-500 ${isSelected ? "ring-4 ring-red-300 scale-105" : ""}`;
      case "reserved":
        return `${base} bg-yellow-50 hover:border-yellow-500 ${isSelected ? "ring-4 ring-yellow-300 scale-105" : ""}`;
      default:
        return `${base} bg-green-50 hover:border-green-500 ${isSelected ? "ring-4 ring-green-300 scale-105" : ""}`;
    }
  };

  const getSeatColor = (status: string) => {
    switch (status) {
      case "occupied":
        return "hover:bg-red-50 bg-neutral-200";
      case "reserved":
        return "hover:bg-yellow-50 bg-neutral-200";
      default:
        return "hover:bg-green-50 bg-neutral-200";
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden relative">
      <header className="sticky top-0 z-30 border-b px-4 sm:px-6 lg:px-8 pb-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-zinc-900 dark:text-neutral-600 leading-none">
              Floor <span className="text-red-600">Plan</span>
            </h1>
            <p className="text-xs sm:text-sm lg:text-sm font-normal text-zinc-400 mt-1 leading-relaxed lg:max-w-lg max-w-sm">
              {isFromCart || isCustomerSide ? (
                <>
                  Order Selection — Choose an available table to start. Occupied
                  tables cannot be selected.
                </>
              ) : (
                <>
                  Table Management — Monitor real-time status and update
                  availability.
                </>
              )}
            </p>
          </div>

          <div className="relative w-full sm:w-80 lg:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              className="w-full pl-10 h-10 bg-zinc-50 dark:bg-neutral-800 border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600/20 text-sm"
              placeholder="Search table number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </header>

      <div className="px-8 py-3 border-b flex items-center gap-2 overflow-x-auto no-scrollbar">
        <Button
          variant={selectedRoomId === "all" ? "default" : "outline"}
          onClick={() => setSelectedRoomId("all")}
          className={`h-9 rounded-full px-6 text-sm hover:bg-red-50 hover:text-red-500 ${selectedRoomId === "all" ? "bg-red-600 text-white" : "border-zinc-100 text-zinc-400"}`}
        >
          All Areas
        </Button>
        {rooms.map((room: any) => (
          <Button
            key={room.id}
            variant={
              selectedRoomId === room.id.toString() ? "default" : "outline"
            }
            onClick={() => setSelectedRoomId(room.id.toString())}
            className={`h-9 rounded-full text-sm font-normal shadow-none hover:bg-red-50 hover:text-red-500 ${selectedRoomId === room.id.toString() ? "bg-red-600 text-white" : "border-zinc-100 text-zinc-400"}`}
          >
            {room.name}
          </Button>
        ))}
      </div>

      <ScrollArea className="flex-1 overflow-hidden">
        <div className="p-12 max-w-[1400px] mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-12 gap-y-16">
            {isLoading
              ? Array.from({ length: 12 }).map((_, i) => (
                  <TableSkeleton key={i} />
                ))
              : tableList.map((table: any) => {
                  const isSelected = selectedTable?.id === table.id;
                  const isOccupied = table.status === "occupied";
                  return (
                    <div
                      key={table.id}
                      className="relative flex flex-col items-center"
                    >
                      <div className="flex gap-4 mb-1">
                        {Array.from({
                          length: Math.ceil(table.capacity / 2),
                        }).map((_, i) => (
                          <div
                            key={i}
                            className={`w-10 h-3.5 bg-neutral-100 dark:bg-neutral-700 rounded-t-full transition-all duration-300 ${getSeatColor(table.status)}`}
                          />
                        ))}
                      </div>

                      <button
                        disabled={(isFromCart || isCustomerSide) && isOccupied}
                        onClick={() => handleTableClick(table)}
                        className={`relative rounded-xl flex flex-col bg-white dark:bg-neutral-900 items-center justify-center p-4 
                        ${table.capacity > 4 ? "w-48 h-24" : table.capacity > 2 ? "w-36 h-24" : "w-24 h-24"}
                        ${getStatusStyles(table.status, isSelected)}`}
                      >
                        <span
                          className={`font-black w-10 h-10 rounded-full flex justify-center items-center text-sm mb-1 text-white
                        ${table.status === "occupied" ? "bg-red-500" : table.status === "reserved" ? "bg-yellow-500" : "bg-green-500"}`}
                        >
                          T-{table.table_number}
                        </span>
                        <div className="flex items-center gap-1 opacity-40">
                          <Users className="h-3 w-3" />
                          <span className="text-[10px] font-bold">
                            {table.capacity}
                          </span>
                        </div>
                      </button>

                      <div className="flex gap-4 mt-1">
                        {Array.from({
                          length: Math.floor(table.capacity / 2),
                        }).map((_, i) => (
                          <div
                            key={i}
                            className={`w-10 h-3.5 bg-neutral-100 dark:bg-neutral-700 rounded-b-full transition-all duration-300 ${getSeatColor(table.status)}`}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
          </div>
        </div>
      </ScrollArea>

      <footer className="fixed bottom-0 right-0 z-50 w-full lg:w-[1230px] bg-white dark:bg-neutral-900 backdrop-blur border-t px-4 sm:px-6 py-3 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-col text-zinc-500">
            <span className="text-sm uppercase font-semibold mb-2">
              Information
            </span>
            <div className="flex flex-wrap items-center gap-6 text-xs">
              <div className="flex items-center gap-2.5 group">
                <div className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                </div>
                <span className="text-zinc-500 group-hover:text-emerald-600 transition-colors">
                  Available
                </span>
              </div>

              <div className="flex items-center gap-2.5 group">
                <div className="relative flex h-2.5 w-2.5">
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]"></span>
                </div>
                <span className="text-zinc-500 group-hover:text-rose-600 transition-colors">
                  Occupied
                </span>
              </div>

              <div className="flex items-center gap-2.5 group">
                <div className="relative flex h-2.5 w-2.5">
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"></span>
                </div>
                <span className="text-zinc-500 group-hover:text-amber-600 transition-colors">
                  Reserved
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end">
            {isFromCart || isCustomerSide ? (
              <Button
                disabled={!selectedTable || selectedTable.status === "occupied"}
                className="text-sm font-semibold bg-red-500 hover:bg-red-400"
                onClick={handleConfirmTable}
              >
                Confirm Selection <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <p className="text-sm font-normal text-zinc-400 text-right">
                Management Mode: Click any table to edit status
              </p>
            )}
          </div>
        </div>
      </footer>

      <Dialog open={isManageDialogOpen} onOpenChange={setIsManageDialogOpen}>
        <DialogContent className="max-w-2xl border-none bg-white dark:bg-neutral-700 p-0 overflow-hidden shadow-2xl rounded-[28px]">
          <div className="flex flex-col md:flex-row h-full">
            <div className="w-full md:w-[280px] bg-zinc-900 p-8 flex flex-col items-center justify-center text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl" />

              <div className="relative z-10 text-center space-y-6">
                <div className="space-y-1">
                  <span className="text-sm font-normal text-zinc-500 dark:text-neutral-200">
                    Dining Table
                  </span>
                  <h2 className="text-4xl font-blacker">
                    T-{selectedTable?.table_number}
                  </h2>
                </div>

                <div className="bg-white p-3 rounded-2xl shadow-2xl transform hover:scale-105 transition-transform duration-500">
                  {selectedTable?.qr_code ? (
                    <img
                      src={`${import.meta.env.VITE_STORAGE_URL}/${selectedTable.qr_code}`}
                      alt="Table QR"
                      className="w-32 h-32 object-contain"
                    />
                  ) : (
                    <div className="w-32 h-32 bg-zinc-100 flex items-center justify-center text-zinc-400 text-[10px] font-bold">
                      NO QR
                    </div>
                  )}
                </div>

                <div className="pt-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10">
                    <Users className="h-3 w-3 text-zinc-400" />
                    <span className="text-[11px] font-medium text-zinc-300">
                      Cap. {selectedTable?.capacity} Persons
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 p-8 space-y-8 bg-white dark:bg-neutral-900">
              <div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                  Table Management
                </h3>
                <p className="text-zinc-500 text-sm">
                  Update status or schedule a reservation.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  disabled={updateTable.isPending}
                  onClick={() => handleUpdateStatus("available")}
                  className="group flex items-center gap-3 p-4 rounded-full border-2 hover:border-emerald-500/30 hover:bg-emerald-50/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updateTable.isPending &&
                  selectedTable?.status === "available" ? (
                    <div className="h-2 w-2 rounded-full border border-zinc-300 border-t-emerald-500 animate-spin" />
                  ) : (
                    <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  )}
                  <span className="text-sm font-medium text-zinc-600 group-hover:text-emerald-700">
                    {updateTable.isPending &&
                    selectedTable?.status === "available"
                      ? "Updating..."
                      : "Set Available"}
                  </span>
                </button>

                <button
                  disabled={updateTable.isPending}
                  onClick={() => handleUpdateStatus("occupied")}
                  className="group flex items-center gap-3 p-4 rounded-full border-2 hover:border-rose-500/30 hover:bg-rose-50/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updateTable.isPending &&
                  selectedTable?.status === "occupied" ? (
                    <div className="h-2 w-2 rounded-full border border-zinc-300 border-t-rose-500 animate-spin" />
                  ) : (
                    <div className="h-2 w-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]" />
                  )}
                  <span className="text-sm font-medium text-zinc-600 group-hover:text-rose-700">
                    {updateTable.isPending &&
                    selectedTable?.status === "occupied"
                      ? "Updating..."
                      : "Set Occupied"}
                  </span>
                </button>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <label className="flex items-center gap-2 text-sm font-normal text-zinc-400">
                  <Calendar className="h-3 w-3" /> Reservation Schedule
                </label>

                <div className="flex gap-2">
                  <input
                    type="datetime-local"
                    className="flex-1 border h-10 px-4 rounded text-xs font-semibold outline-none focus:ring-2 focus:ring-amber-500/10 focus:border-amber-500/50 transition-all"
                    value={reservedUntil}
                    onChange={(e) => setReservedUntil(e.target.value)}
                  />
                  <Button
                    disabled={!reservedUntil}
                    onClick={() => handleUpdateStatus("reserved")}
                    className="h-10 px-6 bg-amber-500 hover:bg-amber-600 text-white font-semibold disabled:opacity-30 disabled:shadow-none"
                  >
                    Save
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

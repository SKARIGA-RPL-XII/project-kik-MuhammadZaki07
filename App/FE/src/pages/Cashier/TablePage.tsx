import { useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { useTables, useTableMutations } from "@/hooks/react-query/useTable";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChevronRight,
  Clock,
  Search,
  Users,
  LayoutGrid,
  Calendar,
  Armchair,
} from "lucide-react";
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

  const [selectedRoomId, setSelectedRoomId] = useState<string | "all">("all");
  const [selectedTable, setSelectedTable] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isManageDialogOpen, setIsManageDialogOpen] = useState(false);
  const [reservedUntil, setReservedUntil] = useState("");
  const { toast } = useToast();

  const isFromCashier = location.state?.fromCart || false;

  const handleTableClick = (table: any) => {
    setSelectedTable(table);

    if (!isFromCashier) {
      setIsManageDialogOpen(true);
      if (table.reserved_until) {
        const date = new Date(table.reserved_until);
        const formattedDate = date.toISOString().slice(0, 16);
        setReservedUntil(formattedDate);
      } else {
        setReservedUntil("");
      }
    }
  };

  const handleConfirmTable = () => {
    if (!selectedTable) return;
    navigate("/payment", {
      state: {
        tableId: selectedTable.id,
        tableName: selectedTable.table_number,
        orderType: "dine_in",
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
      {
        id: selectedTable.id,
        payload: payload,
      },
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
        return `${base} bg-red-50 hover:border-red-500 ${isSelected ? "ring-4 ring-red-300 scale-105" : ""
          }`;

      case "reserved":
        return `${base} bg-yellow-50 hover:border-yellow-500 ${isSelected ? "ring-4 ring-yellow-300 scale-105" : ""
          }`;

      default:
        return `${base} bg-green-50 hover:border-green-500 ${isSelected ? "ring-4 ring-green-300 scale-105" : ""
          }`;
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
      <header className="sticky top-0 z-30 bg-white border-b border-zinc-200 px-4 sm:px-6 lg:px-8 pb-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-zinc-900 leading-none">
              Floor <span className="text-red-600">Plan</span>
            </h1>
            <p className="text-xs sm:text-sm lg:text-sm font-normal text-zinc-400 mt-1 leading-relaxed lg:max-w-lg max-w-sm">
              {isFromCashier ? (
                <>
                  Order Selection — Choose an available table to start creating a new order.
                  Reserved and occupied tables cannot be selected.
                </>
              ) : (
                <>
                  Table Management — Monitor real-time table status and update availability,
                  reservations, or occupancy as needed.
                </>
              )}
            </p>
          </div>


          <div className="relative w-full sm:w-80 lg:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              className="w-full pl-10 h-10 bg-zinc-50 border border-zinc-200 rounded-xl 
        focus:outline-none focus:ring-2 focus:ring-red-600/20 text-sm"
              placeholder="Search table number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </header>

      <div className="px-8 py-3 bg-white border-b border-zinc-100 flex items-center gap-2 overflow-x-auto no-scrollbar">
        {isLoading ? (
          <>
            <Skeleton className="h-9 w-24 rounded-full" />
            <Skeleton className="h-9 w-24 rounded-full" />
            <Skeleton className="h-9 w-24 rounded-full" />
          </>
        ) : (
          <>
            <Button
              variant={selectedRoomId === "all" ? "default" : "outline"}
              onClick={() => setSelectedRoomId("all")}
              className={`h-9 rounded-full px-6 text-sm  hover:bg-red-50 hover:text-red-500 ${selectedRoomId === "all"
                  ? "bg-red-600 text-white"
                  : "border-zinc-100 text-zinc-400"
                }`}
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
                className={`h-9 rounded-full text-sm font-normal shadow-none hover:bg-red-50 hover:text-red-500 ${selectedRoomId === room.id.toString()
                    ? "bg-red-600 text-white"
                    : "border-zinc-100 text-zinc-400 hover:text-red-600"
                  }`}
              >
                {room.name}
              </Button>
            ))}
          </>
        )}
      </div>

      <ScrollArea className="flex-1 overflow-hidden">
        <div className="p-12 max-w-[1400px] mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-12 gap-y-16">
            {isLoading ? (
              Array.from({ length: 12 }).map((_, i) => (
                <TableSkeleton key={i} />
              ))
            ) : tableList.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center py-24 text-center">
                <div className="w-20 h-20 rounded-full bg-zinc-100 flex items-center justify-center mb-6">
                  <Armchair className="w-10 h-10 text-zinc-400" />
                </div>

                <h3 className="text-xl font-bold text-zinc-800">
                  No Tables Available
                </h3>

                <p className="text-sm text-zinc-400 mt-2 max-w-sm">
                  There are currently no tables created in this floor plan.
                  Please add a new table to get started.
                </p>
              </div>
            ) : (
              tableList.map((table: any) => {
                const isSelected = selectedTable?.id === table.id;
                const isOccupied = table.status === "occupied";
                const isReserved = table.status === "reserved";

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
                          className={`w-10 h-3.5 rounded-t-full transition-all duration-300
        ${getSeatColor(table.status)}
      `}
                        />
                      ))}
                    </div>

                    <button
                      disabled={isFromCashier && isOccupied}
                      onClick={() => handleTableClick(table)}
                      className={`relative rounded-xl flex flex-col items-center justify-center p-4
                          ${table.capacity > 4 ? "w-48 h-24" : table.capacity > 2 ? "w-36 h-24" : "w-24 h-24"}
                          ${getStatusStyles(table.status, isSelected)}
                        `}
                    >
                      <span
                        className={`font-black w-10 h-10 rounded-full flex justify-center items-center text-sm mb-1 text-white
                            ${table.status === "occupied"
                            ? "bg-red-500"
                            : table.status === "reserved"
                              ? "bg-yellow-500"
                              : "bg-green-500"
                          }
                            ${isSelected ? "ring-2 ring-offset-1 ring-black/20" : ""}
                            `}
                      >
                        T-{table.table_number}
                      </span>
                      <div className="flex items-center gap-1 opacity-40">
                        <Users className="h-3 w-3" />
                        <span className="text-[10px] font-bold">
                          {table.capacity}
                        </span>
                      </div>

                      {isReserved && (
                        <div className="absolute -bottom-3 flex items-center gap-1 bg-amber-500 text-white px-2 py-0.5 rounded-full text-[8px] font-black italic shadow-md">
                          <Calendar className="h-2.5 w-2.5" />
                          {table.reserved_until
                            ? new Date(table.reserved_until).toLocaleTimeString(
                              [],
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )
                            : "BOOKED"}
                        </div>
                      )}
                    </button>

                    <div className="flex gap-4 mt-1">
                      {Array.from({
                        length: Math.floor(table.capacity / 2),
                      }).map((_, i) => (
                        <div
                          key={i}
                          className={`w-10 h-3.5 rounded-b-full transition-all duration-300
        ${getSeatColor(table.status)}
      `}
                        />
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </ScrollArea>

      <footer className="fixed bottom-0 right-0 z-50 w-full lg:w-[1230px] 
bg-white/95 backdrop-blur border-t border-zinc-200 
px-4 sm:px-6 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

          <div className="flex flex-col text-zinc-500">
            <span className="text-md font-normal mb-2">
              Information
            </span>

            <div className="flex flex-wrap gap-4 text-[11px] font-semibold">

              <span className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-ping [animation-duration:1.5s]" />
                FREE
              </span>

              <span className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping [animation-duration:1.5s] [animation-delay:0.2s]" />
                USED
              </span>

              <span className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping [animation-duration:1.5s] [animation-delay:0.4s]" />
                BOOK
              </span>

            </div>
          </div>

          <div className="flex items-center justify-end">
            {isFromCashier ? (
              <Button
                disabled={!selectedTable || selectedTable.status === "occupied"}
                className="text-sm font-bold bg-red-500 hover:bg-red-400 cursor-pointer"
                onClick={handleConfirmTable}
              >
                CONFIRM SELECTION
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <p className="text-sm font-semibold text-zinc-400 text-right">
                Management Mode: Click any table to edit status
              </p>
            )}
          </div>

        </div>
      </footer>

      <Dialog open={isManageDialogOpen} onOpenChange={setIsManageDialogOpen}>
        <DialogContent className="max-w-md rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-center font-black uppercase tracking-tight text-xl">
              Table {selectedTable?.table_number}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="h-20 rounded-2xl flex-col gap-2 border-zinc-100 hover:bg-emerald-50 hover:border-emerald-200 text-zinc-600"
                onClick={() => handleUpdateStatus("available")}
              >
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="font-bold text-[10px] uppercase">
                  Available
                </span>
              </Button>
              <Button
                variant="outline"
                className="h-20 rounded-2xl flex-col gap-2 border-zinc-100 hover:bg-red-50 hover:border-red-200 text-zinc-600"
                onClick={() => handleUpdateStatus("occupied")}
              >
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="font-bold text-[10px] uppercase">
                  Occupied
                </span>
              </Button>
            </div>
            <div className="bg-zinc-50 p-5 rounded-2xl border border-zinc-100 space-y-4">
              <div className="flex items-center gap-2 text-amber-600 font-black text-[10px] uppercase tracking-widest">
                <Calendar className="h-3 w-3" /> Set Reservation
              </div>
              <input
                type="datetime-local"
                className="w-full bg-white border border-zinc-200 h-12 px-4 rounded-xl text-xs outline-none"
                value={reservedUntil}
                onChange={(e) => setReservedUntil(e.target.value)}
              />
              <Button
                disabled={!reservedUntil}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-black rounded-xl h-12 shadow-md"
                onClick={() => handleUpdateStatus("reserved")}
              >
                SAVE RESERVATION
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

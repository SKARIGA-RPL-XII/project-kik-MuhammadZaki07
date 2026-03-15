import { useState } from "react";
import { useNavigate } from "react-router";
import { useTables } from "@/hooks/react-query/useTable";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, ArrowLeft, Check, Search } from "lucide-react";
import { useTranslation } from "react-i18next";

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

export default function Step3Table({
  data,
  onBack,
  onUpdateData,
  onNext,
}: any) {
  const { t } = useTranslation();
  const { data: tables, isLoading } = useTables({ page: 1, size: 10000 });

  const [selectedRoomId, setSelectedRoomId] = useState<string | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const handleTableClick = (table: any) => {
    onUpdateData({
      table_id: table.id,
      table_number: table.table_number,
      selectedTableObject: table,
    });
  };

  const handleFinalConfirm = () => {
    if (!data.table_id) return;

    if (onNext) {
      onNext();
    }
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
    if (status === "occupied")
      return `${base} bg-red-50 dark:bg-red-950/20 opacity-50 cursor-not-allowed`;
    if (status === "reserved")
      return `${base} bg-yellow-50 dark:bg-yellow-950/20 opacity-50 cursor-not-allowed`;
    return `${base} bg-green-50 dark:bg-green-950/20 hover:border-green-500 ${isSelected ? "ring-2 ring-green-500 scale-105" : ""}`;
  };

  const getSeatColor = (status: string) => {
    if (status === "occupied") return "bg-red-200 dark:bg-red-800";
    if (status === "reserved") return "bg-yellow-200 dark:bg-yellow-800";
    return "bg-neutral-200 dark:bg-neutral-800";
  };

  return (
    <div className="space-y-6 w-full animate-in fade-in slide-in-from-right-4 pb-">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={onBack}
            size="icon"
            className="rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold">Pilih Meja</h2>
            <p className="text-sm text-zinc-500">
              Tentukan lokasi meja untuk reservasi kamu.
            </p>
          </div>
        </div>

        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            className="w-full pl-10 h-10 bg-white dark:bg-neutral-800 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-red-500/20"
            placeholder="Cari nomor meja..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2">
        <Button
          variant={selectedRoomId === "all" ? "default" : "outline"}
          onClick={() => setSelectedRoomId("all")}
          className={`rounded-full px-6 text-sm font-semibold ${selectedRoomId === "all" ? "bg-red-600" : ""}`}
        >
          Semua Ruangan
        </Button>
        {rooms.map((room: any) => (
          <Button
            key={room.id}
            variant={
              selectedRoomId === room.id.toString() ? "default" : "outline"
            }
            onClick={() => setSelectedRoomId(room.id.toString())}
            className={`rounded-full text-sm font-semibold ${selectedRoomId === room.id.toString() ? "bg-red-600" : ""}`}
          >
            {room.name.toUpperCase()}
          </Button>
        ))}
      </div>

      <ScrollArea className="h-[500px] rounded-lg border bg-white/50 dark:bg-neutral-900/50 py-5">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-12">
          {isLoading
            ? Array.from({ length: 10 }).map((_, i) => (
                <TableSkeleton key={i} />
              ))
            : tableList.map((table: any) => {
                const isSelected = data.table_id === table.id;
                const isDisabled = table.status !== "available";

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
                          className={`w-8 h-2 rounded-t-full transition-all ${getSeatColor(table.status)}`}
                        />
                      ))}
                    </div>

                    <button
                      disabled={isDisabled}
                      onClick={() => handleTableClick(table)}
                      className={`relative rounded-2xl flex flex-col items-center justify-center p-4 
                        ${table.capacity > 4 ? "w-40 h-20" : "w-24 h-20"}
                        ${getStatusStyles(table.status, isSelected)}`}
                    >
                      <span
                        className={`font-black text-xs px-2 py-1 rounded-lg text-white mb-1
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
                          className={`w-8 h-2 rounded-b-full transition-all ${getSeatColor(table.status)}`}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
        </div>
      </ScrollArea>

      <div className="fixed bottom-0 left-0 w-full p-3 bg-white dark:bg-neutral-950 border-t flex flex-col md:flex-row justify-between items-center z-50 gap-4">
        <div className="flex items-center gap-4 border-l pl-8 border-zinc-100 dark:border-neutral-800 sm:flex">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
            <span className="text-[10px] font-bold text-zinc-500 uppercase">
              Tersedia
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500 opacity-50" />
            <span className="text-[10px] font-bold text-zinc-500 uppercase">
              Terisi
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500 opacity-50" />
            <span className="text-[10px] font-bold text-zinc-500 uppercase">
              Dipesan
            </span>
          </div>
        </div>
        <Button
          disabled={!data.table_id}
          onClick={handleFinalConfirm}
          className="bg-red-500 hover:bg-red-600 text-white"
        >
          Selesaikan Booking <Check className="ml-2 w-6 h-6" />
        </Button>
      </div>
    </div>
  );
}

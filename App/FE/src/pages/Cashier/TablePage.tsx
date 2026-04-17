import { useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router";
import { useTables, useTableMutations } from "@/hooks/react-query/useTable";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronRight, Search, Users, Calendar } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useToast } from "@/context/ToastContext";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import PageMeta from "@/components/common/PageMeta";
import dayjs from "dayjs";

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
  const { t } = useTranslation();
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

  const isCustomerSide = location.pathname.includes("customer");
  const isFromCart = location.state?.fromCart || false;

  const handleTableClick = (table: any) => {
    setSelectedTable(table);

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
    if (status === "reserved" || status === "booked") {
      if (!reservedUntil)
        return toast(
          "warning",
          t("tp_toast_warning"),
          t("tp_toast_reserve_time"),
        );
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

  const rooms = useMemo(() => {
    return Array.from(
      new Map(
        tables?.data?.tables
          ?.filter((t: any) => t.room)
          ?.map((t: any) => [t.room.id, t.room]),
      ).values(),
    );
  }, [tables?.data?.tables]);

  const tableList = useMemo(() => {
    const rawData = tables?.data?.tables || tables?.data || [];
    return rawData.filter((t: any) => {
      const matchesSearch = (t?.table_number?.toString() || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesRoom =
        selectedRoomId === "all" ||
        t.room_id?.toString() === selectedRoomId.toString();
      return matchesSearch && matchesRoom;
    });
  }, [tables, searchQuery, selectedRoomId]);

  const getStatusStyles = (status: string, isSelected: boolean) => {
    const base = "border-2 transition-all duration-300";

    switch (status) {
      case "occupied":
        return `${base}
        bg-red-100 dark:bg-red-950/20
        border-red-400 hover:border-red-500
        ${isSelected ? "ring-4 ring-red-300 scale-105" : ""}`;

      case "booked":
        return `${base}
        bg-yellow-100 dark:bg-yellow-950/20
        border-yellow-400 hover:border-yellow-500
        ${isSelected ? "ring-4 ring-yellow-300 scale-105" : ""}`;

      default:
        return `${base}
        bg-green-100 dark:bg-green-950/20
        border-green-400 hover:border-green-500
        ${isSelected ? "ring-4 ring-green-300 scale-105" : ""}`;
    }
  };

  const getSeatColor = (status: string) => {
    switch (status) {
      case "occupied":
        return "bg-red-200 dark:bg-red-900";
      case "booked":
        return "bg-yellow-200 dark:bg-yellow-900";
      default:
        return "bg-green-200 dark:bg-green-900";
    }
  };

  const getTableState = (table: any) => {
    return getDerivedStatus(table);
  };

  const isBlockedTable = (table: any) => {
    const state = getTableState(table);
    return state.status === "occupied";
  };

  const getDerivedStatus = (table: any) => {
    const now = dayjs();
    const reservedTime = table.reserved_until
      ? dayjs(table.reserved_until)
      : null;

    if (table.status === "occupied") {
      return {
        status: "occupied",
        color: "bg-red-500",
        labelClass:
          "w-10 h-10 flex justify-center items-center rounded-full bg-red-500 text-white",
        label: `T-${table.table_number}`,
        subLabel: "IN USE",
        disabled: true,
      };
    }

    if (table.status === "booked" || table.status === "reserved") {
      if (reservedTime) {
        const isToday = reservedTime.isSame(now, "day");
        const isFuture = reservedTime.isAfter(now, "day");

        if (isToday) {
          return {
            status: "booked",
            color: "bg-yellow-500",
            labelClass:
              "w-10 h-10 flex justify-center items-center rounded-full bg-yellow-500 text-white",
            label: reservedTime.format("HH:mm"),
            subLabel: `BOOKED TODAY • ${reservedTime.format("HH:mm")}`,
            disabled: false,
          };
        }

        if (isFuture) {
          return {
            status: "available",
            color: "bg-emerald-500",
            labelClass:
              "w-10 h-10 flex justify-center items-center rounded-full bg-emerald-500 text-white",
            label: `T-${table.table_number}`,
            subLabel: `BOOKED TOMORROW • ${reservedTime.format("DD/MM HH:mm")}`,
            disabled: false,
          };
        }
      }

      // fallback booked
      return {
        status: "booked",
        color: "bg-yellow-500",
        labelClass:
          "w-10 h-10 flex justify-center items-center rounded-full bg-yellow-500 text-white",
        label: `T-${table.table_number}`,
        subLabel: "BOOKED",
        disabled: false,
      };
    }

    // 🟢 AVAILABLE
    return {
      status: "available",
      color: "bg-emerald-500",
      labelClass:
        "w-10 h-10 flex justify-center items-center rounded-full bg-emerald-500 text-white",
      label: `T-${table.table_number}`,
      subLabel: null,
      disabled: false,
    };
  };

  // const getTodayAndTomorrowBookingsJSON = (tables: any[]) => {
  //   const now = dayjs();
  //   const start = now.startOf("day");
  //   const end = now.add(2, "day").endOf("day");

  //   const result: any[] = [];

  //   tables.forEach((table) => {
  //     const bookings = table.bookings || [];

  //     bookings.forEach((b: any) => {
  //       if (!b.booking_time) return;

  //       const bookingTime = dayjs(b.booking_time);

  //       const inRange = bookingTime.isAfter(start) && bookingTime.isBefore(end);

  //       const validStatus = ["booked", "reserved", "confirmed"].includes(
  //         b.status,
  //       );

  //       if (inRange && validStatus) {
  //         console.log("BOOKING FOUND:", {
  //           table_id: table.id,
  //           table_number: table.table_number,
  //           booking_time: b.booking_time,
  //           status: b.status,
  //         });

  //         result.push({
  //           table_id: table.id,
  //           table_number: table.table_number,
  //           booking_id: b.id,
  //           booking_time: b.booking_time,
  //           status: b.status,
  //           type: "TODAY_TOMORROW_BOOKING",
  //           display_as: "GREEN_TABLE",
  //         });
  //       }
  //     });
  //   });

  //   return result;
  // };

  return (
    <div className="flex flex-col h-screen overflow-hidden relative max-w-7xl mx-auto">
      <PageMeta
        title={t("tp_header_floor") || "Table Management"}
        description="Real-time restaurant floor plan management, table status tracking, and reservation scheduling."
      />
      <header
        className={`sticky ${
          isCustomerSide ? "pb-4 pt-5" : "pb-4"
        } top-0 z-30 border-b`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-zinc-900 dark:text-neutral-100 leading-none">
              {t("tp_header_floor")}{" "}
              <span className="text-red-600">{t("tp_header_plan")}</span>
            </h1>
            <p className="text-xs sm:text-sm lg:text-sm font-normal text-zinc-400 mt-1 leading-relaxed lg:max-w-lg max-w-sm">
              {isFromCart || isCustomerSide
                ? t("tp_desc_customer")
                : t("tp_desc_management")}
            </p>
          </div>

          <div className="relative w-full sm:w-80 lg:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              className="w-full pl-10 h-10 bg-zinc-50 dark:bg-neutral-800 border dark:border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600/20 text-sm"
              placeholder={t("tp_search_placeholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </header>

      <div className="py-3 border-b dark:border-neutral-800 flex items-center gap-2 overflow-x-auto no-scrollbar">
        <Button
          variant={selectedRoomId === "all" ? "default" : "outline"}
          onClick={() => setSelectedRoomId("all")}
          className={`h-9 rounded-full px-6 text-sm hover:bg-red-50 hover:text-red-500 ${
            selectedRoomId === "all"
              ? "bg-red-600 text-white"
              : "border-zinc-100 dark:border-neutral-700 text-zinc-400"
          }`}
        >
          {t("tp_filter_all")}
        </Button>
        {rooms.map((room: any) => (
          <Button
            key={room.id}
            variant={
              selectedRoomId === room.id.toString() ? "default" : "outline"
            }
            onClick={() => setSelectedRoomId(room.id.toString())}
            className={`h-9 rounded-full text-sm font-normal shadow-none hover:bg-red-50 hover:text-red-500 ${
              selectedRoomId === room.id.toString()
                ? "bg-red-600 text-white"
                : "border-zinc-100 dark:border-neutral-700 text-zinc-400"
            }`}
          >
            {room.name}
          </Button>
        ))}
      </div>

      <ScrollArea className="flex-1 overflow-hidden">
        <div className="pt-10 pb-32 md:pt-10 md:pb-20 lg:pb-24 max-w-[1400px] mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-12 gap-y-12">
            {isLoading
              ? Array.from({ length: 12 }).map((_, i) => (
                  <TableSkeleton key={i} />
                ))
              : tableList.map((table: any) => {
                  const isSelected = selectedTable?.id === table.id;
                  const status = getDerivedStatus(table);
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
                            className={`w-10 h-3.5 bg-neutral-100 dark:bg-neutral-800 rounded-t-full transition-all duration-300 ${getSeatColor(
                              table.status,
                            )}`}
                          />
                        ))}
                      </div>

                      <button
                        disabled={
                          (isFromCart || isCustomerSide) && status.disabled
                        }
                        onClick={() => handleTableClick(table)}
                        className={`relative rounded-xl flex flex-col bg-white dark:bg-neutral-900 items-center cursor-pointer justify-center p-4
                              ${
                                table.capacity > 4
                                  ? "w-48 h-24"
                                  : table.capacity > 2
                                  ? "w-36 h-24"
                                  : "w-24 h-24"
                              }
                              ${getStatusStyles(status.status, isSelected)}
                              ${
                                (isFromCart || isCustomerSide) &&
                                (isFromCart || isCustomerSide) &&
                                isBlockedTable(table)
                                  ? "opacity-50 cursor-not-allowed pointer-events-none"
                                  : ""
                              }
                            `}
                      >
                        <span className={status.labelClass}>
                          {status.label}
                        </span>
                        <div className="flex items-center gap-1 opacity-40">
                          <Users className="h-3 w-3" />
                          <span className="text-[10px] font-bold">
                            {table.capacity}
                          </span>
                        </div>
                        {getDerivedStatus(table).subLabel && (
                          <div
                            className={`text-[9px] mt-1 font-bold uppercase
                              ${
                                getDerivedStatus(table).status === "occupied"
                                  ? "text-red-600"
                                  : "text-yellow-600"
                              }`}
                          >
                            {status.subLabel && (
                              <div
                                className={`text-[9px] mt-1 font-bold uppercase ${
                                  status.status === "occupied"
                                    ? "text-red-600"
                                    : "text-yellow-600"
                                }`}
                              >
                                {status.subLabel}
                              </div>
                            )}
                          </div>
                        )}
                      </button>

                      <div className="flex gap-4 mt-1">
                        {Array.from({
                          length: Math.floor(table.capacity / 2),
                        }).map((_, i) => (
                          <div
                            key={i}
                            className={`w-10 h-3.5 bg-neutral-100 dark:bg-neutral-800 rounded-b-full transition-all duration-300 ${getSeatColor(
                              status.status,
                            )}`}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
          </div>
        </div>
      </ScrollArea>

      <footer
        className={`fixed ${
          isCustomerSide ? "w-full" : "w-[1230px]"
        } bottom-0 right-0 z-50 bg-white dark:bg-neutral-900 backdrop-blur border-t dark:border-neutral-800 px-4 sm:px-6 py-3 shadow-lg`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-col text-zinc-500">
            <span className="text-sm uppercase font-semibold mb-2">
              {t("tp_footer_info")}
            </span>
            <div className="flex flex-wrap items-center gap-6 text-xs">
              <div className="flex items-center gap-2.5 group">
                <div className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                </div>
                <span className="text-zinc-500 group-hover:text-emerald-600 transition-colors">
                  {t("tp_status_available")}
                </span>
              </div>

              <div className="flex items-center gap-2.5 group">
                <div className="relative flex h-2.5 w-2.5">
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]"></span>
                </div>
                <span className="text-zinc-500 group-hover:text-rose-600 transition-colors">
                  {t("tp_status_occupied")}
                </span>
              </div>

              <div className="flex items-center gap-2.5 group">
                <div className="relative flex h-2.5 w-2.5">
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"></span>
                </div>
                <span className="text-zinc-500 group-hover:text-amber-600 transition-colors">
                  {t("tp_status_reserved")}
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
                {t("tp_btn_confirm")} <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <p className="text-sm font-normal text-zinc-400 text-right">
                {t("tp_management_mode")}
              </p>
            )}
          </div>
        </div>
      </footer>

      <Dialog open={isManageDialogOpen} onOpenChange={setIsManageDialogOpen}>
        <DialogContent className="max-w-3xl border-none bg-white dark:bg-neutral-800 p-0 overflow-hidden shadow-2xl rounded-[28px]">
          <div className="flex flex-col md:flex-row h-full">
            <div className="w-full md:w-[280px] bg-red-600 dark:bg-neutral-800 p-8 flex flex-col items-center justify-center text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl" />

              <div className="relative z-10 text-center space-y-6">
                <div className="space-y-1">
                  <span className="text-sm font-normal text-white">
                    {t("tp_dialog_table_label")}
                  </span>
                  <h2 className="text-4xl font-black">
                    T-{selectedTable?.table_number}
                  </h2>
                </div>

                <div className="bg-white p-3 rounded-2xl shadow-2xl transform hover:scale-105 transition-transform duration-500">
                  {selectedTable?.qr_code ? (
                    <img
                      src={`${import.meta.env.VITE_STORAGE_URL}/${
                        selectedTable.qr_code
                      }`}
                      alt="Table QR"
                      className="w-32 h-32 object-contain"
                    />
                  ) : (
                    <div className="w-32 h-32 bg-zinc-100 flex items-center justify-center text-zinc-400 text-[10px] font-bold">
                      {t("tp_dialog_no_qr")}
                    </div>
                  )}
                </div>

                <div className="pt-4">
                  <Badge variant={"default"}>
                    <Users className="h-3 w-3 dark:text-black text-white" />
                    <span className="text-[11px] font-medium text-white dark:text-black">
                      {t("tp_dialog_capacity", {
                        count: selectedTable?.capacity,
                      })}
                    </span>
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex-1 px-4 py-5 space-y-8 bg-white dark:bg-neutral-900">
              <div>
                <h3 className="text-2xl font-bold text-zinc-900 dark:text-neutral-100">
                  {t("tp_dialog_title")}
                </h3>
                <p className="dark:text-neutral-300 text-muted-foreground text-sm">
                  {t("tp_dialog_subtitle")}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  disabled={updateTable.isPending}
                  onClick={() => handleUpdateStatus("available")}
                  className="group relative flex items-center gap-4 p-4 rounded-xl border bg-white dark:bg-neutral-900 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-all disabled:opacity-50"
                >
                  <div className="flex items-center justify-center w-5 h-5 rounded-xl bg-emerald-100 dark:bg-emerald-500/15">
                    {updateTable.isPending &&
                    selectedTable?.status === "available" ? (
                      <div className="h-4 w-4 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
                    ) : (
                      <div className="h-3 w-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.6)]" />
                    )}
                  </div>

                  <div className="flex flex-col text-left">
                    <span className="text-sm font-semibold text-zinc-800 dark:text-white">
                      {t("tp_btn_set_available")}
                    </span>
                    <span className="text-xs text-zinc-500 dark:text-neutral-400">
                      {updateTable.isPending &&
                      selectedTable?.status === "available"
                        ? t("tp_btn_updating")
                        : "Table ready for guests"}
                    </span>
                  </div>
                </button>

                <button
                  disabled={updateTable.isPending}
                  onClick={() => handleUpdateStatus("occupied")}
                  className="group relative flex items-center gap-4 p-4 rounded-xl border bg-white dark:bg-neutral-900 hover:border-rose-500/40 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all disabled:opacity-50"
                >
                  <div className="flex items-center justify-center w-5 h-5 rounded-xl bg-rose-100 dark:bg-rose-500/15">
                    {updateTable.isPending &&
                    selectedTable?.status === "occupied" ? (
                      <div className="h-4 w-4 rounded-full border-2 border-rose-500 border-t-transparent animate-spin" />
                    ) : (
                      <div className="h-3 w-3 rounded-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.6)]" />
                    )}
                  </div>

                  <div className="flex flex-col text-left">
                    <span className="text-sm font-semibold text-zinc-800 dark:text-white">
                      {t("tp_btn_set_occupied")}
                    </span>
                    <span className="text-xs text-zinc-500 dark:text-neutral-400">
                      {updateTable.isPending &&
                      selectedTable?.status === "occupied"
                        ? t("tp_btn_updating")
                        : "Mark table as taken"}
                    </span>
                  </div>
                </button>
              </div>

              <div className="space-y-4 pt-4 border-t dark:border-neutral-800">
                <label className="flex items-center gap-2 text-sm font-normal text-muted-foreground dark:text-neutral-300">
                  <Calendar className="h-3 w-3" />{" "}
                  {t("tp_label_reserve_schedule")}
                </label>
                <div className="flex gap-2">
                  <input
                    type="datetime-local"
                    className="flex-1 border dark:border-neutral-700 bg-transparent dark:text-white h-9 px-4 rounded text-xs font-semibold outline-none focus:ring-2 focus:ring-amber-500/10 transition-all"
                    value={reservedUntil}
                    onChange={(e) => setReservedUntil(e.target.value)}
                  />
                  <Button
                    disabled={!reservedUntil}
                    onClick={() => handleUpdateStatus("reserved")}
                    className="bg-red-500 hover:bg-red-600 text-white font-semibold disabled:opacity-30"
                  >
                    {t("tp_btn_save")}
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

import * as React from "react";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DraggableStateSnapshot,
  type DroppableProvided,
} from "@hello-pangea/dnd";
import { useEmployes } from "@/hooks/react-query/useEmploye";
import { useScheduleLogic } from "@/hooks/useScheduleLogic";
import ScheduleSkeleton from "@/components/skeleton/ScheduleSkeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { Clock, Save, Trash2, Search, AlertCircle, Info } from "lucide-react";
import { StaffCard } from "@/components/ui/StaffCard";
import { cn } from "@/lib/utils";
import { mergeDraggableStyle } from "@/utils/dragStyles";
import PageMeta from "@/components/common/PageMeta";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import type { Shift as ShiftEntity } from "@/services/shift.service";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useBlocker } from "react-router";

const DAY_ACCENTS: Record<string, string> = {
  Senin: "border-t-sky-400/45",
  Selasa: "border-t-violet-400/45",
  Rabu: "border-t-emerald-400/45",
  Kamis: "border-t-orange-400/45",
  Jumat: "border-t-pink-400/45",
  Sabtu: "border-t-indigo-400/45",
  Minggu: "border-t-rose-400/45",
};

const DAY_TINT: Record<string, string> = {
  Senin: "bg-sky-500/[0.03]",
  Selasa: "bg-violet-500/[0.03]",
  Rabu: "bg-emerald-500/[0.03]",
  Kamis: "bg-orange-500/[0.03]",
  Jumat: "bg-pink-500/[0.03]",
  Sabtu: "bg-indigo-500/[0.03]",
  Minggu: "bg-rose-500/[0.03]",
};

function ScheduleDroppablePanel({
  droppableProvided,
  className,
  dragOverClassName,
  isDraggingOver,
  children,
}: {
  droppableProvided: DroppableProvided;
  className?: string;
  dragOverClassName?: string;
  isDraggingOver: boolean;
  children: React.ReactNode;
}) {
  const { innerRef, droppableProps, placeholder } = droppableProvided;
  return (
    <ScrollAreaPrimitive.Root
      className={cn("relative min-h-0 flex-1 overflow-hidden", className)}
    >
      <ScrollAreaPrimitive.Viewport
        ref={innerRef as unknown as React.Ref<HTMLDivElement>}
        {...droppableProps}
        className="h-full w-full max-w-full rounded-[inherit] outline-none [&>div]:!block"
      >
        <div
          className={cn(
            "flex min-h-24 w-full min-w-0 max-w-full flex-col gap-2 p-3 transition-colors duration-150",
            isDraggingOver ? dragOverClassName : "bg-transparent",
          )}
        >
          {children}
          {placeholder}
        </div>
      </ScrollAreaPrimitive.Viewport>
      <ScrollAreaPrimitive.ScrollAreaScrollbar
        orientation="vertical"
        className="flex h-full w-2 touch-none border-l border-l-transparent p-px select-none"
      >
        <ScrollAreaPrimitive.ScrollAreaThumb className="relative flex-1 rounded-full bg-border" />
      </ScrollAreaPrimitive.ScrollAreaScrollbar>
    </ScrollAreaPrimitive.Root>
  );
}

function DraggableItem({
  draggableId,
  index,
  children,
}: {
  draggableId: string;
  index: number;
  children: (state: { snapshot: DraggableStateSnapshot }) => React.ReactNode;
}) {
  return (
    <Draggable draggableId={draggableId} index={index}>
      {(provided, snapshot) => (
        <motion.div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={mergeDraggableStyle(provided.draggableProps.style, snapshot)}
          className="w-full min-w-0 max-w-full outline-none"
          initial={false}
          layout={false}
          transition={{ duration: 0.15, ease: "easeOut" }}
        >
          {children({ snapshot })}
        </motion.div>
      )}
    </Draggable>
  );
}

const SchedulePage = () => {
  const { data: employeData, isLoading } = useEmployes({ page: 1, size: 100 });
  const [searchQuery, setSearchQuery] = React.useState("");

  const {
    availableStaff,
    weeklySchedule,
    shifts,
    onDragEnd,
    removeUser,
    updateShiftTime,
    setWeeklySchedule,
    handleFullSave,
    hasChanges,
    isReady,
  } = useScheduleLogic(employeData);

  // 1. Definisikan blocker dengan logika yang stabil
  const blocker = useBlocker(
    React.useCallback(
      ({ currentLocation, nextLocation }) =>
        hasChanges && currentLocation.pathname !== nextLocation.pathname,
      [hasChanges]
    )
  );

  // 2. Fungsi khusus untuk simpan lalu lanjut pindah
  const handleSaveAndExit = async () => {
    await handleFullSave();
    // Beri jeda sedikit agar state sinkron sebelum navigasi dilanjutkan
    setTimeout(() => {
      blocker.proceed?.();
    }, 100);
  };

  // 3. Cleanup blocker saat pindah halaman
  React.useEffect(() => {
    return () => {
      if (blocker.state === "blocked") {
        blocker.reset?.();
      }
    };
  }, [blocker.state]);

  // 4. Handle penutupan tab/refresh browser
  React.useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasChanges]);

  const filteredStaff = React.useMemo(() => {
    if (!searchQuery.trim()) return availableStaff;
    return availableStaff.filter((emp: any) =>
      emp.user.username.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [availableStaff, searchQuery]);

  if (isLoading || !isReady) return <ScheduleSkeleton />;

  return (
    <motion.div
      className="flex h-[calc(100vh-140px)] w-full min-h-0 flex-col overflow-hidden"
      initial={{ opacity: 0.92 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <PageBreadcrumb pageTitle="Schedule" />
      <Header hasChanges={hasChanges} onSave={handleFullSave} />
      <PageMeta description="Manage employee schedules and shifts" title="Schedule" />

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex min-h-0 flex-1 gap-0 overflow-hidden">
          <Sidebar
            availableStaff={filteredStaff}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
          <Board
            weeklySchedule={weeklySchedule}
            shifts={shifts}
            setWeeklySchedule={setWeeklySchedule}
            removeUser={removeUser}
            updateShiftTime={updateShiftTime}
          />
        </div>
      </DragDropContext>

      {/* MODAL KONFIRMASI */}
      <AlertDialog open={blocker.state === "blocked"}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="size-5 text-destructive" />
              Perubahan Belum Disimpan
            </AlertDialogTitle>
            <AlertDialogDescription>
              Zaki, ada perubahan jadwal yang belum disimpan. Jika kamu pergi sekarang, data yang kamu atur akan hilang.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel onClick={() => blocker.reset?.()}>
              Tetap di Sini
            </AlertDialogCancel>

            <Button
              variant="ghost"
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => blocker.proceed?.()}
            >
              Buang Perubahan
            </Button>

            <AlertDialogAction
              onClick={handleSaveAndExit}
              className="bg-red-500 hover:bg-red-500/80 text-white"
            >
              Simpan & Keluar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
};

const Header = ({
  hasChanges,
  onSave,
}: {
  hasChanges: boolean;
  onSave: () => void;
}) => (
  <header className="flex shrink-0 items-center justify-between gap-4 border-b border-border pb-3">
    <div className="min-w-0 space-y-1">
      <h1 className="text-lg font-semibold text-foreground">Jadwal</h1>
      <p className="text-sm text-muted-foreground">
        Kelola penempatan shift mingguan pegawai.
      </p>
    </div>

    <div className="flex items-center gap-3">
      {hasChanges && (
        <span className="text-xs font-medium text-orange-500 flex gap-2 items-center">
         <Info size={15} className="animate-ping"/> Ada perubahan yang belum disimpan
        </span>
      )}
      <Button
        size="default"
        disabled={!hasChanges}
        onClick={onSave}
        className="shrink-0 gap-2 transition-all duration-150 bg-red-500 hover:bg-red-500/80 text-white"
      >
        <Save className="size-4" />
        Simpan
      </Button>
    </div>
  </header>
);

const Sidebar = ({
  availableStaff,
  searchQuery,
  setSearchQuery,
}: {
  availableStaff: any[];
  searchQuery: string;
  setSearchQuery: (v: string) => void;
}) => (
  <aside className="flex w-72 min-w-0 shrink-0 flex-col overflow-hidden border-r border-border bg-muted/5">
    <div className="shrink-0 space-y-4 border-b border-border p-4">
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">Pegawai Tersedia</p>
        <p className="text-xs text-muted-foreground">
          {availableStaff.length} orang ditemukan
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
        <Input
          placeholder="Cari nama..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-9 pl-9 text-xs focus-visible:ring-sky-500/30"
        />
      </div>
    </div>

    <Droppable droppableId="pool">
      {(provided, snapshot) => (
        <ScheduleDroppablePanel
          droppableProvided={provided}
          isDraggingOver={snapshot.isDraggingOver}
          dragOverClassName="bg-muted/50"
          className="min-h-0 flex-1"
        >
          {availableStaff.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Search className="mb-2 size-8 text-muted-foreground/30" />
              <p className="text-xs text-muted-foreground">Tidak ada pegawai</p>
            </div>
          ) : (
            availableStaff.map((emp: any, index: number) => (
              <DraggableItem
                key={emp.user.id}
                draggableId={emp.user.id.toString()}
                index={index}
              >
                {({ snapshot: s }) => (
                  <StaffCard emp={emp} isDragging={s.isDragging} />
                )}
              </DraggableItem>
            ))
          )}
        </ScheduleDroppablePanel>
      )}
    </Droppable>
  </aside>
);

const Board = ({
  weeklySchedule,
  shifts,
  setWeeklySchedule,
  removeUser,
  updateShiftTime,
}: {
  weeklySchedule: Record<string, any>;
  shifts: ShiftEntity[];
  setWeeklySchedule: (fn: (prev: any) => any) => void;
  removeUser: (day: string, userId: number) => void;
  updateShiftTime: (
    day: string,
    type: string,
    field: "start" | "end",
    value: string,
  ) => void;
}) => {
  const days = Object.keys(weeklySchedule);

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden p-4 bg-muted/10">
      <div className="custom-scrollbar min-h-0 flex-1 overflow-x-auto overflow-y-hidden overscroll-x-contain">
        <div className="flex h-full min-h-0 w-max items-stretch gap-3 pr-1">
          {days.map((day, i) => (
            <DayColumn
              key={day}
              day={day}
              dayIndex={i}
              data={weeklySchedule[day]}
              shifts={shifts}
              setWeeklySchedule={setWeeklySchedule}
              removeUser={removeUser}
              updateShiftTime={updateShiftTime}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const DayColumn = ({
  day,
  dayIndex,
  data,
  shifts,
  setWeeklySchedule,
  removeUser,
  updateShiftTime,
}: {
  day: string;
  dayIndex: number;
  data: any;
  shifts: ShiftEntity[];
  setWeeklySchedule: (fn: (prev: any) => any) => void;
  removeUser: (day: string, userId: number) => void;
  updateShiftTime: (
    day: string,
    type: string,
    field: "start" | "end",
    value: string,
  ) => void;
}) => {
  const shiftTimeToInput = (t: string | undefined) => {
    if (!t) return "08:00";
    const part = t.includes("T")
      ? t.split("T")[1]?.slice(0, 5)
      : String(t).slice(0, 5);
    return /^\d{2}:\d{2}$/.test(part) ? part : "08:00";
  };

  const firstShiftId = String(shifts[0]?.id ?? "");
  const rawTab = String(data?.activeType ?? "");
  const currentType = shifts.some((s) => String(s.id) === rawTab)
    ? rawTab
    : firstShiftId;
  const activeSlot = data?.[currentType] as
    | { users?: any[]; start?: string; end?: string }
    | undefined;
  const masterShift = shifts.find((s) => String(s.id) === currentType);
  const users = activeSlot?.users ?? [];
  const timeStart =
    activeSlot?.start ?? shiftTimeToInput(masterShift?.start_time);
  const timeEnd = activeSlot?.end ?? shiftTimeToInput(masterShift?.end_time);
  const accent = DAY_ACCENTS[day] ?? DAY_ACCENTS.Senin;
  const tint = DAY_TINT[day] ?? DAY_TINT.Senin;

  return (
    <motion.div
      className="flex h-full min-h-0 w-80 shrink-0 flex-col"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: dayIndex * 0.02, ease: "easeOut" }}
    >
      <Card
        className={cn(
          "flex h-full min-h-0 w-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm",
          "border-t-2",
          accent,
          tint,
        )}
      >
        <CardHeader className="shrink-0 space-y-3 border-b border-border px-4 py-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold">{day}</CardTitle>
            <div className="flex h-5 items-center rounded-full bg-background/50 px-2 text-[10px] font-medium text-muted-foreground border">
              {users.length} Pegawai
            </div>
          </div>

          <Tabs
            value={currentType}
            onValueChange={(v) =>
              setWeeklySchedule((prev: any) => ({
                ...prev,
                [day]: { ...prev[day], activeType: v },
              }))
            }
          >
            <TabsList className="grid h-8 w-full grid-cols-4 rounded-lg bg-muted/60 p-0.5">
              {shifts.map((shift) => (
                <TabsTrigger
                  key={shift.id}
                  value={String(shift.id)}
                  className="rounded-md capitalize text-[10px] font-medium transition-colors duration-150 data-[state=active]:shadow-sm"
                >
                  {shift.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground/70">
                Mulai
              </span>
              <Input
                type="time"
                value={timeStart}
                onChange={(e) =>
                  updateShiftTime(day, currentType, "start", e.target.value)
                }
                className="h-8 rounded-lg text-xs bg-background/50 focus-visible:ring-1"
              />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground/70">
                Selesai
              </span>
              <Input
                type="time"
                value={timeEnd}
                onChange={(e) =>
                  updateShiftTime(day, currentType, "end", e.target.value)
                }
                className="h-8 rounded-lg text-xs bg-background/50 focus-visible:ring-1"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex min-h-0 flex-1 flex-col p-0 bg-transparent">
          <Droppable droppableId={day}>
            {(provided, snapshot) => (
              <ScheduleDroppablePanel
                droppableProvided={provided}
                isDraggingOver={snapshot.isDraggingOver}
                dragOverClassName="bg-sky-500/[0.05]"
                className="min-h-[200px] flex-1"
              >
                {users.length === 0 ? (
                  <EmptyState />
                ) : (
                  users.map((u: any, idx: number) => (
                    <DraggableItem
                      key={`${day}-${currentType}-${u.user.id}`}
                      draggableId={u.user.id.toString()}
                      index={idx}
                    >
                      {({ snapshot: s }) => (
                        <div className="group relative w-full min-w-0">
                          <StaffCard emp={u} isDragging={s.isDragging} />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute -right-1 -top-1 size-6 scale-0 rounded-full opacity-0 transition-all duration-150 group-hover:scale-100 group-hover:opacity-100"
                            onPointerDown={(e) => e.stopPropagation()}
                            onClick={() => removeUser(day, u.user.id)}
                          >
                            <Trash2 className="size-3" />
                          </Button>
                        </div>
                      )}
                    </DraggableItem>
                  ))
                )}
              </ScheduleDroppablePanel>
            )}
          </Droppable>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const EmptyState = () => (
  <motion.div
    initial={{ opacity: 0, scale: 0.99 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.18, ease: "easeOut" }}
    className="flex min-h-[7.5rem] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-muted-foreground/20 bg-muted/5 px-3 py-6 mt-2 mx-1"
  >
    <Clock className="size-5 text-muted-foreground/40" />
    <span className="text-center text-[11px] text-muted-foreground/60 font-medium">
      Belum ada penempatan
    </span>
  </motion.div>
);

export default SchedulePage;

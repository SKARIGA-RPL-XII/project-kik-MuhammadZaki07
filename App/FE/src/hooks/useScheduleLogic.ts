import { useCallback, useLayoutEffect, useMemo, useState } from "react";
import type { SetStateAction } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { scheduleService } from "@/services/schedule.service";
import type { Shift } from "@/services/shift.service";
import { useToast } from "@/context/ToastContext";
import { useShifts } from "@/hooks/react-query/useShift";

const DAYS = [
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
  "Minggu",
] as const;

export type ScheduleUserRow = {
  user: { id: number; username: string; role: { name: string } };
  profile_image?: string | null;
};

export type DayShiftSlot = {
  users: ScheduleUserRow[];
  start: string;
  end: string;
  shift_id: number;
};

export type DayScheduleState = {
  activeType: string;
} & Record<string, DayShiftSlot | string>;

export type WeeklyScheduleState = Record<
  (typeof DAYS)[number],
  DayScheduleState
>;

type ApiScheduleRow = {
  id?: number;
  user_id: number;
  shift_id: number | null;
  date: string;
  user?: {
    id: number;
    username: string;
    role?: { name: string };
    employe?: { profile_image?: string | null };
  };
};

type EmployeListItem = {
  user: { id: number; username: string; role: { name: string } };
  profile_image?: string | null;
};

function toHHmm(t: string | undefined): string {
  if (!t) return "08:00";
  const s = t.includes("T") ? t.split("T")[1]?.slice(0, 5) : t.slice(0, 5);
  return s && /^\d{2}:\d{2}$/.test(s) ? s : "08:00";
}

export function getTargetDate(dayIndex: number): string {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) + dayIndex;
  const result = new Date(d);
  result.setDate(diff);
  const y = result.getFullYear();
  const m = String(result.getMonth() + 1).padStart(2, "0");
  const da = String(result.getDate()).padStart(2, "0");
  return `${y}-${m}-${da}`;
}

function getWeekDateStrings(): string[] {
  return DAYS.map((_, i) => getTargetDate(i));
}

function sortShifts(shifts: Shift[]): Shift[] {
  return [...shifts].sort((a, b) => a.id - b.id);
}

function userToScheduleRow(
  user: ApiScheduleRow["user"],
): ScheduleUserRow | null {
  if (!user?.id) return null;
  return {
    user: {
      id: user.id,
      username: user.username,
      role: { name: user.role?.name ?? "" },
    },
    profile_image: user.employe?.profile_image ?? null,
  };
}

function createEmptyWeeklySchedule(sortedShifts: Shift[]): WeeklyScheduleState {
  if (sortedShifts.length === 0) {
    return DAYS.reduce((acc, day) => {
      acc[day] = { activeType: "" } as DayScheduleState;
      return acc;
    }, {} as WeeklyScheduleState);
  }

  const firstId = String(sortedShifts[0].id);

  return DAYS.reduce((acc, day) => {
    const shiftSlots: Record<string, DayShiftSlot> = {};
    for (const s of sortedShifts) {
      const key = String(s.id);
      shiftSlots[key] = {
        users: [],
        start: toHHmm(s.start_time),
        end: toHHmm(s.end_time),
        shift_id: s.id,
      };
    }
    acc[day] = {
      activeType: firstId,
      ...shiftSlots,
    } as DayScheduleState;
    return acc;
  }, {} as WeeklyScheduleState);
}

function parseSchedulesResponse(payload: unknown): ApiScheduleRow[] {
  if (Array.isArray(payload)) return payload as ApiScheduleRow[];
  if (payload && typeof payload === "object" && "data" in payload) {
    const d = (payload as { data: unknown }).data;
    if (Array.isArray(d)) return d as ApiScheduleRow[];
  }
  return [];
}

export function normalizeWeeklySchedule(
  weekly: WeeklyScheduleState,
  sortedShifts: Shift[],
): WeeklyScheduleState {
  if (sortedShifts.length === 0) return weekly;

  const fresh = createEmptyWeeklySchedule(sortedShifts);

  for (const day of DAYS) {
    const templateDay = fresh[day];
    const existing = weekly[day];
    if (!existing) {
      fresh[day] = templateDay;
      continue;
    }

    let active = String(existing.activeType ?? "");
    if (!sortedShifts.some((s) => String(s.id) === active)) {
      active = String(sortedShifts[0].id);
    }

    const merged: DayScheduleState = { activeType: active } as DayScheduleState;

    for (const s of sortedShifts) {
      const k = String(s.id);
      const templateSlot = templateDay[k] as DayShiftSlot;
      const exSlot = existing[k] as DayShiftSlot | undefined;
      merged[k] = {
        shift_id: templateSlot.shift_id,
        start: templateSlot.start,
        end: templateSlot.end,
        users: [],
      };
      if (exSlot && Array.isArray(exSlot.users)) {
        const cur = merged[k] as DayShiftSlot;
        merged[k] = {
          ...cur,
          users: exSlot.users,
          start: exSlot.start?.length ? exSlot.start : templateSlot.start,
          end: exSlot.end?.length ? exSlot.end : templateSlot.end,
        };
      }
    }
    fresh[day] = merged;
  }
  return fresh;
}

export function mapApiSchedulesToWeekly(
  rows: ApiScheduleRow[],
  sortedShifts: Shift[],
  weekDates: string[],
): WeeklyScheduleState {
  const base = createEmptyWeeklySchedule(sortedShifts);
  if (sortedShifts.length === 0) return base;
  const shiftKeySet = new Set(sortedShifts.map((s) => String(s.id)));

  for (const row of rows) {
    const dayName = (row as any).day_name as (typeof DAYS)[number];
    if (!dayName || !DAYS.includes(dayName)) continue;
    if (row.shift_id == null) continue;
    const sid = String(row.shift_id);
    if (!shiftKeySet.has(sid)) continue;

    const emp = userToScheduleRow(row.user);
    if (!emp) continue;

    const slot = base[dayName][sid] as DayShiftSlot | undefined;
    if (!slot?.users) continue;
    if (slot.users.some((u) => u.user.id === emp.user.id)) continue;
    slot.users.push(emp);
  }
  return normalizeWeeklySchedule(base, sortedShifts);
}

export const useScheduleLogic = (
  employeData: { employes?: EmployeListItem[] } | undefined,
) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { shifts: shiftsRaw, isLoading: shiftsLoading } = useShifts();

  const sortedShifts = useMemo(() => sortShifts(shiftsRaw ?? []), [shiftsRaw]);
  const shiftKeys = useMemo(
    () => sortedShifts.map((s) => String(s.id)),
    [sortedShifts],
  );
  const weekDates = useMemo(() => getWeekDateStrings(), []);

  const [weeklySchedule, setWeeklyScheduleRaw] = useState<WeeklyScheduleState>(
    () => createEmptyWeeklySchedule([]),
  );
  const [hasChanges, setHasChanges] = useState(false);

  const schedulesQuery = useQuery({
    queryKey: ["schedules", "week", weekDates[0]],
    queryFn: async () => {
      const payload = await scheduleService.getSchedules();
      return parseSchedulesResponse(payload);
    },
    enabled: sortedShifts.length > 0,
  });

  const availableStaff = useMemo(() => {
    const baseStaff = employeData?.employes || [];
    const assignedIds = new Set<number>();

    DAYS.forEach((day) => {
      shiftKeys.forEach((key) => {
        const slot = weeklySchedule[day][key] as DayShiftSlot | undefined;
        slot?.users?.forEach((u) => assignedIds.add(u.user.id));
      });
    });

    return baseStaff.filter((emp) => !assignedIds.has(emp.user.id));
  }, [employeData, weeklySchedule, shiftKeys]);

  const setWeeklySchedule = useCallback(
    (update: SetStateAction<WeeklyScheduleState>) => {
      setWeeklyScheduleRaw((prev) => {
        const next = typeof update === "function" ? update(prev) : update;
        return normalizeWeeklySchedule(next, sortedShifts);
      });
    },
    [sortedShifts],
  );

  useLayoutEffect(() => {
    if (sortedShifts.length === 0) return;
    if (!schedulesQuery.isFetched || schedulesQuery.isFetching) return;
    if (hasChanges) return;

    const rows = schedulesQuery.isError ? [] : (schedulesQuery.data ?? []);
    const weekly = mapApiSchedulesToWeekly(rows, sortedShifts, weekDates);
    setWeeklyScheduleRaw(normalizeWeeklySchedule(weekly, sortedShifts));
  }, [
    sortedShifts,
    schedulesQuery.data,
    schedulesQuery.isFetched,
    schedulesQuery.isFetching,
    hasChanges,
  ]);

  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const findUser = (): EmployeListItem | null => {
      const fromAvailable = availableStaff.find(
        (s) => s.user.id.toString() === result.draggableId,
      );
      if (fromAvailable) return fromAvailable;

      for (const day of DAYS) {
        for (const sk of shiftKeys) {
          const slot = weeklySchedule[day][sk] as DayShiftSlot | undefined;
          const u = slot?.users.find(
            (u) => u.user.id.toString() === result.draggableId,
          );
          if (u) return u as unknown as EmployeListItem;
        }
      }
      return null;
    };

    const user = findUser();
    if (!user) return;

    const nextSchedule = { ...weeklySchedule };
    for (const day of DAYS) {
      const dayData = { ...nextSchedule[day] };
      for (const sk of shiftKeys) {
        const slot = dayData[sk] as DayShiftSlot | undefined;
        if (slot) {
          dayData[sk] = {
            ...slot,
            users: slot.users.filter(
              (u) => u.user.id.toString() !== result.draggableId,
            ),
          };
        }
      }
      nextSchedule[day] = dayData as DayScheduleState;
    }

    if (result.destination.droppableId !== "pool") {
      const destDay = result.destination.droppableId as (typeof DAYS)[number];
      const activeType = nextSchedule[destDay].activeType;
      const destSlot = nextSchedule[destDay][activeType] as DayShiftSlot;
      nextSchedule[destDay] = {
        ...nextSchedule[destDay],
        [activeType]: {
          ...destSlot,
          users: [...destSlot.users, user as unknown as ScheduleUserRow],
        },
      };
    }

    setWeeklySchedule(nextSchedule);
    setHasChanges(true);
  };

  const removeUser = (day: string, userId: number) => {
    const dayKey = day as (typeof DAYS)[number];
    setWeeklySchedule((prev) => {
      const newDay = { ...prev[dayKey] };
      shiftKeys.forEach((sk) => {
        const slot = newDay[sk] as DayShiftSlot | undefined;
        if (slot) {
          newDay[sk] = {
            ...slot,
            users: slot.users.filter((u) => u.user.id !== userId),
          };
        }
      });
      return { ...prev, [dayKey]: newDay };
    });
    setHasChanges(true);
  };

  const updateShiftTime = (
    day: string,
    type: string,
    field: "start" | "end",
    value: string,
  ) => {
    const dayKey = day as (typeof DAYS)[number];
    setWeeklySchedule((prev) => {
      const slot = prev[dayKey][type] as DayShiftSlot | undefined;
      if (!slot) return prev;
      return {
        ...prev,
        [dayKey]: { ...prev[dayKey], [type]: { ...slot, [field]: value } },
      };
    });
    setHasChanges(true);
  };

  const handleFullSave = async () => {
    toast("info", "Menyimpan", "Mensinkronkan jadwal mingguan...");

    const schedulesPayload: any[] = [];
    const shiftUpdatesMap = new Map<
      number,
      { shift_id: number; start_time: string; end_time: string }
    >();

    sortedShifts.forEach((shift) => {
      const shiftKey = String(shift.id);

      for (const dayName of DAYS) {
        const slot = weeklySchedule[dayName][shiftKey] as
          | DayShiftSlot
          | undefined;
        if (!slot) continue;

        const isChanged =
          slot.start !== toHHmm(shift.start_time) ||
          slot.end !== toHHmm(shift.end_time);

        shiftUpdatesMap.set(shift.id, {
          shift_id: shift.id,
          start_time: slot.start,
          end_time: slot.end,
        });

        if (isChanged) break;
      }
    });

    DAYS.forEach((dayName, idx) => {
      const date = getTargetDate(idx);

      sortedShifts.forEach((shift) => {
        const slot = weeklySchedule[dayName][String(shift.id)] as
          | DayShiftSlot
          | undefined;

        if (slot?.users?.length) {
          slot.users.forEach((u) => {
            schedulesPayload.push({
              user_id: u.user.id,
              date: date,
              shift_id: shift.id,
              note: `Sync: ${slot.start}-${slot.end}`,
            });
          });
        }
      });
    });

    try {
      const payload = {
        schedules: schedulesPayload,
        dates: weekDates,
        shift_updates: Array.from(shiftUpdatesMap.values()),
      };

      await scheduleService.bulkSaveSchedules(payload);

      setHasChanges(false);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["schedules"] }),
        queryClient.invalidateQueries({ queryKey: ["shifts"] }),
      ]);

      toast("success", "Berhasil", "Jadwal dan Shift berhasil disinkronkan!");
    } catch (error) {
      console.error("❌ Save Error:", error);
      toast(
        "error",
        "Gagal",
        "Gagal menyimpan, periksa koneksi atau validasi.",
      );
    }
  };

  return {
    availableStaff,
    weeklySchedule,
    shifts: sortedShifts,
    hasChanges,
    isReady: !shiftsLoading && schedulesQuery.isFetched,
    onDragEnd,
    removeUser,
    updateShiftTime,
    setWeeklySchedule,
    handleFullSave,
  };
};

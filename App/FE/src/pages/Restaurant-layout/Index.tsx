import { useEffect, useState, useCallback } from "react";
import PageMeta from "@/components/common/PageMeta";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { RoomService } from "@/services/room.service";
import { TableService } from "@/services/table.service";
import { useToast } from "@/context/ToastContext";
import { RoomInterface, TableInterface } from "@/types/layout-table";
import SidebarRoomNav from "@/components/restaurant-layout/SidebarRoomNav";
import LayoutCanvas from "@/components/restaurant-layout/LayoutCanvas";
import LayoutRoomSkeleton from "@/components/restaurant-layout/LayoutRoomSkeleton";

export default function RestaurantLayoutPage() {
  const [rooms, setRooms] = useState<RoomInterface[]>([]);
  const [tables, setTables] = useState<TableInterface[]>([]);
  const [activeRoomId, setActiveRoomId] = useState<number | "all">("all");
  const [loading, setLoading] = useState(false);
  const [selectedTableIds, setSelectedTableIds] = useState<number[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [rRes, tRes] = await Promise.all([
        RoomService.getRooms(),
        TableService.getTables({ size: 100 }),
      ]);
      setRooms(rRes.data || []);
      setTables(tRes.data?.tables || []);
    } catch {
      toast("error", "Error", "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleSelectTable = (id: number) => {
    setSelectedTableIds((prev) =>
      prev.includes(id)
        ? prev.filter((itemId) => itemId !== id)
        : [...prev, id],
    );
  };

  const handleSelectAll = () => {
    const currentVisibleTableIds =
      activeRoomId === "all"
        ? tables.map((t) => t.id)
        : tables.filter((t) => t.room_id === activeRoomId).map((t) => t.id);

    const isAllSelected = currentVisibleTableIds.every((id) =>
      selectedTableIds.includes(id),
    );

    if (isAllSelected) {
      setSelectedTableIds((prev) =>
        prev.filter((id) => !currentVisibleTableIds.includes(id)),
      );
    } else {
      setSelectedTableIds((prev) =>
        Array.from(new Set([...prev, ...currentVisibleTableIds])),
      );
    }
  };

  const clearSelection = () => {
    setSelectedTableIds([]);
    setIsSelectionMode(false);
  };

  if (loading && tables.length === 0) {
    return <LayoutRoomSkeleton />;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] overflow-hidden">
      <PageMeta
        title="Spatial Layout & Asset Configuration"
        description="Manage and optimize physical infrastructure, room distribution, and asset placement."
      />
      <PageBreadcrumb pageTitle="Physical Space Manager" />

      <div className="flex flex-1 gap-6 overflow-hidden p-2">
        <SidebarRoomNav
          rooms={rooms}
          activeId={activeRoomId}
          onSelect={(id) => {
            setActiveRoomId(id);
            if (isSelectionMode) setSelectedTableIds([]);
          }}
        />

        <div className="flex-1 bg-white dark:bg-white/[0.02] rounded-xl border border-neutral-200 dark:border-white/[0.05] relative overflow-hidden">
          <LayoutCanvas
            activeRoomId={activeRoomId}
            rooms={rooms}
            tables={tables}
            onRefresh={fetchData}
            selectedTableIds={selectedTableIds}
            isSelectionMode={isSelectionMode}
            onToggleSelectionMode={() => setIsSelectionMode(!isSelectionMode)}
            onSelectTable={toggleSelectTable}
            onSelectAll={handleSelectAll}
            onClearSelection={clearSelection}
          />
        </div>
      </div>
    </div>
  );
}

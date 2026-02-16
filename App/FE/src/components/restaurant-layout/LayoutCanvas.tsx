import { useState, useMemo, useEffect } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
} from "@dnd-kit/core";
import { RoomService } from "@/services/room.service";
import { useToast } from "@/context/ToastContext";
import {
  Edit3,
  Save,
  Plus,
  RefreshCw,
  ZoomIn,
  ZoomOut,
  Maximize,
  Layout,
  SquarePlus,
  QrCode,
  CheckSquare,
  X,
  Download,
  Trash2,
} from "lucide-react";
import TableItem from "./TableItem";
import { cn } from "@/lib/utils";
import { TableInterface } from "@/types/layout-table";
import ModalEditTable from "../dialog/ModalEditTable";
import { ModalCreateRoom } from "../dialog/ModalCreateRoom";
import { ModalCreateTable } from "../dialog/ModalCreateTable";
import { TableService } from "@/services/table.service";
import { generateTableQRPdf } from "./pdf-generator";
import { RoomDroppable } from "./RoomDroppable";

interface LayoutCanvasProps {
  activeRoomId: number | "all";
  rooms: any[];
  tables: TableInterface[];
  onRefresh: () => Promise<void>;
  selectedTableIds: number[];
  isSelectionMode: boolean;
  onToggleSelectionMode: () => void;
  onSelectTable: (id: number) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
}

export default function LayoutCanvas({
  activeRoomId,
  rooms,
  tables,
  onRefresh,
  selectedTableIds,
  isSelectionMode,
  onToggleSelectionMode,
  onSelectTable,
  onSelectAll,
  onClearSelection,
}: LayoutCanvasProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [draftTables, setDraftTables] = useState<TableInterface[]>([]);
  const [hoveredTable, setHoveredTable] = useState<TableInterface | null>(null);
  const [selectedTable, setSelectedTable] = useState<TableInterface | null>(
    null,
  );
  const [isDraggingActive, setIsDraggingActive] = useState(false);
  const [isSpeedDialOpen, setIsSpeedDialOpen] = useState(false);
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [currentScale, setCurrentScale] = useState(0.4);

  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 1 },
    }),
  );

  useEffect(() => {
    setDraftTables(tables);
  }, [tables]);

  const displayRooms = useMemo(
    () =>
      activeRoomId === "all"
        ? rooms
        : rooms.filter((r) => r.id === activeRoomId),
    [activeRoomId, rooms],
  );

  const handleDragStart = (event: DragStartEvent) => {
    if (isEditMode) {
      setIsDraggingActive(true);
      document.body.classList.add("grabbing-cursor");
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setIsDraggingActive(false);
    document.body.classList.remove("grabbing-cursor");

    const { active, over, delta } = event;
    if (!active) return;

    setDraftTables((prev) =>
      prev.map((t) => {
        if (t.id === active.id) {
          const newX = Math.round(t.x_position + delta.x / currentScale);
          const newY = Math.round(t.y_position + delta.y / currentScale);

          const newRoomId = over ? Number(over.id) : t.room_id;

          return {
            ...t,
            x_position: newX,
            y_position: newY,
            room_id: newRoomId,
          };
        }
        return t;
      }),
    );
  };

  const handleSaveLayout = async () => {
    setLoading(true);
    try {
      const roomGroups = draftTables.reduce((acc: any, t) => {
        if (t.room_id) {
          if (!acc[t.room_id]) acc[t.room_id] = [];
          acc[t.room_id].push(t);
        }
        return acc;
      }, {});

      const roomIds = Object.keys(roomGroups);

      for (const id of roomIds) {
        await RoomService.updateLayout(Number(id), roomGroups[id]);
      }

      toast("success", "Updated", "Layout saved successfully");
      setIsEditMode(false);
      await onRefresh();
    } catch (error: any) {
      let errorMessage = "Failed to save layout";
      if (error.response?.data?.errors) {
        const validationErrors = error.response.data.errors;
        const firstKey = Object.keys(validationErrors)[0];
        errorMessage = validationErrors[firstKey][0];
      }
      toast("error", "Save Failed", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTable = async (
    id: number,
    data: Partial<TableInterface>,
  ) => {
    try {
      const res = await TableService.updateTable(id, data);
      toast("success", "Success", "Table updated successfully");
      await onRefresh();
      return res;
    } catch (error: any) {
      toast(
        "error",
        "Update Failed",
        error?.response?.data?.message || "Something went wrong",
      );
      return { error: error?.response?.data?.errors || error.message };
    }
  };

  const handleDeleteTable = async (id: number) => {
    try {
      await TableService.deleteTable(id);
      toast("success", "Deleted", "Table has been removed");
      await onRefresh();
    } catch (error: any) {
      toast(
        "error",
        "Delete Failed",
        error?.message || "Failed to delete table",
      );
    }
  };

  const handleDownloadSingle = async (table: TableInterface) => {
    try {
      await generateTableQRPdf([table]);
      toast("success", "Success", "QR Code downloaded");
    } catch (error) {
      toast("error", "Error", "Failed to generate PDF");
    }
  };

  const handleDownloadSelected = async () => {
    const selectedData = tables.filter((t) => selectedTableIds.includes(t.id));
    if (selectedData.length === 0) return;
    try {
      await generateTableQRPdf(selectedData);
      onClearSelection();
      onToggleSelectionMode();
    } catch (error) {
      toast("error", "Error", "Failed to generate PDF");
    }
  };

  return (
    <div className="w-[885px] h-full relative overflow-hidden bg-neutral-50 dark:bg-[#0a0a0a] flex flex-col transition-colors duration-300">
      <style>{`
        .grabbing-cursor, .grabbing-cursor * { cursor: grabbing !important; }
        .bg-grid-premium {
          background-image: radial-gradient(circle, #d1d5db 1px, transparent 1px);
          background-size: 32px 32px;
        }
        .dark .bg-grid-premium {
          background-image: radial-gradient(circle, #262626 1px, transparent 1px);
        }
      `}</style>

      {isSelectionMode && (
        <div className="absolute top-0 left-0 right-0 z-[70] animate-in slide-in-from-top duration-300">
          <div className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 px-6 py-3 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-6">
              <button
                onClick={onToggleSelectionMode}
                className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
              <div className="h-4 w-[1px] bg-neutral-200 dark:border-neutral-800" />
              <span className="text-sm font-bold tracking-tight">
                {selectedTableIds.length}{" "}
                <span className="font-medium text-neutral-500">
                  Tables Selected
                </span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onSelectAll}
                className="flex items-center gap-2 px-4 py-2 text-[13px] font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-sm transition-colors"
              >
                <CheckSquare size={14} />
                {tables
                  .filter(
                    (t) => activeRoomId === "all" || t.room_id === activeRoomId,
                  )
                  .every((t) => selectedTableIds.includes(t.id))
                  ? "Unselect All"
                  : "Select All"}
              </button>
              <button
                onClick={onClearSelection}
                className="flex items-center gap-2 px-4 py-2 text-[13px] font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-sm transition-colors"
              >
                <Trash2 size={14} /> Clear
              </button>
              <div className="w-[1px] h-4 bg-neutral-200 dark:bg-neutral-800 mx-2" />
              <button
                onClick={handleDownloadSelected}
                disabled={selectedTableIds.length === 0}
                className="flex items-center gap-2 px-6 py-2 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 rounded-sm text-[13px] font-bold hover:opacity-90 disabled:opacity-30 transition-all"
              >
                <Download size={14} /> Generate PDF
              </button>
            </div>
          </div>
        </div>
      )}

      <TransformWrapper
        initialScale={0.4}
        minScale={0.05}
        limitToBounds={false}
        centerOnInit
        disabled={isEditMode && isDraggingActive}
        onTransformed={(ref) => setCurrentScale(ref.state.scale)}
      >
        {({ zoomIn, zoomOut, resetTransform }) => (
          <>
            <div className="absolute top-6 right-6 z-[60] flex flex-col border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm rounded-sm overflow-hidden">
              <button
                onClick={() => onRefresh()}
                className="p-3 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-brand-600 border-b border-neutral-200 dark:border-neutral-800 transition-colors"
              >
                <RefreshCw size={16} />
              </button>
              <button
                onClick={() => zoomIn()}
                className="p-3 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors border-b border-neutral-200 dark:border-neutral-800"
              >
                <ZoomIn size={16} />
              </button>
              <button
                onClick={() => zoomOut()}
                className="p-3 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors border-b border-neutral-200 dark:border-neutral-800"
              >
                <ZoomOut size={16} />
              </button>
              <button
                onClick={() => resetTransform()}
                className="p-3 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                <Maximize size={16} />
              </button>
            </div>

            <DndContext
              sensors={sensors}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <TransformComponent
                wrapperClass="!w-full !h-full bg-grid-premium"
                contentClass="!w-full !h-full flex items-center justify-center"
              >
                <div className="relative flex gap-20 min-w-[800px] min-h-[800px] items-start justify-center">
                  {displayRooms.map((room) => (
                    <RoomDroppable key={room.id} room={room}>
                      {draftTables
                        .filter((t) => t.room_id === room.id)
                        .map((table) => (
                          <TableItem
                            key={table.id}
                            table={table}
                            isEditMode={isEditMode}
                            isSelected={selectedTableIds.includes(table.id)}
                            isSelectionMode={isSelectionMode}
                            isHovered={hoveredTable?.id === table.id}
                            onHover={setHoveredTable}
                            onDownload={() => handleDownloadSingle(table)}
                            onEditClick={(t) =>
                              isSelectionMode
                                ? onSelectTable(t.id)
                                : setSelectedTable(t)
                            }
                          />
                        ))}
                    </RoomDroppable>
                  ))}
                </div>
              </TransformComponent>
            </DndContext>
          </>
        )}
      </TransformWrapper>

      <div className="absolute bottom-8 right-8 z-[70] flex items-center gap-10">
        {!isEditMode && !isSelectionMode && (
          <div className="flex items-center gap-2 p-1.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-md shadow-sm">
            <button
              onClick={onToggleSelectionMode}
              className="flex items-center gap-2 px-4 py-2 text-[13px] font-bold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-sm transition-all"
            >
              <QrCode size={14} /> Print QR
            </button>
            <button
              onClick={() => setIsEditMode(true)}
              className="flex items-center gap-2 px-4 py-2 text-[13px] font-bold bg-brand-500 dark:bg-neutral-100 text-white dark:text-neutral-900 rounded-sm transition-all"
            >
              <Edit3 size={14} /> Edit Plan
            </button>
          </div>
        )}

        {isEditMode && (
          <div className="flex items-center gap-2 p-1.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-md shadow-lg">
            <button
              onClick={() => {
                setIsEditMode(false);
                setDraftTables(tables);
              }}
              disabled={loading}
              className="px-6 py-2 text-[13px] font-bold text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-sm disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveLayout}
              disabled={loading}
              className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-2 rounded-sm text-[13px] font-bold hover:bg-emerald-700 transition-all disabled:bg-emerald-800/50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <RefreshCw size={14} className="animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save size={14} /> Save Changes
                </>
              )}
            </button>
          </div>
        )}

        <div className="relative">
          {isSpeedDialOpen && (
            <div className="absolute bottom-full right-0 mb-8 flex flex-col gap-2 animate-in slide-in-from-bottom-2 duration-200">
              <button
                onClick={() => {
                  setIsRoomModalOpen(true);
                  setIsSpeedDialOpen(false);
                }}
                className="flex items-center justify-center w-12 h-12 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-sm shadow-xl hover:bg-neutral-50"
              >
                <Layout size={18} />
              </button>
              <button
                onClick={() => {
                  setIsTableModalOpen(true);
                  setIsSpeedDialOpen(false);
                }}
                className="flex items-center justify-center w-12 h-12 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-sm shadow-xl hover:bg-neutral-50"
              >
                <SquarePlus size={18} />
              </button>
            </div>
          )}
          <button
            onClick={() => setIsSpeedDialOpen(!isSpeedDialOpen)}
            className={cn(
              "w-12 h-12 flex items-center justify-center transition-all rounded-sm shadow-sm",
              isSpeedDialOpen
                ? "bg-red-500 text-white rotate-45"
                : "bg-brand-600 text-white hover:bg-brand-700",
            )}
          >
            <Plus size={24} />
          </button>
        </div>
      </div>

      <ModalEditTable
        isOpen={!!selectedTable}
        table={selectedTable}
        onClose={() => setSelectedTable(null)}
        onUpdate={handleUpdateTable}
        onDelete={handleDeleteTable}
      />
      <ModalCreateRoom
        isOpen={isRoomModalOpen}
        onClose={() => setIsRoomModalOpen(false)}
        onRefresh={onRefresh}
      />
      <ModalCreateTable
        isOpen={isTableModalOpen}
        onClose={() => setIsTableModalOpen(false)}
        onRefresh={onRefresh}
        rooms={rooms}
      />
    </div>
  );
}

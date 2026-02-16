import { useDraggable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import { TableInterface } from "@/types/layout-table";
import { Download, Edit2, Check } from "lucide-react";

interface TableItemProps {
  table: TableInterface;
  isEditMode: boolean;
  onEditClick: (table: TableInterface) => void;
  isHovered: boolean;
  onHover: (table: TableInterface | null) => void;
  onDownload?: () => void;
  isSelected?: boolean;
  isSelectionMode?: boolean;
}

export default function TableItem({
  table,
  isEditMode,
  onEditClick,
  isHovered,
  onHover,
  onDownload,
  isSelected = false,
  isSelectionMode = false,
}: TableItemProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: table.id,
    disabled: !isEditMode,
  });

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault(); 
    e.stopPropagation();
    onEditClick(table);
  };

  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    left: `${table.x_position}px`,
    top: `${table.y_position}px`,
    position: "absolute" as const,
    zIndex: isDragging ? 999 : isHovered ? 100 : 10,
    transition: isDragging ? "none" : "all 200ms cubic-bezier(0.2, 0, 0, 1)",
  };

  const getShapeClass = () => {
    switch (table.shape) {
      case "round":
        return "rounded-full";
      case "rectangle":
        return "rounded-lg";
      default:
        return "rounded-xl";
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group outline-none",
        isEditMode ? "cursor-grab active:cursor-grabbing" : "cursor-pointer",
        isDragging && "cursor-grabbing z-[100] scale-105 shadow-2xl",
        isSelectionMode && "hover:scale-105"
      )}
      onMouseEnter={() => !isEditMode && !isSelectionMode && onHover(table)}
      onMouseLeave={() => onHover(null)}
      onContextMenu={handleContextMenu}
      {...(isEditMode ? { ...attributes, ...listeners } : {})}
    >
      <div
        onClick={(e) => {
          e.stopPropagation();
          onEditClick(table);
        }}
        style={{
          width: table.width,
          height: table.height,
          transform: `rotate(${table.rotation}deg)`,
        }}
        className={cn(
          "border-2 flex items-center justify-center font-bold text-xl shadow-sm transition-all relative select-none",
          getShapeClass(),
          !isSelectionMode && (
            table.status === "available"
              ? "bg-white dark:bg-neutral-800 dark:border-green-800 border-green-500 text-green-600 hover:bg-green-50"
              : "bg-red-50 dark:bg-red-300/50 dark:border-red-800 border-red-500 text-red-600 hover:bg-red-100"
          ),
          isSelectionMode && isSelected && "bg-emerald-500 border-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)] scale-105 z-20",
          isSelectionMode && !isSelected && "bg-neutral-100 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 text-neutral-400 opacity-40 grayscale",
          !isEditMode && "active:scale-90"
        )}
      >
        {table.table_number}

        {isSelectionMode && isSelected && (
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white dark:border-neutral-900 animate-in zoom-in duration-200">
            <Check size={14} strokeWidth={4} />
          </div>
        )}
      </div>

      {isHovered && !isEditMode && !isSelectionMode && (
        <div
          className="absolute bottom-full left-1/2 -translate-x-1/2 pb-4 z-[110] animate-in fade-in zoom-in duration-150 pointer-events-auto"
          onMouseEnter={() => onHover(table)}
        >
          <div className="w-56 bg-white dark:bg-neutral-900 rounded-xl shadow-2xl border border-neutral-200 dark:border-white/10 p-5 text-left">
            <div className="flex flex-col items-center text-center">
              <div className="aspect-square w-full bg-neutral-50 dark:bg-white/5 rounded mb-4 flex items-center justify-center overflow-hidden border border-neutral-100 dark:border-neutral-800">
                {table.qr_code ? (
                  <img
                    src={`/storage/${table.qr_code.replace(/^\//, "")}`}
                    alt="QR"
                    className="w-full h-full object-contain p-2"
                  />
                ) : (
                  <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">
                    No QR
                  </span>
                )}
              </div>

              <div className="w-full mb-4">
                <div className="text-2xl font-black text-neutral-800 dark:text-white leading-none">
                  Table {table.table_number}
                </div>
                <div
                  className={cn(
                    "text-sm font-bold uppercase mt-1",
                    table.status === "available" ? "text-green-500" : "text-red-500"
                  )}
                >
                  {table.status}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 w-full">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDownload?.();
                  }}
                  className="flex items-center justify-center bg-neutral-100 dark:bg-white/5 text-neutral-800 dark:text-white w-full h-10 rounded-lg hover:bg-neutral-200 dark:hover:bg-white/10 transition-all"
                >
                  <Download size={16} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditClick(table);
                  }}
                  className="flex items-center justify-center bg-yellow-300 text-black w-full h-10 rounded-lg hover:bg-yellow-400 transition-all"
                >
                  <Edit2 size={16} />
                </button>
              </div>
            </div>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white dark:bg-neutral-900 border-r border-b border-neutral-200 dark:border-white/10 rotate-45" />
          </div>
        </div>
      )}
    </div>
  );
}
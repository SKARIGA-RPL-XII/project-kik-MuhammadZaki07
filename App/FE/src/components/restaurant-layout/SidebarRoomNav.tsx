import { LayoutGrid, Hash, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ActionGuard } from "../guard/ActionGuard";

interface SidebarRoomNavProps {
  rooms: any[];
  activeId: number | "all";
  onSelect: (id: number | "all") => void;
  onEdit?: (room: any) => void;
  onDelete?: (room: any) => void;
}

export default function SidebarRoomNav({
  rooms,
  activeId,
  onSelect,
  onEdit,
  onDelete,
}: SidebarRoomNavProps) {
  return (
    <div className="w-64 flex flex-col bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800">
      <div className="p-4 border-b border-neutral-200 dark:border-neutral-800">
        <h2 className="text-[11px] font-bold uppercase tracking-[0.15em] text-neutral-400 dark:text-neutral-500">
          Navigation
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        <button
          onClick={() => onSelect("all")}
          className={cn(
            "w-full flex items-center gap-3 px-4 py-3 text-[13px] font-medium transition-all relative",
            activeId === "all"
              ? "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
              : "text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800/50 hover:text-neutral-700",
          )}
        >
          {activeId === "all" && (
            <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-brand-600" />
          )}
          <LayoutGrid
            size={16}
            className={activeId === "all" ? "text-brand-600" : ""}
          />
          Whole Plan
        </button>

        <div className="mt-4">
          <div className="px-4 mb-2">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.15em] text-neutral-400 dark:text-neutral-500">
              Rooms
            </h2>
          </div>

          <div className="space-y-[1px]">
            {rooms.map((room) => (
              <div
                key={room.id}
                className={cn(
                  "group flex items-center justify-between transition-all relative",
                  activeId === room.id
                    ? "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                    : "text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800/50 hover:text-neutral-700",
                )}
              >
                {activeId === room.id && (
                  <div
                    className="absolute left-0 top-0 bottom-0 w-[3px] z-10"
                    style={{ backgroundColor: room.color }}
                  />
                )}

                <button
                  onClick={() => onSelect(room.id)}
                  className="flex-1 flex items-center gap-3 px-4 py-3 text-[13px] font-medium text-left"
                >
                  <Hash
                    size={14}
                    className={cn(
                      "transition-colors",
                      activeId === room.id
                        ? ""
                        : "text-neutral-300 dark:text-neutral-700",
                    )}
                    style={activeId === room.id ? { color: room.color } : {}}
                  />
                  <span className="truncate max-w-[120px]">{room.name}</span>
                </button>

                <div className="flex items-center pr-2 gap-1">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-md transition-all">
                        <MoreVertical size={14} />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-32">
                      <ActionGuard module="table & room" action="write">
                        <DropdownMenuItem
                          onClick={() => onEdit?.(room)}
                          className="gap-2 text-[12px]"
                        >
                          <Pencil size={12} /> Edit
                        </DropdownMenuItem>
                      </ActionGuard>
                      <ActionGuard module="table & room" action="delete">
                        <DropdownMenuItem
                          onClick={() => onDelete?.(room)}
                          className="gap-2 text-[12px] text-red-500 focus:text-red-500"
                        >
                          <Trash2 size={12} /> Delete
                        </DropdownMenuItem>
                      </ActionGuard>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <span className="text-[10px] tabular-nums opacity-40 group-hover:hidden transition-opacity">
                    {String(room.id).padStart(2, "0")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-100/50 dark:bg-neutral-900/80">
        <div className="flex items-center gap-2 text-[11px] text-neutral-400">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          System Live
        </div>
      </div>
    </div>
  );
}
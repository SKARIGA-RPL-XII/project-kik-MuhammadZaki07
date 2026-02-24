import { useState } from "react";
import PageMeta from "@/components/common/PageMeta";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { useToast } from "@/context/ToastContext";
import { RoomInterface } from "@/types/layout-table";
import SidebarRoomNav from "@/components/restaurant-layout/SidebarRoomNav";
import LayoutCanvas from "@/components/restaurant-layout/LayoutCanvas";
import LayoutRoomSkeleton from "@/components/restaurant-layout/LayoutRoomSkeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Input from "@/components/form/input/InputField";
import Button from "@/components/ui/button/Button";
import { Trash2Icon } from "lucide-react";
import { useRooms, useRoomMutations } from "@/hooks/react-query/useRoom";
import { useTables } from "@/hooks/react-query/useTable";

export default function RestaurantLayoutPage() {
  const [activeRoomId, setActiveRoomId] = useState<number | "all">("all");
  const [selectedTableIds, setSelectedTableIds] = useState<number[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<RoomInterface | null>(null);
  const [editName, setEditName] = useState("");

  const { toast } = useToast();

  const { data: roomRes = [], isLoading: roomsLoading } = useRooms();
  const {
    data: tableRes,
    isLoading: tablesLoading,
    refetch: refetchTables,
  } = useTables({ size: 100 });
  const { updateRoom, deleteRoom } = useRoomMutations();

  const tables = tableRes?.data.tables || [];
  const rooms = roomRes || [];

  const onHandleDelete = () => {
    if (!selectedRoom) return;
    deleteRoom.mutate(selectedRoom.id, {
      onSuccess: () => {
        toast("success", "Deleted", "Room deleted successfully");
        if (activeRoomId === selectedRoom.id) setActiveRoomId("all");
        setOpenDelete(false);
      },
      onError: (err: any) => toast("error", "Failed", err),
    });
  };

  const onConfirmEdit = () => {
    if (!selectedRoom) return;
    updateRoom.mutate(
      {
        id: selectedRoom.id,
        data: {
          name: editName,
          width: selectedRoom.width,
          height: selectedRoom.height,
          color: selectedRoom.color,
          capacity: selectedRoom.capacity,
        },
      },
      {
        onSuccess: () => {
          toast("success", "Success", "Room updated successfully");
          setOpenEdit(false);
        },
        onError: (err: any) => toast("error", "Error", err),
      },
    );
  };

  if ((roomsLoading || tablesLoading) && tables.length === 0) {
    return <LayoutRoomSkeleton />;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] overflow-hidden">
      <PageMeta
        title="Spatial Layout"
        description="Manage physical infrastructure."
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
          onDelete={(room) => {
            setSelectedRoom(room);
            setOpenDelete(true);
          }}
          onEdit={(room) => {
            setSelectedRoom(room);
            setEditName(room.name);
            setOpenEdit(true);
          }}
        />

        <div className="flex-1 bg-white dark:bg-white/[0.02] rounded-xl border border-neutral-200 dark:border-white/[0.05] relative overflow-hidden">
          <LayoutCanvas
            activeRoomId={activeRoomId}
            rooms={rooms}
            tables={tables}
            onRefresh={refetchTables}
            selectedTableIds={selectedTableIds}
            isSelectionMode={isSelectionMode}
            onToggleSelectionMode={() => setIsSelectionMode(!isSelectionMode)}
            onSelectTable={(id) =>
              setSelectedTableIds((prev) =>
                prev.includes(id)
                  ? prev.filter((i) => i !== id)
                  : [...prev, id],
              )
            }
            onSelectAll={() => {}}
            onClearSelection={() => {
              setSelectedTableIds([]);
              setIsSelectionMode(false);
            }}
          />
        </div>
      </div>

      <AlertDialog open={openEdit} onOpenChange={setOpenEdit}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Edit Room</AlertDialogTitle>
          </AlertDialogHeader>
          <div className="space-y-3">
            <Input
              label="Room Name"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button loading={updateRoom.isPending} onClick={onConfirmEdit}>
              Save Changes
            </Button>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={openDelete} onOpenChange={setOpenDelete}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
              <Trash2Icon />
            </AlertDialogMedia>
            <AlertDialogTitle>Delete Room?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <strong>{selectedRoom?.name}</strong>? This will permanently
              delete the room and release all tables inside.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel variant="outline">Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={(e) => {
                e.preventDefault();
                onHandleDelete();
              }}
              disabled={deleteRoom.isPending}
            >
              {deleteRoom.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

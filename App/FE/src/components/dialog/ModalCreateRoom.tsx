import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { RoomService } from "@/services/room.service";
import { useToast } from "@/context/ToastContext";
import { Label } from "../ui/label";
import Input from "../form/input/InputField";
import LoadingSpinner from "../skeleton/LoadingSpinner";

export function ModalCreateRoom({
  isOpen,
  onClose,
  onRefresh,
}: {
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
}) {
  const [roomData, setRoomData] = useState({
    name: "",
    color: "#000",
    width: 800,
    height: 600,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const { toast } = useToast();

  const handleCreate = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    const res = await RoomService.createRoom(roomData);

    if (res.error) {
      if (typeof res.error === "object") {
        setErrors(res.error);
        toast("error", "Validation Error", "Please check your inputs");
      } else {
        toast("error", "Error", res.error);
      }
      setIsLoading(false);
    } else {
      toast("success", "Success", "Room created successfully");
      setIsLoading(false);
      onRefresh();
      onClose();
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !isLoading && onClose()}>
      <AlertDialogContent   onEscapeKeyDown={() => !isLoading && onClose()}>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-3xl font-bold">
            Build Room
          </AlertDialogTitle>
          <AlertDialogDescription className="font-medium text-neutral-500">
            Define the dimensions and style for your new area.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-5 my-6">
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-neutral-400">
              Room Name
            </Label>
            <Input
              placeholder="e.g. Indoor Main"
              disabled={isLoading}
              error={errors.name}
              onChange={(e) =>
                setRoomData({ ...roomData, name: e.target.value })
              }
            />
            {errors.name && (
              <span className="text-xs text-red-500 font-medium px-1">
                {errors.name[0]}
              </span>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-neutral-400">
              Theme Color
            </Label>
            <input
              type="color"
              disabled={isLoading}
              className="w-full h-14 bg-neutral-100 dark:bg-white/5 rounded-2xl border-none p-1 cursor-pointer"
              value={roomData.color}
              onChange={(e) =>
                setRoomData({ ...roomData, color: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-neutral-400">
                Width (px)
              </Label>
              <Input
                type="number"
                placeholder="800"
                disabled={isLoading}
                error={errors.width}
                value={roomData.width}
                onChange={(e) =>
                  setRoomData({ ...roomData, width: e.target.value })
                }
              />
              {errors.width && (
                <span className="text-xs text-red-500 font-medium px-1">
                  {errors.width[0]}
                </span>
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-neutral-400">
                Height (px)
              </Label>
              <Input
                type="number"
                placeholder="600"
                disabled={isLoading}
                value={roomData.height}
                error={errors.height}
                onChange={(e) =>
                  setRoomData({ ...roomData, height: e.target.value })
                }
              />
              {errors.height && (
                <span className="text-xs text-red-500 font-medium px-1">
                  {errors.height[0]}
                </span>
              )}
            </div>
          </div>
        </div>

        <AlertDialogFooter className="flex items-center gap-3">
          <AlertDialogCancel
            disabled={isLoading}
            className="w-20 border-none bg-neutral-100 font-bold text-neutral-400 hover:text-neutral-600"
          >
            Cancel
          </AlertDialogCancel>
          <button
            onClick={handleCreate}
            disabled={isLoading}
            className="w-40 h-10 bg-brand-600 hover:bg-brand-700 text-white rounded-lg flex items-center justify-center gap-2 border-none disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? <LoadingSpinner /> : <>Build Room</>}
          </button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

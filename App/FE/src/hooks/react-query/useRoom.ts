import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { RoomService } from "@/services/room.service";

export const useRooms = () => {
  return useQuery({
    queryKey: ["rooms"],
    queryFn: async () => {
      const res = await RoomService.getRooms();
      return res.data || [];
    },
  });
};

export const useRoomMutations = () => {
  const queryClient = useQueryClient();

  const createRoom = useMutation({
    mutationFn: (payload: any) => RoomService.createRoom(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
    },
  });

  const updateRoom = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      RoomService.updateRoom(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
    },
  });

  const updateLayout = useMutation({
    mutationFn: ({ roomId, tables }: { roomId: number; tables: any[] }) =>
      RoomService.updateLayout(roomId, tables),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      queryClient.invalidateQueries({ queryKey: ["tables"] });
    },
  });

  const deleteRoom = useMutation({
    mutationFn: (id: number) => RoomService.deleteRoom(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
    },
  });

  return { createRoom, updateRoom, updateLayout, deleteRoom };
};
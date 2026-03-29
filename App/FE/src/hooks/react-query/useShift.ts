import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { shiftService, Shift } from "@/services/shift.service";
import { useToast } from "@/context/ToastContext";

export const useShifts = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: shifts = [], isLoading, isError } = useQuery({
    queryKey: ["shifts"],
    queryFn: shiftService.getAll,
  });

  const createShiftMutation = useMutation({
    mutationFn: (newShift: Partial<Shift>) => shiftService.create(newShift),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shifts"] });
      toast("success", "Berhasil", "Shift baru telah ditambahkan");
    },
    onError: () => toast("error", "Gagal", "Gagal menambahkan shift"),
  });

  const updateShiftMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Shift> }) =>
      shiftService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shifts"] });
      toast("success", "Berhasil", "Data shift telah diperbarui");
    },
    onError: () => toast("error", "Gagal", "Gagal memperbarui shift"),
  });

  const deleteShiftMutation = useMutation({
    mutationFn: (id: number) => shiftService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shifts"] });
      toast("success", "Terhapus", "Shift telah dihapus permanen");
    },
    onError: () => toast("error", "Gagal", "Gagal menghapus shift"),
  });

  return {
    shifts,
    isLoading,
    isError,
    createShift: createShiftMutation.mutate,
    updateShift: updateShiftMutation.mutate,
    deleteShift: deleteShiftMutation.mutate,
    isProcessing: 
      createShiftMutation.isPending || 
      updateShiftMutation.isPending || 
      deleteShiftMutation.isPending
  };
};
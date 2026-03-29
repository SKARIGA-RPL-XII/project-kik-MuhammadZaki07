import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { leaveService, LeaveRequest } from "@/services/leave.service";
import { useToast } from "@/context/ToastContext";

export const useLeaves = () => {
  return useQuery({
    queryKey: ["leaves"],
    queryFn: leaveService.getAllLeaves,
  });
};

export const useMyLeaves = () => {
  return useQuery({
    queryKey: ["my-leaves"],
    queryFn: leaveService.getMyLeaves,
  });
};

export const useCreateLeave = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: LeaveRequest) => leaveService.createLeave(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-leaves"] });
      toast("success", "Berhasil", "Pengajuan izin berhasil dikirim");
    },
    onError: () => {
      toast("error", "Gagal", "Gagal mengirim pengajuan izin");
    },
  });
};

export const useApproveLeave = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, status, reason }: { id: number; status: "approved" | "rejected"; reason?: string }) =>
      leaveService.approveLeave(id, status, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leaves"] });
      toast("success", "Berhasil", "Status izin berhasil diperbarui");
    },
    onError: () => {
      toast("error", "Gagal", "Gagal memperbarui status");
    },
  });
};
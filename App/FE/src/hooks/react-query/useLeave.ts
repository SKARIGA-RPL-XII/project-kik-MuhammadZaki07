import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { leaveService } from "@/services/leave.service";
import { useToast } from "@/context/ToastContext";

export const useLeaves = (params: any) => {
  return useQuery({
    queryKey: ["leaves", params],
    queryFn: () => leaveService.getAllLeaves(params),
  });
};

export const useMyLeaves = (params: any) => {
  return useQuery({
    queryKey: ["my-leaves", params],
    queryFn: () => leaveService.getMyLeaves(params),
  });
};

export const useCreateLeave = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: FormData) => leaveService.createLeave(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-leaves"] });
      
      toast("success", "Berhasil", "Pengajuan izin berhasil dikirim");
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Gagal mengirim pengajuan izin";
      toast("error", "Gagal", message);
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

export const useLeaveDetail = (id: number | null) => {
  return useQuery({
    queryKey: ["leave", id],
    queryFn: () => leaveService.getLeaveDetail(id!),
    enabled: !!id,
  });
};
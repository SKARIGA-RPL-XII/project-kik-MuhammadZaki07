import { useToast } from "@/context/ToastContext";
import { TransactionService } from "@/services/transaction.service";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const useTransaction = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const useGetOrders = (orderSource?: string) => {
    return useQuery({
      queryKey: ["transactions", orderSource],
      queryFn: async () => {
        const { data, error } = await TransactionService.getAll({
          order_source: orderSource,
        });
        if (error) throw new Error(error);
        return data;
      },
      refetchInterval: 10000,
    });
  };

  const useUpdateStatus = () => {
    return useMutation({
      mutationFn: async ({ id, status }: { id: number; status: string }) => {
        const { data, error } = await TransactionService.updateStatus(id, status);
        if (error) throw new Error(error);
        return data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["transactions"] });
        toast("success", "success", "Order updated successfully");
      },
      onError: (err: any) => {
        toast("error", "Failed", err.message);
      },
    });
  };

  const useCreateTransaction = () => {
    return useMutation({
      mutationFn: async (payload: any) => {
        const { data, error } = await TransactionService.create(payload);
        if (error) throw new Error(error);
        return data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["transactions"] });
      },
      onError: (err: any) => {
        toast("error", "Checkout Failed", err.message);
      },
    });
  };

  return {
    useGetOrders,
    useUpdateStatus,
    useCreateTransaction,
  };
};
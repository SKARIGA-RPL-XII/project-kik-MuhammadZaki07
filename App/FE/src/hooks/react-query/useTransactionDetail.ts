import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { TransactionDetailService, TransactionQuery } from "@/services/transactionDetail.service";
import { useToast } from "@/context/ToastContext";
import { TransactionService } from "@/services/transaction.service";

export const useTransactionDetail = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const useGetDetails = (query: TransactionQuery) => {
    return useQuery({
      queryKey: ["transaction-details", query],
      queryFn: async () => {
        const response = await TransactionDetailService.getAll(query);
        if (response.error) throw new Error(response.error);
        return response;
      },
      refetchInterval: 10000,
    });
  };


  const useUpdateItemStatus = () => {
    return useMutation({
      mutationFn: async ({ id, status }: { id: number; status: string }) => {
        const response = await TransactionDetailService.updateStatus(id, status);
        if (response.error) throw new Error(response.error);
        return response.data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["transaction-details"] });
        queryClient.invalidateQueries({ queryKey: ["transactions"] });
        
        toast("success", "Success", "Item status updated successfully");
      },
      onError: (err: any) => {
        toast("error", "Update Failed", err.message);
      },
    });
  };


   const useShowDetail = (id: string | number) => {
    return useQuery({
      queryKey: ["transaction-detail", id],
      queryFn: () => TransactionService.getTransactionDetail(id),
      enabled: !!id,
    });
  };


  return {
    useGetDetails,
    useUpdateItemStatus,
    useShowDetail
  };
};
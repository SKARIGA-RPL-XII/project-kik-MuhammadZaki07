import { useToast } from "@/context/ToastContext";
import { TransactionService } from "@/services/transaction.service";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";

export const useTransaction = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [loadingExport, setLoadingExport] = useState(false);

  const useGetOrders = (params: {
    orderSource?: string;
    search?: string;
    page?: number;
  }) => {
    return useQuery({
      queryKey: ["transactions", params],
      queryFn: async () => {
        const { data, error } = await TransactionService.getAll({
          order_source: params.orderSource,
          search: params.search,
          page: params.page,
        });
        if (error) throw new Error(error);
        return data;
      },
      refetchInterval: 10000,
    });
  };

  const useGetDashboardStats = () => {
    return useQuery({
      queryKey: ["transaction-statistics"],
      queryFn: async () => {
        const { data, error } = await TransactionService.getDashboardStats();
        if (error) throw new Error(error);
        return data;
      },
      refetchInterval: 30000,
    });
  };

  const useUpdateStatus = () => {
    return useMutation({
      mutationFn: async ({ id, status }: { id: number; status: string }) => {
        const { data, error } = await TransactionService.updateStatus(
          id,
          status,
        );
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

  const exportTransactions = async (id?: number) => {
    setLoadingExport(true);
    try {
      const token = localStorage.getItem("token");
      const fileName = id ? `transaction-${id}.xlsx` : "all-transactions.xlsx";
      const url = id
        ? `${import.meta.env.VITE_BASE_URL}/transactions/export/${id}`
        : `${import.meta.env.VITE_BASE_URL}/transactions/export`;

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        },
        responseType: "blob",
      });

      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Export failed", error);
    } finally {
      setLoadingExport(false);
    }
  };

  return {
    useGetOrders,
    loadingExport,
    useUpdateStatus,
    useCreateTransaction,
    useGetDashboardStats,
    exportTransactions,
  };
};

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { stockService } from "@/services/stock.service";
import { Stock } from "@/pages/Stock/StockPage";

export const useStocks = (page: number, size: number, search: string) => {
  return useQuery({
    queryKey: ["stocks", page, size, search],
    queryFn: () => stockService.getAll(page, size, search),
  });
};

export const useStockMutation = () => {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: Omit<Stock, "id">) => stockService.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["stocks"] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Stock> }) =>
      stockService.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["stocks"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => stockService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["stocks"] }),
  });

  return { createMutation, updateMutation, deleteMutation };
};

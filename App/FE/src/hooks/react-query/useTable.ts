import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { TableService, TableQuery } from "@/services/table.service";

export const useTables = (query?: TableQuery) => {
  return useQuery({
    queryKey: ["tables", query],
    queryFn: () => TableService.getTables(query),
    refetchInterval: 10000,
    refetchIntervalInBackground: true,
  });
};

export const useTableMutations = () => {
  const queryClient = useQueryClient();

  const createTable = useMutation({
    mutationFn: (payload: { table_number: string }) =>
      TableService.createTable(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tables"] });
    },
  });

  const updateTable = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: any }) =>
      TableService.updateTable(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tables"] });
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
    },
  });

  const deleteTable = useMutation({
    mutationFn: (id: number) => TableService.deleteTable(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tables"] });
    },
  });

  return { createTable, updateTable, deleteTable };
};

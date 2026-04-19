import logService from "@/services/log.service";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export type ActivityLogFilters = {
  search?: string;
  module?: string;
  action?: string;
  date?: string;
  include_deleted?: boolean;
  page?: number;
};

export const useActivityLogs = (filters: ActivityLogFilters = {}) => {
  const queryClient = useQueryClient();

  const logsQuery = useQuery({
    queryKey: ["activity-logs", filters],
    queryFn: () => logService.getAll(filters),
    refetchInterval: 20 * 1000,
    keepPreviousData: true,
  });

  const response = logsQuery.data;

  const logDetailMutation = useMutation({
    mutationFn: (id: number) => logService.getDetail(id),
  });

  const deleteLogMutation = useMutation({
    mutationFn: (id: number) => logService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activity-logs"] });
    },
  });

  const restoreLogMutation = useMutation({
    mutationFn: (id: number) => logService.restore(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activity-logs"] });
    },
  });

  return {
    logs: response?.data ?? [],
    pagination: {
      current_page: response?.meta?.current_page ?? 1,
      last_page: response?.meta?.last_page ?? 1,
      total: response?.meta?.total ?? 0,
      from: response?.meta?.from ?? 0,
      to: response?.meta?.to ?? 0,
      per_page: response?.meta?.per_page ?? 10,
    },

    isLoading: logsQuery.isLoading,
    isFetching: logsQuery.isFetching,
    isError: logsQuery.isError,

    getLogById: logDetailMutation.mutateAsync,
    isFetchingDetail: logDetailMutation.isPending,

    deleteLog: deleteLogMutation.mutate,
    isDeleting: deleteLogMutation.isPending,

    restoreLog: restoreLogMutation.mutate,
    isRestoring: restoreLogMutation.isPending,
  };
};
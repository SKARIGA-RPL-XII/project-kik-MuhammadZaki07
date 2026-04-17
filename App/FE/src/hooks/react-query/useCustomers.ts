import { UserService } from "@/services/user.service";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";


export const useCustomers = (params?: {
  page?: number;
  per_page?: number;
  search?: string;
  status?: "active" | "blocked";
  date?: "today" | "week" | "month";
}) => {
  return useQuery({
    queryKey: ["customers", params],
    queryFn: () => UserService.getCustomers(params),
    keepPreviousData: true,
  });
};


export const useCustomerStats = () => {
  return useQuery({
    queryKey: ["customer-stats"],
    queryFn: UserService.getCustomerStats,
  });
};

export const useCustomerDetail = (id?: number) => {
  return useQuery({
    queryKey: ["customer", id],
    queryFn: () => UserService.getCustomerById(id!),
    enabled: !!id,
  });
};

export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: any;
    }) => UserService.updateCustomer(id, payload),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["customer"] });
    },
  });
};


export const useToggleBlockCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) =>
      UserService.toggleBlockCustomer(id),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["customer-stats"] });
    },
  });
};

export const useDeleteCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) =>
      UserService.deleteCustomer(id),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["customer-stats"] });
    },
  });
};

export const useCustomerChart = () => {
  return useQuery({
    queryKey: ["customer-chart"],
    queryFn: UserService.getCustomerChart,
  });
};
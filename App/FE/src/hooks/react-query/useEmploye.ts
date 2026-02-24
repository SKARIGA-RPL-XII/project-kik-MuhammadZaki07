import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { EmployeService, EmployeQuery } from "@/services/employe.service";

export const useEmployes = (query: EmployeQuery) => {
  return useQuery({
    queryKey: ["employes", query],
    queryFn: async () => {
      const res = await EmployeService.getEmployes(query);
      return res.data?.data || { employes: [], metadata: { total: 0 } };
    },
  });
};

export const useEmployeMutations = () => {
  const queryClient = useQueryClient();

  const createEmploye = useMutation({
    mutationFn: (formData: FormData) => EmployeService.createEmploye(formData),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["employes"] }),
  });

  const updateEmploye = useMutation({
    mutationFn: ({ id, formData }: { id: number; formData: FormData }) =>
      EmployeService.updateEmploye(id, formData),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["employes"] }),
  });

  const deleteEmploye = useMutation({
    mutationFn: (id: number) => EmployeService.deleteEmploye(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["employes"] }),
  });

  const importEmploye = useMutation({
    mutationFn: (payload: { data: any[] }) =>
      EmployeService.importMapping(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["employes"] }),
  });

  return { createEmploye, updateEmploye, deleteEmploye, importEmploye };
};

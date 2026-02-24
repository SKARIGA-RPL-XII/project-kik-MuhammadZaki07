import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminService } from "@/services/admin.service";

export const useAdmins = (params?: { search?: string; page?: number }) => {
    return useQuery({
        queryKey: ["admins", params],
        queryFn: () => AdminService.getAll(params),
    });
};

export const useAdminMutations = () => {
    const queryClient = useQueryClient();

    const createAdmin = useMutation({
        mutationFn: (payload: { email: string; password: string }) => AdminService.create(payload),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admins"] }),
    });

    const updateAdmin = useMutation({
        mutationFn: ({ id, payload }: { id: number; payload: { email?: string; password?: string } }) =>
            AdminService.update(id, payload),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admins"] }),
    });

    const deleteAdmin = useMutation({
        mutationFn: (id: number) => AdminService.delete(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admins"] }),
    });

    const importAdmin = useMutation({
        mutationFn: (payload: { data: any[] }) => AdminService.importMapping(payload),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admins"] }),
    });

    return { createAdmin, updateAdmin, deleteAdmin, importAdmin };
};
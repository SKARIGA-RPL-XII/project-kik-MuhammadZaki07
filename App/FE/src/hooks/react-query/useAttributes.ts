import { AttributeService } from "@/services/attribute.service";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const useAttributes = () => {
  const queryClient = useQueryClient();

  const attributesQuery = useQuery({
    queryKey: ["attributes"],
    queryFn: async () => {
      const { data, error } = await AttributeService.getAttributes();
      if (error) throw new Error(error);
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async ({ name, levels }: { name: string; levels: { name: string }[] }) => {
      const { data, error } = await AttributeService.createAttribute(name, levels);
      if (error) throw new Error(error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attributes"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, name, levels }: { id: number; name?: string; levels?: { id?: number; name: string }[] }) => {
      const { data, error } = await AttributeService.updateAttribute(id, name, levels);
      if (error) throw new Error(error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attributes"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await AttributeService.deleteAttribute(id);
      if (error) throw new Error(error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attributes"] });
    },
  });

  return {
    attributes: attributesQuery.data ?? [],
    isLoading: attributesQuery.isLoading,
    isError: attributesQuery.isError,
    error: attributesQuery.error,
    createAttribute: createMutation.mutateAsync,
    updateAttribute: updateMutation.mutateAsync,
    deleteAttribute: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
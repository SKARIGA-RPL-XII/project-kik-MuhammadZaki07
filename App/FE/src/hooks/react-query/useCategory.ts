import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CategoryService, CategoryQuery } from "@/services/category.service";

export const useCategories = (query?: CategoryQuery) => {
  return useQuery({
    queryKey: ["categories", query],
    queryFn: () => CategoryService.getCategories(query),
    staleTime: 1000 * 60 * 10,
  });
};

export const useCategoryMutations = () => {
  const queryClient = useQueryClient();

  const createCategory = useMutation({
    mutationFn: (payload: any) => CategoryService.createCategory(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["categories-select"] });
    },
  });

  const updateCategory = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: any }) =>
      CategoryService.updateCategory(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["categories-select"] });
    },
  });

  const deleteCategory = useMutation({
    mutationFn: (id: number) => CategoryService.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["categories-select"] });
    },
  });

  return { createCategory, updateCategory, deleteCategory };
};

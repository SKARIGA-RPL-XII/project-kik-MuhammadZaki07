import { MenuQuery, MenuService } from "@/services/menu.service";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const useMenus = (query?: MenuQuery) => {
  return useQuery({
    queryKey: ["menus", query],
    queryFn: () => MenuService.getMenus(query),
    staleTime: 1000 * 60 * 5,
  });
};

export const useMenusAdmin = (query?: MenuQuery) => {
  return useQuery({
    queryKey: ["menus-admin", query],
    queryFn: () => MenuService.getMenusAdmin(query),
    staleTime: 1000 * 60 * 5,
  });
};

export const useMenuDetail = (id?: number | string) => {
  return useQuery({
    queryKey: ["menu", id],
    queryFn: () => MenuService.getMenuById(Number(id)),
    enabled: !!id,
    staleTime: 1000 * 60 * 10,
  });
};

export const useMenuMutations = () => {
  const queryClient = useQueryClient();

  const createMenu = useMutation({
    mutationFn: (formData: FormData) => MenuService.createMenu(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menus"] });
      queryClient.invalidateQueries({ queryKey: ["menus-admin"] });
    },
  });

  const updateMenu = useMutation({
    mutationFn: ({ id, formData }: { id: number; formData: FormData }) =>
      MenuService.updateMenu(id, formData),
    onSuccess: (res, variables) => {
      queryClient.invalidateQueries({ queryKey: ["menus"] });
      queryClient.invalidateQueries({ queryKey: ["menus-admin"] });
      queryClient.invalidateQueries({ queryKey: ["menu", variables.id] });
    },
  });

  const deleteMenu = useMutation({
    mutationFn: (id: number) => MenuService.deleteMenu(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menus"] });
      queryClient.invalidateQueries({ queryKey: ["menus-admin"] });
    },
  });

  return { createMenu, updateMenu, deleteMenu };
};
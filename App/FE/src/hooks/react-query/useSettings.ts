import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SettingsService, SettingsPayload } from "@/services/settings.service";

export const useSettings = (group?: string) => {
  return useQuery({
    queryKey: ["settings", group],
    queryFn: () => SettingsService.getAll({ group }),
  });
};

export const useUpdateSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SettingsPayload) =>
      SettingsService.updateBulk(payload),
    onSuccess: (res) => {
      if (res.status) {
        queryClient.invalidateQueries({ queryKey: ["settings"] });
      }
    },
  });
};

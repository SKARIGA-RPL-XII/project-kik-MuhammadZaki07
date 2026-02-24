import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BadgeService } from "@/services/badge.service";

export const useBadges = (params?: { search?: string; status?: string }) => {
  return useQuery({
    queryKey: ["badges", params],
    queryFn: () => BadgeService.getBadges(params),
  });
};

export const useBadgeMutations = () => {
  const queryClient = useQueryClient();

  const createBadge = useMutation({
    mutationFn: (formData: FormData) => BadgeService.createBadge(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["badges"] });
    },
  });

  const updateBadge = useMutation({
    mutationFn: ({ id, formData }: { id: number; formData: FormData }) =>
      BadgeService.updateBadge(id, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["badges"] });
    },
  });

  const deleteBadge = useMutation({
    mutationFn: (id: number) => BadgeService.deleteBadge(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["badges"] });
    },
  });

  return { createBadge, updateBadge, deleteBadge };
};
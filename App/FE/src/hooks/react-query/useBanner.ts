import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BannerService } from "@/services/banner.service";

export const useBanners = () => {
  return useQuery({
    queryKey: ["banners"],
    queryFn: () => BannerService.getBanners(),
    staleTime: 1000 * 60 * 15,
  });
};

export const useBannersAdmin = () => {
  return useQuery({
    queryKey: ["banners-admin"],
    queryFn: () => BannerService.getBannerAdmin(),
    staleTime: 1000 * 60 * 5,
  });
};

export const useBannerMutations = () => {
  const queryClient = useQueryClient();

  const createBanner = useMutation({
    mutationFn: (formData: FormData) => BannerService.createBanner(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banners"] });
      queryClient.invalidateQueries({ queryKey: ["banners-admin"] });
    },
  });

  const updateBanner = useMutation({
    mutationFn: ({ id, formData }: { id: number; formData: FormData }) =>
      BannerService.updateBanner(id, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banners"] });
      queryClient.invalidateQueries({ queryKey: ["banners-admin"] });
    },
  });

  const deleteBanner = useMutation({
    mutationFn: (id: number) => BannerService.deleteBanner(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banners"] });
      queryClient.invalidateQueries({ queryKey: ["banners-admin"] });
    },
  });

  return { createBanner, updateBanner, deleteBanner };
};

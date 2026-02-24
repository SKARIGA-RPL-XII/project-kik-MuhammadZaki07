import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { UserService } from "@/services/user.service";
import { useAuth } from "@/context/AuthContext";

export const useProfile = () => {
  return useQuery({
    queryKey: ["profile"],
    queryFn: UserService.getProfile,
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { refreshUser } = useAuth();

  return useMutation({
    mutationFn: ({ userId, payload }: { userId: number; payload: any }) =>
      UserService.updateProfile(userId, payload),
    onSuccess: async (res) => {
      if (!res.error) {
        await queryClient.invalidateQueries({ queryKey: ["profile"] });
        await refreshUser();
      }
    },
  });
};
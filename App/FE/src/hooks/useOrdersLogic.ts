import { useQuery } from "@tanstack/react-query";
import { UserService } from "@/services/user.service";

export function useOrdersLogic() {
  const { 
    data: orders = [], 
    isLoading: loading,
    error,
    refetch 
  } = useQuery({
    queryKey: ["transactions"],
    queryFn: async () => {
      const data = await UserService.getTransactions();
      return data || [];
    },
    staleTime: 1000 * 60 * 3,
  });

  return { 
    orders, 
    loading, 
    error,
    refetch 
  };
}
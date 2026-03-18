import { useInfiniteQuery } from "@tanstack/react-query";
import { UserService } from "@/services/user.service";

export function useOrdersLogic() {
  const {
    data,
    isLoading: loading,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["transactions"],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await UserService.getTransactions(pageParam);
      return response.data; 
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage: any, allPages) => {
      return lastPage?.length === 10 ? allPages.length + 1 : undefined;
    },
    staleTime: 1000 * 60 * 3,
  });

  const orders = data?.pages.flatMap((page) => page) || [];

  return {
    orders,
    loading,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  };
}
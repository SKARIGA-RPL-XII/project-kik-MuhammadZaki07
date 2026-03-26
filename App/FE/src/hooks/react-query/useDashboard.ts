import dashboardService from "@/services/dashboard.service";
import { useQuery } from "@tanstack/react-query";

export const useDashboard = () => {
  const useMetrics = () => {
    return useQuery({
      queryKey: ["dashboard", "metrics"],
      queryFn: dashboardService.getMetrics,
      refetchInterval: 3 * 10000,
    });
  };

  const useSalesChart = (filter?: string, dateRange?: string) => {
    return useQuery({
      queryKey: ["dashboard", "sales-chart", filter, dateRange],
      queryFn: () => dashboardService.getSalesChart(filter, dateRange),
      staleTime: 5 * 60 * 1000,
    });
  };

  const useBestSellers = () => {
    return useQuery({
      queryKey: ["dashboard", "best-sellers"],
      queryFn: dashboardService.getBestSellers,
    });
  };

  const useTransactionStats = () => {
    return useQuery({
      queryKey: ["dashboard", "transaction-stats"],
      queryFn: dashboardService.getTransactionStats,
    });
  };

  const useLatestTransactions = () => {
    return useQuery({
      queryKey: ["dashboard", "latest-transactions"],
      queryFn: dashboardService.getLatestTransactions,
      refetchInterval: 3 * 10000,
    });
  };

  return {
    useMetrics,
    useSalesChart,
    useBestSellers,
    useTransactionStats,
    useLatestTransactions,
  };
};
import { useQuery } from "@tanstack/react-query";
import { ReportService } from "@/services/report.service";

export const useTopSelling = (limit?: number) => {
  return useQuery({
    queryKey: ["reports", "top-selling", limit],
    queryFn: () => ReportService.getTopSelling(limit),
    staleTime: 1000 * 60 * 5,
  });
};

export const useSalesSummary = (days?: number) => {
  return useQuery({
    queryKey: ["reports", "sales-summary", days],
    queryFn: () => ReportService.getSalesSummary(days),
    staleTime: 1000 * 60 * 5,
  });
};

export const useTransactionExplorer = (params: any) => {
  return useQuery({
    queryKey: ["reports", "explorer", params],
    queryFn: () => ReportService.getTransactionExplorer(params),
  });
};
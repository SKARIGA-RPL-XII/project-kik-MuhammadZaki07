import { apiClient } from "@/lib/apiClient";

export const ReportService = {
  getTopSelling: async (limit: number = 10) => {
    const response = await apiClient.get(`/reports/top-selling?limit=${limit}`);
    return response.data;
  },
  getSalesSummary: async (days: number = 7) => {
    const response = await apiClient.get(`/reports/sales-summary?days=${days}`);
    return response.data;
  },

getTransactionExplorer: async (params: any) => {
  const response = await apiClient.get(`/reports/explorer`, { params });
  return response.data;
}
};

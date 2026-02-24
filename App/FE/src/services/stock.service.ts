import { apiClient } from "@/lib/apiClient";
import { Stock, Metadata } from "@/pages/inventory/StockPage";

export interface StockResponse {
  status: string;
  message: string;
  data: Stock[];
  metadata: Metadata;
}

export interface SingleStockResponse {
  status: string;
  message: string;
  data: Stock;
}

export const stockService = {
  getAll: async (
    page: number = 1,
    size: number = 10,
    search: string = "",
  ): Promise<StockResponse> => {
    const res = await apiClient.get("/stocks", {
      params: { page, size, search },
    });
    return res.data;
  },

  create: async (data: Omit<Stock, "id">): Promise<SingleStockResponse> => {
    const res = await apiClient.post("/stocks", data);
    return res.data;
  },

  update: async (
    id: number,
    data: Partial<Stock>,
  ): Promise<SingleStockResponse> => {
    const res = await apiClient.put(`/stocks/${id}`, data);
    return res.data;
  },

  delete: async (id: number): Promise<{ status: string; message: string }> => {
    const res = await apiClient.delete(`/stocks/${id}`);
    return res.data;
  },
};

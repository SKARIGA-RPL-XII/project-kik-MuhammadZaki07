import { apiClient } from "@/lib/apiClient";
import { Stock } from "@/pages/Stock/StockPage";

export interface Adjustment {
  id: number;
  stock_id: number;
  type: "in" | "out";
  amount: number;
  reason: string;
  user_id: number;
  created_at: string;
  stock?: Stock;
  user?: { name: string };
}

class AdjustmentService {
  private readonly endpoint = "/stock-adjustments";

  async getAll(page = 0, size = 10, search = "", type = "") {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      search,
      type,
    });
    const res = await apiClient.get(`${this.endpoint}?${params}`);
    return res.data;
  }

  async create(data: {
    stock_id: number;
    type: "in" | "out";
    amount: number;
    reason: string;
  }) {
    const res = await apiClient.post(this.endpoint, data);
    return res.data;
  }

  async delete(id: number) {
    const res = await apiClient.delete(`${this.endpoint}/${id}`);
    return res.data;
  }
}

export const adjustmentService = new AdjustmentService();

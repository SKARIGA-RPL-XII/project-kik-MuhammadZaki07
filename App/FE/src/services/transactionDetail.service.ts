import { apiClient } from "../lib/apiClient";

export interface TransactionQuery {
  page?: number;
  size?: number;
  search?: string;
  order_source?: "qr_code" | "cashier_direct" | string;
  transaction_id?: number;
  filter_time?: "today" | "this_week" | "this_month";
  sort_by?: "created_at" | "price" | "total_amount";
  sort_direction?: "asc" | "desc";
}

export class TransactionDetailService {
  private static readonly BASE_PATH = "/transaction-details";

  static async getAll(query : TransactionQuery) {
    try {
      const res = await apiClient.get(this.BASE_PATH, {
        params: {
          transaction_id: query?.transaction_id,
          page: query?.page ?? 1,
          per_page: query?.size ?? 10,
          search: query?.search,
          filter_time: query?.filter_time,
          sort_by: query?.sort_by,
          sort_direction: query?.sort_direction,
        },
      });

      const { data, meta } = res.data;

      return {
        data: data,
        page: meta ? Number(meta.current_page) : 1,
        total: meta ? Number(meta.total) : data.length,
        last_page: meta ? Number(meta.last_page) : 1,
        error: null,
      };
    } catch (err: any) {
      return {
        data: [],
        error: err?.response?.data?.message || "Failed to fetch transaction details",
      };
    }
  }


  static async updateStatus(id: number, status: string) {
    try {
      const res = await apiClient.patch(`${this.BASE_PATH}/${id}/status`, { 
        status 
      });

      return {
        data: res.data.data,
        error: null,
      };
    } catch (err: any) {
      return {
        data: null,
        error: err?.response?.data?.message || "Failed to update item status",
      };
    }
  }
}
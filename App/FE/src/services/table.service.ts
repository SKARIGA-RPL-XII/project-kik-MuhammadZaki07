import { apiClient } from "../lib/apiClient";

export interface TableQuery {
  page?: number;
  size?: number;
  search?: string;
  status?: string;
}

export class TableService {
  static async getTables(query?: TableQuery) {
    try {
      const res = await apiClient.get("/tables", {
        params: {
          page: query?.page ?? 1,
          size: query?.size ?? 10,
          search: query?.search || undefined,
          status: query?.status || undefined,
        },
      });

      return { data: res.data, error: null };
    } catch (err: any) {
      return {
        data: null,
        error:
          err?.response?.data?.message || "Failed to fetch tables",
      };
    }
  }

  static async createTable(data: FormData) {
    try {
      const res = await apiClient.post("/tables", data);
      return { data: res.data, error: null };
    } catch (err: any) {
      return {
        data: null,
        error:
          err?.response?.data?.errors ||
          err?.response?.data?.message ||
          "Failed to create table",
      };
    }
  }

  static async updateTable(id: number, data: FormData) {
    try {
      const res = await apiClient.post(`/tables/${id}?_method=PUT`, data);
      return { data: res.data, error: null };
    } catch (err: any) {
      return {
        data: null,
        error:
          err?.response?.data?.errors ||
          err?.response?.data?.message ||
          "Failed to update table",
      };
    }
  }

  static async deleteTable(id: number) {
    try {
      const res = await apiClient.delete(`/tables/${id}`);
      return { data: res.data, error: null };
    } catch (err: any) {
      return {
        data: null,
        error:
          err?.response?.data?.message || "Failed to delete table",
      };
    }
  }
}

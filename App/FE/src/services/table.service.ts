import { apiClient } from "../lib/apiClient";

export interface TableQuery {
  page?: number;
  size?: number;
  search?: string;
  status?: string;
}

export interface TableInterface {
  id: number;
  table_number: string;
  status: "available" | "occupied";
  qr_code: string | null;
  room_id: number | null;
  position_x: number;
  position_y: number;
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

      return {
        data: res.data.data,
        error: null,
      };
    } catch (err: any) {
      return {
        data: null,
        error: err?.response?.data?.message || "Failed to fetch tables",
      };
    }
  }

  static async showTable(id: number | string) {
    try {
      const res = await apiClient.get(`/tables/${id}`);

      return {
        data: res.data,
        error: null,
      };
    } catch (err: any) {
      return {
        data: null,
        error: err?.response?.data?.message || "Failed to Get table",
      };
    }
  }

  static async createTable(payload: { table_number: string }) {
    try {
      const res = await apiClient.post("/tables", payload);

      return {
        data: res.data.data,
        error: null,
      };
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

  static async updateTable(
    id: number,
    payload: {
      table_number?: string;
      status?: "available" | "occupied";
      position_x?: number;
      position_y?: number;
      room_id?: number | null;
    },
  ) {
    try {
      const res = await apiClient.put(`/tables/${id}`, payload);

      return {
        data: res.data.data,
        error: null,
      };
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

      return {
        data: res.data,
        error: null,
      };
    } catch (err: any) {
      return {
        data: null,
        error: err?.response?.data?.message || "Failed to delete table",
      };
    }
  }
}

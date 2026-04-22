import { apiClient } from "../lib/apiClient";

export interface UnitQuery {
  page?: number;
  size?: number;
  search?: string;
  category?: 'weight' | 'volume' | 'unit';
}

export interface Unit {
  id: number;
  name: string;
  abbreviation: string;
  category: string;
  base_unit_id: number;
  multiplier: number;
  base_unit?: Unit;
}

export class UnitService {
  static async getUnits(query?: UnitQuery) {
    try {
      const res = await apiClient.get("/units", {
        params: {
          page: query?.page ?? 1,
          size: query?.size ?? 10,
          search: query?.search,
          category: query?.category,
        },
      });

      const { units, metadata } = res.data.data;

      return {
        data: units as Unit[],
        page: Number(metadata.page),
        size: Number(metadata.size),
        total: Number(metadata.total),
        error: null,
      };
    } catch (err: any) {
      return {
        data: null,
        error: err?.response?.data?.message || "Failed to fetch units",
      };
    }
  }

  static async createUnit(payload: Partial<Unit>) {
    const res = await apiClient.post("/units", payload);
    return res.data;
  }

  static async updateUnit(id: number, payload: Partial<Unit>) {
    const res = await apiClient.put(`/units/${id}`, payload);
    return res.data;
  }

  static async deleteUnit(id: number) {
    const res = await apiClient.delete(`/units/${id}`);
    return res.data;
  }
}
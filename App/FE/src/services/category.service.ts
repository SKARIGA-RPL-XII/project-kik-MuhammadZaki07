import { apiClient } from "../lib/apiClient";

export interface CategoryQuery {
  page?: number;
  size?: number;
  search?: string;
}

export class CategoryService {
  static async getCategories(query?: CategoryQuery) {
    try {
      const res = await apiClient.get("/categories", {
        params: {
          page: query?.page ?? 0,
          size: query?.size ?? 10,
          search: query?.search,
        },
      });

      const { category, metadata } = res.data.data;

      return {
        data: category,
        page: Number(metadata.page),
        size: Number(metadata.size),
        total: Number(metadata.total),
        error: null,
      };
    } catch (err: any) {
      return {
        data: null,
        error: err?.response?.data?.message || "Failed to fetch categories",
      };
    }
  }

  static async createCategory(payload: any) {
    const res = await apiClient.post("/category", payload);
    return res.data;
  }

  static async updateCategory(id: number, payload: any) {
    const res = await apiClient.put(`/category/${id}`, payload);
    return res.data;
  }

  static async deleteCategory(id: number) {
    const res = await apiClient.delete(`/category/${id}`);
    return res.data;
  }
}
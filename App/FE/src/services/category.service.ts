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

      return {
        data: res.data.data.category,
        page: Number(res.data.data.metadata.page),
        size: Number(res.data.data.metadata.size),
        total: Number(res.data.data.metadata.total),
        error: null,
      };
    } catch (err: any) {
      return {
        data: null,
        error: err?.response?.data?.message || "Failed to fetch categories",
      };
    }
  }

  static async createCategory(formData: FormData) {
    try {
      const res = await apiClient.post("/category", formData);
      return { data: res.data, error: null };
    } catch (err: any) {
      return {
        data: null,
        error:
          err?.response?.data?.errors ||
          err?.response?.data?.message ||
          "Failed to create category",
      };
    }
  }

  static async updateCategory(id: number, formData: FormData) {
    try {
      const res = await apiClient.put(`/category/${id}`, formData);
      return { data: res.data, error: null };
    } catch (err: any) {
      return {
        data: null,
        error:
          err?.response?.data?.errors ||
          err?.response?.data?.message ||
          "Failed to update category",
      };
    }
  }

  static async deleteCategory(id: number) {
    try {
      const res = await apiClient.delete(`/category/${id}`);
      return { data: res.data, error: null };
    } catch (err: any) {
      return {
        data: null,
        error: err?.response?.data?.message || "Failed to delete category",
      };
    }
  }
}

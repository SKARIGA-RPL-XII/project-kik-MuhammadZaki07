import { apiClient } from "../lib/apiClient";

export class DiscountService {
  static async getDiscounts(params?: {
    search?: string;
    status?: string;
    start_date?: string;
    end_date?: string;
  }) {
    try {
      const res = await apiClient.get("/discounts", { params });
      return { data: res.data, error: null };
    } catch (err: any) {
      return {
        data: null,
        error: err?.response?.data?.message || "Failed to fetch discounts",
      };
    }
  }

  static async createDiscount(formData: FormData) {
    try {
      const res = await apiClient.post("/discounts", formData);
      return { data: res.data, error: null };
    } catch (err: any) {
      return {
        data: null,
        error:
          err?.response?.data?.errors ||
          err?.response?.data?.message ||
          "Failed to create discount",
      };
    }
  }

  static async updateDiscount(id: number, formData: FormData) {
    try {
      formData.append("_method", "PUT");

      const res = await apiClient.post(`/discounts/${id}`, formData);

      return { data: res.data, error: null };
    } catch (err: any) {
      return {
        data: null,
        error:
          err?.response?.data?.errors ||
          err?.response?.data?.message ||
          "Failed to update discount",
      };
    }
  }

  static async deleteDiscount(id: number) {
    try {
      const res = await apiClient.delete(`/discounts/${id}`);
      return { data: res.data, error: null };
    } catch (err: any) {
      return {
        data: null,
        error: err?.response?.data?.message || "Failed to delete discount",
      };
    }
  }

  static async applyDiscount(formData: FormData) {
    try {
      const res = await apiClient.post("/discounts/apply-discount", formData);

      return { data: res.data, error: null };
    } catch (err: any) {
      return {
        data: null,
        error:
          err?.response?.data?.errors ||
          err?.response?.data?.message ||
          "Failed to apply discount",
      };
    }
  }
}

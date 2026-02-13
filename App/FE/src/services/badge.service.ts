import { apiClient } from "../lib/apiClient";

export class BadgeService {
  static async getBadges(params?: { search?: string; status?: string }) {
    try {
      const res = await apiClient.get("/badges", {
        params,
      });

      return { data: res.data, error: null };
    } catch (err: any) {
      return {
        data: null,
        error: err?.response?.data?.message || "Failed to fetch badges",
      };
    }
  }

  static async getBadge(id: number) {
    try {
      const res = await apiClient.get(`/badges/${id}`);
      return { data: res.data, error: null };
    } catch (err: any) {
      return {
        data: null,
        error: err?.response?.data?.message || "Failed to fetch badge",
      };
    }
  }

  static async createBadge(formData: FormData) {
    try {
      const res = await apiClient.post("/badges", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return { data: res.data, error: null };
    } catch (err: any) {
      return {
        data: null,
        error:
          err?.response?.data?.errors ||
          err?.response?.data?.message ||
          "Failed to create badge",
      };
    }
  }

  static async updateBadge(id: number, formData: FormData) {
    try {
      formData.append("_method", "PUT");

      const res = await apiClient.post(`/badges/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return { data: res.data, error: null };
    } catch (err: any) {
      return {
        data: null,
        error:
          err?.response?.data?.errors ||
          err?.response?.data?.message ||
          "Failed to update badge",
      };
    }
  }

  static async deleteBadge(id: number) {
    try {
      const res = await apiClient.delete(`/badges/${id}`);
      return { data: res.data, error: null };
    } catch (err: any) {
      return {
        data: null,
        error: err?.response?.data?.message || "Failed to delete badge",
      };
    }
  }
}

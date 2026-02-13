import { apiClient } from "../lib/apiClient";

export class BannerService {
  static async getBanners() {
    try {
      const res = await apiClient.get("/banners");
      return { data: res.data, error: null };
    } catch (err: any) {
      return {
        data: null,
        error:
          err?.response?.data?.message ||
          "Failed to fetch banners",
      };
    }
  }

  static async createBanner(formData: FormData) {
    try {
      const res = await apiClient.post("/banners", formData);
      return { data: res.data, error: null };
    } catch (err: any) {
      return {
        data: null,
        error:
          err?.response?.data?.errors ||
          err?.response?.data?.message ||
          "Failed to create banner",
      };
    }
  }

  static async updateBanner(id: number, formData: FormData) {
    try {
      formData.append("_method", "PUT");

      const res = await apiClient.post(
        `/banners/${id}`,
        formData
      );

      return { data: res.data, error: null };
    } catch (err: any) {
      return {
        data: null,
        error:
          err?.response?.data?.errors ||
          err?.response?.data?.message ||
          "Failed to update banner",
      };
    }
  }

  static async deleteBanner(id: number) {
    try {
      const res = await apiClient.delete(`/banners/${id}`);
      return { data: res.data, error: null };
    } catch (err: any) {
      return {
        data: null,
        error:
          err?.response?.data?.message ||
          "Failed to delete banner",
      };
    }
  }
}

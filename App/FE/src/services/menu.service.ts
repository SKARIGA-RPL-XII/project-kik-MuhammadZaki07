import { apiClient } from "../lib/apiClient";

export interface MenuQuery {
  page?: number;
  size?: number;
  search?: string;
  category?: string;
  stock_min?: number;
  stock_max?: number;
}

export class MenuService {
  static async getMenus(query?: MenuQuery) {
    try {
      const res = await apiClient.get("/menus", { params: query });

      return {
        data: res.data.data.menus,
        page: Number(res.data.data.metadata.page),
        size: Number(res.data.data.metadata.size),
        total: Number(res.data.data.metadata.total),
        error: null,
      };
    } catch (err: any) {
      return {
        data: null,
        error: err?.response?.data?.message || "Failed to fetch menus",
      };
    }
  }

  static async getMenusAdmin(query?: MenuQuery) {
    try {
      const res = await apiClient.get("/menu-admin", { params: query });

      return {
        data: res.data.data.menus,
        page: Number(res.data.data.metadata.page),
        size: Number(res.data.data.metadata.size),
        total: Number(res.data.data.metadata.total),
        error: null,
      };
    } catch (err: any) {
      return {
        data: null,
        error: err?.response?.data?.message || "Failed to fetch menus",
      };
    }
  }

  static async getMenuById(id?: MenuQuery) {
    try {
      const res = await apiClient.get(`/menus/${id}`);
      return { data: res.data, error: null };
    } catch (err: any) {
      return {
        data: null,
        error: err?.response?.data?.message || "Failed to fetch menu by id",
      };
    }
  }

  static async createMenu(formData: FormData) {
    try {
      const res = await apiClient.post("/menus", formData);
      return { data: res.data, error: null };
    } catch (err: any) {
      return {
        data: null,
        error:
          err?.response?.data?.errors ||
          err?.response?.data?.message ||
          "Failed to create menu",
      };
    }
  }

  static async updateMenu(id: number, formData: FormData) {
    try {
      formData.append("_method", "PUT");

      const res = await apiClient.post(`/menus/${id}`, formData);

      return { data: res.data, error: null };
    } catch (err: any) {
      return {
        data: null,
        error:
          err?.response?.data?.errors ||
          err?.response?.data?.message ||
          "Failed to update menu",
      };
    }
  }

  static async deleteMenu(id: number) {
    try {
      const res = await apiClient.delete(`/menus/${id}`);
      return { data: res.data, error: null };
    } catch (err: any) {
      return {
        data: null,
        error: err?.response?.data?.message || "Failed to delete menu",
      };
    }
  }
}

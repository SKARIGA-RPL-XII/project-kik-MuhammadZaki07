import { apiClient } from "../lib/apiClient";

export interface MenuQuery {
  page?: number;
  size?: number;
  search?: string;
  category?: string;
  stock_min?: number;
  stock_max?: number;
}

export interface MenuResponse<T> {
  data: T | null;
  page?: number;
  size?: number;
  total?: number;
  error: string | null;
}

export class MenuService {
  private static async request<T>(
    method: "get" | "post" | "put" | "delete",
    url: string,
    options?: any,
  ): Promise<MenuResponse<T>> {
    try {
      const res = await apiClient[method](url, options);
      const payload = res.data?.data;
      return {
        data: payload?.menus || payload || null,
        page: payload?.metadata?.page
          ? Number(payload.metadata.page)
          : undefined,
        size: payload?.metadata?.size
          ? Number(payload.metadata.size)
          : undefined,
        total: payload?.metadata?.total
          ? Number(payload.metadata.total)
          : undefined,
        error: null,
      };
    } catch (err: any) {
      return {
        data: null,
        error:
          err?.response?.data?.errors ||
          err?.response?.data?.message ||
          "Request failed",
      };
    }
  }

  static getMenus(query?: MenuQuery) {
    return this.request<any[]>("get", "/menus", { params: query });
  }

  static getMenusAdmin(query?: MenuQuery) {
    return this.request<any[]>("get", "/menu-admin", { params: query });
  }

  static async getMenuById(id: number) {
    return this.request<any>("get", `/menus/${id}`);
  }

  static async createMenu(formData: FormData) {
    return this.request<any>("post", "/menus", formData);
  }

  static async updateMenu(id: number, formData: FormData) {
    formData.append("_method", "PUT");
    return this.request<any>("post", `/menus/${id}`, formData);
  }

  static async deleteMenu(id: number) {
    return this.request<any>("delete", `/menus/${id}`);
  }
}

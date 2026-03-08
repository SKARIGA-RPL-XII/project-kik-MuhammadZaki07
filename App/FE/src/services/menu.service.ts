import { apiClient } from "../lib/apiClient";

export interface MenuQuery {
  page?: number;
  size?: number;
  search?: string;
  category?: string | number;
  sort_by?: 'best_seller' | 'stock_highest' | 'price_lowest' | 'price_highest';
}

export interface MenuResponse<T> {
  data: T | null;
  page?: number;
  size?: number;
  total?: number;
  error: any | null;
}

export class MenuService {
  private static async request<T>(
    method: "get" | "post" | "put" | "delete",
    url: string,
    options?: any,
  ): Promise<MenuResponse<T>> {
    try {
      const res = await apiClient[method](url, options);
      const responseData = res.data;
      const payload = responseData.data;

      return {
        data: payload?.menus || payload || null,
        page: payload?.metadata?.page ?? undefined,
        size: payload?.metadata?.size ?? undefined,
        total: payload?.metadata?.total ?? undefined,
        error: null,
      };
    } catch (err: any) {
      return {
        data: null,
        error: err?.response?.data || "Request failed",
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
    if (!(formData instanceof FormData)) {
      throw new Error("Update menu must use FormData for image uploads");
    }
    formData.append("_method", "PUT");
    return this.request<any>("post", `/menus/${id}`, formData);
  }

  static async deleteMenu(id: number) {
    return this.request<any>("delete", `/menus/${id}`);
  }
}
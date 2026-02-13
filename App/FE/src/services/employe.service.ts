import { apiClient } from "../lib/apiClient";

export interface EmployeQuery {
  page?: number;
  size?: number;
  search?: string;
  gender?: string;
  role_id?: number | string;
}

export class EmployeService {
  static async getEmployes(query?: EmployeQuery) {
    try {
      const res = await apiClient.get("/employes", {
        params: {
          page: query?.page ?? 1,
          size: query?.size ?? 10,
          search: query?.search || undefined,
          gender: query?.gender || undefined,
          role_id: query?.role_id || undefined,
        },
      });

      return { data: res.data, error: null };
    } catch (err: any) {
      return {
        data: null,
        error: err?.response?.data?.message || "Failed to fetch employes",
      };
    }
  }

  static async createEmploye(formData: FormData) {
    try {
      const res = await apiClient.post("/employes", formData);
      return { data: res.data, error: null };
    } catch (err: any) {
      return {
        data: null,
        error:
          err?.response?.data?.errors ||
          err?.response?.data?.message ||
          "Failed to create employe",
      };
    }
  }

  static async updateEmploye(id: number, formData: FormData) {
    try {
      formData.append("_method", "PUT");

      const res = await apiClient.post(`/employes/${id}`, formData);

      return { data: res.data, error: null };
    } catch (err: any) {
      return {
        data: null,
        error:
          err?.response?.data?.errors ||
          err?.response?.data?.message ||
          "Failed to update employe",
      };
    }
  }

  static async deleteEmploye(id: number) {
    try {
      const res = await apiClient.delete(`/employes/${id}`);
      return { data: res.data, error: null };
    } catch (err: any) {
      return {
        data: null,
        error: err?.response?.data?.message || "Failed to delete employe",
      };
    }
  }
}

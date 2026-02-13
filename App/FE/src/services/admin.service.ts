import { apiClient } from "@/lib/apiClient";

export interface Admin {
  id: number;
  email: string;
  role_id: number;
  created_at: string;
  updated_at: string;
}

export interface AdminPayload {
  email: string;
  password?: string;
}

export interface PaginatedResponse<T> {
  data: {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export const AdminService = {
  async getAll(params?: { search?: string; page?: number }) {
    const res = await apiClient.get("/admins", { params });
    return res.data;
  },

  async create(payload: { email: string; password: string }) {
    try {
      const res = await apiClient.post("/admins", payload);
      return { data: res.data };
    } catch (error: any) {
      return {
        error: error.response?.data?.errors || {
          general: ["Something went wrong"],
        },
      };
    }
  },

  async update(
    id: number,
    payload: { email?: string; password?: string }
  ) {
    try {
      const res = await apiClient.put(`/admins/${id}`, payload);
      return { data: res.data };
    } catch (error: any) {
      return {
        error: error.response?.data?.errors || {
          general: ["Something went wrong"],
        },
      };
    }
  },

  async delete(id: number) {
    await apiClient.delete(`/admins/${id}`);
  },
};


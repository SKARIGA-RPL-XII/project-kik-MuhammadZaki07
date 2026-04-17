import { apiClient } from "../lib/apiClient";

export interface UpdateProfilePayload {
  email?: string;
  password?: string;
  no_tlp?: number | string;
  addres?: string;
  gender?: "LK" | "PR";
  username?: string;
  profile_image?: File | null;
}

export const UserService = {
  getProfile: async () => {
    const res = await apiClient.get("/user/me");
    return res.data.data;
  },

  updateProfile: async (userId: number, payload: any) => {
    const formData = new FormData();
    formData.append("_method", "PUT");

    Object.entries(payload).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formData.append(key, value instanceof File ? value : String(value));
      }
    });

    try {
      const { data } = await apiClient.post(`/users/${userId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return { data, error: null };
    } catch (err: any) {
      return {
        data: null,
        error: err.response?.data?.errors || err.message,
      };
    }
  },

  getTransactions: async (page: number = 1) => {
    const res = await apiClient.get(`/user/transactions?page=${page}`);
    return res.data.data;
  },

  getTransactionById: async (id: string | undefined) => {
    if (!id) return null;
    const res = await apiClient.get(`/transactions/${id}`);
    return res.data.data;
  },

  deleteAccount: async () => {
    try {
      const res = await apiClient.delete(`/user/delete`);
      return { data: res.data, error: null };
    } catch (err: any) {
      return {
        data: null,
        error: err.response?.data?.message || "Gagal menghapus akun",
      };
    }
  },

getCustomers: async (params: any) => {
  const res = await apiClient.get("/customers", {
    params: {
      ...params,
      page: params.page + 1,
    },
  });
  return res.data.data;
},

  getCustomerStats: async () => {
    const res = await apiClient.get("/customers/stats");
    return res.data.data;
  },

  getCustomerById: async (id: number) => {
    const res = await apiClient.get(`/customers/${id}`);
    return res.data.data;
  },

  updateCustomer: async (id: number, payload: UpdateProfilePayload) => {
    const formData = new FormData();
    formData.append("_method", "PUT");

    Object.entries(payload).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formData.append(key, value instanceof File ? value : String(value));
      }
    });

    try {
      const res = await apiClient.post(`/customers/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      return { data: res.data, error: null };
    } catch (err: any) {
      return {
        data: null,
        error: err.response?.data?.errors || err.message,
      };
    }
  },

  toggleBlockCustomer: async (id: number) => {
    const res = await apiClient.patch(`/customers/${id}/toggle-block`);
    return res.data;
  },

  deleteCustomer: async (id: number) => {
    const res = await apiClient.delete(`/customers/${id}`);
    return res.data;
  },

  getCustomerChart: async () => {
    const res = await apiClient.get("/customers/chart");
    return res.data.data;
  },
};

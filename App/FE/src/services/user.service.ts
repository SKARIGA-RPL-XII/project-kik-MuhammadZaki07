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
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return { data, error: null };
  } catch (err: any) {
    return { 
      data: null, 
      error: err.response?.data?.errors || err.message 
    };
  }
}
};

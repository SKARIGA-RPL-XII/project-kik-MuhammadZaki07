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

  updateProfile: async (userId: number, payload: UpdateProfilePayload) => {
    const formData = new FormData();

    formData.append("_method", "PUT");

    if (payload.email) formData.append("email", payload.email);
    if (payload.password) formData.append("password", payload.password);
    if (payload.no_tlp) formData.append("no_tlp", String(payload.no_tlp));
    if (payload.addres) formData.append("addres", payload.addres);
    if (payload.gender) formData.append("gender", payload.gender);
    if (payload.username) formData.append("username", payload.username);

    if (payload.profile_image) {
      formData.append("profile_image", payload.profile_image);
    }

    const { data } = await apiClient.post(`/users/${userId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return data;
  },
};

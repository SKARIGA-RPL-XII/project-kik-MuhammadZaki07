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

  // TARUH DI SINI: Memberitahu Laravel untuk memperlakukan POST ini sebagai PUT
  formData.append("_method", "PUT");

  // Masukkan semua field dari UI ke dalam FormData
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      // Jika value adalah File (gambar), masukkan langsung
      // Jika bukan, konversi ke string
      formData.append(key, value instanceof File ? value : String(value));
    }
  });

  try {
    // Tetap kirim menggunakan method .post agar file terkirim dengan aman
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

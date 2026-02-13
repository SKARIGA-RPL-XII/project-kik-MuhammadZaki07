import { apiClient } from "@/lib/apiClient";

export class RoleService {
  static async getRoles() {
    try {
      const res = await apiClient.get("/roles");
      return { data: res?.data, error: null };
    } catch (err: any) {
      return {
        data: null,
        error: err?.response?.data?.message || "Failed to fetch badges",
      };
    }
  }
}

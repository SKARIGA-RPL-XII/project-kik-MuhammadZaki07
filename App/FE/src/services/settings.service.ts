import { apiClient } from "@/lib/apiClient";

export interface SettingsPayload {
  group: string;
  settings: Record<string, any>;
}

export interface SettingResponse {
  status: boolean;
  message?: string;
  data?: Record<string, { value: any; type: string; group: string }>;
  errors?: Record<string, string[]>;
}

export const SettingsService = {
  async getAll(params?: { group?: string }): Promise<SettingResponse> {
    const response = await apiClient.get("/settings", { params });
    return response.data;
  },

  async getByKey(key: string): Promise<SettingResponse> {
    const response = await apiClient.get(`/settings/${key}`);
    return response.data;
  },

  async updateBulk(payload: SettingsPayload): Promise<SettingResponse> {
    try {
      const response = await apiClient.post("/settings/bulk", payload);
      return {
        status: true,
        message: response.data.message,
        data: response.data.data
      };
    } catch (error: any) {
      return {
        status: false,
        message: error.response?.data?.message || "Failed to update settings",
        errors: error.response?.data?.errors,
      };
    }
  },

  async delete(key: string): Promise<SettingResponse> {
    const response = await apiClient.delete(`/settings/${key}`);
    return response.data;
  },
};
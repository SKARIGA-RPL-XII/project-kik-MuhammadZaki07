import { apiClient } from "@/lib/apiClient";

export interface SettingsPayload {
  store_name?: string;
  phone?: string;
  address?: string;
  theme?: string;
  sidebar_config?: Record<string, any>;
  pages_config?: Record<string, any>;
  tax_percentage?: number;
  service_percentage?: number;
}

export interface SettingResponse {
  status: boolean;
  message?: string;
  data?: Record<string, any>;
  errors?: Record<string, string[]>;
}

export const SettingsService = {
  async getAll(): Promise<SettingResponse> {
    const response = await apiClient.get("/settings");
    return response.data;
  },

  async getByKey(key: string): Promise<SettingResponse> {
    const response = await apiClient.get(`/settings/${key}`);
    return response.data;
  },

  async update(payload: SettingsPayload): Promise<SettingResponse> {
    try {
      const response = await apiClient.put("/settings", payload, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }

      return {
        status: false,
        message: "Unexpected error occurred",
      };
    }
  },

  async delete(key: string): Promise<SettingResponse> {
    const response = await apiClient.delete(`/settings/${key}`);
    return response.data;
  },
};

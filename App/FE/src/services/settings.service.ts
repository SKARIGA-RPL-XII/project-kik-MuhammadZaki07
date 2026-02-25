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

  // async updateBulk(payload: SettingsPayload): Promise<SettingResponse> {
  //   try {
  //     const response = await apiClient.post("/settings/bulk", payload);
  //     return {
  //       status: true,
  //       message: response.data.message,
  //       data: response.data.data
  //     };
  //   } catch (error: any) {
  //     return {
  //       status: false,
  //       message: error.response?.data?.message || "Failed to update settings",
  //       errors: error.response?.data?.errors,
  //     };
  //   }
  // },

 async updateBulk(payload: SettingsPayload): Promise<SettingResponse> {
  try {
    const fd = new FormData();

    fd.append("_method", "PUT");
    fd.append("group", payload.group);

    Object.entries(payload.settings).forEach(([key, value]) => {
      if (value instanceof File) {
        fd.append(`settings[${key}]`, value);
      } else if (value !== null && value !== undefined) {
        const processedValue = typeof value === 'object' 
          ? JSON.stringify(value) 
          : value;
          
        fd.append(`settings[${key}]`, processedValue);
      }
    });

    const response = await apiClient.post("/settings/bulk", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return {
      status: true,
      message: response.data.message,
      data: response.data.data,
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

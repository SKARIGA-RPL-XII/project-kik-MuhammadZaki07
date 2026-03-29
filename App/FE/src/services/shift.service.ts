import { apiClient } from "@/lib/apiClient";

export interface Shift {
  id: number;
  name: string;
  start_time: string;
  end_time: string;
  late_tolerance: number;
  late_penalty: number;
  created_at?: string;
  updated_at?: string;
}

export const shiftService = {
  getAll: async (): Promise<Shift[]> => {
    const response = await apiClient.get("/shifts");
    return response.data.data;
  },

  getById: async (id: number): Promise<Shift> => {
    const response = await apiClient.get(`/shifts/${id}`);
    return response.data.data;
  },

  create: async (data: Partial<Shift>): Promise<Shift> => {
    const response = await apiClient.post("/shifts", data);
    return response.data.data;
  },

  update: async (id: number, data: Partial<Shift>): Promise<Shift> => {
    const response = await apiClient.put(`/shifts/${id}`, data);
    return response.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/shifts/${id}`);
  },
};
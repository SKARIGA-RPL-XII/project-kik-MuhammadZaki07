import { apiClient } from "@/lib/apiClient";

const API_URL = '/attendance';

export const attendanceService = {
  async clockIn(lat: number, long: number) {
    const response = await apiClient.post(`${API_URL}/clock-in`, { lat, long });
    return response.data;
  },

  async clockOut() {
    const response = await apiClient.post(`${API_URL}/clock-out`);
    return response.data;
  },

  async getTodayStatus() {
    const response = await apiClient.get(`${API_URL}/status-today`);
    return response.data;
  },

  async getMyAttendance(params?: { month?: string; status?: string; page?: number }) {
    const response = await apiClient.get(`${API_URL}/my`, { params });
    return response.data;
  }
};
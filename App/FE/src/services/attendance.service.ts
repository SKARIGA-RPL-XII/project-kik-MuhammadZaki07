import { apiClient } from "@/lib/apiClient";

const API_URL = '/attendance';

export const attendanceService = {

  async getAllAttendance(params: {
    page?: number;
    per_page?: number;
    search?: string;
    role?: string;
    status?: string;
    start_date?: string;
    end_date?: string;
  }) {
    const response = await apiClient.get(`${API_URL}/admin/all`, { params });
    return response.data;
  },

  async exportAttendance(format: 'xlsx' | 'pdf', params: any) {
  try {
   const response = await apiClient.get(`${API_URL}/export/${format}`, {
      params,
      responseType: 'blob',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`, 
        'Accept': 'application/json'
      }
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    
    const fileName = `attendance-report-${new Date().getTime()}.${format}`;
    link.setAttribute('download', fileName);
    
    document.body.appendChild(link);
    link.click();
    
    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(url);

  } catch (error) {
    console.error("Export failed", error);
  }
},
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
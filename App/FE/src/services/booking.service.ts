import { apiClient } from "../lib/apiClient";

export class BookingService {
static async getBookings(params?: { search?: string; status?: string }) {
    try {
      const res = await apiClient.get("/bookings", { params });
      return { 
        data: res.data.data, 
        error: null 
      };
    } catch (err: any) {
      return {
        data: [],
        error: err?.response?.data?.message || "Failed to fetch bookings",
      };
    }
  }

  static async createBooking(payload: any) {
    try {
      const res = await apiClient.post("/bookings", payload);
      return { data: res.data, error: null };
    } catch (err: any) {
      return {
        data: null,
        error:
          err?.response?.data?.errors ||
          err?.response?.data?.message ||
          "Failed to create booking",
      };
    }
  }

  static async deleteBooking(id: number) {
    try {
      const res = await apiClient.delete(`/bookings/${id}`);
      return { data: res.data, error: null };
    } catch (err: any) {
      return {
        data: null,
        error: err?.response?.data?.message || "Failed to delete booking",
      };
    }
  }

  static async approveBooking(id: number) {
    try {
      const res = await apiClient.put(`/bookings/${id}/approve`);
      return { data: res.data, error: null };
    } catch (err: any) {
      return {
        data: null,
        error: err?.response?.data?.message || "Failed to approve booking",
      };
    }
  }

  static async rejectBooking(id: number) {
    try {
      const res = await apiClient.put(`/bookings/${id}/reject`);
      return { data: res.data, error: null };
    } catch (err: any) {
      return {
        data: null,
        error: err?.response?.data?.message || "Failed to reject booking",
      };
    }
  }
}

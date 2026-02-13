import { apiClient } from "../lib/apiClient";

export const DutyScheduleService = {
  getAll: (params?: any) =>
    apiClient.get("/duty-schedules", { params }),

  getById: (id: number) =>
    apiClient.get(`/duty-schedules/${id}`),

  create: (payload: {
    user_id: number;
    shift_id: number;
    date: string;
  }) => {
    const formData = new FormData();
    formData.append("user_id", String(payload.user_id));
    formData.append("shift_id", String(payload.shift_id));
    formData.append("date", payload.date);

    return apiClient.post("/duty-schedules", formData);
  },

  update: (id: number, payload: {
    user_id: number;
    shift_id: number;
    date: string;
  }) => {
    const formData = new FormData();
    formData.append("_method", "PUT");
    formData.append("user_id", String(payload.user_id));
    formData.append("shift_id", String(payload.shift_id));
    formData.append("date", payload.date);

    return apiClient.post(`/duty-schedules/${id}`, formData);
  },

  delete: (id: number) =>
    apiClient.delete(`/duty-schedules/${id}`),
};

import { apiClient } from "../lib/apiClient";

export const EventService = {
  async getAll() {
    const res = await apiClient.get("/events");
    return res.data;
  },

  async create(payload: any) {
    const res = await apiClient.post("/events", payload);
    return res.data;
  },

  async update(id: number, payload: any) {
    const res = await apiClient.put(`/events/${id}`, payload);
    return res.data;
  },

  async delete(id: number) {
    const res = await apiClient.delete(`/events/${id}`);
    return res.data;
  },
};

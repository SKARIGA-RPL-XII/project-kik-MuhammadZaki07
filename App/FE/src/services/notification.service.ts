import { apiClient } from "@/lib/apiClient";
import { Notification, NotificationMetadata } from "../types/notification";

interface NotificationResponse {
  data: {
    notifications: Notification[];
    metadata: NotificationMetadata;
  };
}

interface NotificationDetailResponse {
  data: Notification;
}

export const notificationService = {
  async getAll(page = 1, size = 10): Promise<NotificationResponse> {
    const response = await apiClient.get(
      `/notifications?page=${page}&size=${size}`,
    );
    return response.data;
  },

  async getById(id: string): Promise<NotificationDetailResponse> {
    const response = await apiClient.get(`/notifications/${id}`);
    return response.data;
  },

  async markAsRead(id: string): Promise<void> {
    await apiClient.put(`/notifications/${id}/read`);
  },

  async markAllAsRead(): Promise<void> {
    await apiClient.put("/notifications/read-all");
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/notifications/${id}`);
  },
};

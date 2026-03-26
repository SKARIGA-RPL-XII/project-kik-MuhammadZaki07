import { apiClient } from "@/lib/apiClient";

export interface Task {
  id: number;
  user_id: number;
  title: string;
  description: string | null;
  priority: "low" | "medium" | "high";
  status: "pending" | "completed";
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;
}

class TasksService {
  async getTasks(): Promise<Task[]> {
    const response = await apiClient.get<{ data: Task[] }>("/tasks");
    return response.data.data;
  }

  async createTask(data: Partial<Task>): Promise<Task> {
    const response = await apiClient.post<{ data: Task }>("/tasks", data);
    return response.data.data;
  }

  async updateTask(id: number, data: Partial<Task>): Promise<Task> {
    const response = await apiClient.put<{ data: Task }>(`/tasks/${id}`, data);
    return response.data.data;
  }

  async toggleTaskStatus(id: number): Promise<Task> {
    const response = await apiClient.patch<{ data: Task }>(`/tasks/${id}/toggle`);
    return response.data.data;
  }

  async deleteTask(id: number): Promise<void> {
    await apiClient.delete(`/tasks/${id}`);
  }
}

export default new TasksService();
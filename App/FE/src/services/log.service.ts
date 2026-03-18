import { apiClient } from "@/lib/apiClient";

export interface ActivityLog {
  id: number;
  user_id: number;
  action: string;
  module: string;
  payload_before: any;
  payload_after: any;
  message: string;
  created_at: string;
  user?: {
    name: string;
  };
}

interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  prev_page_url: string | null;
  next_page_url: string | null;
}

class LogService {
  private endpoint = "/logs";

async getAll(params?: {
  search?: string;
  module?: string;
  action?: string;
  date?: string;
  page?: number;
}): Promise<PaginatedResponse<ActivityLog>> {
  const { data } = await apiClient.get(this.endpoint, { params });
  return data;
}

  async getDetail(id: number): Promise<ActivityLog> {
    const { data } = await apiClient.get(`${this.endpoint}/${id}`);
    return data.data;
  }

  async delete(id: number): Promise<void> {
    await apiClient.delete(`${this.endpoint}/${id}`);
  }

  async restore(id: number): Promise<void> {
    await apiClient.post(`${this.endpoint}/${id}/restore`);
  }
}

export default new LogService();

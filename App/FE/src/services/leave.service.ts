import { apiClient } from "@/lib/apiClient";

export interface LeaveRequest {
  type: string;
  start_date: string;
  end_date: string;
  reason: string;
  proof_file: File;
}

export const leaveService = {
  getAllLeaves: async (params: any) => {
    const res = await apiClient.get("/leaves", { params });
    return res.data;
  },

  getMyLeaves: async (params?: { search?: string; page?: number; status?: string }) => {
    const response = await apiClient.get("/leaves/my", { params });
    return response.data;
  },
  createLeave: async (data: FormData) => {
    const response = await apiClient.post("/leaves", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  approveLeave: async (
    id: number,
    status: "approved" | "rejected",
    reason?: string,
  ) => {
    const res = await apiClient.post(`/leaves/${id}/approve`, {
      status,
      rejected_reason: reason,
    });
    return res.data;
  },

  getLeaveDetail: async (id: number) => {
    const res = await apiClient.get(`/leaves/${id}`);
    return res.data.data;
  },
};

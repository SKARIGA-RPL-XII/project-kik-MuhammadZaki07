import { apiClient } from "@/lib/apiClient";

export interface LeaveRequest {
  type: string;
  start_date: string;
  end_date: string;
  reason: string;
  proof_file: File;
}

export const leaveService = {
  getAllLeaves: async () => {
    const res = await apiClient.get("/leaves");
    return res.data.data;
  },

  getMyLeaves: async () => {
    const res = await apiClient.get("/leaves/me");
    return res.data.data;
  },

  createLeave: async (data: LeaveRequest) => {
    const formData = new FormData();
    formData.append("type", data.type);
    formData.append("start_date", data.start_date);
    formData.append("end_date", data.end_date);
    formData.append("reason", data.reason);
    formData.append("proof_file", data.proof_file);

    const res = await apiClient.post("/leaves", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  approveLeave: async (id: number, status: "approved" | "rejected", reason?: string) => {
    const res = await apiClient.post(`/leaves/${id}/approve`, {
      status,
      rejected_reason: reason,
    });
    return res.data;
  },
};
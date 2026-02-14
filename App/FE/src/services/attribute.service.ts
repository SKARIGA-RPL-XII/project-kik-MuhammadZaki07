import { apiClient } from "../lib/apiClient";

export interface Attribute {
  id: number;
  name: string;
  levels: { id: number; name: string }[];
}

export class AttributeService {
  static async getAttributes() {
    try {
      const res = await apiClient.get("/attributes");
      return { data: res.data.data as Attribute[], error: null };
    } catch (err: any) {
      return {
        data: null,
        error: err?.response?.data?.message || "Failed to fetch attributes",
      };
    }
  }

  static async createAttribute(name: string, levels: { name: string }[] = []) {
    try {
      const res = await apiClient.post("/attributes", { name, levels });
      return { data: res.data.data as Attribute, error: null };
    } catch (err: any) {
      return {
        data: null,
        error: err?.response?.data?.message || "Failed to create attribute",
      };
    }
  }

  static async updateAttribute(
    id: number,
    name?: string,
    levels?: { id?: number; name: string }[],
  ) {
    try {
      const res = await apiClient.put(`/attributes/${id}`, { name, levels });
      return { data: res.data.data as Attribute, error: null };
    } catch (err: any) {
      return {
        data: null,
        error: err?.response?.data?.message || "Failed to update attribute",
      };
    }
  }

  static async deleteAttribute(id: number) {
    try {
      const res = await apiClient.delete(`/attributes/${id}`);
      return { data: res.data.data, error: null };
    } catch (err: any) {
      return {
        data: null,
        error: err?.response?.data?.message || "Failed to delete attribute",
      };
    }
  }
}

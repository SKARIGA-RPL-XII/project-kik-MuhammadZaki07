import { apiClient } from "@/lib/apiClient";

export interface Supplier {
  id: number;
  name: string;
  contact_person: string;
  phone: string;
  address: string;
  is_active: boolean;
  created_at: string;
}

class SupplierService {
  private readonly endpoint = "/suppliers";

  async getAll(page = 0, size = 10, search = "") {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      search,
    });
    const res = await apiClient.get(`${this.endpoint}?${params}`);
    return res.data;
  }

  async create(data: Omit<Supplier, "id" | "created_at">) {
    const res = await apiClient.post(this.endpoint, data);
    return res.data;
  }

  async update(id: number, data: Partial<Supplier>) {
    const res = await apiClient.put(`${this.endpoint}/${id}`, data);
    return res.data;
  }

  async delete(id: number) {
    const res = await apiClient.delete(`${this.endpoint}/${id}`);
    return res.data;
  }
}

export const supplierService = new SupplierService();

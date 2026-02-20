import { Stock, Metadata } from "@/pages/inventory/StockPage";

const API_URL = import.meta.env.VITE_API_URL || "/api";

export interface StockResponse {
  status: string;
  message: string;
  data: Stock[];
  metadata: Metadata;
}

export interface SingleStockResponse {
  status: string;
  message: string;
  data: Stock;
}

export const stockService = {
  getAll: async (page: number = 0, size: number = 10, search: string = ""): Promise<StockResponse> => {
    const response = await fetch(`${API_URL}/stocks?page=${page}&size=${size}&search=${search}`, {
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      }
    });
    if (!response.ok) throw new Error("Failed to fetch stocks");
    return response.json();
  },

  create: async (data: Omit<Stock, "id">): Promise<SingleStockResponse> => {
    const response = await fetch(`${API_URL}/stocks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to create stock");
    return response.json();
  },

  update: async (id: number, data: Partial<Stock>): Promise<SingleStockResponse> => {
    const response = await fetch(`${API_URL}/stocks/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to update stock");
    return response.json();
  },

  delete: async (id: number): Promise<{ status: string; message: string }> => {
    const response = await fetch(`${API_URL}/stocks/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      }
    });
    if (!response.ok) throw new Error("Failed to delete stock");
    return response.json();
  }
};
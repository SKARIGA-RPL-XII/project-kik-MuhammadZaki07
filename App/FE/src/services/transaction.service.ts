import { apiClient } from "../lib/apiClient";

export interface TransactionItemPayload {
  menu_id: number;
  qty: number;
}

export interface CreateTransactionPayload {
  table_id: number;
  payment_method?: "cash" | "ewallet";
  items: TransactionItemPayload[];
}

export interface CashPaymentPayload {
  amount_paid: number;
}

export class TransactionService {
  static async getAll(params?: {
    order_source?: string;
    search?: string;
    page?: number;
  }) {
    try {
      const res = await apiClient.get("/transactions", { params });
      return {
        data: res.data.data,
        error: null,
      };
    } catch (err: any) {
      return {
        data: null,
        error: err?.response?.data?.message || "Failed to fetch transactions",
      };
    }
  }

  static async create(payload: CreateTransactionPayload) {
    try {
      const res = await apiClient.post("/transactions", payload);
      return {
        data: res.data,
        error: null,
      };
    } catch (err: any) {
      return {
        data: null,
        error:
          err?.response?.data?.message ||
          err?.response?.data?.errors ||
          "Failed to create transaction",
      };
    }
  }

  static async getById(transactionId: number) {
    try {
      const res = await apiClient.get(`/transactions/${transactionId}`);
      return {
        data: res.data.data,
        error: null,
      };
    } catch (err: any) {
      return {
        data: null,
        error: err?.response?.data?.message || "Failed to fetch transaction",
      };
    }
  }

  static async updateStatus(transactionId: number, status: string) {
    try {
      const res = await apiClient.patch(
        `/transactions/${transactionId}/status`,
        { status },
      );
      return {
        data: res.data.data,
        error: null,
      };
    } catch (err: any) {
      return {
        data: null,
        error: err?.response?.data?.message || "Failed to update status",
      };
    }
  }

  static async getSnapToken(id: number) {
    try {
      const res = await apiClient.get(`/transactions/${id}/snap-token`);
      return { data: res.data, error: null };
    } catch (err: any) {
      return {
        data: null,
        error: err?.response?.data?.message || "Failed to get payment token",
      };
    }
  }

  static async payCash(transactionId: number, payload: CashPaymentPayload) {
    try {
      const res = await apiClient.put(
        `/transactions/${transactionId}`,
        payload,
      );
      return {
        data: res.data.data,
        error: null,
      };
    } catch (err: any) {
      return {
        data: null,
        error:
          err?.response?.data?.message ||
          err?.response?.data?.errors ||
          "Payment failed",
      };
    }
  }

  static async getDashboardStats() {
    try {
      const res = await apiClient.get("/transactions/statistics");
      return {
        data: res.data.data,
        error: null,
      };
    } catch (err: any) {
      return {
        data: null,
        error: err?.response?.data?.message || "Failed to fetch statistics",
      };
    }
  }

  static async getTransactionDetail(id: string | number) {
    try {
      const res = await apiClient.get(`/transaction-details/show/${id}`);
      return {
        data: res.data,
        error: null,
      };
    } catch (err: any) {
      return {
        data: null,
        error: err?.response?.data?.message || "Failed to fetch detail",
      };
    }
  }
}

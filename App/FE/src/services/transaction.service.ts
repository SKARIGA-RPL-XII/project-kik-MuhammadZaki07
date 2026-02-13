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
  static async create(payload: CreateTransactionPayload) {
    try {
      const res = await apiClient.post("/transactions", payload);
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
        error:
          err?.response?.data?.message ||
          "Failed to fetch transaction",
      };
    }
  }

  static async payCash(
    transactionId: number,
    payload: CashPaymentPayload
  ) {
    try {
      const res = await apiClient.put(
        `/transactions/${transactionId}`,
        payload
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
}

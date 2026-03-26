import { apiClient } from "@/lib/apiClient";

export interface DashboardMetrics {
  income_today: number;
  income_month: number;
  total_transactions_today: number;
  low_stock_count: number;
}

export interface SalesChartData {
  date: string;
  total: number;
}

export interface BestSeller {
  menu_id: number;
  total_sold: number;
  menu: {
    id: number;
    name: string;
    menu_image: string;
  };
}

export interface TransactionStatus {
  status: string;
  count: number;
}

export interface Transaction {
  id: number;
  invoice_number: string;
  total_price: number;
  status: "paid" | "pending" | "canceled";
  created_at: string;
  user_id: number;
}

class DashboardService {
  async getMetrics(): Promise<DashboardMetrics> {
    const response = await apiClient.get<{ data: DashboardMetrics }>(
      "/dashboard/metrics",
    );
    return response.data.data;
  }

  async getSalesChart(
    filter?: string,
    dateRange?: string,
  ): Promise<SalesChartData[]> {
    const response = await apiClient.get<{ data: SalesChartData[] }>(
      "/dashboard/sales-chart",
      {
        params: {
          filter: filter,
          date_range: dateRange,
        },
      },
    );
    return response.data.data;
  }

  async getBestSellers(): Promise<BestSeller[]> {
    const response = await apiClient.get<{ data: BestSeller[] }>(
      "/dashboard/best-sellers",
    );
    return response.data.data;
  }

  async getTransactionStats(): Promise<TransactionStatus[]> {
    const response = await apiClient.get<{ data: TransactionStatus[] }>(
      "/dashboard/transaction-stats",
    );
    return response.data.data;
  }

  async getLatestTransactions(): Promise<Transaction[]> {
    const response = await apiClient.get<{ data: Transaction[] }>(
      "/dashboard/latest-transactions",
    );
    return response.data.data;
  }
}

const dashboardService = new DashboardService();
export default dashboardService;

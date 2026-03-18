import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PageMeta from "@/components/common/PageMeta";
import { TransactionHistoryTable } from "@/components/tables/TransactionHistoryTable";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { StatCardsContainer } from "@/components/ui/StatCardsContainer";
import { useTransaction } from "@/hooks/react-query/useTransaction";
import { useTransactionDetail } from "@/hooks/react-query/useTransactionDetail";
import useDebounce from "@/hooks/useDebounce";
import { Download, Loader2, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";

export default function TransactionHistoryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || "",
  );
  const debouncedSearch = useDebounce(searchTerm, 500);

  const currentPage = Number(searchParams.get("page")) || 1;
  const currentTime = searchParams.get("time") || "";

  const { useGetDetails } = useTransactionDetail();
  const { useGetDashboardStats, exportTransactions, loadingExport } =
    useTransaction();

  const { data: dataStatistik, isLoading: loadingStats } =
    useGetDashboardStats();

  const { data: transactionsData, isLoading: loadingTable } = useGetDetails({
    search: debouncedSearch,
    filter_time: currentTime as any,
    page: currentPage,
    size: 15,
  });
  const transactions = transactionsData?.data || [];

  useEffect(() => {
    const newParams = new URLSearchParams(searchParams);
    if (debouncedSearch) {
      newParams.set("search", debouncedSearch);
    } else {
      newParams.delete("search");
    }
    newParams.set("page", "1");
    setSearchParams(newParams);
  }, [debouncedSearch]);

  const updateParam = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set(key, value);
    if (key !== "page") newParams.set("page", "1");
    setSearchParams(newParams);
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto font-sans min-h-screen">
      <PageMeta
        title="Reports | Gagal-Lapar"
        description="Monitor business performance and transaction growth."
      />
      <PageBreadcrumb pageTitle="Reports" />

      <Card className="px-5 pt-5 shadow-none border flex flex-col gap-2">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-1.5 mb-4">
              <h1 className="text-2xl font-bold tracking-tight text-neutral-800 dark:text-white/90">
                Statistik Laporan Penjualan
              </h1>
              <p className="text-sm font-normal text-neutral-500 dark:text-neutral-400">
                Analisis komprehensif performa bisnis dan pertumbuhan transaksi
                real-time.
              </p>
            </div>
        </div>
        <StatCardsContainer stats={dataStatistik} loading={loadingStats} />
      </Card>

      <Separator />

      <div className="flex items-center gap-3">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
            size={15}
          />
          <Input
            placeholder="Search items, tables..."
            className="pl-9 w-72 h-10 rounded-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          className="h-10 px-4 border bg-white dark:bg-neutral-950 rounded-lg text-xs font-medium outline-none cursor-pointer hover:bg-neutral-50"
          value={currentTime}
          onChange={(e) => updateParam("time", e.target.value)}
        >
          <option value="">All Periods</option>
          <option value="today">Today</option>
          <option value="this_week">This Week</option>
          <option value="this_month">This Month</option>
        </select>

        <Button
          onClick={() => exportTransactions()}
          disabled={loadingExport}
          variant="outline"
          className="flex items-center dark:bg-neutral-950 gap-2 h-10 px-4 text-emerald-600 shadow-none"
        >
          {loadingExport ? (
            <Loader2 className="animate-spin" size={16} />
          ) : (
            <Download size={16} />
          )}
          {loadingExport ? "Processing..." : "Export All Data"}
        </Button>
      </div>

      <TransactionHistoryTable
        details={transactions}
        loading={loadingTable}
        meta={transactionsData}
        currentPage={currentPage}
        onPageChange={(page) => updateParam("page", page.toString())}
      />
    </div>
  );
}

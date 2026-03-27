import React, { useState, useEffect, useRef } from "react";
import { useSettings } from "@/context/SettingsContext";
import ExcelJS from "exceljs";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { saveAs } from "file-saver";
import { useTransactionExplorer } from "@/hooks/react-query/useReports";
import {
  Calendar as CalendarIcon,
  FileDown,
  FileSpreadsheet,
  RotateCcw,
  Search,
  Loader2,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import PageMeta from "@/components/common/PageMeta";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { useEmployes } from "@/hooks/react-query/useEmploye";
import { Input } from "@/components/ui/input";

export default function ReportExplorerPage() {
  const { settings } = useSettings();
  const datePickerRef = useRef<HTMLInputElement>(null);
  const [page, setPage] = useState(1);

  const [filters, setFilters] = useState({
    start_date: new Date().toISOString().split("T")[0],
    end_date: new Date().toISOString().split("T")[0],
    cashier_id: "",
    payment_method: "",
    min_amount: "",
    max_amount: "",
  });

  const { data: employeeRes } = useEmployes();

  const employees = employeeRes?.employes || [];
  const cashierOptions = employees.filter(
    (emp: any) => emp.user !== null && emp.user.role?.name === "cashier",
  );

  const { data: response, isLoading } = useTransactionExplorer({
    ...filters,
    page,
    per_page: 10,
  });

  const transactions = response?.data || [];
  const meta = response?.meta;
  const summary = response?.summary;

  useEffect(() => {
    if (!datePickerRef.current) return;

    const fp = flatpickr(datePickerRef.current, {
      mode: "range",
      static: true,
      monthSelectorType: "static",
      dateFormat: "Y-m-d",
      defaultDate: [filters.start_date, filters.end_date],
      onClose: (selectedDates) => {
        if (selectedDates.length === 2) {
          const start = selectedDates[0].toISOString().split("T")[0];
          const end = selectedDates[1].toISOString().split("T")[0];
          setPage(1);
          setFilters((prev) => ({ ...prev, start_date: start, end_date: end }));
        }
      },
    });

    return () => {
      if (fp && typeof fp.destroy === "function") fp.destroy();
    };
  }, []);

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setPage(1);
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const resetFilters = () => {
    setPage(1);
    setFilters({
      start_date: new Date().toISOString().split("T")[0],
      end_date: new Date().toISOString().split("T")[0],
      cashier_id: "",
      payment_method: "",
      min_amount: "",
      max_amount: "",
    });
  };

  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Transaction Report");
    worksheet.columns = [
      { header: "Waktu", key: "time", width: 25 },
      { header: "No. Nota", key: "id", width: 15 },
      { header: "Kasir", key: "cashier", width: 20 },
      { header: "Metode", key: "method", width: 15 },
      { header: "Total", key: "total", width: 20 },
    ];
    transactions.forEach((trx: any) => {
      worksheet.addRow({
        time: new Date(trx.transaction_date || trx.created_at).toLocaleString(),
        id: `#${trx.id}`,
        cashier: trx.user?.username || "Sistem",
        method: trx.payment_method?.toUpperCase(),
        total: Number(trx.total_amount),
      });
    });
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `Audit_GagalLapar_${filters.start_date}.xlsx`);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const tableColumn = ["Waktu", "No. Nota", "Kasir", "Metode", "Total"];
    const tableRows = transactions.map((trx: any) => [
      new Date(trx.transaction_date || trx.created_at).toLocaleString("id-ID"),
      `#${trx.id}`,
      trx.user?.username || "Sistem",
      trx.payment_method?.toUpperCase(),
      `${settings?.currency_symbol || "Rp"} ${Number(trx.total_amount).toLocaleString()}`,
    ]);

    doc.setFontSize(18);
    doc.text("Laporan Audit Transaksi", 14, 15);
    doc.setFontSize(10);
    doc.text(`Periode: ${filters.start_date} s/d ${filters.end_date}`, 14, 22);

    autoTable(doc, {
      startY: 30,
      head: [tableColumn],
      body: tableRows,
      theme: "grid",
      headStyles: { fillColor: [220, 38, 38] },
    });

    doc.save(`Audit_Sales_${filters.start_date}.pdf`);
  };

  return (
    <div className="p-6 bg-white dark:bg-neutral-900 min-h-screen">
      <PageMeta
        title="Audit Transaksi | Gagal-Lapar"
        description="Filter dan audit data transaksi."
      />
      <PageBreadcrumb pageTitle="Transaction Explorer" />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mt-6 mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800 dark:text-white">
            Audit Transaksi
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Pantau setiap rupiah yang masuk dengan filter presisi.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportToPDF}
            disabled={transactions.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-lg text-sm font-medium hover:bg-neutral-200 transition-all disabled:opacity-50"
          >
            <FileDown size={18} /> Export PDF
          </button>
          <button
            onClick={exportToExcel}
            disabled={transactions.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-all disabled:opacity-50 shadow-sm shadow-emerald-200 dark:shadow-none"
          >
            <FileSpreadsheet size={18} /> Export Excel
          </button>
        </div>
      </div>

      <div className="bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-100 dark:border-white/[0.05] rounded-xl p-6 mb-8">
        <div className="flex items-center gap-2 mb-4 text-neutral-800 dark:text-neutral-200 font-semibold">
          <Filter size={18} className="text-red-500" />
          <span>Filter Pencarian</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-neutral-400">
              Rentang Waktu
            </label>
            <div className="relative flex items-center">
              <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-neutral-400 pointer-events-none z-10" />
              <input
                ref={datePickerRef}
                className="w-full h-10 pl-10 pr-3 py-2 rounded-lg border border-neutral-200 bg-white text-sm font-medium text-neutral-700 outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 cursor-pointer"
                placeholder="Pilih Tanggal"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-neutral-400">
              Metode Bayar
            </label>
            <select
              name="payment_method"
              value={filters.payment_method}
              onChange={handleFilterChange}
              className="w-full h-10 px-3 rounded-lg border border-neutral-200 bg-white text-sm font-medium text-neutral-700 outline-none focus:ring-2 focus:ring-red-500/20 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300"
            >
              <option value="">Semua Metode</option>
              <option value="cash">Tunai (Cash)</option>
              <option value="qris">QRIS</option>
              <option value="va">Transfer Bank</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-neutral-400">
              Pilih Kasir
            </label>
            <select
              name="cashier_id"
              value={filters.cashier_id}
              onChange={handleFilterChange}
              className="w-full h-10 px-3 rounded-lg border border-neutral-200 bg-white text-sm font-medium text-neutral-700 outline-none focus:ring-2 focus:ring-red-500/20 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 cursor-pointer"
            >
              <option value="">Semua Kasir</option>
              {cashierOptions.map((emp: any) => (
                <option key={emp.id} value={emp.user.id}>
                  {emp.user.username || emp.no_induk}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-neutral-400">
              Min. Nominal
            </label>
            <Input
              name="min_amount"
              type="number"
              placeholder="Rp 0"
              value={filters.min_amount}
              onChange={handleFilterChange}
            />
          </div>

          <div className="flex items-end pb-0.5">
            <button
              onClick={resetFilters}
              className="flex items-center justify-center gap-2 w-full h-10 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all"
            >
              <RotateCcw size={16} /> Reset Filter
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-6 items-center mb-6 px-2">
        <div className="flex flex-col">
          <span className="text-[12px] text-neutral-400 font-medium">
            TOTAL TRANSAKSI
          </span>
          <span className="text-sm font-bold dark:text-white">
            {summary?.total_count || 0} Nota
          </span>
        </div>
        <div className="w-px h-8 bg-neutral-200 dark:bg-neutral-700"></div>
        <div className="flex flex-col">
          <span className="text-[12px] text-neutral-400 font-medium">
            TOTAL NILAI
          </span>
          <span className="text-sm font-bold text-emerald-600">
            {settings?.currency_symbol}{" "}
            {Number(summary?.total_amount || 0).toLocaleString()}
          </span>
        </div>
      </div>

      <div className="bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-white/[0.05] rounded-lg overflow-hidden shadow-none">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50 dark:bg-neutral-900/50 text-[13px] text-neutral-400">
                <th className="p-4 border-b border-neutral-100 dark:border-neutral-700 font-medium">
                  Waktu Transaksi
                </th>
                <th className="p-4 border-b border-neutral-100 dark:border-neutral-700 font-medium">
                  ID Nota
                </th>
                <th className="p-4 border-b border-neutral-100 dark:border-neutral-700 font-medium">
                  Kasir
                </th>
                <th className="p-4 border-b border-neutral-100 dark:border-neutral-700 font-medium text-center">
                  Metode
                </th>
                <th className="p-4 border-b border-neutral-100 dark:border-neutral-700 font-medium text-right">
                  Total Bayar
                </th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-20 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Loader2
                        className="animate-spin text-red-500"
                        size={32}
                      />
                      <span className="text-neutral-400 font-medium italic">
                        Mengambil data transaksi...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : transactions.length > 0 ? (
                transactions.map((trx: any) => (
                  <tr
                    key={trx.id}
                    className="group hover:bg-neutral-50 dark:hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="p-4 border-b border-neutral-100 dark:border-neutral-700 text-neutral-500 tabular-nums">
                      {new Date(
                        trx.transaction_date || trx.created_at,
                      ).toLocaleString("id-ID")}
                    </td>
                    <td className="p-4 border-b border-neutral-100 dark:border-neutral-700 font-bold text-neutral-800 dark:text-neutral-200">
                      #{trx.id}
                    </td>
                    <td className="p-4 border-b border-neutral-100 dark:border-neutral-700">
                      <div className="flex flex-col">
                        <span className="font-medium text-neutral-700 dark:text-neutral-300">
                          {trx.user?.username || "Sistem"}
                        </span>
                        <span className="text-[10px] text-neutral-400">
                          ID: {trx.user_id}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 border-b border-neutral-100 dark:border-neutral-700 text-center">
                      <span
                        className={`px-3 py-1 rounded-lg text-[10px] font-blacker ${
                          trx.payment_method === "cash"
                            ? "bg-orange-50 text-orange-600 dark:bg-orange-500/10"
                            : trx.payment_method === "qris"
                              ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10"
                              : "bg-purple-50 text-purple-600 dark:bg-purple-500/10"
                        }`}
                      >
                        {trx.payment_method}
                      </span>
                    </td>
                    <td className="p-4 border-b border-neutral-100 dark:border-neutral-700 text-right font-bold text-neutral-900 dark:text-white tabular-nums">
                      {settings?.currency_symbol}{" "}
                      {Number(trx.total_amount).toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-20 text-center">
                    <div className="flex flex-col items-center gap-2 opacity-30">
                      <Search size={48} />
                      <span className="text-sm font-medium">
                        Tidak ada transaksi yang cocok dengan filter.
                      </span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between mt-6 px-1">
        <p className="text-sm text-neutral-500 font-medium">
          Showing {transactions.length} of {meta?.total || 0} items (Page{" "}
          {meta?.current_page || 1} of {meta?.last_page || 1})
        </p>

        <div className="flex gap-2">
          <button
            disabled={page === 1 || isLoading}
            onClick={() => setPage((p) => p - 1)}
            className="px-4 py-2 text-sm font-medium border border-neutral-200 dark:border-neutral-700 rounded-lg disabled:opacity-30 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300"
          >
            Prev
          </button>

          <button
            disabled={page === meta?.last_page || isLoading}
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 text-sm font-medium border border-neutral-200 dark:border-neutral-700 rounded-lg disabled:opacity-30 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

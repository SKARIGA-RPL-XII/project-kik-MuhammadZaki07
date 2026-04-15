import { Globe, CalendarDays, User, Printer } from "lucide-react";
import Badge from "@/components/ui/badge/Badge";
import { useNavigate, useParams } from "react-router";
import { useTransactionDetail } from "@/hooks/react-query/useTransactionDetail";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/utils/dateHelper";
import PageMeta from "@/components/common/PageMeta";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { TransactionDetailSkeleton } from "@/components/skeleton/TransactionDetailSkeleton";

export default function TransactionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { useShowDetail } = useTransactionDetail();

  const { data, isLoading } = useShowDetail(id!);
  const detail = data?.data?.data;
  const transaction = detail?.transaction;

  if (isLoading) return <TransactionDetailSkeleton/>

  if (!detail || !transaction)
    return (
      <div className="p-20 text-center text-neutral-500 dark:text-neutral-300">
        Transaction not found.
      </div>
    );

  return (
    <div className="space-y-6 font-sans">
      <PageMeta
        title="Detail Transaksi Penjualan | Sistem Manajemen Restoran"
        description="Laporan detail rincian transaksi penjualan, informasi pelanggan, dan status pembayaran pada aplikasi Gagal-Lapar."
      />
      <PageBreadcrumb pageTitle="Detail Transaksi" />

      <Card className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-6 shadow-none border bg-white dark:bg-neutral-900">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-300">
                #{transaction.transaction_code}
              </h2>
              <Badge color="success">{transaction.status}</Badge>
            </div>

            <div className="flex flex-col gap-1.5 pt-1">
              <div className="flex items-center gap-2 text-neutral-500">
                <CalendarDays size={16} className="text-red-500 shrink-0" />
                <span className="text-sm font-medium dark:text-neutral-300">
                  {formatDate(transaction.created_at, true)}
                </span>
              </div>

              <div className="flex items-center gap-2 text-neutral-400">
                <User size={16} className="text-red-500 shrink-0" />
                <span className="text-[12px] dark:text-neutral-300">
                  Oleh:{" "}
                  <span className="font-medium dark:text-neutral-300 text-neutral-600">
                    {transaction.cashier?.username || "System"}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:flex items-center gap-3">
          <a
            href={`/invoice/${transaction.id}`}
            target="_blank"
            className="w-full rounded-lg sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-red-600 text-white text-sm hover:bg-red-700 transition-all"
          >
            <Printer size={16} />
            View Nota
          </a>
          <Button
            variant="secondary"
            onClick={() => navigate(-1)}
            className="w-full rounded-lg dark:bg-neutral-900 sm:w-auto flex items-center justify-center gap-2 px-6 h-10 text-sm transition-all"
          >
            Back
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border p-6 shadow-none">
            <h3 className="text-2xl font-bold text-neutral-800 dark:text-neutral-300 mb-6">
              Order Details
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[12px] text-neutral-400 border-b">
                    <th className="pb-4 font-medium">Product</th>
                    <th className="pb-4 font-medium text-center">Quantity</th>
                    <th className="pb-4 font-medium text-right">Unit Cost</th>
                    <th className="pb-4 font-medium text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-50">
                  <tr className="text-sm">
                    <td className="py-5">
                      <div className="flex items-start gap-3">
                        <div className="w-13 h-13 bg-neutral-100 rounded-md flex-shrink-0 flex items-center justify-center overflow-hidden border">
                          <img
                            src={detail.menu_image ? `${import.meta.env.VITE_STORAGE_URL}/${detail.menu.menu_image}` : "/image-dumy.png"}
                            alt={detail.menu?.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-neutral-800 dark:text-neutral-300 leading-none mb-1">
                            {detail.menu?.name}
                          </span>

                          {detail.menu?.attributes &&
                            detail.menu.attributes.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {detail.menu.attributes.map(
                                  (attr: any, index: number) => (
                                    <span
                                      key={`${attr.id}-${index}`}
                                      className="text-xs font-normal bg-neutral-50 dark:bg-neutral-800 text-neutral-400 border px-1.5 py-0.5 rounded"
                                    >
                                      {attr.name}
                                    </span>
                                  ),
                                )}
                              </div>
                            )}
                        </div>
                      </div>
                    </td>
                    <td className="py-5 text-center text-neutral-600 dark:text-neutral-300 font-medium">
                      {detail.menu_qty}
                    </td>
                    <td className="py-5 text-right text-neutral-600 dark:text-neutral-300 font-medium">
                      Rp{Number(detail.price).toLocaleString("id-ID")}
                    </td>
                    <td className="py-5 text-right font-bold text-neutral-800 dark:text-neutral-300">
                      Rp{Number(detail.subtotal).toLocaleString("id-ID")}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-8 flex justify-end">
              <div className="w-full max-w-xs space-y-3">
                <div className="flex justify-between text-sm text-neutral-500 dark:text-neutral-300">
                  <span>Sub Total</span>
                  <span className="font-semibold text-neutral-800 dark:text-neutral-300 font-mono">
                    Rp{Number(transaction.total_amount).toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-neutral-500 dark:text-neutral-300">
                  <span>Vat (11%)</span>
                  <span className="font-semibold text-neutral-800 dark:text-neutral-300 font-mono">
                    Included
                  </span>
                </div>
                <div className="flex justify-between text-lg pt-3 border-t">
                  <span className="font-bold text-neutral-800 dark:text-neutral-300">Total</span>
                  <span className="font-black text-red-600 font-mono">
                    Rp{Number(transaction.total_amount).toLocaleString("id-ID")}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border p-6 shadow-none">
            <h3 className="text-lg font-bold text-neutral-800 dark:text-neutral-300 mb-6">
              Customer Details
            </h3>
            <div className="space-y-5">
              <div className="flex justify-between items-start gap-4">
                <span className="text-sm text-neutral-400 font-medium">
                  Name
                </span>
                <span className="text-sm font-bold text-neutral-800 dark:text-neutral-300 text-right">
                  {transaction.customer_name ?? "-"}
                </span>
              </div>
              <div className="flex justify-between items-start gap-4">
                <span className="text-sm text-neutral-400 font-medium">
                  Email
                </span>
                <span className="text-sm font-bold text-neutral-800 dark:text-neutral-300 text-right break-all">
                  {transaction.user?.email || "-"}
                </span>
              </div>
              <div className="flex justify-between items-start gap-4">
                <span className="text-sm text-neutral-400 font-medium">
                  Phone
                </span>
                <span className="text-sm font-bold text-neutral-800 dark:text-neutral-300 text-right">
                  {transaction.user?.no_tlp || "-"}
                </span>
              </div>
              <div className="flex justify-between items-start gap-4">
                <span className="text-sm text-neutral-400 font-medium">
                  Source
                </span>
                <span className="text-sm font-bold text-neutral-800 dark:text-neutral-300 text-right uppercase tracking-tighter">
                  {transaction.order_source}
                </span>
              </div>
              <div className="flex justify-between items-start gap-4">
                <span className="text-sm text-neutral-400 font-medium">
                  Address
                </span>
                <span className="text-sm font-bold text-neutral-800 dark:text-neutral-300 text-right leading-relaxed">
                  {transaction.user?.addres || "-"}
                </span>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t">
              <div className="flex items-center">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-neutral-400">
                    Served By
                  </span>
                  <span className="text-sm font-bold text-neutral-800 dark:text-neutral-300 mt-0.5">
                    {transaction.cashier?.username || "System Auto"}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 shadow-none border">
            <h3 className="text-sm font-medium text-neutral-400 mb-5">
              Payment Method
            </h3>

            <div className="relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-16 h-16 bg-red-500/5 dark:bg-neutral-900 rounded-full blur-2xl group-hover:bg-red-500/10 dark:group-hover:bg-neutral-500/10 transition-colors" />

              <div className="p-4 bg-white dark:bg-neutral-900 border rounded flex items-center justify-between hover:border-red-100 dark:border hover:bg-red-50/30 transition-all duration-300">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center border overflow-hidden">
                    {transaction.payment_method === "midtrans" ? (
                      <img
                        src="/images/brand/mitrands.png"
                        alt="Midtrans"
                        className="w-full h-full object-contain transition-all"
                      />
                    ) : (
                      <Globe size={20} className="text-neutral-400" />
                    )}
                  </div>

                  <div className="flex flex-col">
                    <span className="text-xs text-neutral-400 uppercase tracking-widest leading-none">
                      Provider
                    </span>
                    <span className="text-sm text-neutral-800 dark:text-neutral-300 uppercase mt-1.5 tracking-tight">
                      {transaction.payment_method || "Manual Transfer"}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100">
                    <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold">Secure</span>
                  </div>
                </div>
              </div>
            </div>

            <p className="mt-4 text-[11px] text-neutral-400 leading-relaxed italic">
              *Pembayaran diproses secara otomatis melalui sistem enkripsi{" "}
              {transaction.payment_method}.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}

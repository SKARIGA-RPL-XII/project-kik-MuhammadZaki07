import { useSettings } from "@/context/SettingsContext";
import { useTopSelling } from "@/hooks/react-query/useReports";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import Badge from "../../components/ui/badge/Badge";
import { Loader2 } from "lucide-react";
import { Link } from "react-router";
import PageMeta from "@/components/common/PageMeta";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";

export default function TopSellingPage() {
  const { data: response, isLoading } = useTopSelling(10);
  const { settings } = useSettings();
  const topMenus = response?.data || [];

  return (
    <div className="p-6 bg-white dark:bg-neutral-900 min-h-screen">
      <PageMeta 
        title="Laporan Menu Terlaris | Gagal-Lapar Management" 
        description="Analisis performa penjualan menu tertinggi berdasarkan volume transaksi dan pendapatan operasional." 
      />
      <PageBreadcrumb pageTitle="Top Selling Menus" />

      <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-neutral-100 dark:border-white/[0.05]">
              <TableRow>
                <TableHead className="px-5 py-3 text-start text-theme-xs font-medium text-neutral-500 uppercase">
                  Menu
                </TableHead>
                <TableHead className="px-5 py-3 text-center text-theme-xs font-medium text-neutral-500 uppercase">
                  Terjual
                </TableHead>
                <TableHead className="px-5 py-3 text-end text-theme-xs font-medium text-neutral-500 uppercase">
                  Pendapatan
                </TableHead>
                <TableHead className="px-5 py-3 text-start text-theme-xs font-medium text-neutral-500 uppercase">
                  Status Stok
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-neutral-100 dark:divide-white/[0.05]">
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-10 text-neutral-500">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="animate-spin" size={18} />
                      <span>Menganalisa data...</span>
                    </div>
                  </TableCell>
                </TableRow>
              )}

              {!isLoading && topMenus.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="py-10 text-center">
                    <span className="text-neutral-400">Belum ada data penjualan</span>
                  </TableCell>
                </TableRow>
              )}

              {!isLoading &&
                topMenus.map((item: any, index: number) => (
                  <TableRow key={index} className="hover:bg-neutral-50 dark:hover:bg-white/[0.02] transition-colors">
                    <TableCell className="px-5 py-4">
                      <Link to={`/menu/show/${item.menu.id}`}>
                      </Link>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-neutral-100 dark:bg-neutral-800 overflow-hidden border border-neutral-200 dark:border-white/[0.05]">
                          <img 
                            src={`${import.meta.env.VITE_STORAGE_URL}/${item.menu.menu_image}`} 
                            className="w-full h-full object-cover"
                            alt={item.menu.name}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "https://placehold.co/100x100?text=Food";
                            }}
                          />
                        </div>
                        <div>
                          <p className="font-medium text-neutral-800 dark:text-white/90">
                            {item.menu.name}
                          </p>
                          <p className="text-[11px] text-neutral-400">
                            {item.menu.category?.name || "No Category"}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="px-5 py-4 text-center">
                      <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                        {item.total_sold}
                      </span>
                      <span className="ml-1 text-[11px] text-neutral-400 font-normal italic">porsi</span>
                    </TableCell>

                    <TableCell className="px-5 py-4 text-end">
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 text-theme-sm">
                        {settings?.currency_symbol || "Rp"} {Number(item.total_revenue).toLocaleString()}
                      </span>
                    </TableCell>

                    <TableCell className="px-5 py-4">
                      <div className="flex flex-col gap-1.5 min-w-[120px]">
                        <div className="flex justify-between items-center text-[10px]">
                           <Badge variant="light" color={item.menu.calculated_stock <= (settings?.low_stock_threshold || 10) ? "error" : "success"}>
                              {item.menu.calculated_stock} Porsi
                           </Badge>
                        </div>
                        <div className="h-1.5 w-full bg-neutral-100 dark:bg-white/[0.05] rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-700 ${
                              item.menu.calculated_stock <= (settings?.low_stock_threshold || 10) ? 'bg-red-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.min((item.menu.calculated_stock / 50) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
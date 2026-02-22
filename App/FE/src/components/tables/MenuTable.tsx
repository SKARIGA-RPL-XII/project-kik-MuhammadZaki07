import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import Badge from "../ui/badge/Badge";
import { MenuService } from "../../services/menu.service";
import { Eye, Loader2, Pencil, Trash2 } from "lucide-react";
import { Link } from "react-router";
import { formatCurrency } from "@/lib/currency";
import DeleteAlertDialog from "@/components/dialog/DeleteAlertDialog";
import { ActionGuard } from "../guard/ActionGuard";

interface MenuTableProps {
  menus: any[];
  loading: boolean;
  onRefresh: () => void;
}

export default function MenuTable({
  menus,
  loading,
  onRefresh,
}: MenuTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-b border-neutral-100 dark:text-white dark:border-white/[0.05]">
            <TableRow>
              <TableHead className="px-5 py-3 text-theme-xs text-start font-bold">
                Menu
              </TableHead>
              <TableHead className="px-5 py-3 text-theme-xs text-start font-bold">
                Price
              </TableHead>
              <TableHead className="px-5 py-3 text-theme-xs text-start font-bold">
                Discount
              </TableHead>
              <TableHead className="px-5 py-3 text-theme-xs text-start font-bold">
                Ingredients (Stocks)
              </TableHead>
              <TableHead className="px-5 py-3 text-theme-xs text-start font-bold">
                Status
              </TableHead>
              <TableHead className="px-5 py-3 text-theme-xs text-start font-bold">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-neutral-100 dark:divide-white/[0.05] relative">
            {loading && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-10 text-neutral-500"
                >
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="animate-spin" size={18} />
                    <span>Loading data...</span>
                  </div>
                </TableCell>
              </TableRow>
            )}

            {!loading && menus.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10">
                  <span className="text-neutral-400">No menu data found</span>
                </TableCell>
              </TableRow>
            )}

            {!loading &&
              menus.map((menu) => {
                const hasDiscount = menu.discount && menu.discount.is_active;
                const discountValue = hasDiscount ? menu.discount.value_discount : 0;
                
                const finalPrice = hasDiscount
                  ? menu.price * (1 - discountValue / 100)
                  : menu.price;

                return (
                  <TableRow key={menu.id} className="hover:bg-neutral-50/50 dark:hover:bg-white/[0.02] transition-colors">
                    <TableCell className="px-5 py-4 text-start">
                      <div className="flex items-center gap-3">
                        <img
                          src={`${import.meta.env.VITE_STORAGE_URL}/${menu.menu_image}`}
                          alt={menu.name}
                          className="w-12 h-12 rounded-lg object-center border border-neutral-100 dark:border-white/10"
                        />
                        <div className="flex-col flex">
                          <span className="font-medium text-neutral-800 dark:text-white/90">
                            {menu.name}
                          </span>
                          <span className="block text-neutral-500 text-theme-xs dark:text-neutral-400">
                            {menu.category?.name || "Uncategorized"}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="px-4 py-3 text-theme-sm">
                      <div className="flex flex-col">
                        {hasDiscount && (
                          <span className="line-through text-neutral-400 text-xs">
                            {formatCurrency(menu.price)}
                          </span>
                        )}
                        <span className="font-semibold text-neutral-800 dark:text-white">
                          {formatCurrency(finalPrice)}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      {hasDiscount ? (
                        <Badge color="error" variant="light">
                          -{discountValue}%
                        </Badge>
                      ) : (
                        <span className="text-neutral-400 text-xs italic">Normal</span>
                      )}
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-wrap gap-1.5 max-w-[250px] max-h-[80px] overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-200 pr-2">
                        {menu.stocks && menu.stocks.length > 0 ? (
                          menu.stocks.map((s: any) => (
                            <div 
                              key={s.id} 
                              className="inline-flex items-center px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10 text-[10px] font-medium text-neutral-600 dark:text-neutral-300 whitespace-nowrap"
                            >
                              {s.name} <span className="ml-1 text-blue-500 font-bold">{s.pivot.amount}</span>
                            </div>
                          ))
                        ) : (
                          <span className="text-neutral-400 text-xs">No Ingredients</span>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge color={menu.is_active ? "success" : "error"} variant="light">
                        {menu.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Link
                          to={`/menu/show/${menu.id}`}
                          className="p-2 rounded-lg text-neutral-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors"
                        >
                          <Eye size={18} />
                        </Link>

                        <ActionGuard module="menu" action="write">
                          <Link
                            to={`/menu/edit-menu/${menu.id}`}
                            className="p-2 rounded-lg text-neutral-500 hover:text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-500/10 transition-colors"
                          >
                            <Pencil size={18} />
                          </Link>
                        </ActionGuard>

                        <ActionGuard module="menu" action="delete">
                          <DeleteAlertDialog
                            title="Delete menu?"
                            description={`This will permanently delete "${menu.name}".`}
                            onConfirm={async () => {
                              await MenuService.deleteMenu(menu.id);
                              onRefresh();
                            }}
                          >
                            <button className="p-2 rounded-lg text-neutral-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
                              <Trash2 size={18} />
                            </button>
                          </DeleteAlertDialog>
                        </ActionGuard>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
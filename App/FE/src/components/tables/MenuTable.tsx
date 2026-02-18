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
              <TableHead className="px-5 py-3 text-theme-xs text-start">
                Menu
              </TableHead>
              <TableHead className="px-5 py-3 text-theme-xs text-start">
                Price
              </TableHead>
              <TableHead className="px-5 py-3 text-theme-xs text-start">
                Discount
              </TableHead>
              <TableHead className="px-5 py-3 text-theme-xs text-start">
                Stock
              </TableHead>
              <TableHead className="px-5 py-3 text-theme-xs text-start">
                Status
              </TableHead>
              <TableHead className="px-5 py-3 text-theme-xs text-start">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-neutral-100 dark:divide-white/[0.05] relative">
            {loading && (
              <TableRow>
                <TableCell
                  colSpan={7}
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
                <TableCell colSpan={7} className="text-center py-10">
                  <span className="text-neutral-400">No menu data found</span>
                </TableCell>
              </TableRow>
            )}

            {!loading &&
              menus.map((menu) => {
                const finalPrice = menu.discount
                  ? menu.price * (1 - menu.discount.value_discount / 100)
                  : menu.price;

                return (
                  <TableRow key={menu.id}>
                    <TableCell className="px-5 py-4 text-start">
                      <div className="flex items-center gap-3">
                        <img
                          src={`${import.meta.env.VITE_STORAGE_URL}/${menu.menu_image}`}
                          alt={menu.name}
                          className="w-12 h-12 rounded-lg object-cover border border-neutral-100 dark:border-white/10"
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
                        {menu.discount && (
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
                      {menu.discount ? (
                        <Badge color="error">
                          {menu.discount.value_discount}%
                        </Badge>
                      ) : (
                        <span className="text-neutral-400 text-xs">—</span>
                      )}
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant="light"
                        color={menu.stock < 10 ? "warning" : "default"}
                      >
                        {menu.stock}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <Badge color={menu.is_active ? "success" : "error"}>
                        {menu.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/menu/show/${menu.id}`}
                          className="p-2 rounded text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10"
                        >
                          <Eye size={18} />
                        </Link>

                        <ActionGuard module="menu" action="write">
                          <Link
                            to={`/menu/edit-menu/${menu.id}`}
                            className="p-2 rounded text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-500/10"
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
                            <button className="p-2 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10">
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

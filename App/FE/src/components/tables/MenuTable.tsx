import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import Badge from "../ui/badge/Badge";
import { MenuService } from "../../services/menu.service";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { Link } from "react-router";

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
  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure want to delete this menu?")) return;
    await MenuService.deleteMenu(id);
    onRefresh();
  };

  return (
    <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <Table>
          {/* Table Header */}
          <TableHeader className="border-b border-neutral-100 dark:text-white dark:border-white/[0.05]">
            <TableRow>
              <TableCell
                isHeader
                className="px-5 py-3 text-theme-xs text-start"
              >
                Menu
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 text-theme-xs text-start"
              >
                Price
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 text-theme-xs text-start"
              >
                Stock
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 text-theme-xs text-start"
              >
                Status
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 text-theme-xs text-start"
              >
                Action
              </TableCell>
            </TableRow>
          </TableHeader>

          {/* Table Body */}
          <TableBody className="divide-y divide-neutral-100 dark:divide-white/[0.05] relative">
            {loading && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10 mx-auto">
                  <span className="text-neutral-500">Loading data...</span>
                </TableCell>
              </TableRow>
            )}

            {!loading && menus.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10">
                  <span className="text-neutral-400">
                    No menu data found
                  </span>
                </TableCell>
              </TableRow>
            )}

            {!loading &&
              menus.map((menu) => (
                <TableRow key={menu.id}>
                  <TableCell className="px-5 py-4 text-start">
                    <div className="flex items-center gap-3">
                      <img
                        src={`${import.meta.env.VITE_STORAGE_URL}/${menu.menu_image}`}
                        alt={menu.name}
                        loading="lazy"
                        className="w-10 h-10 rounded"
                      />
                      <div className="flex-col flex">
                        <span className="font-medium text-neutral-800 dark:text-white/90">
                          {menu.name}
                        </span>
                        <span className="block text-neutral-500 text-theme-xs dark:text-neutral-400">
                          {menu.category.name}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="px-4 py-3 text-theme-sm text-neutral-500 dark:text-neutral-400">
                    {menu.price || "free"}
                  </TableCell>

                  <TableCell className="px-4 py-3 text-theme-sm text-neutral-500 dark:text-neutral-400">
                    <Badge variant="light">{menu.stock}</Badge>
                  </TableCell>

                  <TableCell className="px-4 py-3 text-theme-sm text-neutral-500 dark:text-neutral-400">
                    <Badge color={menu.is_active ? "success" : "error"}>
                      {menu.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>

                  <TableCell className="px-4 py-3 text-theme-sm">
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/menu/show/${menu.id}`}
                        title="Show"
                        className="p-2 rounded text-blue-500 hover:bg-blue-50
                 dark:text-blue-400 dark:hover:bg-blue-500/10"
                      >
                        <Eye size={18} />
                      </Link>

                      <Link
                        to={`/menu/edit-menu/${menu.id}`}
                        title="Edit"
                        className="p-2 rounded text-yellow-500 hover:bg-yellow-50
                 dark:text-yellow-400 dark:hover:bg-yellow-500/10"
                      >
                        <Pencil size={18} />
                      </Link>

                      <button
                        title="Delete"
                        onClick={() => handleDelete(menu.id)}
                        className="p-2 rounded text-red-500 hover:bg-red-50
                 dark:text-red-400 dark:hover:bg-red-500/10"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

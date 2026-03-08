import { Loader2, Pencil, Trash2 } from "lucide-react";
import Badge from "../ui/badge/Badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { ActionGuard } from "../guard/ActionGuard";

interface BadgeType {
  id: number;
  badge_image?: string;
  name: string;
  min_spend: number;
  icon?: string;
  color: string;
  is_active: boolean;
}

interface Props {
  badges: BadgeType[];
  loading?: boolean;
  onEdit?: (badge: BadgeType) => void;
  onDelete?: (id: number) => void;
}

export default function BadgeTable({
  badges,
  loading,
  onEdit,
  onDelete,
}: Props) {
  // Helper untuk format mata uang agar terlihat profesional
  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-b border-neutral-100 dark:text-white dark:border-white/[0.05]">
            <TableRow>
              <TableHead className="px-5 py-3 text-theme-xs text-start">
                Image
              </TableHead>
              <TableHead className="px-5 py-3 text-theme-xs text-start">
                Name
              </TableHead>
              {/* Kolom Baru: Min. Spend */}
              <TableHead className="px-5 py-3 text-theme-xs text-start">
                Min. Spend
              </TableHead>
              <TableHead className="px-5 py-3 text-theme-xs text-start">
                Icon
              </TableHead>
              <TableHead className="px-5 py-3 text-theme-xs text-start">
                Color
              </TableHead>
              <TableHead className="px-5 py-3 text-theme-xs text-start">
                Status
              </TableHead>
              <TableHead className="px-5 py-3 text-theme-xs text-start">
                Actions
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

            {!loading && badges.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10">
                  <span className="text-neutral-400">No badge data found</span>
                </TableCell>
              </TableRow>
            )}

            {!loading &&
              badges.map((badge) => (
                <TableRow key={badge.id}>
                  <TableCell className="px-4 py-3 text-theme-sm text-neutral-500 dark:text-neutral-400">
                    {badge.badge_image ? (
                      <img
                        src={`${import.meta.env.VITE_STORAGE_URL}/${badge.badge_image}`}
                        className="w-12 h-12 object-cover rounded-lg shadow-sm"
                        alt={badge.name}
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-neutral-100 dark:bg-white/5 flex items-center justify-center text-xs text-neutral-400">
                        No Img
                      </div>
                    )}
                  </TableCell>

                  <TableCell className="px-4 py-3 text-theme-sm font-medium text-neutral-800 dark:text-white">
                    {badge.name}
                  </TableCell>

                  {/* Render Min. Spend */}
                  <TableCell className="px-4 py-3 text-theme-sm text-neutral-500 dark:text-neutral-400">
                    <span className="font-mono text-xs bg-neutral-50 dark:bg-white/5 px-2 py-1 rounded">
                       {formatRupiah(badge.min_spend || 0)}
                    </span>
                  </TableCell>

                  <TableCell className="px-4 py-3 text-theme-sm text-neutral-500 dark:text-neutral-400">
                    {badge.icon === "null" || !badge.icon ? "-" : (
                        <span className="text-lg">{badge.icon}</span>
                    )}
                  </TableCell>

                  <TableCell className="px-4 py-3 text-theme-sm text-neutral-500 dark:text-neutral-400">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full border border-black/5"
                        style={{ background: badge.color }}
                      />
                      <span className="uppercase text-xs font-mono">{badge.color}</span>
                    </div>
                  </TableCell>

                  <TableCell className="px-4 py-3 text-theme-sm">
                    <Badge
                      size="sm"
                      color={badge.is_active ? "success" : "error"}
                    >
                      {badge.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>

                  <TableCell className="px-4 py-3 text-theme-sm">
                    <div className="flex gap-1">
                      <ActionGuard module="badge" action="write">
                        <button
                          title="Edit"
                          className="p-2 rounded text-yellow-500 hover:bg-yellow-50 dark:text-yellow-400 dark:hover:bg-yellow-500/10 transition-colors"
                          onClick={() => onEdit?.(badge)}
                        >
                          <Pencil size={18} />
                        </button>
                      </ActionGuard>

                      <ActionGuard module="badge" action="delete">
                        <button
                          title="Delete"
                          onClick={() => onDelete?.(badge.id)}
                          className="p-2 rounded text-red-500 hover:bg-red-50 
                            dark:text-red-400 dark:hover:bg-red-500/10 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </ActionGuard>
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
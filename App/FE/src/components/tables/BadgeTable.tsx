import { Pencil, Trash2 } from "lucide-react";
import Badge from "../ui/badge/Badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";

interface BadgeType {
  id: number;
  badge_image?: string;
  name: string;
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
  return (
    <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-b border-neutral-100 dark:text-white dark:border-white/[0.05]">
            <TableRow>
              <TableCell
                isHeader
                className="px-5 py-3 text-theme-xs text-start"
              >
                Image
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 text-theme-xs text-start"
              >
                Name
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 text-theme-xs text-start"
              >
                Icon
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 text-theme-xs text-start"
              >
                Color
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
                Actions
              </TableCell>
            </TableRow>
          </TableHeader>

         <TableBody className="divide-y divide-neutral-100 dark:divide-white/[0.05] relative">
         {loading && (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-10 mx-auto">
                <span className="text-neutral-500">Loading data...</span>
              </TableCell>
            </TableRow>
          )}

          {!loading && badges.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-10">
                <span className="text-neutral-400">No menu data found</span>
              </TableCell>
            </TableRow>
          )}

            {!loading && badges.map((badge) => (
              <TableRow key={badge.id}>
                <TableCell className="px-4 py-3 text-theme-sm text-neutral-500 dark:text-neutral-400">
                  {badge.badge_image ? (
                    <img
                      src={`${import.meta.env.VITE_STORAGE_URL}/${badge.badge_image}`}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                  ) : (
                    "-"
                  )}
                </TableCell>

                <TableCell className="px-4 py-3 text-theme-sm text-neutral-500 dark:text-neutral-400">
                  {badge.name}
                </TableCell>

                <TableCell className="px-4 py-3 text-theme-sm text-neutral-500 dark:text-neutral-400">
                  {badge.icon == "null" ? "-" : badge.icon}
                </TableCell>

                <TableCell className="px-4 py-3 text-theme-sm text-neutral-500 dark:text-neutral-400">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ background: badge.color }}
                    />
                    {badge.color}
                  </div>
                </TableCell>

                <TableCell className="px-4 py-3 text-theme-sm text-neutral-500 dark:text-neutral-400">
                  <Badge
                    size="sm"
                    color={badge.is_active ? "success" : "error"}
                  >
                    {badge.is_active ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>

                 <TableCell className="px-4 py-3 text-theme-sm text-neutral-500 dark:text-neutral-400">
                   <button
                    title="Edit"
                    className="p-2 rounded text-yellow-500 hover:bg-yellow-50 dark:text-yellow-400 dark:hover:bg-yellow-500/10"
                   onClick={() => onEdit?.(badge)}
                  >
                    <Pencil size={18} />
                  </button>

                  <button
                    title="Delete"
                    onClick={() => onDelete?.(badge.id)}
                    className="p-2 rounded text-red-500 hover:bg-red-50
                        dark:text-red-400 dark:hover:bg-red-500/10"
                  >
                    <Trash2 size={18} />
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

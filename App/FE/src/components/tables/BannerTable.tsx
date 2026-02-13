import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import Badge from "../../components/ui/badge/Badge";
import { Pencil, Trash2 } from "lucide-react";
import { BannerService } from "../../services/banner.service";

interface BannerTableProps {
  banners: any[];
  loading: boolean;
  onRefresh: () => void;
  onEdit: (banner: any) => void;
}

export default function BannerTable({
  banners,
  loading,
  onRefresh,
  onEdit,
}: BannerTableProps) {
  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure want to delete this banner?")) return;
    await BannerService.deleteBanner(id);
    onRefresh();
  };

  return (
    <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-b border-neutral-100 dark:border-white/[0.05]">
            <TableRow>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-neutral-500 text-start text-theme-xs dark:text-neutral-400"
              >
                Banner
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-neutral-500 text-start text-theme-xs dark:text-neutral-400"
              >
                Status
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-neutral-500 text-start text-theme-xs dark:text-neutral-400"
              >
                Action
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-neutral-100 dark:divide-white/[0.05] relative">
            {loading && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-10 text-center text-neutral-500"
                >
                  Loading data...
                </TableCell>
              </TableRow>
            )}

            {!loading && banners.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-10 text-center text-neutral-400"
                >
                  No banners found
                </TableCell>
              </TableRow>
            )}

            {!loading &&
              banners.map((banner) => (
                <TableRow key={banner.id}>
                  <TableCell className="px-5 py-4 text-start">
                    <div className="flex items-start gap-3">
                      <img
                        src={`${banner.banner_image}`}
                        alt={banner.name}
                        loading="lazy"
                        className="w-72 h-36 rounded object-cover"
                      />
                      <div className="flex-col flex">
                        <span className="font-medium text-4xl text-neutral-800 dark:text-white/90">
                          {banner.title.length > 500
                            ? banner.title.substring(0, 500) + "..."
                            : banner.title}
                        </span>
                        <span className="block text-neutral-500 text-theme-xl dark:text-neutral-400">
                          {banner.description.length > 100
                            ? banner.description.substring(0, 100) + "..."
                            : banner.description}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-5 py-4">
                    <Badge
                      size="sm"
                      color={banner.is_active ? "success" : "error"}
                    >
                      {banner.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onEdit(banner)}
                        className="p-2 rounded text-yellow-500 hover:bg-yellow-50 dark:text-yellow-400 dark:hover:bg-yellow-500/10"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(banner.id)}
                        className="p-2 rounded text-red-500 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
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

import { useState } from "react";
import { useLeaves, useApproveLeave } from "@/hooks/react-query/useLeave";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PageMeta from "@/components/common/PageMeta";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import useDebounce from "@/hooks/useDebounce";
import { LeaveTable } from "@/components/tables/LeaveTable";
import { LeaveDetailDialog } from "@/components/dialog/LeaveDetailDialog";
import { RejectLeaveDialog } from "@/components/dialog/RejectLeaveDialog";
import { Search, Filter } from "lucide-react";

export default function LeaveApprovalPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const debouncedSearch = useDebounce(search, 500);

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const [rejectId, setRejectId] = useState<number | null>(null);
  const [isRejectOpen, setIsRejectOpen] = useState(false);

  const { data, isLoading } = useLeaves({
    page,
    search: debouncedSearch,
    type,
    per_page: 10,
  });

  const approveMutation = useApproveLeave();

  const handleAction = (id: number, status: "approved" | "rejected") => {
    if (status === "approved") {
      approveMutation.mutate({ id, status });
    } else {
      setRejectId(id);
      setIsRejectOpen(true);
    }
  };

  const handleConfirmReject = (reason: string) => {
    if (rejectId) {
      approveMutation.mutate(
        { id: rejectId, status: "rejected", reason },
        {
          onSuccess: () => {
            setIsRejectOpen(false);
            setRejectId(null);
          },
        }
      );
    }
  };

  const openDetail = (id: number) => {
    setSelectedId(id);
    setIsDetailOpen(true);
  };

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      <PageMeta description="Persetujuan Izin Pegawai" title="Leave Approval" />
      <PageBreadcrumb pageTitle="Leave Approval" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Persetujuan Izin</h1>
          <p className="text-sm text-muted-foreground">
            Tinjau pengajuan izin pegawai dan sinkronisasi otomatis dengan absensi.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full md:w-[280px]">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="Cari nama pegawai..."
              className="pl-9 bg-card"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-muted-foreground hidden sm:block" />
            <Select 
              value={type} 
              onValueChange={(val) => {
                setType(val);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[140px] bg-card">
                <SelectValue placeholder="Tipe Izin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Tipe</SelectItem>
                <SelectItem value="sick">Sakit</SelectItem>
                <SelectItem value="leave">Izin</SelectItem>
                <SelectItem value="permit">Keperluan</SelectItem>
                <SelectItem value="vacation">Cuti</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="rounded-xl">
        <LeaveTable
          data={data?.data || []}
          isLoading={isLoading}
          onDetail={openDetail}
          onAction={handleAction}
        />
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-2">
        <p className="text-xs text-muted-foreground font-medium order-2 sm:order-1">
          Menampilkan <span className="text-foreground">{data?.data?.length || 0}</span> dari{" "}
          <span className="text-foreground">{data?.meta?.total || 0}</span> data
        </p>

        <div className="flex items-center gap-2 order-1 sm:order-2">
          <Button
            size="sm"
            variant="outline"
            className="h-8 px-3"
            disabled={page === 1 || isLoading}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          
          <div className="flex items-center justify-center min-w-20 px-2 py-1 rounded-md border bg-muted/50 text-[11px] font-medium text-neutral-600">
            Hal {data?.meta?.current_page || 1} / {data?.meta?.last_page || 1}
          </div>

          <Button
            size="sm"
            variant="outline"
            className="h-8 px-3"
            disabled={page >= (data?.meta?.last_page || 1) || isLoading}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>

      <LeaveDetailDialog
        id={selectedId}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
      />

      <RejectLeaveDialog
        open={isRejectOpen}
        onOpenChange={setIsRejectOpen}
        onConfirm={handleConfirmReject}
        isPending={approveMutation.isPending}
      />
    </div>
  );
}
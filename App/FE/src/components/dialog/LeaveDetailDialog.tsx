import { useLeaveDetail } from "@/hooks/react-query/useLeave";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, FileText, Info, AlertCircle } from "lucide-react";
import { formatDate } from "@/utils/dateHelper";

interface LeaveDetailDialogProps {
  id: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LeaveDetailDialog({
  id,
  open,
  onOpenChange,
}: LeaveDetailDialogProps) {
  const { data: detail, isLoading } = useLeaveDetail(id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Info className="size-5 text-blue-500" />
            Leave Request Details
          </DialogTitle>
          <DialogDescription>
            Complete information regarding employee leave or sick leave request.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        ) : (
          detail && (
            <div className="space-y-6 py-2.5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <p className="text-sm font-normal text-neutral-400 flex items-center gap-1">
                    <User size={12} /> Employee
                  </p>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold">
                      {detail?.user?.username ?? "Unknown"}
                    </span>
                    <span className="text-sm text-neutral-500 tracking-wider">
                      {detail?.user?.role ?? "No Role"}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <p className="text-sm font-normal text-neutral-400 flex items-center gap-1">
                    <Calendar size={12} /> Period
                  </p>
                  <p className="text-sm font-normal">
                    {formatDate(detail?.start_date)}{" "}
                    <span className="text-neutral-400 mx-1">to</span>{" "}
                    {formatDate(detail?.end_date)}
                  </p>
                </div>
              </div>

              <div className="space-y-1.5">
                <p className="text-sm font-normal text-neutral-400 flex items-center gap-1">
                  <FileText size={12} /> Reason & Type
                </p>
                <div className="bg-neutral-50 border rounded-lg p-3">
                  <Badge variant="outline" className="mb-2 capitalize">
                    {detail?.type ?? "N/A"}
                  </Badge>
                  <p className="text-sm text-neutral-600 leading-relaxed overflow-y-auto h-full max-h-20 custom-scrollbar scrollbar-thin scrollbar-thumb-neutral-200 hover:scrollbar-thumb-neutral-300">
                    "{detail?.reason ?? "No reason provided"}"
                  </p>
                </div>
              </div>

              {detail?.status === "rejected" && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-lg flex gap-3">
                  <AlertCircle className="size-5 text-red-500 shrink-0" />
                  <div className="space-y-1">
                    <p className="text-sm font-normal text-red-600">
                      Rejection Reason
                    </p>
                    <p className="text-sm text-red-700 font-normal">
                      {detail?.rejected_reason ?? "N/A"}
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <p className="text-sm font-normal text-neutral-400">
                  Proof Attachment
                </p>
                <div className="relative w-full h-full max-h-60 overflow-hidden rounded-xl border bg-neutral-100 group">
                  <img
                    src={`${import.meta.env.VITE_STORAGE_URL}/${detail?.proof_file}`}
                    className="h-full w-full object-center transition-transform duration-300 group-hover:scale-105"
                    alt="Proof"
                  />
                  <a
                    href={`${import.meta.env.VITE_STORAGE_URL}/${detail?.proof_file}`}
                    target="_blank"
                    className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-normal"
                  >
                    Click to enlarge
                  </a>
                </div>
              </div>
            </div>
          )
        )}

        <DialogFooter className="sm:justify-end">
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

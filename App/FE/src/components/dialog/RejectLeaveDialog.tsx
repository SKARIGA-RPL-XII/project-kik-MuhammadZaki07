import React, { useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle } from "lucide-react";

interface RejectLeaveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason: string) => void;
  isPending: boolean;
}

export function RejectLeaveDialog({
  open,
  onOpenChange,
  onConfirm,
  isPending,
}: RejectLeaveDialogProps) {
  const [reason, setReason] = useState("");

  const handleConfirm = (e: React.MouseEvent) => {
    if (!reason.trim()) {
      e.preventDefault();
      return;
    }
    onConfirm(reason);
    setReason("");
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-red-600">
            <AlertCircle size={20} />
            Tolak Pengajuan Izin
          </AlertDialogTitle>
          <AlertDialogDescription>
            Harap berikan alasan penolakan yang jelas. Alasan ini akan dapat dilihat oleh pegawai yang bersangkutan.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="py-4">
          <Textarea
            placeholder="Contoh: Bukti lampiran tidak jelas atau periode izin bertabrakan dengan event penting..."
            className="min-h-[100px] focus-visible:ring-red-500"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
          />
          {!reason.trim() && (
            <p className="text-[10px] text-red-500 mt-2">* Alasan penolakan wajib diisi</p>
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setReason("")}>Batal</AlertDialogCancel>
          <AlertDialogAction
            className="bg-red-600 hover:bg-red-700"
            onClick={handleConfirm}
            disabled={!reason.trim() || isPending}
          >
            {isPending ? "Memproses..." : "Ya, Tolak Izin"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
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
            Reject Leave Request
          </AlertDialogTitle>
          <AlertDialogDescription>
            Please provide a clear reason for rejection. This reason will be visible to the employee.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="py-4">
          <Textarea
            placeholder="Example: Unclear proof attachment or period overlaps with critical events..."
            className="min-h-[100px] focus-visible:ring-red-500"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
          />
          {!reason.trim() && (
            <p className="text-[10px] text-red-500 mt-2">* Rejection reason is required</p>
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setReason("")}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-red-600 hover:bg-red-700"
            onClick={handleConfirm}
            disabled={!reason.trim() || isPending}
          >
            {isPending ? "Processing..." : "Yes, Reject Leave"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
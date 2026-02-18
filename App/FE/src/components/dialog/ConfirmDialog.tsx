import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { ReactNode } from "react";
import { Loader2 } from "lucide-react";

interface ConfirmDialogProps {
  trigger: ReactNode;

  title: string;
  description?: string;

  icon?: ReactNode;

  confirmText?: string;
  cancelText?: string;

  onConfirm: () => void | Promise<void>;

  loading?: boolean;

  size?: "sm" | "md" | "lg";
}

export default function ConfirmDialog({
  trigger,
  title,
  description,
  icon,

  confirmText = "Confirm",
  cancelText = "Cancel",

  onConfirm,

  loading = false,

  size = "sm",
}: ConfirmDialogProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>

      <AlertDialogContent size={size}>
        <AlertDialogHeader>
          {icon && (
            <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20">
              {icon}
            </AlertDialogMedia>
          )}

          <AlertDialogTitle>{title}</AlertDialogTitle>

          {description && (
            <AlertDialogDescription>{description}</AlertDialogDescription>
          )}
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel variant="outline">{cancelText}</AlertDialogCancel>

          <AlertDialogAction
            variant="destructive"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading && <Loader2 className="animate-spin mr-2 h-4 w-4" />}

            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

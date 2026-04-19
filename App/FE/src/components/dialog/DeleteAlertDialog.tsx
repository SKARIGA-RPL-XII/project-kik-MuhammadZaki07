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
import { Check, Trash2Icon } from "lucide-react";
import { ReactNode, useState } from "react";

interface DeleteAlertDialogProps {
  title?: string;
  description?: string;
  onConfirm: () => Promise<void> | void;
  children: ReactNode;
  trashIcon?: boolean;
}

export default function DeleteAlertDialog({
  title = "Delete data?",
  description = "This action cannot be undone. This will permanently delete the selected data.",
  onConfirm,
  children,
  trashIcon = true,
}: DeleteAlertDialogProps) {
  const [loading, setLoading] = useState(false);

  const Icon = trashIcon ? Trash2Icon : Check;
  const handleConfirm = async () => {
    try {
      setLoading(true);
      await onConfirm();
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>

      <AlertDialogContent  className="will-change-transform transform-gpu transition-all duration-150 ease-out" size="sm">
        <AlertDialogHeader>
          <AlertDialogMedia
            className={`${
              trashIcon
                ? "bg-destructive/10 text-destructive dark:bg-destructive/20"
                : "bg-green-100 text-green-500"
            }`}
          >
            <Icon />
          </AlertDialogMedia>

          <AlertDialogTitle>{title}</AlertDialogTitle>

          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel variant="outline">Cancel</AlertDialogCancel>

          <AlertDialogAction
            variant="destructive"
            className="transition-all duration-150"
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

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
import { Trash2Icon } from "lucide-react";
import { ReactNode, useState } from "react";

interface DeleteAlertDialogProps {
  title?: string;
  description?: string;
  onConfirm: () => Promise<void> | void;
  children: ReactNode;
}

export default function DeleteAlertDialog({
  title = "Delete data?",
  description = "This action cannot be undone. This will permanently delete the selected data.",
  onConfirm,
  children,
}: DeleteAlertDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    await onConfirm();
    setLoading(false);
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>

      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20">
            <Trash2Icon />
          </AlertDialogMedia>

          <AlertDialogTitle>{title}</AlertDialogTitle>

          <AlertDialogDescription>
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel variant="outline">
            Cancel
          </AlertDialogCancel>

          <AlertDialogAction
            variant="destructive"
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

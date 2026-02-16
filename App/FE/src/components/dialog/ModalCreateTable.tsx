import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useState } from "react";
import { TableService } from "@/services/table.service";
import { useToast } from "@/context/ToastContext";
import { SquarePlus } from "lucide-react";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import LoadingSpinner from "../skeleton/LoadingSpinner";
import { Button } from "../ui/button";

export function ModalCreateTable({ isOpen, onClose, onRefresh }: { isOpen: boolean, onClose: () => void, onRefresh: () => void }) {
  const [tableNumber, setTableNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const { toast } = useToast();

  const handleCreate = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    const res = await TableService.createTable({ table_number: tableNumber });

    if (res.error) {
      if (typeof res.error === "object") {
        setErrors(res.error);
        toast("error", "Validation Error", "Please check your inputs");
      } else {
        toast("error", "Error", res.error);
      }
      setIsLoading(false);
    } else {
      toast("success", "Success", "Table created and QR generated");
      setIsLoading(false);
      onRefresh();
      onClose();
      setTableNumber("");
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !isLoading && onClose()}>
      <AlertDialogContent 
        onEscapeKeyDown={() => !isLoading && onClose()}
      >
        <AlertDialogHeader>
          <AlertDialogTitle className="text-3xl font-bold">New Table</AlertDialogTitle>
          <AlertDialogDescription className="font-medium text-neutral-500">
            Enter table identifier. QR code will be generated automatically.
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="space-y-2">
          <Label className="text-sm font-bold text-muted-foreground">Table Number / Label</Label>
          <Input
            placeholder="e.g. A-01 or VIP-1"
            value={tableNumber}
            disabled={isLoading}
            error={errors.table_number}
            onChange={(e) => setTableNumber(e.target.value)}
          />
          {errors.table_number && (
            <span className="text-xs text-red-500 font-medium px-1">
              {errors.table_number[0]}
            </span>
          )}
        </div>

        <AlertDialogFooter className="flex items-center gap-3">
          <AlertDialogCancel 
            disabled={isLoading}
            className="w-28 border-none font-bold text-neutral-400 hover:text-neutral-600 bg-transparent"
          >
            Cancel
          </AlertDialogCancel>
          <Button
            onClick={handleCreate} 
            disabled={isLoading}
            className="w-36 bg-brand-600 hover:bg-brand-700 text-white flex items-center justify-center gap-2 border-none disabled:opacity-70 disabled:cursor-not-allowed transition-all"
          >
            {isLoading ? (
              <LoadingSpinner />
            ) : (
              <>
                <SquarePlus size={22} /> Create Table
              </>
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
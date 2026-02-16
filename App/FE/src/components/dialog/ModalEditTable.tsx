import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState, useEffect } from "react";
import { X, Save, Trash2 } from "lucide-react";
import LoadingSpinner from "../skeleton/LoadingSpinner";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import Select from "../form/Select";
import Button from "../ui/button/Button";
import { TableInterface } from "@/types/layout-table";

interface ModalEditTableProps {
  table: TableInterface | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: number, data: Partial<TableInterface>) => Promise<any>;
  onDelete: (id: number) => Promise<any>;
}

export default function ModalEditTable({
  table,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
}: ModalEditTableProps) {
  const [formData, setFormData] = useState<Partial<TableInterface>>({
    table_number: "",
    shape: "square",
    status: "available",
    width: 100,
    height: 100,
    rotation: 0,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [errors, setErrors] = useState<any>({});

  const shapeOptions = [
    { value: "square", label: "Square" },
    { value: "round", label: "Round" },
    { value: "rectangle", label: "Rectangle" },
  ];

  const statusOptions = [
    { value: "available", label: "Available" },
    { value: "occupied", label: "Occupied" },
  ];

  useEffect(() => {
    if (table && isOpen) {
      setFormData({
        table_number: table.table_number ?? "",
        shape: table.shape ?? "square",
        status: table.status ?? "available",
        width: table.width ?? 100,
        height: table.height ?? 100,
        rotation: table.rotation ?? 0,
      });
      setErrors({});
    }
  }, [table, isOpen]);

  const handleUpdate = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!table?.id || isLoading) return;

    setIsLoading(true);
    setErrors({});

    try {
      const res = await onUpdate(table.id, formData);
      if (res?.error) {
        if (typeof res.error === "object") setErrors(res.error);
        setIsLoading(false);
      } else {
        setIsLoading(false);
        onClose();
      }
    } catch (err) {
      setIsLoading(false);
    }
  };

  const processDelete = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); 
    if (!table?.id || isLoading) return;

    setIsLoading(true);
    try {
      await onDelete(table.id);
      setIsLoading(false);
      setShowDeleteConfirm(false);
      onClose();
    } catch (err) {
      setIsLoading(false);
    }
  };

  return (
    <>
      <AlertDialog open={isOpen} onOpenChange={(open) => !isLoading && onClose()}>
        <AlertDialogContent onEscapeKeyDown={(e) => isLoading && e.preventDefault()}>
          <AlertDialogHeader className="flex flex-row justify-between items-start">
            <div className="space-y-1">
              <AlertDialogTitle className="text-2xl font-bold">
                Edit Table {table?.table_number}
              </AlertDialogTitle>
              <AlertDialogDescription className="text-[10px] font-bold uppercase text-neutral-400">
                Adjust table dimensions, shape, and identifier.
              </AlertDialogDescription>
            </div>
            <button
              type="button"
              disabled={isLoading}
              onClick={onClose}
              className="p-2 hover:bg-neutral-100 dark:hover:bg-white/5 rounded-full transition-colors text-neutral-500 disabled:opacity-50"
            >
              <X size={20} />
            </button>
          </AlertDialogHeader>

          <div className="space-y-6 my-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-neutral-400">Table Number</Label>
              <Input
                type="text"
                disabled={isLoading}
                value={formData.table_number || ""}
                error={errors.table_number}
                onChange={(e) => setFormData({ ...formData, table_number: e.target.value })}
              />
              {errors.table_number && (
                <span className="text-[10px] text-red-500 font-bold ml-2 mt-1 block">
                  {errors.table_number[0]}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-neutral-400">Shape</Label>
                <Select
                  options={shapeOptions}
                  value={formData.shape || ""}
                  onChange={(val) => setFormData({ ...formData, shape: val as any })}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-neutral-400">Status</Label>
                <Select
                  options={statusOptions}
                  value={formData.status || ""}
                  onChange={(val) => setFormData({ ...formData, status: val as any })}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-neutral-400">Width</Label>
                <Input
                  type="number"
                  disabled={isLoading}
                  value={formData.width ?? 0}
                  onChange={(e) => setFormData({ ...formData, width: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-neutral-400">Height</Label>
                <Input
                  type="number"
                  disabled={isLoading}
                  value={formData.height ?? 0}
                  onChange={(e) => setFormData({ ...formData, height: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-neutral-400">Rotation</Label>
                <Input
                  type="number"
                  disabled={isLoading}
                  value={formData.rotation ?? 0}
                  onChange={(e) => setFormData({ ...formData, rotation: Number(e.target.value) })}
                />
              </div>
            </div>
          </div>

          <AlertDialogFooter className="flex flex-row gap-3 h-10">
            <Button
              type="button"
              disabled={isLoading}
              onClick={() => setShowDeleteConfirm(true)}
              variant="outline"
            >
              <Trash2 size={20} />
            </Button>
            <Button type="button" disabled={isLoading} onClick={handleUpdate}>
              {isLoading ? (
                <LoadingSpinner />
              ) : (
                <div className="flex items-center gap-2">
                  <Save size={18} />
                  <span>Update Data</span>
                </div>
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <div className="w-12 h-12 bg-destructive/10 text-destructive dark:bg-destructive/20 rounded-full flex items-center justify-center mb-2">
              <Trash2 size={24} />
            </div>
            <AlertDialogTitle>Delete table?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete Table <span className="font-bold">{table?.table_number}</span>. 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading} variant="outline">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isLoading}
              onClick={processDelete}
              variant="destructive"
            >
              {isLoading ? <LoadingSpinner /> : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
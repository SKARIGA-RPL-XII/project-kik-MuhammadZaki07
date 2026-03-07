import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogCancel } from "@/components/ui/alert-dialog";
import Input from "@/components/form/input/InputField";
import Select from "@/components/form/Select";
import Button from "@/components/ui/button/Button";
import Label from "@/components/form/Label";
import { useState, useEffect } from "react";
import { TableService } from "@/services/table.service";
import { X } from "lucide-react";

export default function TableFormDialog({ open, data, onClose, onSuccess }) {
  const [form, setForm] = useState({
    table_number: "",
    status: "available",
    width: 60,
    height: 60,
    rotation: 0
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (data) setForm({ 
      table_number: data.table_number, 
      status: data.status,
      width: data.width || 60,
      height: data.height || 60,
      rotation: data.rotation || 0
    });
    else setForm({ table_number: "", status: "available", width: 60, height: 60, rotation: 0 });
  }, [data, open]);

  const handleSubmit = async () => {
    setLoading(true);
    const res = data ? await TableService.updateTable(data.id, form) : await TableService.createTable(form);
    if (!res.error) { onSuccess(); onClose(); }
    setLoading(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md rounded-3xl p-8">
        <div className="flex justify-between items-center mb-6">
          <AlertDialogTitle className="text-2xl font-bold">{data ? "Modify Table" : "New Table"}</AlertDialogTitle>
          <button onClick={onClose} className="p-2 hover:bg-neutral-100 rounded-full transition-colors"><X size={20}/></button>
        </div>
        
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Table Label</Label>
              <Input value={form.table_number} onChange={(e) => setForm({...form, table_number: e.target.value})} placeholder="e.g. T-01" />
            </div>
            <div>
              <Label>Status</Label>
              <Select 
                value={form.status} 
                onChange={(v) => setForm({...form, status: v})}
                options={[{label: "Available", value: "available"}, {label: "Occupied", value: "occupied"}]} 
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 p-4 bg-neutral-50 dark:bg-white/5 rounded-2xl border border-neutral-100 dark:border-white/5">
            <div>
              <Label className="text-[10px] uppercase tracking-wider">Width</Label>
              <Input type="number" value={form.width} onChange={(e) => setForm({...form, width: Number(e.target.value)})} />
            </div>
            <div>
              <Label className="text-[10px] uppercase tracking-wider">Height</Label>
              <Input type="number" value={form.height} onChange={(e) => setForm({...form, height: Number(e.target.value)})} />
            </div>
            <div>
              <Label className="text-[10px] uppercase tracking-wider">Rotation</Label>
              <Input type="number" value={form.rotation} onChange={(e) => setForm({...form, rotation: Number(e.target.value)})} />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <AlertDialogCancel className="flex-1 rounded-xl">Cancel</AlertDialogCancel>
            <Button onClick={handleSubmit} disabled={loading} className="flex-[2] rounded-xl bg-red-500">
              {loading ? "Saving..." : "Apply Changes"}
            </Button>
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
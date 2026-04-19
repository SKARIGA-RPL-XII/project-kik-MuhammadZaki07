import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function AttributeModal({ open, onClose, item, onConfirm }: any) {
  const [selected, setSelected] = useState<any>({});

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{item.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {(item.attributes || []).map((attr: any) => (
            <div key={attr.id}>
              <p className="text-sm font-bold mb-2">{attr.name}</p>

              <div className="flex flex-wrap gap-2">
                {attr.levels?.map((opt: any) => (
                  <button
                    key={opt.id}
                    onClick={() =>
                      setSelected((prev: any) => ({
                        ...prev,
                        [attr.id]: opt.id,
                      }))
                    }
                    className={`px-3 py-1 rounded-full border text-xs transition ${
                      selected[attr.id] === opt.id
                        ? "bg-red-600 text-white"
                        : "bg-white hover:bg-slate-100"
                    }`}
                  >
                    {opt.name}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end mt-4">
          <Button onClick={() => onConfirm(item, selected)} className="w-full bg-red-500 hover:bg-red-600">
            Tambah ke Keranjang
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Input from "@/components/form/input/InputField";
import MultiSelect from "@/components/form/MultiSelect";
import Button from "@/components/ui/button/Button";
import { useState } from "react";
import { RoomService } from "@/services/room.service";

export default function RoomFormDialog({
  open,
  tables,
  onClose,
  onSuccess,
}: any) {
  const [form, setForm] = useState({
    name: "",
    capacity: 1,
    table_ids: [],
  });

  const [errors, setErrors] = useState<any>({});

  const options = tables.map((t: any) => ({
    text: t.table_number,
    value: t.id.toString(),
  }));

  const submit = async () => {
    const res = await RoomService.createRoom(form);

    if (!res) setErrors({ general: "Failed" });
    else {
      onSuccess();
      onClose();
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onClose}>

      <AlertDialogContent>

        <AlertDialogHeader>

          <AlertDialogTitle>
            Create Room
          </AlertDialogTitle>

        </AlertDialogHeader>

        <div className="space-y-4">

          <Input
            placeholder="Room name"
            value={form.name}
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
          />

          <Input
            type="number"
            value={form.capacity}
            onChange={(e) =>
              setForm({
                ...form,
                capacity: Number(e.target.value),
              })
            }
          />

          <MultiSelect
            options={options}
            onChange={(v) =>
              setForm({
                ...form,
                table_ids: v.map(Number),
              })
            }
          />

          <Button onClick={submit}>
            Save
          </Button>

        </div>

      </AlertDialogContent>

    </AlertDialog>
  );
}

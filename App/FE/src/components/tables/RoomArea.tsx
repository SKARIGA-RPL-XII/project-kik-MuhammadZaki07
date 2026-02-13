import { useEffect, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Input from "@/components/form/input/InputField";
import MultiSelect from "@/components/form/MultiSelect";
import { TableInterface } from "@/pages/Table";
import Button from "../ui/button/Button";

interface Props {
  title: string;
  roomId: number;
  cols: number;
  roomTables: TableInterface[];
  allTables: TableInterface[];
  children: React.ReactNode;
  onEdit: (payload: {
    name: string;
    capacity: number;
    table_ids: number[];
  }) => void;
  onDelete: (roomId: number) => void;
}

const RoomArea = ({
  title,
  roomId,
  cols,
  roomTables,
  allTables,
  children,
  onEdit,
  onDelete,
}: Props) => {
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);

  const [name, setName] = useState(title);
  const [capacity, setCapacity] = useState(cols);
  const [selectedTableIds, setSelectedTableIds] = useState<number[]>([]);

  useEffect(() => {
    if (openEdit) {
      setSelectedTableIds(roomTables.map((t) => t.id));
      setName(title);
      setCapacity(cols);
    }
  }, [openEdit]);

  const selectableTables = allTables.filter(
    (t) => t.room_id === null || t.room_id === roomId,
  );
  
  const options = selectableTables.map((t) => ({
    text: `Table ${t.table_number}`,
    value: t.id.toString(),
  }));

  return (
    <>
      <div className="bg-neutral-100 dark:bg-neutral-800 border-t-4 border-green-700 rounded-2xl p-5">
        <div className="flex justify-between mb-4">
          <span className="font-bold text-sm">{title}</span>

          <div className="flex gap-2">
            <button onClick={() => setOpenEdit(true)}>
              <Pencil size={14} />
            </button>
            <button onClick={() => setOpenDelete(true)}>
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        <div
          className="grid gap-5"
          style={{ gridTemplateColumns: "repeat(auto-fit, 36px)" }}
        >
          {children}
        </div>
      </div>

      {/* EDIT */}
      <AlertDialog open={openEdit} onOpenChange={setOpenEdit}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Edit Room</AlertDialogTitle>
          </AlertDialogHeader>

          <div className="space-y-3">
            <Input value={name} onChange={(e) => setName(e.target.value)} />

            <Input
              type="number"
              value={capacity}
              onChange={(e) => setCapacity(Number(e.target.value))}
            />

            <MultiSelect
              options={options}
              defaultSelected={selectedTableIds.map(String)}
              onChange={(values) =>
                setSelectedTableIds(values.map((v) => Number(v)))
              }
            />
          </div>

          <div className="flex justify-end gap-2 items-center h-10 pt-4">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <div>
            <Button
            className="h-10"
              onClick={() => {
                onEdit({
                  name,
                  capacity,
                  table_ids: selectedTableIds,
                });
                setOpenEdit(false);
              }}
            >
              Save
            </Button>
            </div>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* DELETE */}
      <AlertDialog open={openDelete} onOpenChange={setOpenDelete}>
        <AlertDialogContent>
          <AlertDialogTitle className="text-rose-600">
            Delete Room
          </AlertDialogTitle>

          <p className="text-sm text-muted-foreground">
            Tables inside will be released.
          </p>

          <div className="flex justify-end gap-2 pt-4">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button
              className="bg-rose-600 text-white"
              onClick={() => {
                onDelete(roomId);
                setOpenDelete(false);
              }}
            >
              Delete
            </Button>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default RoomArea;

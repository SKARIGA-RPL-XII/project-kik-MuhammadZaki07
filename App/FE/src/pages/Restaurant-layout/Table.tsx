import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import Button from "../../components/ui/button/Button";
import Input from "../../components/form/input/InputField";
import Select from "../../components/form/Select";
import MultiSelect from "../../components/form/MultiSelect";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import { TableService } from "../../services/table.service";
import { RoomService, RoomInterface } from "../../services/room.service";
import RoomArea from "../../components/tables/RoomArea";
import MiniTable from "../../components/tables/MiniArea";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export interface TableInterface {
  id: number;
  table_number: string;
  status: "available" | "occupied";
  qr_code: string | null;
}

export default function MiniatureFloorPlan() {
  const [tables, setTables] = useState<TableInterface[]>([]);
  const [rooms, setRooms] = useState<RoomInterface[]>([]);
  const [loading, setLoading] = useState(false);

  // Table Form
  const [openTableForm, setOpenTableForm] = useState(false);
  const [selectedTable, setSelectedTable] = useState<TableInterface | null>(
    null,
  );
  const [tableForm, setTableForm] = useState({
    table_number: "",
    status: "available",
  });
  const [tableErrors, setTableErrors] = useState<any>({});
  const [submittingTable, setSubmittingTable] = useState(false);

  const [openRoomForm, setOpenRoomForm] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [roomCapacity, setRoomCapacity] = useState(1);
  const [roomTableIds, setRoomTableIds] = useState<number[]>([]);
  const [roomErrors, setRoomErrors] = useState<any>({});
  const [submittingRoom, setSubmittingRoom] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  useEffect(() => {
    fetchTables();
    fetchRooms();
  }, []);

  const fetchTables = async () => {
    setLoading(true);
    const { data } = await TableService.getTables({ page: 1, size: 100 });
    if (data) setTables(data.data.tables);
    setLoading(false);
  };

  const fetchRooms = async () => {
    const data = await RoomService.getRooms();
    setRooms(data);
  };

  const resetTableForm = () => {
    setTableForm({ table_number: "", status: "available" });
    setTableErrors({});
    setSelectedTable(null);
    setSubmittingTable(false);
  };

  const handleTableSubmit = async () => {
    setSubmittingTable(true);
    setTableErrors({});
    try {
      if (!tableForm.table_number.trim()) {
        setTableErrors({ table_number: ["Table number is required"] });
        setSubmittingTable(false);
        return;
      }
      if (selectedTable) {
        await TableService.updateTable(selectedTable.id, tableForm);
      } else {
        await TableService.createTable(tableForm);
      }
      setOpenTableForm(false);
      resetTableForm();
      fetchTables();
      fetchRooms();
    } catch (err: any) {
      if (err?.error) setTableErrors(err.error);
    }
    setSubmittingTable(false);
  };

  const handleTableDelete = async () => {
    if (!selectedTable) return;
    if (!window.confirm("Are you sure to delete this table?")) return;
    await TableService.deleteTable(selectedTable.id);
    setOpenTableForm(false);
    resetTableForm();
    fetchTables();
  };

  const handleRoomSubmit = async () => {
    setSubmittingRoom(true);
    setRoomErrors({});
    const newErrors: any = {};
    let valid = true;

    if (!roomName.trim()) {
      newErrors.name = "Room name is required";
      valid = false;
    }
    if (roomCapacity < 1) {
      newErrors.capacity = "Capacity must be at least 1";
      valid = false;
    }
    if (roomTableIds.length === 0) {
      newErrors.table_ids = "Select at least one table";
      valid = false;
    }
    if (roomTableIds.length > roomCapacity) {
      newErrors.table_ids = `Max ${roomCapacity} tables allowed`;
      valid = false;
    }

    setRoomErrors(newErrors);
    if (!valid) {
      setSubmittingRoom(false);
      return;
    }

    try {
      const room = await RoomService.createRoom({
        name: roomName,
        capacity: roomCapacity,
        table_ids: roomTableIds,
      });
      setAlertMessage(`Room "${room.name}" created successfully!`);
      setRoomName("");
      setRoomCapacity(1);
      setRoomTableIds([]);
      setOpenRoomForm(false);
      fetchRooms();
    } catch (err: any) {
      setAlertMessage(err?.message || "Failed to create room");
    }

    setSubmittingRoom(false);
  };

  const updateRoom = async (
    roomId: number,
    payload: {
      name: string;
      capacity: number;
      table_ids: number[];
    },
  ) => {
    setLoading(true);
    try {
      const updatedRoom = await RoomService.updateRoom(roomId, payload);

      setRooms((prev) =>
        prev.map((r) => (r.id === roomId ? updatedRoom.data : r)),
      );
    } finally {
      setLoading(false);
    }
  };

  const deleteRoom = async (roomId: number) => {
    setLoading(true);
    try {
      await RoomService.deleteRoom(roomId);
      setRooms((prev) => prev.filter((r) => r.id !== roomId));
    } finally {
      setLoading(false);
    }
  };

  const multiOptions = tables.map((t) => ({
    text: `Table ${t.table_number} (${t.status})`,
    value: t.id.toString(),
  }));

  return (
    <>
      <PageBreadcrumb pageTitle="Table & Room" />
      <PageMeta title="Table & Room" description="Restaurant layout" />

      <ComponentCard title="Actions" className="mb-10 flex justify-between">
        <div className="flex gap-2">
          <Button
            onClick={() => {
              setSelectedTable(null);
              setOpenTableForm(true);
            }}
          >
            Create Table <Plus size={16} />
          </Button>

          <AlertDialog open={openRoomForm} onOpenChange={setOpenRoomForm}>
            <AlertDialogTrigger asChild>
              <Button>Create Room</Button>
            </AlertDialogTrigger>

            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Create Room</AlertDialogTitle>
              </AlertDialogHeader>

              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Room Name</label>
                  <Input
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    placeholder="Room name"
                  />
                  {roomErrors.name && (
                    <p className="text-red-500 text-xs">{roomErrors.name}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium">Capacity</label>
                  <Input
                    type="number"
                    value={roomCapacity}
                    onChange={(e) => setRoomCapacity(e.target.value)}
                  />
                  {roomErrors.capacity && (
                    <p className="text-red-500 text-xs">
                      {roomErrors.capacity}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium">Select Tables</label>
                  <MultiSelect
                    options={multiOptions}
                    defaultSelected={roomTableIds.map((id) => id.toString())}
                    onChange={(values) =>
                      setRoomTableIds(values.map((v) => Number(v)))
                    }
                  />
                  {roomErrors.table_ids && (
                    <p className="text-red-500 text-xs">
                      {roomErrors.table_ids}
                    </p>
                  )}
                </div>
              </div>

              {alertMessage && (
                <p className="text-green-500 text-sm">{alertMessage}</p>
              )}

              <div className="flex justify-end gap-2 h-10 items-center">
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <Button
                  onClick={handleRoomSubmit}
                  disabled={submittingRoom}
                  className="bg-black text-white h-9"
                >
                  {submittingRoom ? "Creating..." : "Create Room"}
                </Button>
              </div>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </ComponentCard>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {rooms.map((room) => (
            <RoomArea
              key={room.id}
              roomId={room.id}
              title={room.name}
              cols={room.capacity}
              roomTables={room.tables}
              allTables={tables}
              onEdit={(payload) => updateRoom(room.id, payload)}
              onDelete={() => deleteRoom(room.id)}
            >
              {room.tables.map((table) => (
                <MiniTable
                  key={table.id}
                  table={table}
                  onClick={() => {
                    setSelectedTable(table);
                    setTableForm({
                      table_number: table.table_number,
                      status: table.status,
                    });
                    setOpenTableForm(true);
                  }}
                />
              ))}
            </RoomArea>
          ))}
        </div>
      </div>

      <AlertDialog open={openTableForm} onOpenChange={setOpenTableForm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {selectedTable ? "Edit Table" : "Create Table"}
            </AlertDialogTitle>
          </AlertDialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Table Number</label>
              <Input
                value={tableForm.table_number}
                onChange={(e) =>
                  setTableForm({ ...tableForm, table_number: e.target.value })
                }
                placeholder="Table number"
              />
              {tableErrors.table_number && (
                <p className="text-red-500 text-xs">
                  {tableErrors.table_number[0]}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium">Status</label>
              <Select
                value={tableForm.status}
                onChange={(v) => setTableForm({ ...tableForm, status: v })}
                options={[
                  { label: "Available", value: "available" },
                  { label: "Occupied", value: "occupied" },
                ]}
              />
            </div>
          </div>

          <div className="flex justify-between items-center pt-4">
            {selectedTable && (
              <Button
                onClick={handleTableDelete}
                className="bg-rose-500 text-white h-9 hover:bg-rose-500/70"
              >
                Delete
              </Button>
            )}

            <div className="flex gap-2 ml-auto">
              <AlertDialogCancel
                onClick={() => {
                  resetTableForm();
                }}
              >
                Cancel
              </AlertDialogCancel>

              <Button
                onClick={handleTableSubmit}
                disabled={submittingTable}
                className="bg-black text-white h-9"
              >
                {submittingTable
                  ? "Saving..."
                  : selectedTable
                    ? "Save"
                    : "Create Table"}
              </Button>
            </div>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

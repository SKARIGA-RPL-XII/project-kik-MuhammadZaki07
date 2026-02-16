import TableItem from "./TableItem";

export default function RoomCard({
  room,
  tables,
  onEditTable,
  onDeleteTable,
}: any) {
  return (
    <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow p-6">
      <div className="font-semibold mb-4 text-lg">{room.name}</div>

      <div className="flex flex-wrap gap-4">
        {tables.map((table: any) => (
          <TableItem
            key={table.id}
            table={table}
            onClick={() => onEditTable(table)}
            onDelete={() => onDeleteTable(table.id)}
          />
        ))}
      </div>
    </div>
  );
}

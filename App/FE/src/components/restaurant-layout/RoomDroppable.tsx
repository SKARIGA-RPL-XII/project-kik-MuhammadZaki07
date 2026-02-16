import { useDroppable } from "@dnd-kit/core";

interface RoomDroppableProps {
  room: any;
  children: React.ReactNode;
}

export function RoomDroppable({ room, children }: RoomDroppableProps) {
  const { setNodeRef } = useDroppable({
    id: room.id.toString(),
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        width: room.width,
        height: room.height,
        borderColor: room.color,
      }}
      className="relative border border-dashed rounded-sm bg-white/50 dark:bg-neutral-900/40 flex-shrink-0"
    >
      <div className="absolute -top-8 left-0 font-bold text-[11px] uppercase tracking-[0.2em] text-neutral-400">
        {room.name}
      </div>
      {children}
    </div>
  );
}
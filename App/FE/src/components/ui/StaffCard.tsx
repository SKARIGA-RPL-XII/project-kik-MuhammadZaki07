import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

export type StaffCardProps = {
  emp: any;
  isDragging?: boolean;
  className?: string;
};

/**
 * Presentational staff row. Drag positioning is owned by the parent Draggable.
 */
export const StaffCard = ({ emp, isDragging, className }: StaffCardProps) => {
  return (
    <Card
      className={cn(
        "flex w-full min-w-0 max-w-full items-center gap-2.5 rounded-lg border-border bg-card p-2.5 shadow-none transition-[box-shadow,background-color,border-color] duration-150",
        "hover:bg-muted/40",
        isDragging && "border-primary/15 bg-background shadow-sm ring-1 ring-primary/10",
        className
      )}
    >
      <GripVertical
        size={14}
        className="pointer-events-none shrink-0 text-muted-foreground/50"
        aria-hidden
      />

      <Avatar className="h-7 w-7 shrink-0">
        <AvatarImage src={`${import.meta.env.VITE_STORAGE_URL}/${emp.profile_image}`} />
        <AvatarFallback className="text-[10px] font-medium">
          {emp.user.username.slice(0, 2)}
        </AvatarFallback>
      </Avatar>

      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate text-sm font-medium leading-tight text-foreground">
          {emp.user.username}
        </span>
        <span className="truncate text-xs text-muted-foreground">{emp.user.role.name}</span>
      </div>
    </Card>
  );
};

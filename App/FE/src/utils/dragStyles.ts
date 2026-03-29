import type { CSSProperties } from "react";
import type { DraggableStateSnapshot } from "@hello-pangea/dnd";

/**
 * Merges @hello-pangea/dnd fixed-position drag styles with a subtle lift (no harsh motion).
 */
export function mergeDraggableStyle(
  draggableStyle: CSSProperties | undefined,
  snapshot: DraggableStateSnapshot
): CSSProperties {
  if (!draggableStyle) {
    return {};
  }

  const { transform, transition, ...rest } = draggableStyle;

  if (!snapshot.isDragging) {
    return {
      ...rest,
      transform,
      transition,
      maxWidth: "100%",
    };
  }

  const base =
    typeof transform === "string" && transform.length > 0 && transform !== "none"
      ? transform
      : "";

  const lift = "scale(1.02) translateY(-4px)";

  return {
    ...rest,
    transform: base ? `${base} ${lift}` : lift,
    transition,
    zIndex: 2147483646,
    maxWidth: "100%",
    boxShadow:
      "0 18px 40px -12px rgb(15 23 42 / 0.12), 0 8px 16px -8px rgb(15 23 42 / 0.08), 0 0 0 1px rgb(15 23 42 / 0.05)",
    borderRadius: "0.5rem",
    cursor: "grabbing",
  };
}

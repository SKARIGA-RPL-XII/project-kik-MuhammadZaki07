import React from "react";
import { usePermission } from "@/hooks/usePermission";

interface ActionGuardProps {
  module: string;
  action: "view" | "write" | "delete";
  children: React.ReactNode;
}

export const ActionGuard: React.FC<ActionGuardProps> = ({
  module,
  action,
  children,
}) => {
  const { can, loading } = usePermission();

  if (loading) return null;

  return can(module, action) ? <>{children}</> : null;
};
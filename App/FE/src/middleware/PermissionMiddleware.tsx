import { ReactNode } from "react";
import { Navigate } from "react-router";
import { usePermission } from "@/hooks/usePermission";

type Props = {
  children: ReactNode;
  module: string;
  action?: "view" | "write" | "delete";
};

export const PermissionMiddleware = ({ children, module, action = "view" }: Props) => {
  const { can, loading } = usePermission();

  if (loading) return null;

  return can(module, action) ? <>{children}</> : <Navigate to="/404" replace />;
};
import React, { useEffect } from "react";
import { useNavigate } from "react-router";
import { usePermission } from "@/hooks/usePermission";
import { useAuth } from "@/context/AuthContext";

export const withPermission = (
  Component: React.ComponentType<any>,
  module: string,
  action: "view" | "write" | "delete" = "view"
) => {
  return function ProtectedComponent(props: any) {
    const { can, loading: permLoading } = usePermission();
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    const hasAccess = can(module, action);

    useEffect(() => {
      if (!authLoading && !permLoading && user) {
        if (!hasAccess) {
          navigate("/dashboard", { replace: true });
        }
      }
    }, [hasAccess, user, authLoading, permLoading, navigate]);

    if (authLoading || permLoading) return null;

    return hasAccess ? <Component {...props} /> : null;
  };
};
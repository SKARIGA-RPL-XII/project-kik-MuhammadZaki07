import { useSettings } from "@/context/SettingsContext";
import { useAuth } from "@/context/AuthContext";

export const usePermission = () => {
  const { settings, loading: settingsLoading } = useSettings();
  const { user } = useAuth();
  
  const permissions = settings?.role_permissions || {};
  const userRole = user?.role_name || "";

  const can = (
    moduleName: string,
    action: "view" | "write" | "delete" = "view",
  ) => {
    if (!userRole) return false;
    
    const rolePerms = permissions[userRole] || {};
    const moduleKey = moduleName.toLowerCase();
    const moduleActions = rolePerms[moduleKey] || [];

    return moduleActions.includes(action);
  };

  return { can, loading: settingsLoading };
};
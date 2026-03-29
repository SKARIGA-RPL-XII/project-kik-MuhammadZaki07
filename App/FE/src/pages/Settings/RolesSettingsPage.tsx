import { useEffect, useState } from "react";
import { ShieldCheck, Eye, Edit3, Trash2, Save, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { navConfig } from "@/config/navigation";
import { SettingsService } from "@/services/settings.service";
import Alert from "@/components/ui/alert/Alert";
import PageMeta from "@/components/common/PageMeta";
import ACLSkeleton from "@/components/skeleton/settings/ACLSkeleton";
import { ActionGuard } from "@/components/guard/ActionGuard";

export type PermissionType = "view" | "write" | "delete";

export default function RolesPermissionsPage() {
  const [activeRole, setActiveRole] = useState("cashier");
  const [searchTerm, setSearchTerm] = useState("");
  const [permissions, setPermissions] = useState<
    Record<string, Record<string, PermissionType[]>>
  >({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [success, setSuccess] = useState("");

  const roles = ["admin", "employe", "user", "customer", "cashier"];
  const menuSections = [
    { title: "Overview", items: navConfig.overview || [] },
    { title: "Human Resource", items: navConfig.hr || [] },
    { title: "Point of Sales", items: navConfig.pos || [] },
    { title: "Management", items: navConfig.management || [] },
    { title: "System & Settings", items: navConfig.system || [] },
  ];

  useEffect(() => {
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    setFetching(true);
    try {
      const res = await SettingsService.getAll({ group: "security" });
      const data = res.data?.data || res.data || res;

      if (data?.role_permissions) {
        const rawValue =
          data.role_permissions.value !== undefined
            ? data.role_permissions.value
            : data.role_permissions;

        const parsed =
          typeof rawValue === "string" ? JSON.parse(rawValue) : rawValue;
        setPermissions(parsed || {});
      }
    } catch (err) {
      console.error("Failed to fetch permissions:", err);
    } finally {
      setFetching(false);
    }
  };

  const handleToggle = (
    role: string,
    menuKey: string,
    type: PermissionType,
    parentKey?: string,
  ) => {
    setPermissions((prev) => {
      const rolePerms = { ...(prev[role] || {}) };
      const menuPerms = [...(rolePerms[menuKey] || [])];

      const isAdding = !menuPerms.includes(type);
      const updatedMenuPerms = isAdding
        ? [...menuPerms, type]
        : menuPerms.filter((p) => p !== type);

      const newRolePerms = { ...rolePerms, [menuKey]: updatedMenuPerms };

      if (parentKey && isAdding && !rolePerms[parentKey]?.includes("view")) {
        newRolePerms[parentKey] = [...(rolePerms[parentKey] || []), "view"];
      }

      return { ...prev, [role]: newRolePerms };
    });
  };

  const handleSave = async () => {
    setLoading(true);
    setSuccess("");
    try {
      await SettingsService.updateBulk({
        group: "security",
        settings: { role_permissions: permissions },
      });
      setSuccess(
        "ACL synchronized successfully with granular sub-menu support.",
      );

      window.location.reload();

      setTimeout(() => setSuccess(""), 5000);
    } catch (err) {
      console.error("Save error:", err);
    } finally {
      setLoading(false);
    }
  };

  const renderPermissionButtons = (itemKey: string, parentKey?: string) => {
    const activePerms = permissions[activeRole]?.[itemKey] || [];

    return (
      <div className="flex items-center gap-2">
        {[
          { key: "view", icon: Eye, color: "emerald" },
          { key: "write", icon: Edit3, color: "blue" },
          { key: "delete", icon: Trash2, color: "rose" },
        ].map((action) => {
          const isActive = activePerms.includes(action.key as PermissionType);
          const colorClass =
            action.color === "emerald"
              ? "text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10"
              : action.color === "blue"
                ? "text-blue-500 bg-blue-50 dark:bg-blue-500/10"
                : "text-rose-500 bg-rose-50 dark:bg-rose-500/10";

          return (
            <button
              key={action.key}
              onClick={() =>
                handleToggle(
                  activeRole,
                  itemKey,
                  action.key as PermissionType,
                  parentKey,
                )
              }
              className={`p-2 rounded-lg border transition-all ${
                isActive
                  ? `${colorClass} border-current opacity-100`
                  : "border-neutral-100 dark:border-neutral-800 text-neutral-300 opacity-40 hover:opacity-100"
              }`}
            >
              <action.icon className="h-4 w-4" />
            </button>
          );
        })}
      </div>
    );
  };

  if (fetching) return <ACLSkeleton />;

  return (
    <ActionGuard module="roles & permissions" action="view">
      <div className="w-full space-y-8 px-2 pb-10">
        <PageMeta
          title="Roles & Permissions"
          description="Manage granular access control."
        />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b dark:border-neutral-800 pb-8">
          <div>
            <h1 className="text-2xl font-medium text-neutral-900 dark:text-white">
              Access Control List
            </h1>
            <p className="text-neutral-500 text-sm mt-1">
              Granular Sub-Menu Management.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Input
              placeholder="Search modules..."
              className="h-11 w-64 hidden xl:block"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <ActionGuard module="roles & permissions" action="write">
              <Button
                onClick={handleSave}
                disabled={loading}
                className="bg-red-500 h-11 px-8 gap-3"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save Permissions
              </Button>
            </ActionGuard>
          </div>
        </div>

        {success && (
          <Alert title="Success" variant="success" message={success} />
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="w-full lg:w-72 space-y-2">
            {roles.map((role) => (
              <button
                key={role}
                onClick={() => setActiveRole(role)}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl border transition-all ${
                  activeRole === role
                    ? "bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-red-500 "
                    : "border-transparent text-neutral-500"
                }`}
              >
                <ShieldCheck className="h-5 w-5" />
                <span className="text-sm font-medium capitalize">{role}</span>
              </button>
            ))}
          </aside>

          <div className="flex-1 space-y-8">
            {menuSections.map((section) => (
              <div key={section.title} className="space-y-4">
                <h3 className="text-sm font-medium text-neutral-400 px-2">
                  {section.title}
                </h3>
                <div className="space-y-3">
                  {section.items
                    .filter((m) =>
                      m.name.toLowerCase().includes(searchTerm.toLowerCase()),
                    )
                    .map((menu) => {
                      const menuKey = menu.name.toLowerCase();
                      return (
                        <div
                          key={menu.name}
                          className="bg-white dark:bg-neutral-900 border dark:border-neutral-800 rounded-2xl overflow-hidden "
                        >
                          <div className="p-4 flex items-center justify-between bg-neutral-50/50 dark:bg-neutral-800/20">
                            <div className="flex items-center gap-4">
                              <div className="text-neutral-400">
                                {menu.icon}
                              </div>
                              <span className="font-medium text-sm text-neutral-900 dark:text-white">
                                {menu.name}
                              </span>
                            </div>
                            {renderPermissionButtons(menuKey)}
                          </div>

                          {menu.subItems && (
                            <div className="p-2 bg-white dark:bg-neutral-900 divide-y dark:divide-neutral-800">
                              {menu.subItems.map((sub) => {
                                const subKey = sub.name.toLowerCase();
                                return (
                                  <div
                                    key={sub.name}
                                    className="flex items-center justify-between py-3 px-6 hover:bg-neutral-50 dark:hover:bg-neutral-800/30 transition-colors"
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className="h-1.5 w-1.5 rounded-full bg-neutral-300" />
                                      <span className="text-sm text-neutral-600 dark:text-neutral-400 font-medium">
                                        {sub.name}
                                      </span>
                                    </div>
                                    {renderPermissionButtons(subKey, menuKey)}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ActionGuard>
  );
}

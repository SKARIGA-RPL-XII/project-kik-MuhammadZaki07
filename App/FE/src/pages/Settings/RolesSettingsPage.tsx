import { useEffect, useState } from "react";
import { 
  ShieldCheck, ChevronLeft, Search, Lock, Eye, Edit3, Trash2, 
  Info, LayoutGrid, Save, Loader2
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { navConfig } from "@/config/navigation";
import { SettingsService } from "@/services/settings.service";
import Alert from "@/components/ui/alert/Alert";
import PageMeta from "@/components/common/PageMeta";
import ACLSkeleton from "@/components/skeleton/settings/ACLSkeleton";

type PermissionType = 'view' | 'write' | 'delete';

export default function RolesPermissionsPage() {
  const [activeRole, setActiveRole] = useState("cashier");
  const [searchTerm, setSearchTerm] = useState("");
  const [permissions, setPermissions] = useState<Record<string, Record<string, PermissionType[]>>>({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [success, setSuccess] = useState("");

  const roles = ['admin', 'employe', 'user', 'customer', 'cashier'];
  const allMenus = [...navConfig.main, ...navConfig.others];

  useEffect(() => {
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    setFetching(true);
    try {
      const res = await SettingsService.getAll({ group: "security" });
      const data = res.data?.data || res.data || res;
      
      if (data?.role_permissions) {
        const rawValue = data.role_permissions.value !== undefined 
          ? data.role_permissions.value 
          : data.role_permissions;
          
        const parsed = typeof rawValue === 'string' ? JSON.parse(rawValue) : rawValue;
        setPermissions(parsed || {});
      }
    } catch (err) {
      console.error("Failed to parse permissions:", err);
    } finally {
      setFetching(false);
    }
  };

  const handleToggle = (role: string, menuKey: string, type: PermissionType) => {
    const rolePerms = { ...(permissions[role] || {}) };
    const menuPerms = [...(rolePerms[menuKey] || [])];

    const updatedMenuPerms = menuPerms.includes(type)
      ? menuPerms.filter(p => p !== type)
      : [...menuPerms, type];

    setPermissions({
      ...permissions,
      [role]: {
        ...rolePerms,
        [menuKey]: updatedMenuPerms
      }
    });
  };

  const handleSave = async () => {
    setLoading(true);
    setSuccess("");
    try {
      const res = await SettingsService.updateBulk({
        group: "security",
        settings: { role_permissions: permissions }
      });
      
      if (res.status) {
        setSuccess("Access Control List has been synchronized successfully.");
        setTimeout(() => setSuccess(""), 5000);
      }
    } catch (err) {
      console.error("Save error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <ACLSkeleton/>

  return (
    <div className="w-full space-y-8 px-2 pb-10">
      <PageMeta 
        title="Roles & Permissions | Dashboard" 
        description="Manage granular access control and module visibility for each user role." 
      />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-neutral-200 dark:border-neutral-800 pb-8">
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors md:hidden">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
              Access Control List
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-1">
              Dynamic Security Management & Permissions.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative hidden xl:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <Input 
              placeholder="Search modules..." 
              className="h-11 pl-10 w-64 text-sm bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 rounded-lg focus-visible:ring-1 focus-visible:ring-brand-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button 
            onClick={handleSave}
            disabled={loading}
            className="bg-brand-500 hover:bg-brand-700 text-white h-11 px-8 rounded-lg text-sm gap-3  transition-all"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Configuration
          </Button>
        </div>
      </div>

      {success && (
        <Alert title="Success" variant="success" message={success} />
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="w-full lg:w-72 space-y-2">
          <h3 className="px-1 text-sm font-semibold text-muted-foreground mb-4">Available Roles</h3>
          <div className="flex lg:flex-col overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 gap-2 no-scrollbar">
            {roles.map((role) => (
              <button
                key={role}
                onClick={() => setActiveRole(role)}
                className={`flex-shrink-0 lg:w-full flex items-center justify-between px-4 py-2.5 rounded-sm transition-all duration-200 border ${
                  activeRole === role 
                  ? "bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800  text-brand-500" 
                  : "border-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-sm ${activeRole === role ? "bg-brand-500 text-white" : "bg-neutral-200 dark:bg-neutral-800 text-neutral-400"}`}>
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-bold capitalize tracking-tight">{role}</span>
                </div>
                {activeRole === role && <div className="hidden lg:block h-2 w-2 rounded-full bg-brand-500" />}
              </button>
            ))}
          </div>
        </aside>

        <div className="flex-1 space-y-6">
          <div className="bg-neutral-50 dark:bg-neutral-900/40 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold capitalize mb-1 text-neutral-900 dark:text-white">{activeRole} Level</h2>
                <p className="text-neutral-500 text-xs font-medium">
                  Configuring interaction rules for the <span className="text-brand-500 font-bold">{activeRole}</span> identity.
                </p>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center text-brand-500">
                <Lock className="h-6 w-6" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2 px-1">
              <LayoutGrid className="h-3 w-3" /> Navigation Modules
            </h3>
            
            <div className="grid grid-cols-1 gap-3">
              {allMenus
                .filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((menu) => {
                  const menuKey = (menu.path || menu.name).toLowerCase();
                  const activePerms = permissions[activeRole]?.[menuKey] || [];
                  
                  return (
                    <div key={menu.name} className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all gap-4">
                      <div className="flex items-center gap-5">
                        <div className="p-3 rounded-full bg-neutral-50 dark:bg-neutral-800/50 text-neutral-500 dark:text-neutral-400">
                          {menu.icon}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-neutral-900 dark:text-white tracking-tight">{menu.name}</h4>
                          <p className="text-[10px] text-neutral-400 font-medium mt-0.5 tracking-wider uppercase">Identifier: <span className="font-mono text-brand-500/80">{menuKey}</span></p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 border-t sm:border-t-0 pt-4 sm:pt-0">
                        {[
                          { key: 'view', icon: Eye, label: 'View', color: 'emerald' },
                          { key: 'write', icon: Edit3, label: 'Write', color: 'blue' },
                          { key: 'delete', icon: Trash2, label: 'Delete', color: 'rose' }
                        ].map((action) => {
                          const isActive = activePerms.includes(action.key as PermissionType);
                          
                          const colorActive = action.color === 'emerald' ? 'bg-emerald-50 text-emerald-500 dark:bg-emerald-500/10 dark:text-emerald-500 border-emerald-100 dark:border-emerald-500/20' :
                                             action.color === 'blue' ? 'bg-blue-50 text-blue-500 dark:bg-blue-500/10 dark:text-blue-500 border-blue-100 dark:border-blue-500/20' :
                                             'bg-rose-50 text-rose-500 dark:bg-rose-500/10 dark:text-rose-500 border-rose-100 dark:border-rose-500/20';

                          return (
                            <button
                              key={action.key}
                              onClick={() => handleToggle(activeRole, menuKey, action.key as PermissionType)}
                              className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-all w-[70px] ${
                                isActive ? `${colorActive} scale-100` : 'bg-transparent border-neutral-100 dark:border-neutral-800 text-neutral-300 opacity-40 grayscale hover:grayscale-0 hover:opacity-100'
                              }`}
                            >
                              <action.icon className="h-4 w-4" />
                              <span className="text-[9px] font-bold uppercase tracking-tighter">{action.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          <div className="bg-neutral-100 dark:bg-neutral-900/50 rounded-xl p-6 border border-dashed border-neutral-300 dark:border-neutral-800 flex gap-4">
            <Info className="h-5 w-5 text-neutral-400 shrink-0" />
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed italic">
              Permissions are stored in high-performance JSON format. Ensure the system middleware is correctly filtering API responses based on the <code className="bg-neutral-200 dark:bg-neutral-800 px-1.5 py-0.5 rounded text-brand-500 font-mono">role_permissions</code> schema.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
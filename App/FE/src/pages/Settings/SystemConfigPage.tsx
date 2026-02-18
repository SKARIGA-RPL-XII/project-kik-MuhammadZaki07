import { useState, useEffect } from "react";
import {
  Globe,
  ShieldCheck,
  Printer,
  Save,
  Loader2,
  ChevronLeft,
  Store,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { SettingsService } from "@/services/settings.service";
import Alert from "@/components/ui/alert/Alert";
import PageMeta from "@/components/common/PageMeta";
import SystemConfigSkeleton from "@/components/skeleton/settings/SystemConfigSkeleton";

export default function SystemConfigPage() {
  const [activeTab, setActiveTab] = useState("general");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [success, setSuccess] = useState("");
  const [config, setConfig] = useState({
    company_name: "",
    currency_symbol: "Rp",
    timezone: "Asia/Jakarta",
    low_stock_threshold: 5,
    auto_print_receipt: false,
    session_timeout: 60,
    maintenance_mode: false,
  });

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    setFetching(true);
    try {
      const res = await SettingsService.getAll({ group: "system" });
      const rawData = res.data?.data || res.data || res;

      if (rawData) {
        const formatted = Object.keys(rawData).reduce((acc: any, key) => {
          let item = rawData[key];
          let val =
            item && typeof item === "object" && "value" in item
              ? item.value
              : item;

          if (val === "1" || val === "0" || val === "true" || val === "false") {
            val = val === "1" || val === "true";
          } else if (
            !isNaN(Number(val)) &&
            key !== "currency_symbol" &&
            key !== "timezone" &&
            typeof val === "string" &&
            val.trim() !== ""
          ) {
            val = Number(val);
          }

          acc[key] = val;
          return acc;
        }, {});

        setConfig((prev) => ({ ...prev, ...formatted }));
      }
    } catch (err) {
      console.error("Error fetching config:", err);
    } finally {
      setFetching(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setSuccess("");

    const settingsToSave = Object.keys(config).reduce((acc: any, key) => {
      const val = (config as any)[key];
      acc[key] = typeof val === "boolean" ? (val ? 1 : 0) : val;
      return acc;
    }, {});

    const res = await SettingsService.updateBulk({
      group: "system",
      settings: settingsToSave,
    });

    if (res.status) {
      setSuccess("System environment variables updated successfully.");
      setTimeout(() => setSuccess(""), 5000);
    }
    setLoading(false);
  };

  const menuItems = [
    { id: "general", label: "General", icon: Store },
    { id: "localization", label: "Localization", icon: Globe },
    { id: "operation", label: "Operation", icon: Printer },
    { id: "security", label: "Security", icon: ShieldCheck },
  ];

  if (fetching) return <SystemConfigSkeleton />;

  return (
    <div className="w-full space-y-8 px-2 pb-10">
      <PageMeta
        title="System Settings | Dashboard"
        description="Global business identity and core system architecture configuration."
      />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-neutral-200 dark:border-neutral-800 pb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            System Settings
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-1">
            Global business identity and core environment configuration.
          </p>
        </div>

        <Button
          onClick={handleSave}
          disabled={loading}
          className="bg-brand-500 hover:bg-brand-700 text-white h-11 px-8 rounded-lg text-sm gap-3  transition-all"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Save Changes
        </Button>
      </div>

      {success && <Alert title="Success" variant="success" message={success} />}

      <div className="flex flex-col lg:flex-row gap-12">
        <aside className="w-full lg:w-64 shrink-0 space-y-1">
          <p className="px-4 text-sm font-semibold text-muted-foreground mb-4">
            Configuration Groups
          </p>
          <div className="flex lg:flex-col overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 gap-1 no-scrollbar">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex-shrink-0 lg:w-full flex items-center gap-4 px-4 py-2.5 rounded-lg transition-all duration-200 ${
                  activeTab === item.id
                    ? "bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800  text-brand-500"
                    : "border border-transparent text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-900/50"
                }`}
              >
                <item.icon
                  className={`h-4 w-4 ${activeTab === item.id ? "text-brand-500" : "text-neutral-400"}`}
                />
                <span className="text-sm font-bold tracking-tight">
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        </aside>

        <div className="flex-1 max-w-2xl animate-in fade-in slide-in-from-bottom-2 duration-300">
          {activeTab === "general" && (
            <div className="space-y-8">
              <div className="pb-6 border-b border-neutral-100 dark:border-neutral-800">
                <h2 className="text-xl font-bold tracking-tight mb-1">
                  General Settings
                </h2>
                <p className="text-xs text-neutral-500 font-medium">
                  Global business identity and branding settings.
                </p>
              </div>
              <div className="grid gap-3">
                <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 ml-1">
                  Business / Store Name
                </label>
                <Input
                  value={config.company_name}
                  onChange={(e) =>
                    setConfig({ ...config, company_name: e.target.value })
                  }
                  placeholder="Enter store name..."
                  className="h-12 bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-sm px-5 focus-visible:ring-1 focus-visible:ring-brand-500"
                />
              </div>
            </div>
          )}

          {activeTab === "localization" && (
            <div className="space-y-8">
              <div className="pb-6 border-b border-neutral-100 dark:border-neutral-800">
                <h2 className="text-xl font-bold tracking-tight mb-1">
                  Localization
                </h2>
                <p className="text-xs text-neutral-500 font-medium">
                  Define currency symbols and regional time reporting.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-8">
                <div className="grid gap-3">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 ml-1">
                    Currency Symbol
                  </label>
                  <Input
                    value={config.currency_symbol}
                    onChange={(e) =>
                      setConfig({ ...config, currency_symbol: e.target.value })
                    }
                    className="h-12 bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-sm px-5 focus-visible:ring-1 focus-visible:ring-brand-500"
                  />
                </div>
                <div className="grid gap-3">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 ml-1">
                    System Timezone
                  </label>
                  <div className="relative">
                    <select
                      value={config.timezone}
                      onChange={(e) =>
                        setConfig({ ...config, timezone: e.target.value })
                      }
                      className="w-full h-12 pl-5 pr-12 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-sm text-sm font-medium focus:ring-1 focus:ring-brand-500 outline-none appearance-none transition-all cursor-pointer"
                    >
                      <option value="Asia/Jakarta">
                        Jakarta (WIB) - GMT+07:00
                      </option>
                      <option value="Asia/Makassar">
                        Makassar (WITA) - GMT+08:00
                      </option>
                      <option value="Asia/Jayapura">
                        Jayapura (WIT) - GMT+09:00
                      </option>
                      <option value="UTC">UTC / Greenwich</option>
                    </select>
                    <Clock className="absolute right-5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" />
                  </div>
                  <p className="text-[10px] text-neutral-400 italic px-1 leading-relaxed">
                    This ensures your sales reports and transaction timestamps
                    reflect the correct local time.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "operation" && (
            <div className="space-y-8">
              <div className="pb-6 border-b border-neutral-100 dark:border-neutral-800">
                <h2 className="text-xl font-bold tracking-tight mb-1">
                  Operations
                </h2>
                <p className="text-xs text-neutral-500 font-medium">
                  Control hardware behavior and stock management alerts.
                </p>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl ">
                  <div className="space-y-1">
                    <p className="text-sm font-bold tracking-tight text-neutral-900 dark:text-white">
                      Auto Print Receipt
                    </p>
                    <p className="text-xs text-neutral-500">
                      Automatically trigger thermal printer after transaction.
                    </p>
                  </div>
                  <Switch
                    checked={config.auto_print_receipt}
                    onCheckedChange={(val) =>
                      setConfig({ ...config, auto_print_receipt: val })
                    }
                  />
                </div>
                <div className="grid gap-3">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 ml-1">
                    Low Stock Threshold
                  </label>
                  <Input
                    type="number"
                    value={config.low_stock_threshold}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        low_stock_threshold: Number(e.target.value),
                      })
                    }
                    className="h-12 bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-sm px-5 focus-visible:ring-1 focus-visible:ring-brand-500"
                  />
                  <p className="text-[10px] text-neutral-400 px-1">
                    Alert will be triggered when items reach this quantity.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-8">
              <div className="pb-6 border-b border-neutral-100 dark:border-neutral-800">
                <h2 className="text-xl font-bold tracking-tight mb-1">
                  Security
                </h2>
                <p className="text-xs text-neutral-500 font-medium">
                  System protection and availability control.
                </p>
              </div>
              <div className="space-y-6">
                <div className="grid gap-3">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 ml-1">
                    Session Timeout (Minutes)
                  </label>
                  <Input
                    type="number"
                    value={config.session_timeout}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        session_timeout: Number(e.target.value),
                      })
                    }
                    className="h-12 bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-sm px-5 focus-visible:ring-1 focus-visible:ring-brand-500"
                  />
                </div>
                <div className="flex items-center justify-between p-6 bg-rose-50/20 dark:bg-rose-500/5 border border-rose-100 dark:border-rose-500/10 rounded-2xl">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-rose-500">
                      Maintenance Mode
                    </p>
                    <p className="text-xs text-rose-500/70">
                      Restrict system access to Administrators only.
                    </p>
                  </div>
                  <Switch
                    checked={config.maintenance_mode}
                    onCheckedChange={(val) =>
                      setConfig({ ...config, maintenance_mode: val })
                    }
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { SettingsService } from "@/services/settings.service";

interface SidebarConfig {
  dashboard: boolean;
  menu: boolean;
  reports: boolean;
}

interface PagesConfig {
  reservation: boolean;
  kitchen_display: boolean;
}

interface Settings {
  store_name: string;
  phone: string;
  address: string;
  theme: "light" | "dark";
  tax_percentage: string;
  service_percentage: string;
  cash_enabled: string;
  qris_enabled: string;
  card_enabled: string;
  sidebar_config: SidebarConfig;
  pages_config: PagesConfig;
}

const SettingsContext = createContext<Settings | null>(null);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      const data = await SettingsService.getAll();
      setSettings({
        ...data.data,
        sidebar_config: JSON.parse(data.data.sidebar_config || "{}"),
        pages_config: JSON.parse(data.data.pages_config || "{}"),
      });
    };

    fetchSettings();
  }, []);

  useEffect(() => {
    if (!settings) return;

    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(settings.theme);
  }, [settings]);

  return (
    <SettingsContext.Provider value={settings}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used inside SettingsProvider");
  return ctx;
};

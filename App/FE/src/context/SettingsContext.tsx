import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { SettingsService } from "@/services/settings.service";

interface SettingsContextType {
  settings: Record<string, any>;
  loading: boolean;
  getSetting: (key: string, defaultValue?: any) => any;
  refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined,
);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await SettingsService.getAll();
      if (res.data) {
        const flatSettings = Object.keys(res.data).reduce((acc: any, key) => {
          acc[key] = res.data[key].value;
          return acc;
        }, {});
        setSettings(flatSettings);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const getSetting = (key: string, defaultValue: any = null) => {
    return settings[key] ?? defaultValue;
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        loading,
        getSetting,
        refreshSettings: fetchSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};

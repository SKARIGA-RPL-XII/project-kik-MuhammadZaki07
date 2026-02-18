import { SettingsService } from "@/services/settings.service";
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

interface SettingsContextType {
  settings: any;
  loading: boolean;
  getSetting: (key: string, defaultValue?: any) => any;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await SettingsService.getAll();
      const rawData = res.data?.data || res.data || res;
      
      const processed = Object.keys(rawData).reduce((acc: any, key) => {
        acc[key] = rawData[key].value !== undefined ? rawData[key].value : rawData[key]; 
        return acc;
      }, {});

      setSettings(processed);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const getSetting = (key: string, defaultValue: any = null) => {
    return settings[key] !== undefined ? settings[key] : defaultValue;
  };

  return (
    <SettingsContext.Provider value={{ settings, loading, getSetting }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) throw new Error("useSettings must be used within SettingsProvider");
  return context;
};
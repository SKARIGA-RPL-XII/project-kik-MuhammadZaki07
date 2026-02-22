import { useSettings } from "@/context/SettingsContext";
import { Bell, User, MapPin } from "lucide-react";
import { useState } from "react";
import { CustomerProfileModal } from "../dialog/CustomerProfileModal";

interface HeaderProps {
  tableId?: string;
}

export function Header({ tableId = "Table 12" }: HeaderProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { settings, loading } = useSettings();

  if (loading) return <div className="h-20 bg-white animate-pulse border-b border-neutral-100" />;

  return (
    <>
      <header className="sticky top-0 z-[40] bg-white/80 backdrop-blur-md border-b border-neutral-100">
        <div className="px-4 md:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 flex justify-center items-center overflow-hidden">
              <img 
                src={`${import.meta.env.VITE_STORAGE_URL}/${settings?.logo_light}`} 
                alt="Logo" 
                className="w-full h-full object-contain" 
              />
            </div>
            <div className="flex flex-col">
              <h1 className="font-black text-brand-600 text-base uppercase tracking-tight leading-none mb-1">
                {settings?.store_name}
              </h1>
              <div className="flex items-center gap-1 text-neutral-400">
                <MapPin size={10} className="text-brand-500" />
                <span className="text-[10px] font-medium tracking-tight truncate max-w-[150px]">
                  {settings?.address}
                </span>
              </div>
            </div>
          </div>

          <div className="hidden lg:block bg-neutral-50 px-4 py-2 rounded-xl border border-neutral-100">
            <div className="flex items-center gap-3">
              <div className="flex h-1.5 w-1.5 relative">
                <span className="animate-ping absolute h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                <span className="relative h-full w-full rounded-full bg-brand-600"></span>
              </div>
              <span className="text-[11px] font-black uppercase tracking-widest text-brand-600">
                {tableId}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button className="p-2.5 rounded-xl hover:bg-neutral-50 text-neutral-400 transition-colors relative">
              <Bell size={18} />
              <span className="absolute top-3 right-3 w-1.5 h-1.5 bg-brand-600 rounded-full" />
            </button>
            <div className="w-[1px] h-4 bg-neutral-100 mx-2" />
            <button 
              onClick={() => setIsProfileOpen(true)}
              className="flex items-center gap-2 p-1 pr-3 rounded-xl hover:bg-neutral-50 transition-colors"
            >
              <div className="w-9 h-9 rounded-lg bg-neutral-50 border border-neutral-100 flex items-center justify-center text-neutral-600">
                <User size={16} />
              </div>
            </button>
          </div>
        </div>
      </header>

      <CustomerProfileModal
        isOpen={isProfileOpen} 
        onClose={() => setIsProfileOpen(false)} 
      />
    </>
  );
}
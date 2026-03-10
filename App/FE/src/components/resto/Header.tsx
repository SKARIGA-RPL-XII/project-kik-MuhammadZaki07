import { useSettings } from "@/context/SettingsContext";
import { Bell, User, MapPin, LogIn } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Link, useNavigate } from "react-router";

interface HeaderProps {
  tableId?: string;
}

export function Header({ tableId = "-" }: HeaderProps) {
  const { settings, loading } = useSettings();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleProfileClick = () => {
    if (!user) {
      navigate("/auth/sign-in");
      return;
    }

    if (user.role_name === "admin") {
      return;
    }

    navigate("/profile-customer")
  };


  if (loading)
    return (
      <div className="h-20 bg-white animate-pulse border-b border-neutral-100" />
    );

  return (
    <>
      <header className="sticky top-0 z-[40] bg-white/80 backdrop-blur-md border-b">
        <div className="px-4 md:px-8 h-20 flex items-center justify-between">
          <Link to={"/"}>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 flex justify-center items-center overflow-hidden">
              <img
                src={`${import.meta.env.VITE_STORAGE_URL}/${settings?.logo_light}`}
                alt="Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex flex-col">
              <h1 className="font-semibold text-red-600 text-base leading-none mb-1">
                {settings?.store_name}
              </h1>
              <div className="flex items-center gap-1 text-neutral-400">
                <MapPin size={10} className="text-red-500" />
                <span className="text-xs font-normal truncate max-w-[200px]">
                  {settings?.address}
                </span>
              </div>
            </div>
          </div>
          </Link>

          {tableId && (
            <div className="hidden lg:block bg-neutral-50 px-4 py-2 rounded-lg border">
              <div className="flex items-center gap-3">
                <div className="flex h-1.5 w-1.5 relative">
                  <span className="animate-ping absolute h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative h-full w-full rounded-full bg-red-600"></span>
                </div>
                <span className="text-sm font-medium text-red-600">
                  {tableId}
                </span>
              </div>
            </div>
          )}

          <div className="flex items-center gap-1">
            <button className="p-2.5 rounded-xl hover:bg-neutral-50 text-neutral-400 transition-colors relative">
              <Bell size={18} />
              <span className="absolute top-3 right-3 w-1.5 h-1.5 bg-red-600 rounded-full" />
            </button>
            <div className="w-[1px] h-4 bg-neutral-100 mx-2" />
            <button
              onClick={handleProfileClick}
              className={`flex items-center gap-2 p-1 rounded-xl transition-colors ${user?.role_name === "admin"
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-neutral-50"
                }`}
            >
              <div className="w-9 h-9 rounded-lg bg-neutral-50 border border-neutral-100 flex items-center justify-center text-neutral-600">
                {!user ? <LogIn size={16} /> : <User size={16} />}
              </div>
            </button>
          </div>
        </div>
      </header>
    </>
  );
}

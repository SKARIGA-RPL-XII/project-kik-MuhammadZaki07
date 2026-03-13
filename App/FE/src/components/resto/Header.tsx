import { useSettings } from "@/context/SettingsContext";
import { User, MapPin, LogIn } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Link, useNavigate } from "react-router";
import NotificationDropdown from "../header/NotificationDropdown";
import LanguageSwitcher from "../ui/LanguageSwitcher";
import { useTranslation } from "react-i18next";
import { ThemeToggleButton } from "../common/ThemeToggleButton";
import { useTheme } from "@/context/ThemeContext";

interface HeaderProps {
  tableId?: string;
}

export function Header({ tableId = "-" }: HeaderProps) {
  const { settings, loading } = useSettings();
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const {theme} = useTheme();
  

  const handleProfileClick = () => {
    if (!user) {
      navigate("/auth/sign-in");
      return;
    }

    if (user.role_name === "admin") {
      return;
    }

    navigate("/profile-customer");
  };

  if (loading)
    return (
      <div className="h-20 bg-white dark:bg-neutral-900 animate-pulse border-b" />
    );

  return (
    <>
      <header className="sticky top-0 z-[200] bg-white/80 dark:bg-neutral-900 backdrop-blur-md border-b">
        <div className="px-4 md:px-8 h-20 flex items-center justify-between">
          <Link to={"/"}>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 flex justify-center items-center overflow-hidden">
                <img
                  src={`${import.meta.env.VITE_STORAGE_URL}/${theme == "dark" ? settings?.logo_dark : settings?.logo_light}`}
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
                  <span className="text-xs font-normal truncate max-w-[200px] dark:text-neutral-300">
                    {settings?.address}
                  </span>
                </div>
              </div>
            </div>
          </Link>

          {tableId && tableId !== "-" && (
            <div className="hidden lg:block bg-neutral-50 dark:bg-neutral-900 px-4 py-2 rounded-lg border">
              <div className="flex items-center gap-3">
                <div className="flex h-1.5 w-1.5 relative">
                  <span className="animate-ping absolute h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative h-full w-full rounded-full bg-red-600"></span>
                </div>
                <span className="text-sm font-medium text-red-600 dark:text-neutral-300">
                  {t("header_table_label")} {tableId}
                </span>
              </div>
            </div>
          )}

          <div className="flex items-center gap-1.5">
            <LanguageSwitcher />
            <ThemeToggleButton/>
            <NotificationDropdown />
            <div className="w-[1px] h-4 bg-neutral-100 mx-2" />
            <button
              title={
                !user ? t("header_login_tooltip") : t("header_profile_tooltip")
              }
              onClick={handleProfileClick}
              className={`flex items-center gap-2 p-1 rounded-lg transition-colors ${
                user?.role_name === "admin"
                  ? "opacity-50 cursor-not-allowed"
                  : "bg-neutral-50 dark:bg-neutral-800"
              }`}
            >
              <div className="w-9 h-9 rounded-lg bg-neutral-50 border dark:bg-neutral-900 flex items-center justify-center text-neutral-600">
                {!user ? <LogIn size={16} /> : <User size={16} />}
              </div>
              <span className="hidden md:block text-xs font-medium mr-2 dark:text-neutral-300">
                {!user ? t("header_login_btn") : t("header_profile_btn")}
              </span>
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
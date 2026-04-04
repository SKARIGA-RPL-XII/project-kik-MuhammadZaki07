import { useSettings } from "@/context/SettingsContext";
import { User, MapPin, LogIn } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Link, useNavigate } from "react-router";
import NotificationDropdown from "../header/NotificationDropdown";
import LanguageSwitcher from "../ui/LanguageSwitcher";
import { useTranslation } from "react-i18next";
import { ThemeToggleButton } from "../common/ThemeToggleButton";
import { useTheme } from "@/context/ThemeContext";
import { Skeleton } from "../ui/skeleton";

interface HeaderProps {
  tableId?: string;
}

export function Header({ tableId = "-" }: HeaderProps) {
  const { settings, loading } = useSettings();
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { theme } = useTheme();

  const handleProfileClick = () => {
    if (!user) {
      navigate("/auth/sign-in");
      return;
    }

    if (
      user.role_name === "admin" ||
      user.role_name === "employe" ||
      user.role_name === "cashier"
    ) {
      navigate("/dashboard");
    } else {
      navigate("/profile-customer");
    }
  };

  if (loading) {
    return (
      <header className="sticky top-0 z-[200] bg-white dark:bg-neutral-900 border-b">
        <div className="px-4 md:px-8 h-16 md:h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-4">
            <Skeleton className="w-8 h-8 md:w-10 md:h-10 rounded-md" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-24 md:w-32" />
              <Skeleton className="h-3 w-32 md:w-48" />
            </div>
          </div>

          <div className="hidden sm:block">
            <Skeleton className="h-10 w-24 rounded-lg" />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <Skeleton className="h-8 w-8 rounded-md" />
              <Skeleton className="h-8 w-8 rounded-md" />
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>
            <div className="hidden xs:block w-[1px] h-4 bg-neutral-200 dark:bg-neutral-700 mx-1" />
            <Skeleton className="h-10 w-10 md:w-28 rounded-lg" />
          </div>
        </div>
      </header>
    );
  }

  return (
    <>
      <header className="sticky top-0 z-[200] bg-white/80 dark:bg-neutral-900 backdrop-blur-md border-b">
        <div className="px-4 md:px-8 h-16 md:h-20 flex items-center justify-between gap-2">
          <Link to={"/"} className="flex-shrink-0">
            <div className="flex items-center gap-2 md:gap-4">
              <div className="w-8 h-8 md:w-10 md:h-10 flex justify-center items-center overflow-hidden">
                <img
                  src={
                    (
                      theme === "dark"
                        ? settings?.logo_dark
                        : settings?.logo_light
                    )
                      ? `${import.meta.env.VITE_STORAGE_URL}/${theme === "dark" ? settings?.logo_dark : settings?.logo_light}`
                      : "/image-dumy.png"
                  }
                  alt="Logo"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/image-dumy.png";
                  }}
                />
              </div>
              <div className="flex flex-col min-w-0">
                <h1 className="font-semibold text-red-600 text-sm md:text-base leading-none mb-0.5 md:mb-1 truncate max-w-[120px] md:max-w-none">
                  {settings?.store_name ?? "store name"}
                </h1>
                <div className="flex items-center gap-1 text-neutral-400">
                  <MapPin size={10} className="text-red-500 flex-shrink-0" />
                  <span className="text-[10px] md:text-xs font-normal truncate max-w-[100px] md:max-w-[200px] dark:text-neutral-300">
                    {settings?.address ?? "addres"}
                  </span>
                </div>
              </div>
            </div>
          </Link>

          {tableId && tableId !== "-" && (
            <div className="hidden sm:block bg-neutral-50 dark:bg-neutral-800/50 px-3 py-1.5 md:px-4 md:py-2 rounded-lg border border-neutral-100 dark:border-neutral-700">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="flex h-1.5 w-1.5 relative">
                  <span className="animate-ping absolute h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative h-full w-full rounded-full bg-red-600"></span>
                </div>
                <span className="text-[10px] md:text-sm font-medium text-red-600 dark:text-neutral-300 whitespace-nowrap">
                  {t("header_table_label")} {tableId ?? "ID"}
                </span>
              </div>
            </div>
          )}

          <div className="flex items-center gap-1 md:gap-2">
            <div className="flex items-center gap-0.5 md:gap-1">
              <LanguageSwitcher />
              <ThemeToggleButton />
              <NotificationDropdown />
            </div>

            <div className="hidden xs:block w-[1px] h-4 bg-neutral-200 dark:bg-neutral-700 mx-1" />

            <button
              title={
                !user ? t("header_login_tooltip") : t("header_profile_tooltip")
              }
              onClick={handleProfileClick}
              className={`flex items-center gap-2 p-1 rounded-lg transition-all active:scale-95 bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700"`}
            >
              <div className="w-8 h-8 md:w-9 md:h-9 rounded-lg bg-white border dark:border-neutral-700 dark:bg-neutral-900 flex items-center justify-center text-neutral-600 dark:text-neutral-300">
                {!user ? <LogIn size={16} /> : <User size={16} />}
              </div>
              <span className="hidden lg:block text-xs font-medium mr-2 dark:text-neutral-300">
                {!user
                  ? t("header_login_btn")
                  : user.role_name !== "customer"
                    ? "Dashboard"
                    : t("header_profile_btn")}
              </span>
            </button>
          </div>
        </div>
      </header>
    </>
  );
}

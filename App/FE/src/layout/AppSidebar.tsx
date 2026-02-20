import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router";
import { HorizontaLDots } from "../icons";
import { useSidebar } from "../context/SidebarContext";
import { useAuth } from "@/context/AuthContext";
import { navConfig, NavItem } from "../config/navigation";
import { SidebarItem } from "@/components/sidebar/SidebarItem";
import { usePermission } from "@/hooks/usePermission";
import SidebarSkeleton from "@/components/skeleton/SidebarSkeleton";
import { useSettings } from "@/context/SettingsContext";

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const { pathname } = useLocation();
  const { user } = useAuth();
  const { can, loading: permissionLoading } = usePermission();
  const settings = useSettings();
  const config = settings?.settings || {};

  const getLogoUrl = (path: string, fallback: string) => {
    return path ? `${import.meta.env.VITE_STORAGE_URL}/${path}` : fallback;
  };

  const [openKey, setOpenKey] = useState<string | null>(null);
  const [heights, setHeights] = useState<Record<string, number>>({});
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const showFull = isExpanded || isHovered || isMobileOpen;
  const isActive = useCallback((path: string) => pathname === path, [pathname]);

  useEffect(() => {
    Object.entries(navConfig).forEach(([type, items]) => {
      items.forEach((nav, idx) => {
        if (nav.subItems?.some((sub) => isActive(sub.path))) {
          setOpenKey(`${type}-${idx}`);
        }
      });
    });
  }, [pathname, isActive]);

  useEffect(() => {
    if (openKey && subMenuRefs.current[openKey]) {
      setHeights((prev) => ({
        ...prev,
        [openKey]: subMenuRefs.current[openKey]?.scrollHeight || 0,
      }));
    }
  }, [openKey]);

  const filterRole = (items: NavItem[]) => {
    return items
      .map((item) => {
        const parentKey = item.name.toLowerCase();
        const hasParentAccess = can(parentKey, "view");

        if (item.subItems) {
          const filteredSubItems = item.subItems.filter((sub) => {
            return can(sub.name.toLowerCase(), "view");
          });

          if (!hasParentAccess || filteredSubItems.length === 0) return null;

          return {
            ...item,
            subItems: filteredSubItems,
          };
        }

        return hasParentAccess ? item : null;
      })
      .filter((item): item is NavItem => item !== null);
  };

  const renderSection = (
    title: string,
    items: NavItem[],
    type: "main" | "others",
  ) => {
    const allowedItems = filterRole(items);
    if (allowedItems.length === 0) return null;

    return (
      <div className="mb-6">
        <h2
          className={`mb-4 text-xs uppercase flex text-neutral-400 ${!showFull ? "lg:justify-center" : "justify-start"}`}
        >
          {showFull ? title : <HorizontaLDots className="size-6" />}
        </h2>
        <ul className="flex flex-col gap-4">
          {allowedItems.map((item, idx) => {
            const key = `${type}-${idx}`;
            return (
              <SidebarItem
                key={item.name}
                item={item}
                isActive={isActive}
                isExpanded={showFull}
                isOpen={openKey === key}
                onToggle={() => setOpenKey(openKey === key ? null : key)}
                subMenuRef={(el) => (subMenuRefs.current[key] = el)}
                height={heights[key] || 0}
              />
            );
          })}
        </ul>
      </div>
    );
  };

  if (permissionLoading) {
    return <SidebarSkeleton />;
  }

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-neutral-900 border-r dark:border-neutral-800 h-screen transition-all duration-300 z-50 ${showFull ? "w-[290px]" : "w-[90px]"} ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex ${!showFull ? "lg:justify-center" : "justify-start"}`}
      >
        <Link to="/" className="flex items-center gap-3">
          <img
            src={getLogoUrl(config.logo_light, "/black-logo.png")}
            alt="Logo"
            loading="lazy"
            style={{ width: showFull ? 50 : 32, height: "auto" }}
            className="dark:hidden object-contain"
          />

          <img
            src={getLogoUrl(config.logo_dark, "/white-logo.png")}
            alt="Logo"
            loading="lazy"
            style={{ width: showFull ? 50 : 32, height: "auto" }}
            className="hidden dark:block object-contain"
          />

          {showFull && (
            <div className="flex flex-col">
              <span className="dark:text-white font-bold text-sm">
                {config.store_name || "Restoran"}
              </span>
              <span className="text-neutral-500 text-xs">
                {user?.email || "admin@mail.com"}
              </span>
            </div>
          )}
        </Link>
      </div>

      <nav className="flex flex-col overflow-y-auto no-scrollbar">
        {renderSection("Menu", navConfig.main, "main")}
        {renderSection("Others", navConfig.others, "others")}
      </nav>
    </aside>
  );
};

export default AppSidebar;

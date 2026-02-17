import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router";
import {MdFastfood } from "react-icons/md";
import {
  ChevronDownIcon,
  GridIcon,
  HorizontaLDots,
} from "../icons";
import { useSidebar } from "../context/SidebarContext";
import {
  BarChart3,
  Bell,
  ClipboardList,
  MonitorSmartphone,
  Package,
  Settings,
  UserSquare,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
  role: string[];
};

const navItems: NavItem[] = [
  {
    name: "Overview",
    icon: <GridIcon />,
    role: ["admin", "cashier"],
    subItems: [
      { name: "Dashboard", path: "/dashboard" },
      { name: "Notifications", path: "/notifications" },
      { name: "Calendar", path: "/calendar" },
    ],
  },
  {
    name: "Master Data",
    icon: <MdFastfood />,
    role: ["admin"],
    subItems: [
      { name: "Menu", path: "/menu" },
      { name: "Category", path: "/category" },
      { name: "Banner", path: "/banner" },
      { name: "Discount", path: "/discount" },
      { name: "Badge", path: "/badge" },
      { name: "Table & Room", path: "/table" },
    ],
  },
  {
    name: "Cashier",
    icon: <MonitorSmartphone />,
    role: ["cashier"],
    path: "/cashier",
  },
  {
    name: "Account",
    icon: <UserSquare />,
    role: ["admin", "cashier"],
    subItems: [
      { name: "Staff", path: "/staf" },
      { name: "Admin", path: "/admin" },
      { name: "User Profile", path: "/profile" },
    ],
  },
];

const othersItems: NavItem[] = [
  {
    name: "Reports",
    icon: <BarChart3 />,
    role: ["admin"],
    subItems: [
      { name: "Sales Report", path: "/reports/sales" },
      { name: "Daily Revenue", path: "/reports/daily-revenue" },
      { name: "Top Selling Menu", path: "/reports/top-menu" },
      { name: "Transaction History", path: "/reports/transactions" },
    ],
  },
  {
    name: "Inventory",
    icon: <Package />,
    role: ["admin"],
    subItems: [
      { name: "Stock List", path: "/inventory/stock" },
      { name: "Stock Adjustment", path: "/inventory/adjustment" },
      { name: "Suppliers", path: "/inventory/suppliers" },
    ],
  },
  {
    name: "Operations",
    icon: <ClipboardList />,
    role: ["admin"],
    subItems: [
      { name: "Order Queue", path: "/operations/orders" },
      { name: "Kitchen Display", path: "/operations/kitchen" },
      { name: "Reservation", path: "/operations/reservation" },
    ],
  },
  {
    name: "Notifications",
    icon: <Bell />,
    role: ["admin"],
    subItems: [
      { name: "System Logs", path: "/notifications/logs" },
      { name: "Activity History", path: "/notifications/activity" },
    ],
  },
{
  name: "Settings",
  icon: <Settings />,
  role: ["admin"],
  subItems: [
    { name: "General", path: "/settings/general" },
    { name: "Tax & Service", path: "/settings/tax" },
    { name: "Payment Methods", path: "/settings/payment" },
    { name: "Roles & Permissions", path: "/settings/roles" },
    { name: "Theme & Appearance", path: "/settings/theme" },
    { name: "System Config", path: "/settings/system" },
  ],
}
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();
  const { user } = useAuth();
  const ROLE = user?.role_name;

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);

  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {},
  );

  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname],
  );

  useEffect(() => {
    let submenuMatched = false;

    ["main", "others"].forEach((menuType) => {
      const items = menuType === "main" ? navItems : othersItems;

      items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({
                type: menuType as "main" | "others",
                index,
              });
              submenuMatched = true;
            }
          });
        }
      });
    });

    if (!submenuMatched) setOpenSubmenu(null);
  }, [location, isActive]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prev) => ({
          ...prev,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prev) => {
      if (prev && prev.type === menuType && prev.index === index) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  /* ===============================
     SAFE ROLE FILTER
  ================================= */
  const filterByRole = (items: NavItem[]) => {
    if (!ROLE) return [];
    return items.filter((item) => item.role.includes(ROLE));
  };

  const filteredNavItems = filterByRole(navItems);
  const filteredOtherItems = filterByRole(othersItems);

  const renderMenuItems = (items: NavItem[], menuType: "main" | "others") => (
    <ul className="flex flex-col gap-4">
      {items.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`menu-item group ${
                openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? "menu-item-active"
                  : "menu-item-inactive"
              } cursor-pointer ${
                !isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "lg:justify-start"
              }`}
            >
              <span
                className={`menu-item-icon-size ${
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? "menu-item-icon-active"
                    : "menu-item-icon-inactive"
                }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="menu-item-text">{nav.name}</span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <ChevronDownIcon
                  className={`ml-auto w-5 h-5 transition-transform duration-200 ${
                    openSubmenu?.type === menuType &&
                    openSubmenu?.index === index
                      ? "rotate-180 text-brand-500"
                      : ""
                  }`}
                />
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                to={nav.path}
                className={`menu-item group ${
                  isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                }`}
              >
                <span
                  className={`menu-item-icon-size ${
                    isActive(nav.path)
                      ? "menu-item-icon-active"
                      : "menu-item-icon-inactive"
                  }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text">{nav.name}</span>
                )}
              </Link>
            )
          )}

          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`${menuType}-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? `${subMenuHeight[`${menuType}-${index}`]}px`
                    : "0px",
              }}
            >
              <ul className="mt-2 space-y-1 ml-9">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      to={subItem.path}
                      className={`menu-dropdown-item ${
                        isActive(subItem.path)
                          ? "menu-dropdown-item-active"
                          : "menu-dropdown-item-inactive"
                      }`}
                    >
                      {subItem.name}
                      <span className="flex items-center gap-1 ml-auto">
                        {subItem.new && (
                          <span
                            className={`ml-auto ${
                              isActive(subItem.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                            } menu-dropdown-badge`}
                          >
                            new
                          </span>
                        )}
                        {subItem.pro && (
                          <span
                            className={`ml-auto ${
                              isActive(subItem.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                            } menu-dropdown-badge`}
                          >
                            pro
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-neutral-900 dark:border-neutral-800 text-neutral-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-neutral-200 
        ${
          isExpanded || isMobileOpen
            ? "w-[290px]"
            : isHovered
              ? "w-[290px]"
              : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link to="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <div className="gap-3 dark:hidden flex items-start">
                <img
                  className="dark:hidden"
                  src="/black-logo.png"
                  alt="Logo"
                  width={50}
                  height={50}
                  draggable="false"
                />
                <div className="flex flex-col">
                  <span className="dark:text-white">Restorant Name</span>
                  <span className="text-muted-foreground text-xs">
                    {user?.email ?? "-"}
                  </span>
                </div>
              </div>
              <div className="gap-3 dark:flex hidden items-start">
                <img
                  src="/white-logo.png"
                  alt="Logo"
                  width={50}
                  height={50}
                  draggable="false"
                />
                <div className="flex flex-col">
                  <span className="dark:text-white">Restorant Name</span>
                  <span className="text-muted-foreground text-xs">
                    admin@gmail.com
                  </span>
                </div>
              </div>
            </>
          ) : (
            <img src="/white-logo.png" alt="Logo" width={32} height={32} />
          )}
        </Link>
      </div>

      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-neutral-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Menu"
                ) : (
                  <HorizontaLDots className="size-6" />
                )}
              </h2>
              {renderMenuItems(filteredNavItems, "main")}
            </div>
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-neutral-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Others"
                ) : (
                  <HorizontaLDots />
                )}
              </h2>
              {renderMenuItems(filteredOtherItems, "others")}
            </div>
          </div>
        </nav>
        {isExpanded || isHovered || isMobileOpen || null}
      </div>
    </aside>
  );
};

export default AppSidebar;

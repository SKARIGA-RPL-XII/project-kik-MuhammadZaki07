import { ChevronDownIcon } from "@/icons";
import { Link } from "react-router";

interface SidebarItemProps {
  item: any;
  isActive: (path: string) => boolean;
  isExpanded: boolean;
  isOpen: boolean;
  onToggle: () => void;
  subMenuRef: (el: HTMLDivElement | null) => void;
  height: number;
  unreadCount: number;
  pendingReservations: number;
}

export const SidebarItem = ({
  item,
  isActive,
  isExpanded,
  isOpen,
  onToggle,
  subMenuRef,
  height,
  unreadCount,
  pendingReservations,
}: SidebarItemProps) => {
  const hasSubItems = !!item.subItems;
  const active = item.path
    ? isActive(item.path)
    : item.subItems?.some((sub: any) => isActive(sub.path));

  const checkHasAlert = (path: string) => {
    if (path === "/notifications") return unreadCount > 0;
    if (path === "/operations/reservation") return pendingReservations > 0;
    return false;
  };

  const hasNotification = item.path
    ? checkHasAlert(item.path)
    : item.subItems?.some((sub: any) => checkHasAlert(sub.path));

  return (
    <li>
      {hasSubItems ? (
        <button
          onClick={onToggle}
          className={`menu-item group ${active ? "menu-item-active" : "menu-item-inactive"} ${!isExpanded ? "lg:justify-center" : "lg:justify-start"}`}
        >
          <div className="relative">
            <span
              className={`menu-item-icon-size ${active ? "menu-item-icon-active" : "menu-item-icon-inactive"}`}
            >
              {item.icon}
            </span>
            {hasNotification && (
              <span className="absolute -right-1 -top-0.5 z-10 h-2 w-2 rounded-full bg-orange-400 flex">
                <span className="absolute inline-flex w-full h-full bg-orange-400 rounded-full opacity-75 animate-ping"></span>
              </span>
            )}
          </div>

          {isExpanded && (
            <>
              <span className="menu-item-text">{item.name}</span>
              <ChevronDownIcon
                className={`ml-auto w-5 h-5 transition-transform duration-200 ${isOpen ? "rotate-180 text-red-500" : ""}`}
              />
            </>
          )}
        </button>
      ) : (
        <Link
          to={item.path || "#"}
          className={`menu-item group ${active ? "menu-item-active" : "menu-item-inactive"} ${!isExpanded ? "lg:justify-center" : ""}`}
        >
          <div className="relative">
            <span
              className={`menu-item-icon-size ${active ? "menu-item-icon-active" : "menu-item-icon-inactive"}`}
            >
              {item.icon}
            </span>
            {hasNotification && (
              <span className="absolute -right-0.5 -top-0.5 z-10 h-2 w-2 rounded-full bg-orange-400 flex">
                <span className="absolute inline-flex w-full h-full bg-orange-400 rounded-full opacity-75 animate-ping"></span>
              </span>
            )}
          </div>

          {isExpanded && <span className="menu-item-text">{item.name}</span>}
        </Link>
      )}

      {hasSubItems && isExpanded && (
        <div
          ref={subMenuRef}
          className="overflow-hidden transition-all duration-300"
          style={{ height: isOpen ? `${height}px` : "0px" }}
        >
          <ul className="mt-2 space-y-1 ml-9">
            {item.subItems.map((sub: any) => {
              const subHasNotif = checkHasAlert(sub.path);

              return (
                <li key={sub.path}>
                  <Link
                    to={sub.path}
                    className={`menu-dropdown-item ${isActive(sub.path) ? "menu-dropdown-item-active" : "menu-dropdown-item-inactive"}`}
                  >
                    <div className="flex items-center w-full">
                      {sub.name}

                      {subHasNotif && (
                        <span className="relative flex h-2 w-2 ml-1 mb-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                        </span>
                      )}

                      {(sub.new || sub.pro) && (
                        <span className="ml-auto menu-dropdown-badge menu-dropdown-badge-active">
                          {sub.new ? "new" : "pro"}
                        </span>
                      )}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </li>
  );
};

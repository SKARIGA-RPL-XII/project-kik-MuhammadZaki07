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
}

export const SidebarItem = ({ item, isActive, isExpanded, isOpen, onToggle, subMenuRef, height }: SidebarItemProps) => {
  const hasSubItems = !!item.subItems;
  const active = item.path ? isActive(item.path) : item.subItems?.some((sub: any) => isActive(sub.path));

  return (
    <li>
      {hasSubItems ? (
        <button
          onClick={onToggle}
          className={`menu-item group ${active ? "menu-item-active" : "menu-item-inactive"} ${!isExpanded ? "lg:justify-center" : "lg:justify-start"}`}
        >
          <span className={`menu-item-icon-size ${active ? "menu-item-icon-active" : "menu-item-icon-inactive"}`}>
            {item.icon}
          </span>
          {isExpanded && (
            <>
              <span className="menu-item-text">{item.name}</span>
              <ChevronDownIcon className={`ml-auto w-5 h-5 transition-transform duration-200 ${isOpen ? "rotate-180 text-red-500" : ""}`} />
            </>
          )}
        </button>
      ) : (
        <Link to={item.path || "#"} className={`menu-item group ${active ? "menu-item-active" : "menu-item-inactive"}`}>
          <span className={`menu-item-icon-size ${active ? "menu-item-icon-active" : "menu-item-icon-inactive"}`}>
            {item.icon}
          </span>
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
            {item.subItems.map((sub: any) => (
              <li key={sub.path}>
                <Link to={sub.path} className={`menu-dropdown-item ${isActive(sub.path) ? "menu-dropdown-item-active" : "menu-dropdown-item-inactive"}`}>
                  {sub.name}
                  {(sub.new || sub.pro) && (
                    <span className="ml-auto menu-dropdown-badge menu-dropdown-badge-active">
                      {sub.new ? "new" : "pro"}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </li>
  );
};
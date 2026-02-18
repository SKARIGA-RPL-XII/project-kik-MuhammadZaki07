import { MdFastfood } from "react-icons/md";
import { GridIcon } from "../icons";
import { 
  BarChart3, Bell, ClipboardList, MonitorSmartphone, 
  Package, Settings, UserSquare 
} from "lucide-react";

export type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
  role: string[];
};

export const navConfig = {
  main: [
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
  ],
  others: [
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
        { name: "System Config", path: "/settings/system" },
      ],
    }
  ]
};
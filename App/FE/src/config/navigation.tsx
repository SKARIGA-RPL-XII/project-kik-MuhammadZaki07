import { MdFastfood } from "react-icons/md";
import { GridIcon } from "../icons";
import {
  BarChart3,
  Bell,
  CalendarCheck,
  ClipboardList,
  ClockCheck,
  FileText,
  Fingerprint,
  MonitorSmartphone,
  Package,
  Settings,
  UserCheck,
  UserSquare,
  Utensils,
} from "lucide-react";

export type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
  role: string[];
};

export const navConfig = {
  overview: [
    {
      name: "Dashboard",
      icon: <GridIcon />,
      path: "/dashboard",
      role: ["admin", "cashier"],
    },
    {
      name: "Notifications",
      icon: <Bell />,
      path: "/notifications",
      role: ["admin", "cashier", "employe"],
    },
  ],
  hr: [
    {
      name: "Attendance",
      icon: <Fingerprint />,
      path: "/attendance",
      role: ["admin", "cashier", "employee"],
    },
    {
      name: "Attendance Logs",
      icon: <ClockCheck size={18} />,
      path: "/attendance-admin",
      role: ["admin", "cashier", "employee"],
    },
    {
      name: "Leave & Permits",
      icon: <FileText />,
      path: "/leave-permits",
      role: ["admin", "cashier", "employee"],
    },
    {
      name: "Leaves Approval",
      icon: <UserCheck />,
      path: "/leaves-approval",
      role: ["admin", "cashier", "employee"],
    },
    {
      name: "Duty Schedule",
      icon: <CalendarCheck />,
      path: "/schedule",
      role: ["admin", "cashier", "employee"],
    },
  ],
  pos: [
    {
      name: "Cashier",
      icon: <MonitorSmartphone />,
      role: ["cashier"],
      path: "/cashier",
    },
    {
      name: "Table List",
      icon: <Utensils />,
      role: ["cashier"],
      path: "/tables",
    },
    {
      name: "Order Queue",
      icon: <ClipboardList />,
      path: "/operations/orders",
      role: ["admin", "cashier"],
    },
  ],
  management: [
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
        { name: "Atribute", path: "/attributes" },
        { name: "Units", path: "/units" },
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
      name: "Reports",
      icon: <BarChart3 />,
      role: ["admin"],
      subItems: [
        { name: "Sales Report", path: "/reports/sales" },
        // { name: "Daily Revenue", path: "/reports/daily-revenue" },
        { name: "Top Selling Menu", path: "/reports/top-menu" },
        { name: "Report Explorer", path: "/reports/report-exploler" },
        { name: "Transaction History", path: "/reports/transactions" },
      ],
    },
  ],
  system: [
    {
      name: "Operations",
      icon: <Settings />,
      role: ["admin"],
      subItems: [
        // { name: "Kitchen Display", path: "/operations/kitchen" },
        { name: "Reservation", path: "/operations/reservation" },
        { name: "Calendar", path: "/calendar" },
        { name: "System Logs", path: "/system/logs" },
      ],
    },
    {
      name: "Account & Settings",
      icon: <UserSquare />,
      permission: "account",
      role: ["admin"],
      subItems: [
        { name: "Staff", path: "/staf" },
        { name: "Admin", path: "/admin" },
        { name: "Customers", path: "/customers" },
        { name: "User Profile", path: "/profile" },
        { name: "General Settings", path: "/settings/general" },
        { name: "Tax & Service", path: "/settings/tax" },
        { name: "Payment Methods", path: "/settings/payment" },
        { name: "Roles & Permissions", path: "/settings/roles" },
        { name: "System Config", path: "/settings/system" },
      ],
    },
  ],
};

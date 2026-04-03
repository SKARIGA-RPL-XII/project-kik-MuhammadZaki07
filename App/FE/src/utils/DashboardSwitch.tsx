import CashierDashboard from "@/pages/Dashboard/CashierDashboard";
import EmployeeDashboard from "@/pages/Dashboard/EmployeeDashboard";
import React from "react";
import AdminDashboard from "@/pages/Dashboard/AdminDashboard";

const DashboardSwitch: React.FC = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = user.role_name;

  switch (role) {
    case "admin":
      return <AdminDashboard />;
    
    case "cashier":
      return <CashierDashboard />;
    
    case "employee":
      return <EmployeeDashboard />;

    default:
      return <EmployeeDashboard />;
  }
};

export default DashboardSwitch;
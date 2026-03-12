import { useAuth } from "@/context/AuthContext";
import { ReactNode } from "react";
import { Navigate, Outlet } from "react-router";

type Props = {
  children?: ReactNode;
};

export const AuthMiddleware = ({ children }: Props) => {
  const token = localStorage.getItem("token");
  const { loading } = useAuth();

  if (loading) return null;
  return !token ? <Navigate to={"/auth/sign-in"} replace /> : (children || <Outlet />);
};

export const GuestMiddleware = () => {
  const token = localStorage.getItem("token");
  return token ? <Navigate to={"/"} replace /> : <Outlet />;
};

export const StaffMiddleware = ({ children }: Props) => {
  const { user, loading } = useAuth();
  const token = localStorage.getItem("token");

  if (loading) return null;

  if (!token) return <Navigate to={"/auth/sign-in"} replace />;

  if (user?.role_name === "customer") {
    return <Navigate to="/" replace />;
  }

  return children || <Outlet />;
};

export const AdminOnlyMiddleware = ({ children }: Props) => {
  const { user, loading } = useAuth();
  
  if (loading) return null;
  if (user?.role_name !== "admin") return <Navigate to="/dashboard" replace />;

  return children || <Outlet />;
};
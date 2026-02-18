import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from "react";
import { apiClient } from "../lib/apiClient";

type User = {
  id: number;
  email: string;
  username: string;
  role_name: string;
  role_id: number;
  gender: "LK" | "PR";
  profile_image?: string;
  no_tlp?: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  errors: any;
  login: (payload: FormData) => Promise<any>;
  register: (payload: FormData) => Promise<any>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(
    JSON.parse(localStorage.getItem("user") || "null")
  );
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<any>(null);

  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await apiClient.get("/user/me");
      const userData = res.data.data;
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
    } catch (err) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (payload: FormData) => {
    try {
      setLoading(true);
      const res = await apiClient.post("/auth/login", payload);
      const { user: userData, token } = res.data.data;

      setUser(userData);
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));
      return { status: "success", user: userData };
    } catch (err: any) {
      const response = err.response?.data;
      setErrors({ errorMessage: response?.message, errorField: response?.errors });
      return response;
    } finally {
      setLoading(false);
    }
  };

  const register = async (payload: FormData) => {
    try {
      setLoading(true);
      const res = await apiClient.post("/auth/register", payload);
      const { user: userData, token } = res.data.data;

      setUser(userData);
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));
      return { status: "success", user: userData };
    } catch (err: any) {
      const response = err.response?.data;
      setErrors({ errorMessage: response?.message, errorField: response?.errors });
      return response;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await apiClient.post("/auth/logout");
    } finally {
      setUser(null);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, errors, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
};
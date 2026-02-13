import { createContext, useContext, useState, ReactNode } from "react";
import { apiClient } from "../lib/apiClient";

type User = {
  id: number;
  email: string;
  username: string;
  role_name: string;
  gender: "LK" | "PR";
};

type AuthError = {
  errorMessage?: string;
  errorField?: Record<string, string[]>;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  errors: AuthError | null;
  login: (payload: FormData) => Promise<void>;
  register: (payload: FormData) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(
    JSON.parse(localStorage.getItem("user")) || null,
  );
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<AuthError | null>(null);

  const login = async (payload: FormData) => {
    try {
      setLoading(true);
      setErrors(null);

      const res = await apiClient.post("/auth/login", payload);
      const { user, token } = res.data.data;

      setUser(user);
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      return {
        status: "success",
        user,
      };
    } catch (err: any) {
      const response = err.response?.data;

      setErrors({
        errorMessage: response?.message,
        errorField: response?.errors,
      });

      return response;
    } finally {
      setLoading(false);
    }
  };

  const register = async (payload: FormData) => {
    try {
      setLoading(true);
      setErrors(null);

      const res = await apiClient.post("/auth/register", payload);
      const { user, token } = res.data.data;

      setUser(user);
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      return {
        status: "success",
        user,
      };
    } catch (err: any) {
      const response = err.response?.data;

      setErrors({
        errorMessage: response?.message,
        errorField: response?.errors,
      });

      return response;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await apiClient.post("/auth/logout");
      setUser(null);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, errors, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
};

import { createContext, useContext, useState, ReactNode } from "react";
import Alert from "../components/ui/alert/Alert";
type Variant = "success" | "error" | "warning" | "info";

interface ToastItem {
  id: number;
  variant: Variant;
  title: string;
  message: string;
}

interface ToastContextType {
  toast: (variant: Variant, title: string, message: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const toast = (variant: Variant, title: string, message: string) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, variant, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed top-5 right-5 z-[9999] space-y-3 w-[360px]">
        {toasts.map((t) => (
          <Alert
            key={t.id}
            variant={t.variant}
            title={t.title}
            message={t.message}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
};

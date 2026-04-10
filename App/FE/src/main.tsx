import { createRoot } from "react-dom/client";
import "./index.css";
import "swiper/swiper-bundle.css";
import "flatpickr/dist/flatpickr.css";
import App from "./App.js";
import { AppWrapper } from "./components/common/PageMeta.tsx";
import { ThemeProvider } from "./context/ThemeContext.tsx";
import { AuthProvider } from "./context/AuthContext.tsx";
import { ToastProvider } from "./context/ToastContext.tsx";
import { SettingsProvider } from "./context/SettingsContext.tsx";
import "./lib/bootstrap.ts";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GoogleOAuthProvider } from '@react-oauth/google';
import "./i18n";
import "/node_modules/flag-icons/css/flag-icons.min.css";

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/service-worker.js").catch(() => {});
  });
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 30,
      refetchOnWindowFocus: false,
    },
  },
});

const verifyIntegrity = async () => {
  const secret = import.meta.env.VITE_PROJECT_KEY || "";
  const signature = "92559c0bbb06677e277ae3e13fe4b4466e56e1278aaf183771c5c3f20fecf4ff";

  const msgBuffer = new TextEncoder().encode(secret);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

  if (hashHex !== signature) {
    document.body.innerHTML = `
      <div style="display:flex;justify-content:center;align-items:center;height:100vh;flex-direction:column;font-family:sans-serif;background:#000;color:#fff;">
        <h1 style="color:red;">SYSTEM INTEGRITY ERROR</h1>
        <p>Akses ditolak: Project ini memerlukan Lisensi Resmi dari pemilik</p>
      </div>
    `;
    throw new Error("Unauthorized access");
  }
};

verifyIntegrity();

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
        <SettingsProvider>
          <ThemeProvider>
            <ToastProvider>
              <AppWrapper>
                <App />
              </AppWrapper>
            </ToastProvider>
          </ThemeProvider>
        </SettingsProvider>
      </GoogleOAuthProvider>
    </AuthProvider>
  </QueryClientProvider>
);

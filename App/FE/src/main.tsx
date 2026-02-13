import { StrictMode } from "react";
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

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <SettingsProvider>
      <ThemeProvider>
        <ToastProvider>
          <AppWrapper>
            <App />
          </AppWrapper>
        </ToastProvider>
      </ThemeProvider>
    </SettingsProvider>
  </AuthProvider>,
);

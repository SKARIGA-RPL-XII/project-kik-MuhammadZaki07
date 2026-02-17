import { SidebarProvider, useSidebar } from "../context/SidebarContext";
import { Outlet } from "react-router";
import AppHeader from "./AppHeader";
import Backdrop from "./Backdrop";
import AppSidebar from "./AppSidebar";
import { AuthMiddleware } from "../middleware/midleware";
import { useEffect } from "react";

const LayoutContent: React.FC = () => {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  return (
    <div className="min-h-screen xl:flex">
      <div>
        <AppSidebar />
        <Backdrop />
      </div>
      <div
        className={`flex-1 transition-all duration-300 ease-in-out ${
          isExpanded || isHovered ? "lg:ml-[290px]" : "lg:ml-[90px]"
        } ${isMobileOpen ? "ml-0" : ""}`}
      >
        <AppHeader />
        <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

const AppLayout: React.FC = () => {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      const handleMessage = (event: MessageEvent) => {
        if (event.data && event.data.type === "PLAY_SOUND") {
          const audioPath = window.location.origin + event.data.file;
          const audio = new Audio(audioPath);
          audio.play().catch(() => {});
        }
      };

      navigator.serviceWorker.addEventListener("message", handleMessage);
      return () =>
        navigator.serviceWorker.removeEventListener("message", handleMessage);
    }
  }, []);

  return (
    <SidebarProvider>
      <AuthMiddleware>
        <LayoutContent />
      </AuthMiddleware>
    </SidebarProvider>
  );
};

export default AppLayout;

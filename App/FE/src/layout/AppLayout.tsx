import { SidebarProvider, useSidebar } from "../context/SidebarContext";
import { Outlet } from "react-router";
import AppHeader from "./AppHeader";
import Backdrop from "./Backdrop";
import AppSidebar from "./AppSidebar";
import { AuthMiddleware } from "../middleware/midleware";
import { useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";

const LayoutContent: React.FC = () => {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();
  const { user } = useAuth();
  const channelRef = useRef<BroadcastChannel | null>(null);

  const lastNotifId = useRef<string | null>(null);
  const isSubscribed = useRef<string | null>(null);

  useEffect(() => {
    channelRef.current = new BroadcastChannel("notification_system");

    if (user?.id && window.Echo) {
      if (isSubscribed.current === user.id) return;

      const channelName = `notifications.user.${user.id}`;
      console.log("[Echo] Memulai koneksi steril:", channelName);

      window.Echo.leave(channelName);

      window.Echo.private(channelName).listen(
        ".notification.received",
        (e: any) => {
          if (lastNotifId.current === e.notification.id) {
            console.log(
              "[Echo] Duplikasi dicegah untuk ID:",
              e.notification.id,
            );
            return;
          }

          lastNotifId.current = e.notification.id;

          channelRef.current?.postMessage({
            type: "NEW_NOTIFICATION",
            payload: e.notification,
          });

          if (document.visibilityState === "hidden") {
            showNativeNotification(e.notification);
          }
        },
      );

      isSubscribed.current = user.id;

      return () => {
        window.Echo.leave(channelName);
        isSubscribed.current = null;
        channelRef.current?.close();
      };
    }
  }, [user?.id]);

  const showNativeNotification = (notif: any) => {
    if (!("Notification" in window) || Notification.permission !== "granted")
      return;

    new Notification(notif.title || "Export Selesai", {
      body: notif.message,
      icon: "/favicon.ico",
      tag: notif.id,
      // renotify: false
    });
  };

  return (
    <div className="min-h-screen xl:flex overflow-hidden">
      <div className="shrink-0">
        <AppSidebar />
        <Backdrop />
      </div>

      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
          isExpanded || isHovered ? "lg:ml-[290px]" : "lg:ml-[90px]"
        } ${isMobileOpen ? "ml-0" : ""}`}
      >
        <AppHeader />

        <main className="flex-1 min-h-0 min-w-0 p-4 md:p-6 overflow-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

const AppLayout: React.FC = () => {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      const handleMessage = (event: MessageEvent) => {
        if (event.data?.type === "PLAY_SOUND") {
          const audio = new Audio(window.location.origin + event.data.file);
          audio.play().catch(() => {});
        }
      };
      navigator.serviceWorker.addEventListener("message", handleMessage);
      return () =>
        navigator.serviceWorker.removeEventListener("message", handleMessage);
    }
  }, []);

  useEffect(() => {
    const isElectron = navigator.userAgent.toLowerCase().includes("electron");
    if (isElectron) {
      console.log("Running in Desktop Mode");
      // @ts-ignore
      // window.require('electron').webFrame.setVisualZoomLevelLimits(1, 1);
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

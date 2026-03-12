import { useState, useEffect, useRef, useMemo } from "react";
import { useNotification } from "@/hooks/useNotification";
import { useAuth } from "@/context/AuthContext";
import { notificationService } from "@/services/notification.service";

export const useNotificationLogic = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedNotif, setSelectedNotif] = useState<any>(null);
  const [isRinging, setIsRinging] = useState(false);
  const { user } = useAuth();

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const channelRef = useRef<BroadcastChannel | null>(null);

  const { notifications, unreadCount, setNotifications, setUnreadCount } =
    useNotification(user?.id, user?.role_id);

  const fetchLatestData = async () => {
    try {
      const res = await notificationService.getAll(1);
      setNotifications(res.data.notifications);
      setUnreadCount(res.data.metadata.unread_count);
    } catch (err) {
      console.error("Sync Error:", err);
    }
  };

  const triggerNotificationEffects = () => {
    setIsRinging(true);
    audioRef.current?.play().catch(() => console.log("Audio blocked"));
    setTimeout(() => setIsRinging(false), 1000);
  };

  useEffect(() => {
    audioRef.current = new Audio("/sounds/sound_notification.mp3");
    channelRef.current = new BroadcastChannel("notification_system");

    channelRef.current.onmessage = (event) => {
      const { type, payload } = event.data;
      if (type === "NEW_NOTIFICATION") {
        setNotifications((prev) => [payload, ...prev]);
        setUnreadCount((prev) => prev + 1);
        triggerNotificationEffects();
      }
      if (type === "REFRESH_NOTIFICATIONS") fetchLatestData();
    };

    return () => channelRef.current?.close();
  }, []);

  useEffect(() => {
    if (!user?.id) return;

    const echo = window.Echo.private(`App.Models.User.${user.id}`).notification(
      (notification: any) => {
        const formattedNotif = {
          id: notification.id,
          data: {
            message: notification.message,
            type: notification.type,
            link: notification.link,
          },
          read_at: null,
          created_at: notification.created_at || new Date().toISOString(),
          user_name: "System",
          user_avatar: "/notification.png",
        };

        setNotifications((prev) => [formattedNotif, ...prev]);
        setUnreadCount((prev) => prev + 1);
        triggerNotificationEffects();

        channelRef.current?.postMessage({
          type: "NEW_NOTIFICATION",
          payload: formattedNotif,
        });

        if (Notification.permission === "granted" && document.hidden) {
          new Notification("GAGAL-LAPAR", {
            body: notification.message,
            icon: "/notification.png",
          });
        }
      },
    );

    return () => window.Echo.leave(`App.Models.User.${user.id}`);
  }, [user?.id]);

  const sortedNotifications = useMemo(() => {
    return [...notifications].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  }, [notifications]);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    setSelectedNotif(null);
  };

  const handleShowDetail = async (n: any) => {
    setSelectedNotif(n);
    if (!n.read_at) {
      try {
        await notificationService.markAsRead(n.id);
        setNotifications((prev) =>
          prev.map((item) =>
            item.id === n.id
              ? { ...item, read_at: new Date().toISOString() }
              : item,
          ),
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
        channelRef.current?.postMessage({ type: "REFRESH_NOTIFICATIONS" });
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      const target = notifications.find((n) => n.id === id);
      await notificationService.delete(id);
      if (target && !target.read_at)
        setUnreadCount((prev) => Math.max(0, prev - 1));
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      channelRef.current?.postMessage({ type: "REFRESH_NOTIFICATIONS" });
    } catch (err) {
      console.error(err);
    }
  };

  return {
    isOpen,
    unreadCount,
    isRinging,
    selectedNotif,
    sortedNotifications,
    setIsOpen,
    setSelectedNotif,
    toggleDropdown,
    handleShowDetail,
    handleDelete,
  };
};

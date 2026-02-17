import { useEffect, useState } from "react";
import { Notification as NotificationType } from "../types/notification";
import { notificationService } from "@/services/notification.service";
import { playNotificationSound } from "@/utils/notificationHelper";

export const useNotification = (
  userId: number | undefined,
  roleId: number | undefined
) => {
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const fetchNotifications = async () => {
    try {
      const res = await notificationService.getAll();
      setNotifications(res.data.notifications);
      setUnreadCount(res.data.metadata.unread_count);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    }
  };

  const markAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark notifications as read", err);
    }
  };

  const handleIncomingNotification = (notif: NotificationType) => {
    playNotificationSound();

    if (window.Notification && Notification.permission === "granted") {
      new window.Notification(notif.title, {
        body: notif.message,
        icon: "/notification.png",
      });
    }

    setNotifications((prev) => [notif, ...prev]);
    setUnreadCount((prev) => prev + 1);
  };

  useEffect(() => {
    if (!userId || !window.Echo) return;

    fetchNotifications();

    const globalChannel = window.Echo.channel("notifications.global");
    globalChannel.listen(
      ".notification.received",
      (e: { notification: NotificationType }) => {
        handleIncomingNotification(e.notification);
      }
    );

    if (roleId) {
      window.Echo.channel(`notifications.role.${roleId}`).listen(
        ".notification.received",
        (e: { notification: NotificationType }) => {
          handleIncomingNotification(e.notification);
        }
      );
    }

    window.Echo.private(`notifications.user.${userId}`).listen(
      ".notification.received",
      (e: { notification: NotificationType }) => {
        handleIncomingNotification(e.notification);
      }
    );

    return () => {
      if (window.Echo) {
        window.Echo.leave("notifications.global");
        if (roleId) window.Echo.leave(`notifications.role.${roleId}`);
        window.Echo.leave(`notifications.user.${userId}`);
      }
    };
  }, [userId, roleId]);

  return { 
    notifications, 
    unreadCount, 
    setNotifications, 
    setUnreadCount, 
    markAsRead 
  };
};
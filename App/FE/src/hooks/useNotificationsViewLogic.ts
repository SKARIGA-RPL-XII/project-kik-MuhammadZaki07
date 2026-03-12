import { useState } from "react";
import { useNotification } from "@/hooks/useNotification";
import { useAuth } from "@/context/AuthContext";
import { notificationService } from "@/services/notification.service";

export function useNotificationsViewLogic() {
  const { user } = useAuth();
  const [selectedNotif, setSelectedNotif] = useState<any>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  const { notifications, unreadCount, setNotifications, setUnreadCount } = useNotification(
    user?.id,
    user?.role_id
  );

  const getMessage = (n: any) => n.data?.message || n.message || "No message content";
  const getType = (n: any) => n.data?.type || "system";

  const toggleSelect = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === notifications.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(notifications.map(n => n.id));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Hapus ${selectedIds.length} notifikasi?`)) return;

    try {
      await Promise.all(selectedIds.map(id => notificationService.delete(id)));
      const deletedUnread = notifications.filter(n => selectedIds.includes(n.id) && !n.read_at).length;
      
      setNotifications(prev => prev.filter(n => !selectedIds.includes(n.id)));
      setSelectedIds([]);
      setUnreadCount(prev => Math.max(0, prev - deletedUnread));
    } catch (err) {
      console.error("Bulk delete failed", err);
    }
  };

  const handleShowDetail = async (n: any) => {
    setSelectedNotif(n);
    if (!n.read_at) {
      try {
        await notificationService.markAsRead(n.id);
        setNotifications((prev) =>
          prev.map((item) =>
            item.id === n.id ? { ...item, read_at: new Date().toISOString() } : item
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await notificationService.delete(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      setSelectedIds(prev => prev.filter(item => item !== id));
      if (selectedNotif?.id === id) setSelectedNotif(null);
    } catch (err) {
      console.error(err);
    }
  };

  return {
    notifications,
    unreadCount,
    selectedNotif,
    setSelectedNotif,
    selectedIds,
    getMessage,
    getType,
    toggleSelect,
    toggleSelectAll,
    handleBulkDelete,
    handleShowDetail,
    handleDelete
  };
}
import React, { useEffect, useState, useRef } from "react";
import { Notification } from "../../types/notification";
import { useNotification } from "../../hooks/useNotification";
import {
  CheckCheck,
  Clock,
  Trash2,
  Filter,
  ChevronRight,
  ChevronLeft,
  Loader2,
  Trash2Icon,
} from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { notificationService } from "@/services/notification.service";
import { useAuth } from "@/context/AuthContext";
import { requestNotificationPermission } from "@/utils/notificationHelper";
import { useNavigate } from "react-router";
import PageMeta from "@/components/common/PageMeta";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/context/ToastContext";

dayjs.extend(relativeTime);

const NotificationPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { notifications, setNotifications, unreadCount, setUnreadCount } =
    useNotification(user?.id, user?.role_id);

  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isMarking, setIsMarking] = useState(false);

  const channelRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    channelRef.current = new BroadcastChannel("notification_system");
    requestNotificationPermission();
    loadData(currentPage);

    return () => {
      channelRef.current?.close();
    };
  }, [currentPage]);

  const loadData = async (page: number) => {
    setLoading(true);
    try {
      const res = await notificationService.getAll(page);
      setNotifications(res.data.notifications);
      setUnreadCount(res.data.metadata.unread_count);
      setTotalPages(res.data.metadata.last_page || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.length === notifications.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(notifications.map((n) => n.id));
    }
  };

  const toggleSelect = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const openDetail = (notif: Notification) => {
    navigate(`/notifications/${notif.id}`);
  };

  const handleBulkMarkRead = async () => {
    if (selectedIds.length === 0) return;
    try {
      await Promise.all(
        selectedIds.map((id) => notificationService.markAsRead(id)),
      );

      const newlyReadCount = notifications.filter(
        (n) => selectedIds.includes(n.id) && !n.read_at,
      ).length;

      setNotifications((prev) =>
        prev.map((n) =>
          selectedIds.includes(n.id)
            ? { ...n, read_at: dayjs().toISOString() }
            : n,
        ),
      );

      setUnreadCount((prev) => Math.max(0, prev - newlyReadCount));

      channelRef.current?.postMessage({ type: "REFRESH_NOTIFICATIONS" });

      setSelectedIds([]);
      toast("success", "Success", "Notifications marked as read.");
    } catch (err) {
      toast("error", "Error", "Failed to update notifications.");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    setIsDeleting(true);
    try {
      await Promise.all(
        selectedIds.map((id) => notificationService.delete(id)),
      );

      const deletedUnread = notifications.filter(
        (n) => selectedIds.includes(n.id) && !n.read_at,
      ).length;

      setNotifications((prev) =>
        prev.filter((n) => !selectedIds.includes(n.id)),
      );

      setUnreadCount((prev) => Math.max(0, prev - deletedUnread));

      channelRef.current?.postMessage({ type: "REFRESH_NOTIFICATIONS" });

      setSelectedIds([]);
      toast("success", "Deleted", "Notifications have been removed.");
    } catch (err) {
      toast("error", "Error", "Failed to delete notifications.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
      <PageMeta
        title="Notifications | Admin Dashboard"
        description="List of all notifications that come into your account."
      />
      <PageBreadcrumb pageTitle="Notifications" />

      <ComponentCard
        title="Inboxes"
        desc="List of all notifications that come into your account."
      >
        <div className="flex flex-wrap items-center justify-between border-b border-stroke px-4 pb-4 dark:border-strokedark sm:px-6 xl:px-7.5">
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 rounded border border-stroke px-3 py-1.5 text-sm font-medium text-black hover:shadow-1 dark:border-strokedark dark:text-white transition">
              <Filter size={16} /> Filter
            </button>

            {selectedIds.length > 0 && (
              <div className="flex items-center gap-4 animate-in fade-in slide-in-from-left-2">
                <div className="h-6 w-px bg-stroke dark:bg-strokedark" />
                <button
                  onClick={handleBulkMarkRead}
                  disabled={isMarking || selectedIds.length === 0}
                  className={`flex items-center gap-1 text-sm font-semibold text-red-500 hover:opacity-80 transition ${
                    isMarking ? "cursor-not-allowed opacity-60" : ""
                  }`}
                >
                  {isMarking ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-500 border-t-transparent"></div>
                  ) : (
                    <CheckCheck size={16} />
                  )}
                  {isMarking ? "Processing..." : "Mark as Read"}
                </button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button className="flex items-center gap-1 text-sm font-semibold text-red-500 hover:opacity-80 transition">
                      <Trash2 size={16} /> Delete
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent size="sm">
                    <AlertDialogHeader>
                      <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
                        <Trash2Icon />
                      </AlertDialogMedia>
                      <AlertDialogTitle>Delete notifications?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete{" "}
                        <strong>{selectedIds.length}</strong> selected
                        notifications. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel variant="outline">
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        variant="destructive"
                        onClick={handleBulkDelete}
                        disabled={isDeleting}
                      >
                        {isDeleting ? "Deleting..." : "Delete"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
          </div>

          <div className="text-sm font-medium text-body">
            Unread:{" "}
            <span className="text-red-500 font-bold">{unreadCount}</span>
          </div>
        </div>

        <div className="max-w-full overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-2 text-left dark:bg-meta-4">
                <th className="w-[50px] px-4 py-4 xl:pl-11">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-stroke accent-red-500 cursor-pointer"
                    checked={
                      notifications.length > 0 &&
                      selectedIds.length === notifications.length
                    }
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="min-w-[250px] px-4 py-4 font-medium text-black dark:text-white">
                  Message
                </th>
                <th className="px-4 py-4 font-medium text-black dark:text-white">
                  Type
                </th>
                <th className="px-4 py-4 font-medium text-black dark:text-white">
                  Date
                </th>
                <th className="px-4 py-4 text-center font-medium text-black dark:text-white xl:pr-11">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="h-6 w-6 animate-spin text-red-500" />
                      <span className="text-sm font-medium">Loading...</span>
                    </div>
                  </td>
                </tr>
              ) : (
                notifications.map((notif) => {
                  const displayTitle =
                    notif.title || notif.data?.message || "Sistem";
                  const isUnread = !notif.read_at;

                  return (
                    <tr
                      key={notif.id}
                      onClick={() => openDetail(notif)}
                      className={`group cursor-pointer border-b border-[#eee] dark:border-strokedark hover:bg-gray-1 dark:hover:bg-white/5 transition-colors ${
                        isUnread ? "bg-red-500/[0.03]" : ""
                      }`}
                    >
                      <td
                        className="px-4 py-4 xl:pl-11"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-stroke accent-red-500 cursor-pointer"
                          checked={selectedIds.includes(notif.id)}
                          onChange={(e) => toggleSelect(e as any, notif.id)}
                        />
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-2">
                            {isUnread && (
                              <span className="flex h-2 w-2 rounded-full bg-red-500"></span>
                            )}
                            <p
                              className={`text-sm ${isUnread ? "font-bold text-black dark:text-white" : "text-body font-medium"}`}
                            >
                              {displayTitle}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-[10px] font-bold uppercase ${
                            notif.data?.type === "success"
                              ? "bg-green-500/10 text-green-500"
                              : "bg-blue-500/10 text-blue-500"
                          }`}
                        >
                          {notif.data?.type || "Info"}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-body">
                        <div className="flex items-center gap-1.5 whitespace-nowrap opacity-70">
                          <Clock size={12} />
                          <span className="text-[11px]">
                            {dayjs(notif.created_at).fromNow()}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 xl:pr-11 text-right flex justify-center">
                        <ChevronRight
                          size={18}
                          className="text-body group-hover:text-red-500 transition-transform group-hover:translate-x-1"
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex flex-col items-center justify-between border-t border-stroke p-4 dark:border-strokedark sm:flex-row sm:px-6">
            <p className="mb-4 text-sm font-medium text-body sm:mb-0">
              Showing Page {currentPage} of {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => prev - 1)}
                className="flex h-8 w-8 items-center justify-center rounded border border-stroke hover:bg-gray dark:border-strokedark dark:hover:bg-meta-4 disabled:opacity-30 transition"
              >
                <ChevronLeft size={16} />
              </button>
              <div className="flex items-center gap-1 mx-2 text-sm font-semibold text-red-500">
                Page {currentPage}
              </div>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => prev + 1)}
                className="flex h-8 w-8 items-center justify-center rounded border border-stroke hover:bg-gray dark:border-strokedark dark:hover:bg-meta-4 disabled:opacity-30 transition"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </ComponentCard>
    </div>
  );
};

export default NotificationPage;

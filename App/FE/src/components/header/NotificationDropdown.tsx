import { useState } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { Link } from "react-router";
import { useNotification } from "@/hooks/useNotification";
import { useAuth } from "@/context/AuthContext";
import { notificationService } from "@/services/notification.service";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedNotif, setSelectedNotif] = useState<any>(null);
  const { user } = useAuth();
  
  const { notifications, unreadCount, setNotifications, setUnreadCount } = useNotification(
    user?.id,
    user?.role_id
  );

  const sortedNotifications = [...notifications].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    setSelectedNotif(null);
  };

  const closeDropdown = () => {
    setIsOpen(false);
    setSelectedNotif(null);
  };

  const handleShowDetail = async (n: any) => {
    setSelectedNotif(n);
    if (!n.read_at) {
      try {
        await notificationService.markAsRead(n.id);
        setNotifications(prev => 
          prev.map(item => item.id === n.id ? { ...item, read_at: new Date().toISOString() } : item)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (err) {
        console.error("Failed to mark as read", err);
      }
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await notificationService.delete(id);
      if (notifications.find(n => n.id === id && !n.read_at)) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      setNotifications(notifications.filter((n) => n.id !== id));
    } catch (err) {
      console.error("Failed to delete", err);
    }
  };

  const getDownloadUrl = (n: any) => {
    return n.download_url || n.data?.download_url;
  };

  return (
    <div className="relative">
      <button
        className="relative flex items-center justify-center text-neutral-500 transition-colors bg-white border border-neutral-200 rounded-full h-11 w-11 hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900"
        onClick={toggleDropdown}
      >
        {unreadCount > 0 && (
          <span className="absolute right-0 top-0.5 z-10 h-2 w-2 rounded-full bg-orange-400 flex">
            <span className="absolute inline-flex w-full h-full bg-orange-400 rounded-full opacity-75 animate-ping"></span>
          </span>
        )}
        <svg className="fill-current" width="20" height="20" viewBox="0 0 20 20">
          <path d="M10.75 2.29248C10.75 1.87827 10.4143 1.54248 10 1.54248C9.58583 1.54248 9.25004 1.87827 9.25004 2.29248V2.83613C6.08266 3.20733 3.62504 5.9004 3.62504 9.16748V14.4591H3.33337C2.91916 14.4591 2.58337 14.7949 2.58337 15.2091C2.58337 15.6234 2.91916 15.9591 3.33337 15.9591H4.37504H15.625H16.6667C17.0809 15.9591 17.4167 15.6234 17.4167 15.2091C17.4167 14.7949 17.0809 14.4591 16.6667 14.4591H16.375V9.16748C16.375 5.9004 13.9174 3.20733 10.75 2.83613V2.29248ZM14.875 14.4591V9.16748C14.875 6.47509 12.6924 4.29248 10 4.29248C7.30765 4.29248 5.12504 6.47509 5.12504 9.16748V14.4591H14.875ZM8.00004 17.7085C8.00004 18.1228 8.33583 18.4585 8.75004 18.4585H11.25C11.6643 18.4585 12 18.1228 12 17.7085C12 17.2943 11.6643 16.9585 11.25 16.9585H8.75004C8.33583 16.9585 8.00004 17.2943 8.00004 17.7085Z" fill="currentColor" />
        </svg>
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute -right-[240px] mt-[17px] flex h-[480px] w-[350px] flex-col rounded-2xl border border-neutral-200 bg-white p-3 shadow-theme-lg dark:border-neutral-800 dark:bg-neutral-900 sm:w-[361px] lg:right-0"
      >
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-neutral-100 dark:border-neutral-700">
          <div className="flex items-center gap-2">
            {selectedNotif && (
              <button onClick={() => setSelectedNotif(null)} className="text-neutral-500 hover:text-neutral-700">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
              </button>
            )}
            <h5 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200">
              {selectedNotif ? "Detail" : `Notification (${unreadCount})`}
            </h5>
          </div>
          <button onClick={closeDropdown} className="text-neutral-500 hover:text-neutral-700">
            <svg className="fill-current" width="24" height="24" viewBox="0 0 24 24"><path d="M6.21967 7.28131C5.92678 6.98841 5.92678 6.51354 6.21967 6.22065C6.51256 5.92775 6.98744 5.92775 7.28033 6.22065L11.999 10.9393L16.7176 6.22078C17.0105 5.92789 17.4854 5.92788 17.7782 6.22078C18.0711 6.51367 18.0711 6.98855 17.7782 7.28144L13.0597 12L17.7782 16.7186C18.0711 17.0115 18.0711 17.4863 17.7782 17.7792C17.4854 18.0721 17.0105 18.0721 16.7176 17.7792L11.999 13.0607L7.28033 17.7794C6.98744 18.0722 6.51256 18.0722 6.21967 17.7794C5.92678 17.4865 5.92678 17.0116 6.21967 16.7187L10.9384 12L6.21967 7.28131Z" fill="currentColor" /></svg>
          </button>
        </div>

        <div className="flex-grow overflow-y-auto custom-scrollbar">
          {selectedNotif ? (
            <div className="p-2 animate-fadeIn">
              <div className="flex items-center gap-3 mb-4">
                <img src={selectedNotif.user_avatar || "/notification.png"} className="w-12 h-12 rounded-full" alt="" />
                <div>
                  <p className="font-bold text-neutral-800 dark:text-white">{selectedNotif.user_name || "System"}</p>
                  <p className="text-xs text-neutral-500">
                    {selectedNotif.created_at ? dayjs(selectedNotif.created_at).fromNow() : "Just now"}
                  </p>
                </div>
              </div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed mb-4">
                {selectedNotif.message}
              </p>
              {getDownloadUrl(selectedNotif) && (
                <a 
                  href={getDownloadUrl(selectedNotif)} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-lg text-sm hover:bg-brand-600 transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                  Download File
                </a>
              )}
            </div>
          ) : (
            <ul className="flex flex-col gap-1">
              {sortedNotifications.map((n) => (
                <li key={n.id} className="group relative">
                  <div 
                    onClick={() => handleShowDetail(n)}
                    className={`flex gap-3 rounded p-3 cursor-pointer transition border-b border-neutral-50 dark:border-neutral-800 
                      ${!n.read_at ? 'bg-blue-50/50 dark:bg-brand-500/5' : 'hover:bg-neutral-50 dark:hover:bg-white/5'}`}
                  >
                    <img src={n.user_avatar || "/notification.png"} className="w-10 h-10 rounded-full object-cover" alt="" />
                    <div className="flex-grow pr-8">
                      <p className={`text-sm leading-snug ${!n.read_at ? 'text-neutral-900 font-medium dark:text-white' : 'text-neutral-600 dark:text-neutral-400'}`}>
                        <span className="font-semibold">{n.user_name || "System"}</span> {n.message}
                      </p>
                      <p className="text-xs text-neutral-500 mt-1">
                        {n.created_at ? dayjs(n.created_at).fromNow() : "Just now"}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="mt-3 pt-2 border-t border-neutral-100 dark:border-neutral-800">
          <Link to="/notifications" onClick={closeDropdown} className="block w-full py-2.5 text-sm font-medium text-center text-neutral-700 bg-neutral-50 border border-neutral-200 rounded-xl hover:bg-neutral-100 dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-700 transition-colors">
            View All Notifications
          </Link>
        </div>
      </Dropdown>
    </div>
  );
}
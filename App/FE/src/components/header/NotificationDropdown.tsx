import { useState, useEffect, useRef, useMemo } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { Link } from "react-router";
import { useNotification } from "@/hooks/useNotification";
import { useAuth } from "@/context/AuthContext";
import { notificationService } from "@/services/notification.service";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Trash2, ChevronLeft, X, Download } from "lucide-react";

dayjs.extend(relativeTime);

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedNotif, setSelectedNotif] = useState<any>(null);
  const [isRinging, setIsRinging] = useState(false);
  const { user } = useAuth();
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const channelRef = useRef<BroadcastChannel | null>(null);

  const { notifications, unreadCount, setNotifications, setUnreadCount } = useNotification(
    user?.id,
    user?.role_id
  );

  const fetchLatestData = async () => {
    try {
      const res = await notificationService.getAll(1);
      setNotifications(res.data.notifications);
      setUnreadCount(res.data.metadata.unread_count);
    } catch (err) {
      console.error("Sync Error:", err);
    }
  };

  useEffect(() => {
    audioRef.current = new Audio("/sounds/notification.mp3");
    channelRef.current = new BroadcastChannel("notification_system");

    channelRef.current.onmessage = (event) => {
      const { type, payload } = event.data;

      if (type === "NEW_NOTIFICATION") {
        setNotifications((prev) => [payload, ...prev]);
        setUnreadCount((prev) => prev + 1);
        setIsRinging(true);
        audioRef.current?.play().catch(() => console.log("Audio waiting for user interaction"));
        setTimeout(() => setIsRinging(false), 1000);
      }

      if (type === "REFRESH_NOTIFICATIONS") {
        fetchLatestData();
      }
    };

    return () => {
      channelRef.current?.close();
    };
  }, []);

  const sortedNotifications = useMemo(() => {
    return [...notifications].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [notifications]);

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
        setNotifications((prev) =>
          prev.map((item) =>
            item.id === n.id ? { ...item, read_at: new Date().toISOString() } : item
          )
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
      
      if (target && !target.read_at) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      
      channelRef.current?.postMessage({ type: "REFRESH_NOTIFICATIONS" });
    } catch (err) {
      console.error(err);
    }
  };

  const getDownloadUrl = (n: any) => n.download_url || n.data?.download_url;

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
        <svg
          className={`fill-current transition-transform ${isRinging ? "animate-bell text-orange-500" : ""}`}
          width="20"
          height="20"
          viewBox="0 0 20 20"
        >
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
              <button onClick={() => setSelectedNotif(null)} className="text-neutral-500 hover:text-neutral-700 transition-colors">
                <ChevronLeft size={20} />
              </button>
            )}
            <h5 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200">
              {selectedNotif ? "Detail" : `Notification (${unreadCount})`}
            </h5>
          </div>
          <button onClick={closeDropdown} className="text-neutral-500 hover:text-neutral-700 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-grow overflow-y-auto custom-scrollbar">
          {selectedNotif ? (
            <div className="p-2 animate-in fade-in slide-in-from-right-2 duration-200">
              <div className="flex items-center gap-3 mb-4">
                <img src={selectedNotif.user_avatar || "/notification.png"} className="w-12 h-12 rounded-full object-cover" alt="" />
                <div>
                  <p className="font-bold text-neutral-800 dark:text-white">{selectedNotif.user_name || "System"}</p>
                  <p className="text-xs text-neutral-500">
                    {dayjs(selectedNotif.created_at).fromNow()}
                  </p>
                </div>
              </div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed mb-4">
                {selectedNotif.message}
              </p>
              <div className="flex gap-2">
                {getDownloadUrl(selectedNotif) && (
                  <a 
                    href={getDownloadUrl(selectedNotif)} 
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-lg text-sm hover:bg-brand-600 transition"
                  >
                    <Download size={16} /> Download
                  </a>
                )}
                <button 
                  onClick={(e) => { handleDelete(e, selectedNotif.id); setSelectedNotif(null); }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm hover:bg-red-100 transition dark:bg-red-900/20 dark:text-red-400"
                >
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            </div>
          ) : (
            <ul className="flex flex-col gap-1">
              {sortedNotifications.length > 0 ? sortedNotifications.map((n) => (
                <li key={n.id} className="group relative">
                  <div 
                    onClick={() => handleShowDetail(n)}
                    className={`flex gap-3 rounded p-3 cursor-pointer transition-all border-b border-neutral-5 dark:border-neutral-800 
                      ${!n.read_at ? 'bg-brand-500/[0.04]' : 'hover:bg-neutral-50 dark:hover:bg-white/5'}`}
                  >
                    <img src={n.user_avatar || "/notification.png"} className="w-10 h-10 rounded-full object-cover" alt="" />
                    <div className="flex-grow pr-10">
                      <p className={`text-sm leading-snug ${!n.read_at ? 'text-neutral-900 font-bold dark:text-white' : 'text-neutral-600 dark:text-neutral-400'}`}>
                        <span className="font-semibold">{n.user_name || "System"}</span> {n.message}
                      </p>
                      <p className="text-xs text-neutral-500 mt-1 italic">
                        {dayjs(n.created_at).fromNow()}
                      </p>
                    </div>
                    <button 
                      onClick={(e) => handleDelete(e, n.id)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-neutral-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </li>
              )) : (
                <div className="flex flex-col items-center justify-center h-32 text-neutral-400 italic">
                   <p className="text-sm">No notifications yet</p>
                </div>
              )}
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
import { Dropdown } from "../ui/dropdown/Dropdown";
import { Link } from "react-router";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Trash2, ChevronLeft, X, Download, ExternalLink } from "lucide-react";
import { useNotificationLogic } from "@/hooks/useNotificationLogic";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "react-i18next";

dayjs.extend(relativeTime);

export default function NotificationDropdown() {
  const { t, i18n } = useTranslation();
  const {
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
  } = useNotificationLogic();
  const { user } = useAuth();

  dayjs.locale(i18n.language);

  const getDownloadUrl = (n: any) => n.download_url || n.data?.download_url;
  const getTargetLink = (n: any) => n.link || n.data?.link;

  return (
    <div className="relative z-[9999]" title="Notification">
      <button
        className="relative active:scale-95 flex items-center justify-center text-neutral-500 transition-colors bg-white border border-neutral-200 rounded-full h-11 w-11 hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900"
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
          <path
            d="M10.75 2.29248C10.75 1.87827 10.4143 1.54248 10 1.54248C9.58583 1.54248 9.25004 1.87827 9.25004 2.29248V2.83613C6.08266 3.20733 3.62504 5.9004 3.62504 9.16748V14.4591H3.33337C2.91916 14.4591 2.58337 14.7949 2.58337 15.2091C2.58337 15.6234 2.91916 15.9591 3.33337 15.9591H4.37504H15.625H16.6667C17.0809 15.9591 17.4167 15.6234 17.4167 15.2091C17.4167 14.7949 17.0809 14.4591 16.6667 14.4591H16.375V9.16748C16.375 5.9004 13.9174 3.20733 10.75 2.83613V2.29248ZM14.875 14.4591V9.16748C14.875 6.47509 12.6924 4.29248 10 4.29248C7.30765 4.29248 5.12504 6.47509 5.12504 9.16748V14.4591H14.875ZM8.00004 17.7085C8.00004 18.1228 8.33583 18.4585 8.75004 18.4585H11.25C11.6643 18.4585 12 18.1228 12 17.7085C12 17.2943 11.6643 16.9585 11.25 16.9585H8.75004C8.33583 16.9585 8.00004 17.2943 8.00004 17.7085Z"
            fill="currentColor"
          />
        </svg>
      </button>

      <Dropdown
        isOpen={isOpen}
        onClick={() => setIsOpen(false)}
        className="absolute -right-[240px] mt-[17px] flex h-[480px] w-[350px] flex-col rounded-xl border border-neutral-200 bg-white p-3 shadow-theme-lg dark:border-neutral-800 dark:bg-neutral-900 sm:w-[361px] lg:right-0"
      >
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-neutral-100 dark:border-neutral-700">
          <div className="flex items-center gap-2">
            {selectedNotif && (
              <button
                onClick={() => setSelectedNotif(null)}
                className="text-neutral-500 hover:text-neutral-700 transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
            )}
            <h5 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200">
              {selectedNotif ? t("notif_title_detail") : t("notif_title_count", { count: unreadCount })}
            </h5>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-neutral-500 hover:text-neutral-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-grow overflow-y-auto custom-scrollbar">
          {selectedNotif ? (
            <div className="p-2 animate-in fade-in slide-in-from-right-2 duration-200">
              <div className="flex items-center gap-3 mb-4">
                <img
                  src={selectedNotif.user_avatar || "/notification.png"}
                  className="w-12 h-12 rounded-full object-cover"
                  alt=""
                />
                <div>
                  <p className="font-bold text-neutral-800 dark:text-white">
                    {selectedNotif.user_name || t("notif_system")}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {dayjs(selectedNotif.created_at).fromNow()}
                  </p>
                </div>
              </div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed mb-4">
                {selectedNotif.data?.message || selectedNotif.message}
              </p>
              {getTargetLink(selectedNotif) && (
                  <Link
                    to={getTargetLink(selectedNotif)}
                    onClick={() => setIsOpen(false)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm hover:bg-opacity-90 transition font-medium w-full text-center justify-center  mb-2.5"
                  >
                    <ExternalLink size={16} /> Lihat Detail
                  </Link>
                )}
              <div className="flex gap-2">
                {getDownloadUrl(selectedNotif) && (
                  <a
                    href={getDownloadUrl(selectedNotif)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition"
                  >
                    <Download size={16} /> {t("notif_download")}
                  </a>
                )}
                <button
                  onClick={(e) => {
                    handleDelete(e, selectedNotif.id);
                    setSelectedNotif(null);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 text-sm hover:bg-red-100 transition dark:bg-red-900/20 dark:text-red-400 w-full justify-center"
                >
                  <Trash2 size={16} /> {t("notif_delete")}
                </button>
              </div>
            </div>
          ) : (
            <ul className="flex flex-col gap-1">
              {sortedNotifications.length > 0 ? (
                sortedNotifications.map((n) => (
                  <li key={n.id} className="group relative">
                    <div
                      onClick={() => handleShowDetail(n)}
                      className={`flex gap-3 rounded p-3 cursor-pointer transition-all border-b border-neutral-5 dark:border-neutral-800 
                      ${!n.read_at ? "bg-red-500/[0.04]" : "hover:bg-neutral-50 dark:hover:bg-white/5"}`}
                    >
                      <img
                        src={n.user_avatar || "/notification.png"}
                        className="w-10 h-10 rounded-full object-cover"
                        alt=""
                      />
                      <div className="flex-grow pr-10">
                        <p
                          className={`text-sm leading-snug ${!n.read_at ? "text-neutral-900 font-bold dark:text-white" : "text-neutral-600 dark:text-neutral-400"}`}
                        >
                          <span className="font-semibold">
                            {n.user_name || `${t("notif_system")} |`}
                          </span>{" "}
                          {n.data?.message || n.message}
                        </p>
                        <p className="text-xs text-neutral-500 mt-1 italic">
                          {dayjs(n.created_at).format("HH:mm [WIB]")}{" "}
                          — {dayjs(n.created_at).fromNow()}
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
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-32 text-neutral-400 italic">
                  <p className="text-sm">{t("notif_empty")}</p>
                </div>
              )}
            </ul>
          )}
        </div>
        <div className="mt-3 pt-2 border-t border-neutral-100 dark:border-neutral-800">
          <Link
            to={`${user?.role_name == "customer" ? "/profile-customer?tab=notifications" : "/notifications"}`}
            onClick={() => setIsOpen(false)}
            className="block w-full py-2.5 text-sm font-medium text-center text-neutral-700 bg-neutral-50 border border-neutral-200 rounded-xl hover:bg-neutral-100 dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-700 transition-colors"
          >
            {t("notif_view_all")}
          </Link>
        </div>
      </Dropdown>
    </div>
  );
}
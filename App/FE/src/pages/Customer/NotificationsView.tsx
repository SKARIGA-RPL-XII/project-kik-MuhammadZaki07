import { useState, useEffect } from "react"; // Tambahkan useState & useEffect
import { Bell, Trash2, ChevronLeft, Calendar, Info, ShoppingBag, CheckSquare, Square, BellRing, BellOff, X } from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useNotificationsViewLogic } from "@/hooks/useNotificationsViewLogic";
import { Button } from "@/components/ui/button";

dayjs.extend(relativeTime);

export function NotificationsView() {
  const [alert, setAlert] = useState<{ show: boolean; msg: string; type: 'success' | 'error' }>({ show: false, msg: '', type: 'success' });
  const [permissionStatus, setPermissionStatus] = useState(Notification.permission);

  const {
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
  } = useNotificationsViewLogic();

  // Fungsi Alert ala Bootstrap
  const showAlert = (msg: string, type: 'success' | 'error') => {
    setAlert({ show: true, msg, type });
    setTimeout(() => setAlert({ show: false, msg: '', type: 'success' }), 3000);
  };

  const handleRequestPermission = async () => {
    if (!("Notification" in window)) {
      showAlert("Browser ini tidak mendukung notifikasi", "error");
      return;
    }

    const permission = await Notification.requestPermission();
    setPermissionStatus(permission);

    if (permission === "granted") {
      showAlert("Notifikasi Berhasil Diaktifkan!", "success");
    } else {
      showAlert("Notifikasi Dimatikan/Ditolak", "error");
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300 relative">      
      {alert.show && (
        <div className={`fixed top-5 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-3 px-4 py-2.5 rounded-lg border shadow-lg transition-all animate-in slide-in-from-top-2 
          ${alert.type === 'success' ? 'bg-green-50 text-green-700 dark:bg-neutral-900 dark:text-green-300' : 'dark:bg-neutral-900 bg-red-50 text-red-700'}`}>
          <Info size={16} />
          <span className="text-sm font-medium">{alert.msg}</span>
          <button onClick={() => setAlert({ ...alert, show: false })} className="ml-2 hover:opacity-70">
            <X size={14} />
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-neutral-900 p-4 rounded-xl border">
        <div>
          <h2 className="text-lg font-bold text-neutral-800 dark:text-neutral-300">Pusat Notifikasi</h2>
          <p className="text-xs text-neutral-500">Kelola pemberitahuan pesanan dan sistem kamu.</p>
        </div>
        
        <Button
          onClick={handleRequestPermission}
          className={`flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold transition-all
            ${permissionStatus === 'granted' 
              ? 'bg-green-50 dark:bg-green-500 dark:text-white text-green-600 border cursor-default' 
              : 'bg-red-600 text-white hover:bg-red-700 shadow-md active:scale-95'}`}
        >
          {permissionStatus === 'granted' ? (
            <><BellRing size={16} /> Notifikasi Aktif</>
          ) : (
            <><BellOff size={16} /> Aktifkan Notifikasi</>
          )}
        </Button>
      </div>

      {selectedNotif ? (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
          <button 
            onClick={() => setSelectedNotif(null)}
            className="flex items-center gap-2 text-sm text-neutral-500 hover:text-red-600 transition-colors"
          >
            <ChevronLeft size={16} /> Kembali ke daftar
          </button>

          <div className="bg-white dark:bg-neutral-900 border rounded-xl p-5">
            <div className="flex items-start justify-between mb-6">
              <div className="flex gap-4">
                <div className={`p-3 rounded-full ${getType(selectedNotif) === 'payment_success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600 dark:bg-neutral-800'}`}>
                  {getType(selectedNotif) === 'payment_success' ? <ShoppingBag size={24} /> : <Bell size={24} />}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-neutral-800 dark:text-neutral-300 leading-tight">
                    {selectedNotif.data?.type?.replace('_', ' ').toUpperCase() || "SYSTEM"}
                  </h3>
                  <div className="flex items-center gap-2 text-neutral-400 text-xs mt-1">
                    <Calendar size={12} />
                    {dayjs(selectedNotif.created_at).format("DD MMMM YYYY, HH:mm")}
                  </div>
                </div>
              </div>
              <button 
                onClick={() => handleDelete(selectedNotif.id)}
                className="p-2 text-neutral-300 hover:text-red-600 transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </div>

            <p className="text-neutral-600 leading-relaxed text-sm bg-neutral-50 dark:bg-neutral-800 p-4 rounded-xl border dark:text-neutral-300">
              {getMessage(selectedNotif)}
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-2 px-1">
            <div className="flex items-center gap-2">
              {notifications.length > 0 && (
                <button onClick={toggleSelectAll} className="p-1 text-neutral-400 hover:text-red-600 transition-colors">
                  {selectedIds.length === notifications.length ? <CheckSquare size={20} className="text-red-600" /> : <Square size={20} />}
                </button>
              )}
              <span className="text-sm font-medium text-neutral-400">
                {selectedIds.length > 0 ? `${selectedIds.length} Terpilih` : 'Notifikasi Terbaru'}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {selectedIds.length > 0 && (
                <button 
                  onClick={handleBulkDelete}
                  className="flex items-center gap-1.5 text-xs font-bold text-red-600 bg-red-50 px-3 py-1.5 rounded-full hover:bg-red-100 transition-all"
                >
                  <Trash2 size={14} /> Hapus
                </button>
              )}
              {unreadCount > 0 && (
                <span className="text-[10px] bg-red-600 text-white px-2 py-0.5 rounded-full font-bold">
                  {unreadCount} Baru
                </span>
              )}
            </div>
          </div>

          {notifications.length > 0 ? (
            <div className="grid gap-3">
              {notifications.map((n) => {
                const isSelected = selectedIds.includes(n.id);
                const isUnread = !n.read_at;
                
                return (
                  <div
                    key={n.id}
                    onClick={() => handleShowDetail(n)}
                    className={`group relative max-w-[630px] flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected ? "border-red-200 bg-red-50/30 dark:bg-neutral-800" : 
                      isUnread ? "bg-white dark:bg-neutral-800 border-red-100 shadow-sm ring-1 ring-red-50" : "bg-neutral-50/50 dark:bg-neutral-900"
                    }`}
                  >
                    <div onClick={(e) => toggleSelect(e, n.id)} className={`shrink-0 transition-colors ${isSelected ? 'text-red-600' : 'text-neutral-300 group-hover:text-neutral-400'}`}>
                      {isSelected ? <CheckSquare size={20} /> : <Square size={20} />}
                    </div>

                    <div className={`p-2 rounded-lg shrink-0 ${isUnread ? 'bg-red-50 dark:bg-neutral-800 text-red-600' : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-500'}`}>
                      {n.data?.type === 'payment_success' ? <ShoppingBag size={18} /> : <Info size={18} />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <p className={`text-sm truncate capitalize ${isUnread ? 'font-bold text-neutral-800' : 'text-neutral-500'}`}>
                          {n.data?.type?.replace('_', ' ') || "System"}
                        </p>
                        <span className="text-[10px] text-neutral-400 italic shrink-0">
                          {dayjs(n.created_at).fromNow()}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-500 truncate mt-0.5">
                        {getMessage(n)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20 bg-neutral-50 rounded-3xl border border-dashed border-neutral-200">
              <Bell size={20} className="text-neutral-400 mx-auto mb-3" />
              <p className="text-sm text-neutral-500">Belum ada notifikasi untukmu.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
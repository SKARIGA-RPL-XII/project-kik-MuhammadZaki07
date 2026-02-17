import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  Clock,
  Download,
  Trash2,
  ShieldCheck,
  Globe,
  User as UserIcon,
  Calendar,
  FileText,
} from "lucide-react";
import dayjs from "dayjs";
import { notificationService } from "@/services/notification.service";
import { Notification } from "../../types/notification";
import { useNavigate, useParams } from "react-router";
import PageMeta from "@/components/common/PageMeta";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Button } from "@/components/ui/button";
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

const NotificationShow: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [notif, setNotif] = useState<Notification | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) loadDetail(id);
  }, [id]);

  const loadDetail = async (notifId: string) => {
    setLoading(true);
    try {
      const res = await notificationService.getById(notifId);
      const notificationData = res.data;
      setNotif(notificationData);

      if (!notificationData.read_at) {
        await notificationService.markAsRead(notifId);
      }
    } catch (err) {
      console.error(err);
      navigate("/notifications");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!notif) return;
    try {
      await notificationService.delete(notif.id);
      navigate("/notifications");
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-stroke border-t-primary"></div>
      </div>
    );
  }

  if (!notif) return null;

  const downloadUrl = (notif.data as any)?.download_url;

  return (
    <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
      <PageMeta
        title="Notification Detail | TailAdmin"
        description="Detail notifikasi sistem."
      />
      <PageBreadcrumb pageTitle="Notification Detail" />

      <button
        onClick={() => navigate("/notifications")}
        className="mb-6 flex items-center gap-2 text-sm font-medium text-black hover:text-primary dark:text-white dark:hover:text-primary transition-colors"
      >
        <ArrowLeft size={18} /> Back to List
      </button>

      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="border-b border-stroke px-6 py-6 dark:border-strokedark">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-md bg-meta-2 dark:bg-meta-4 text-primary">
                {notif.is_global ? (
                  <Globe size={24} />
                ) : notif.role_id ? (
                  <ShieldCheck size={24} />
                ) : (
                  <UserIcon size={24} />
                )}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-black dark:text-white">
                  {notif.title}
                </h3>
                <div className="flex items-center gap-4 mt-1">
                  <span className="flex items-center gap-1.5 text-sm font-medium text-body">
                    <Calendar size={14} />
                    {dayjs(notif.created_at).format("DD MMM YYYY")}
                  </span>
                  <span className="flex items-center gap-1.5 text-sm font-medium text-body">
                    <Clock size={14} />
                    {dayjs(notif.created_at).format("HH:mm")}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span
                className={`inline-flex rounded px-3 py-1 text-xs font-medium uppercase ${
                  notif.is_global
                    ? "bg-primary/10 text-primary"
                    : "bg-success/10 text-success"
                }`}
              >
                {notif.is_global ? "Global" : "Personal"}
              </span>
            </div>
          </div>
        </div>

        <div className="p-6 md:p-9">
          <div className="max-w-3xl">
            <p className="text-base leading-relaxed text-body dark:text-bodydark whitespace-pre-wrap font-medium">
              {notif.message}
            </p>

            {downloadUrl && (
              <div className="mt-8 rounded-sm border border-stroke bg-gray-2 p-4 dark:border-strokedark dark:bg-meta-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded bg-white dark:bg-boxdark">
                      <Download size={20} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-black dark:text-white">
                        Lampiran Dokumen
                      </p>
                      <p className="text-xs text-body">
                        File lampiran tersedia untuk diunduh
                      </p>
                    </div>
                  </div>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button className="bg-primary hover:bg-opacity-90">
                        Download
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent size="sm">
                      <AlertDialogHeader>
                        <AlertDialogMedia className="bg-brand-500/10 text-brand-500">
                          <FileText size={24} />
                        </AlertDialogMedia>
                        <AlertDialogTitle>Unduh Lampiran?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Anda akan mengunduh dokumen terkait notifikasi ini.
                          Pastikan Anda mempercayai sumber file ini.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel variant="outline">Batal</AlertDialogCancel>
                        <AlertDialogAction
                          asChild
                          className="bg-brand-500"
                        >
                          <a href={downloadUrl} target="_blank">Unduh Sekarang</a>
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            )}
          </div>

          <div className="mt-12 flex items-center justify-end border-t border-stroke pt-6 dark:border-strokedark">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="flex items-center gap-2">
                  <Trash2 size={18} />
                  Delete Notification
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent size="sm">
                <AlertDialogHeader>
                  <AlertDialogMedia className="bg-destructive/10 text-destructive">
                    <Trash2 size={24} />
                  </AlertDialogMedia>
                  <AlertDialogTitle>Hapus Notifikasi?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tindakan ini tidak dapat dibatalkan. Notifikasi akan dihapus secara permanen dari akun Anda.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel variant="outline">Batal</AlertDialogCancel>
                  <AlertDialogAction
                    variant="destructive"
                    onClick={handleDelete}
                  >
                    Hapus Selamanya
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationShow;
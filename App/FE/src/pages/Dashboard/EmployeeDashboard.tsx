import PageMeta from "../../components/common/PageMeta";
import WelcomeBanner from "@/components/ui/WelcomeBanner";
import CalendarWidget from "@/components/ui/CalendarWidget";
import {
  UserCheck,
  AlertTriangle,
  History,
  AlertCircle,
  CalendarDays,
  Coffee,
} from "lucide-react";
import { useDashboard } from "@/hooks/react-query/useDashboard";
import { EmployeeDashboardSkeleton } from "@/components/skeleton/DashboardSkeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router";
import { Badge } from "@/components/ui/badge";

export default function EmployeeDashboard() {
  const { useEmployeeDashboard } = useDashboard();
  const { data, isLoading } = useEmployeeDashboard();

  const attendance = data?.attendance;
  const summary = data?.monthly_summary;
  const hasSchedule = data?.has_schedule;
  const isHoliday = data?.is_holiday;

  if (isLoading) return <EmployeeDashboardSkeleton />;

  return (
    <>
      <PageMeta
        title="My Dashboard | Gagal-Lapar"
        description="Check your performance and attendance."
      />

      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12">
          <WelcomeBanner />
        </div>

        <div className="col-span-12 lg:col-span-5">
          <Card
            className={`overflow-hidden border-2 shadow-none transition-all ${
              !hasSchedule || isHoliday
                ? ""
                : attendance
                  ? " "
                  : ""
            } dark:bg-neuttext-neutral-900`}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-bold">
                Status Absensi Hari Ini
              </CardTitle>
              {!hasSchedule || isHoliday ? (
                <Coffee className="h-6 w-6 text-blue-600" />
              ) : attendance ? (
                <UserCheck className="h-6 w-6 text-green-600" />
              ) : (
                <AlertTriangle className="h-6 w-6 text-red-600" />
              )}
            </CardHeader>
            <CardContent>
              {!hasSchedule || isHoliday ? (
                <div className="space-y-4">
                  <p className="text-sm font-normal">
                    Hari ini Anda tidak memiliki jadwal kerja. Selamat
                    beristirahat!
                  </p>
                  <Badge variant={"outline"} className="flex items-center gap-2 text-[11px] text-blue-600 w-fit px-3 py-1 rounded-full font-bold">
                    <CalendarDays className="h-3 w-3" /> Scheduled: OFF
                  </Badge>
                </div>
              ) : attendance ? (
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-neutral-500">Waktu Masuk</p>
                    <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                      {attendance.clock_in}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      attendance.status === "late"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {attendance.status.toUpperCase()}
                  </span>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-red-600 font-normal">
                    Anda belum melakukan absen masuk hari ini!
                  </p>
                  <Link to={"/attendance"}>
                    <Button className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-6 shadow-none transition-transform active:scale-95">
                      Absen Sekarang <AlertCircle className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="col-span-12 lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="shadow-none border rounded-xl transition-hover">
            <CardHeader className="pb-2">
              <p className="text-sm font-medium text-neutral-500">
                Hadir Bulan Ini
              </p>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <h4 className="text-4xl font-black text-red-600">
                  {summary?.present || 0}
                </h4>
                <span className="text-neutral-500 font-medium">Hari</span>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-none border rounded-xl transition-hover">
            <CardHeader className="pb-2">
              <p className="text-sm font-medium text-neutral-500">
                Total Alpha
              </p>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <h4
                  className={`text-4xl font-black ${
                    summary?.alpha && summary.alpha >= 2
                      ? "text-red-600"
                      : "text-neutral-900 dark:text-white"
                  }`}
                >
                  {summary?.alpha || 0}
                </h4>
                <span className="text-neutral-500 font-medium">Hari</span>
              </div>
              {!!summary?.alpha && summary.alpha >= 2 && (
                <p className="mt-2 text-[10px] font-bold text-red-500 flex items-center gap-1 animate-pulse">
                  <AlertTriangle className="h-3 w-3" /> Batas suspend: 3 kali
                  Alpha
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="col-span-12 xl:col-span-8">
          <CalendarWidget />
        </div>

        <div className="col-span-12 xl:col-span-4">
          <Card className="shadow-none border rounded-xl transition-hover">
            <CardHeader>
              <CardTitle className="text-md font-bold flex items-center gap-2 text-neutral-600">
                <History className="h-5 w-5" /> Aktivitas Terakhir
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-8 text-center border-2 border-dashed border-neuttext-neutral-50 rounded-2xl">
                <p className="text-sm text-neutral-400">
                  Belum ada aktivitas pelayanan terbaru.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

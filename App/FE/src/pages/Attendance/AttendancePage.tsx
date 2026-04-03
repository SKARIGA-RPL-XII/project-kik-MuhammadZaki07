import { useState, useEffect } from "react";
import { useAttendance } from "@/hooks/useAttendance";
import { attendanceService } from "@/services/attendance.service";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import PageMeta from "@/components/common/PageMeta";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { AttendanceTable } from "@/components/tables/AttendanceTable";
import useDebounce from "@/hooks/useDebounce";
import { MapPin, Clock, CalendarDays, FileText, Search } from "lucide-react";
import { isAfter, parse, addMinutes } from "date-fns";
import { Link } from "react-router";
import { MdDone } from "react-icons/md";

export default function AttendancePage() {
  const { toast } = useToast();
  const {
    attendanceStatus,
    distance,
    isOutOfRange,
    loading,
    handleClockIn,
    handleClockOut,
  } = useAttendance(toast);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [historyData, setHistoryData] = useState<any>(null);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const debouncedSearch = useDebounce(search, 500);

  const isTooLate = () => {
    if (!attendanceStatus?.attendance?.schedule?.shift?.start_time)
      return false;
    const now = new Date();
    const startTimeStr = attendanceStatus.attendance.schedule.shift.start_time;
    const startTime = parse(startTimeStr, "HH:mm:ss", new Date());
    const limitTime = addMinutes(startTime, 10);
    return isAfter(now, limitTime);
  };

  const onConfirmAttendance = async () => {
    try {
      let response;
      if (!attendanceStatus?.has_clock_in) {
        response = await handleClockIn();
      } else {
        response = await handleClockOut();
      }

      if (response?.message) {
        toast({
          title: "Berhasil",
          description: response.message,
        });
      }

      fetchHistory();
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message ||
        "Terjadi kesalahan saat memproses absensi.";

      toast({
        variant: "destructive",
        title: "Gagal Absen",
        description: errorMsg,
      });
    }
  };

  const fetchHistory = async () => {
    setIsHistoryLoading(true);
    try {
      const params: any = { page };
      if (debouncedSearch && debouncedSearch.trim() !== "") {
        params.status = debouncedSearch;
      }

      const res = await attendanceService.getMyAttendance(params);
      setHistoryData(res);
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal memuat riwayat absensi.",
      });
    } finally {
      setIsHistoryLoading(false);
    }
  };

  const isBeforeReturnTime = () => {
    if (!attendanceStatus?.attendance?.schedule?.shift?.end_time) return false;

    const now = new Date();
    const endTimeStr = attendanceStatus.attendance.schedule.shift.end_time;

    const endTime = parse(endTimeStr, "HH:mm:ss", new Date());

    return !isAfter(now, endTime);
  };

  useEffect(() => {
    fetchHistory();
  }, [page, debouncedSearch]);

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      <PageMeta
        title="Absensi Saya"
        description="Lakukan absensi harian dan pantau riwayat."
      />
      <PageBreadcrumb pageTitle="Absensi" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6">
          <Card className="shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Presensi Hari Ini
              </CardTitle>
              <CardDescription>
                Pastikan Anda berada dalam radius 50 meter.
              </CardDescription>
            </CardHeader>
          <CardContent className="space-y-4">
  <div
    className={`p-4 rounded-xl border flex items-center gap-4 transition-colors ${
      isOutOfRange ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"
    }`}
  >
    <MapPin className={isOutOfRange ? "text-red-500" : "text-green-500"} />
    <div>
      <p className="text-xs text-muted-foreground font-medium">Jarak Anda</p>
      <p
        className={`text-lg font-bold ${
          isOutOfRange ? "text-red-600" : "text-green-600"
        }`}
      >
        {distance !== null ? `${Math.round(distance)} Meter` : "Mencari Lokasi..."}
      </p>
    </div>
  </div>

  {!attendanceStatus?.has_schedule || attendanceStatus?.is_holiday ? (
    <div className="space-y-4">
      <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-center">
        <CalendarDays strokeWidth={1.3} className="w-8 h-8 text-amber-500 mx-auto mb-2" />
        <p className="text-sm font-bold text-amber-800">Tidak Ada Jadwal</p>
        <p className="text-[11px] text-amber-700">
          Hari ini Anda tidak memiliki jadwal kerja atau sedang hari libur.
        </p>
      </div>
      <Link to="/leaves">
        <Button variant="outline" className="w-full group shadow-none">
          <FileText className="w-4 h-4 mr-2" />
          Tetap Ajukan Izin
        </Button>
      </Link>
    </div>
  ) : (
    <>
      {!attendanceStatus?.has_clock_out ? (
        <div className="space-y-3">
          <Button
            className="w-full h-12 text-lg font-medium shadow-none"
            onClick={onConfirmAttendance}
            disabled={
              loading ||
              isOutOfRange ||
              (!attendanceStatus?.has_clock_in && isTooLate()) ||
              (attendanceStatus?.has_clock_in && isBeforeReturnTime())
            }
            variant={attendanceStatus?.has_clock_in ? "outline" : "default"}
          >
            {loading ? (
              "Processing..."
            ) : !attendanceStatus?.has_clock_in ? (
              "Clock In"
            ) : isBeforeReturnTime() ? (
              `Belum Jam Pulang (${attendanceStatus?.schedule_data?.shift?.end_time || attendanceStatus?.attendance?.schedule?.shift?.end_time})`
            ) : (
              "Clock Out"
            )}
          </Button>

          {isTooLate() && !attendanceStatus?.has_clock_in && (
            <p className="text-[10px] text-red-500 text-center italic font-medium">
              * Batas waktu absen masuk (10 menit) telah berakhir.
            </p>
          )}
        </div>
      ) : (
        <div className="bg-primary/10 flex gap-2 items-center justify-center text-primary p-4 rounded-xl text-center text-sm font-bold border border-primary/20">
          <MdDone className="text-lg" /> Selesai untuk hari ini
        </div>
      )}

      <div className="pt-2">
        <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-[11px] font-medium text-muted-foreground">Shift Hari Ini</span>
          </div>
          <span className="text-[11px] font-bold">
             {attendanceStatus?.schedule_data?.shift?.start_time} - {attendanceStatus?.schedule_data?.shift?.end_time}
          </span>
        </div>
      </div>

      <Link to="/leaves">
        <Button variant="outline" className="w-full mt-2 group shadow-none">
          <FileText className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
          Ajukan Izin / Sakit
        </Button>
      </Link>
    </>
  )}
</CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <CalendarDays className="w-5 h-5" /> Riwayat Absensi
            </h2>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
              <Input
                placeholder="Cari status..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <Card className="shadow-none">
            <CardContent className="p-0">
              <AttendanceTable
                data={historyData?.data || []}
                isLoading={isHistoryLoading}
              />
            </CardContent>
          </Card>

          <div className="flex items-center justify-end space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p - 1)}
              disabled={page === 1 || isHistoryLoading}
            >
              Previous
            </Button>
            <div className="text-sm font-medium">
              Halaman {page} dari {historyData?.meta?.last_page || 1}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={
                page >= (historyData?.meta?.last_page || 1) || isHistoryLoading
              }
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

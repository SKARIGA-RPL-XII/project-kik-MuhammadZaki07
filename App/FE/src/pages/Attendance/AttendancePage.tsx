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
      const errorMsg = err.response?.data?.message || "Terjadi kesalahan saat memproses absensi.";
      
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
                className={`p-4 rounded-xl border flex items-center gap-4 ${isOutOfRange ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"}`}
              >
                <MapPin
                  className={isOutOfRange ? "text-red-500" : "text-green-500"}
                />
                <div>
                  <p className="text-xs text-muted-foreground font-medium">
                    Jarak Anda
                  </p>
                  <p
                    className={`text-lg font-bold ${isOutOfRange ? "text-red-600" : "text-green-600"}`}
                  >
                    {distance !== null
                      ? `${Math.round(distance)} Meter`
                      : "Mencari Lokasi..."}
                  </p>
                </div>
              </div>

              {!attendanceStatus?.has_clock_out ? (
                <Button
                  className="w-full h-12 text-lg font-medium shadow-none"
                  onClick={onConfirmAttendance}
                  disabled={
                    loading ||
                    isOutOfRange ||
                    (!attendanceStatus?.has_clock_in && isTooLate())
                  }
                  variant={
                    attendanceStatus?.has_clock_in ? "outline" : "default"
                  }
                >
                  {loading
                    ? "Processing..."
                    : !attendanceStatus?.has_clock_in
                      ? "Clock In"
                      : "Clock Out"}
                </Button>
              ) : (
                <div className="bg-primary/10 flex gap-2 items-center justify-center text-primary p-3 rounded-md text-center text-sm font-semibold border border-primary/20">
                 <MdDone/> Selesai untuk hari ini
                </div>
              )}

              {isTooLate() && !attendanceStatus?.has_clock_in && (
                <p className="text-[10px] text-red-500 text-center italic">
                  * Batas waktu absen masuk (10 menit) telah berakhir.
                </p>
              )}

              <Link to="/leaves">
                <Button variant="outline" className="w-full mt-2 group">
                  <FileText className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                  Ajukan Izin / Sakit
                </Button>
              </Link>
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

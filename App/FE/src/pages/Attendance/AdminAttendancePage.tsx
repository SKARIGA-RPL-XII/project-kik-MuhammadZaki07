import { useState, useEffect, useRef } from "react";
import { attendanceService } from "@/services/attendance.service";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PageMeta from "@/components/common/PageMeta";
import { AttendanceTable } from "@/components/tables/AttendanceTable";
import useDebounce from "@/hooks/useDebounce";
import {
  Search,
  FileDown,
  Users,
  AlertTriangle,
  UserX,
  Coins,
  RefreshCw,
  CalendarIcon,
} from "lucide-react";
import flatpickr from "flatpickr";
import dayjs from "dayjs";
import { ActionGuard } from "@/components/guard/ActionGuard";

export default function AdminAttendancePage() {
  const { toast } = useToast();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [role, setRole] = useState("all");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [exporting, setExporting] = useState(false);

  const debouncedSearch = useDebounce(search, 800);
  const datePickerRef = useRef<HTMLInputElement>(null);

  const fetchAllAttendance = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        search: debouncedSearch,
        status,
        role,
        start_date: dateRange.start,
        end_date: dateRange.end,
      };
      const res = await attendanceService.getAllAttendance(params);
      setData(res);
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load attendance monitoring data.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllAttendance();
  }, [page, debouncedSearch, status, role, dateRange]);

  useEffect(() => {
    if (!datePickerRef.current) return;

    const fp = flatpickr(datePickerRef.current, {
      mode: "range",
      static: true,
      monthSelectorType: "static",
      dateFormat: "Y-m-d",
      defaultDate: [dateRange.start, dateRange.end],
      onClose: (selectedDates) => {
        if (selectedDates.length === 2) {
          const start = dayjs(selectedDates[0]).format("YYYY-MM-DD");
          const end = dayjs(selectedDates[1]).format("YYYY-MM-DD");

          setPage(1);
          setDateRange({ start, end });
        }
      },
    });

    return () => fp.destroy();
  }, [dateRange.start, dateRange.end]);

  const handleExport = async () => {
    setExporting(true);

    const params = {
      status,
      role,
      start_date: dateRange.start,
      end_date: dateRange.end,
    };

    try {
      await attendanceService.exportAttendance("xlsx", params);

      toast({
        title: "Export Success",
        description: "Attendance data has been successfully exported to Excel.",
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Export Failed",
        description: "Something went wrong while exporting data.",
      });
    } finally {
      setExporting(false);
    }
  };

  const resetFilters = () => {
    setSearch("");
    setStatus("all");
    setRole("all");
    setDateRange({ start: "", end: "" });
    setPage(1);
  };

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      <PageMeta
        title="Attendance Monitoring"
        description="Monitor all employee attendance in real-time."
      />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Attendance Tracking
          </h1>
          <p className="text-muted-foreground text-sm">
            Manage and audit team attendance data.
          </p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button
            variant="outline"
            onClick={fetchAllAttendance}
            disabled={loading}
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>

          <ActionGuard module="attendance logs" action="view">
            <Button
              onClick={handleExport}
              disabled={exporting || !data?.data?.length}
              className="bg-green-600 hover:bg-green-700 transition-all min-w-[140px]"
            >
              {exporting ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <FileDown className="w-4 h-4 mr-2" />
                  Export Excel
                </>
              )}
            </Button>
          </ActionGuard>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Late</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data?.summary?.count_late ?? 0}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Absent</CardTitle>
            <UserX className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data?.summary?.count_alpha ?? 0}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Penalty</CardTitle>
            <Coins className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              Rp{" "}
              {new Intl.NumberFormat("id-ID").format(
                data?.summary?.total_penalty ?? 0
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.meta?.total ?? 0}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-none">
        <CardContent className="p-4 flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px] space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Search Username
            </label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="w-full sm:w-40 space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Status
            </label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="present">Present</SelectItem>
                <SelectItem value="late">Late</SelectItem>
                <SelectItem value="alpha">Absent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="w-full sm:w-64 space-y-1.5">
            <label className="text-xs font-medium text-neutral-400 dark:text-neutral-500">
              Date Range
            </label>
            <div className="relative flex items-center">
              <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-neutral-400 pointer-events-none z-10" />
              <input
                ref={datePickerRef}
                className="w-full h-10 pl-10 pr-3 py-2 rounded-lg border border-neutral-200 bg-white text-sm font-medium text-neutral-700 outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 cursor-pointer transition-all"
                placeholder="Select Date Range"
                readOnly
              />
            </div>
          </div>

          <Button
            variant="ghost"
            onClick={resetFilters}
            className="text-xs text-red-500 hover:text-red-600 h-10 underline"
          >
            Reset Filters
          </Button>
        </CardContent>
      </Card>

      <Card className="shadow-none border-none bg-transparent">
        <CardContent className="p-0">
          <AttendanceTable
            data={data?.data ?? []}
            isLoading={loading}
            isAdminView={true}
          />
        </CardContent>
      </Card>

      <div className="flex items-center justify-between pb-10">
        <p className="text-sm text-muted-foreground">
          Showing {data?.data?.length ?? 0} of {data?.meta?.total ?? 0} entries
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 1 || loading}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= (data?.meta?.last_page ?? 1) || loading}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
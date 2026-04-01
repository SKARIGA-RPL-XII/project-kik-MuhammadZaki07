import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/utils/dateHelper";

interface AttendanceTableProps {
  data: any[];
  isLoading: boolean;
}

export function AttendanceTable({ data, isLoading }: AttendanceTableProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "present": return <Badge className="bg-green-500">Hadir</Badge>;
      case "late": return <Badge variant="destructive">Terlambat</Badge>;
      case "alpha": return <Badge variant="outline" className="text-red-500 border-red-500">Alpha</Badge>;
      case "leave": return <Badge className="bg-purple-500">Izin</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="rounded-md">
      <Table className="shadow-none">
        <TableHeader>
          <TableRow>
            <TableHead>Tanggal</TableHead>
            <TableHead>Masuk</TableHead>
            <TableHead>Pulang</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Denda</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-10">Loading data...</TableCell>
            </TableRow>
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">Belum ada riwayat absensi.</TableCell>
            </TableRow>
          ) : (
            data.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">
                  {formatDate(item.date)}
                </TableCell>
                <TableCell>{item.clock_in || "--:--"}</TableCell>
                <TableCell>{item.clock_out || "--:--"}</TableCell>
                <TableCell>{getStatusBadge(item.status)}</TableCell>
                <TableCell className="text-right text-red-600 font-semibold">
                  {item.total_penalty > 0 ? `Rp ${Number(item.total_penalty).toLocaleString()}` : "-"}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
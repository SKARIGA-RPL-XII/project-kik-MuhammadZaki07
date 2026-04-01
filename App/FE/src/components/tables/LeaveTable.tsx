import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Check, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/utils/dateHelper";

interface LeaveTableProps {
  data: any[];
  isLoading: boolean;
  onDetail: (id: number) => void;
  onAction: (id: number, status: "approved" | "rejected") => void;
}

export const LeaveTable = ({ data, isLoading, onDetail, onAction }: LeaveTableProps) => {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="border rounded-xl bg-card overflow-hidden">
      <Table className="shadow-none">
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead>Pegawai</TableHead>
            <TableHead>Tipe</TableHead>
            <TableHead>Tanggal</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">Data tidak ditemukan.</TableCell>
            </TableRow>
          ) : (
            data?.map((l) => (
              <TableRow key={l.id}>
                <TableCell className="font-medium">{l.user.username}</TableCell>
                <TableCell className="capitalize">{l.type}</TableCell>
                <TableCell className="text-xs">{formatDate(l.start_date)} - {formatDate(l.end_date)}</TableCell>
                <TableCell>
                  <Badge className="text-white dark:text-gray-dark" variant={l.status === "approved" ? "default" : l.status === "rejected" ? "destructive" : "outline"}>
                    {l.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="ghost" size="icon" className="size-8" onClick={() => onDetail(l.id)}>
                    <Eye size={16} />
                  </Button>
                  {l.status === "pending" && (
                    <>
                      <Button variant="outline" size="icon" className="size-8 text-green-600" onClick={() => onAction(l.id, "approved")}>
                        <Check size={16} />
                      </Button>
                      <Button variant="outline" size="icon" className="size-8 text-red-600" onClick={() => onAction(l.id, "rejected")}>
                        <X size={16} />
                      </Button>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
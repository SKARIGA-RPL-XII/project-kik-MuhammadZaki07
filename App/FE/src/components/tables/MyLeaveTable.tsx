import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, History } from "lucide-react";

interface MyLeaveTableProps {
  data: any[];
  isLoading: boolean;
  meta?: any;
  onPageChange?: (page: number) => void;
}

export const MyLeaveTable = ({ data, isLoading, meta, onPageChange }: MyLeaveTableProps) => {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-card overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="font-bold text-red-600">Tipe</TableHead>
              <TableHead className="font-bold">Periode</TableHead>
              <TableHead className="font-bold hidden md:table-cell">Alasan</TableHead>
              <TableHead className="text-right font-bold">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center py-20 text-neutral-500"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Loader2 className="animate-spin text-red-600" size={24} />
                    <span className="text-sm font-medium">Memuat data perizinan...</span>
                  </div>
                </TableCell>
              </TableRow>
            )}

            {!isLoading && data.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="py-20 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 text-neutral-400">
                    <History size={32} className="opacity-20" />
                    <span className="text-sm">Belum ada riwayat perizinan ditemukan</span>
                  </div>
                </TableCell>
              </TableRow>
            )}

            {!isLoading && data.length > 0 && (
              data.map((l: any) => (
                <TableRow key={l.id} className="group hover:bg-muted/30 transition-colors">
                  <TableCell className="font-semibold capitalize text-sm">
                    {l.type}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {l.start_date?.split("T")[0]} - {l.end_date?.split("T")[0]}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-xs text-muted-foreground truncate max-w-[200px]">
                    {l.reason}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge 
                      variant={
                        l.status === "approved" 
                          ? "default" 
                          : l.status === "rejected" 
                            ? "destructive" 
                            : "outline"
                      } 
                      className="capitalize font-medium"
                    >
                      {l.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {meta && meta.last_page > 1 && (
        <div className="flex justify-end items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 text-xs"
            onClick={() => onPageChange?.(meta.current_page - 1)} 
            disabled={meta.current_page === 1 || isLoading}
          >
            Prev
          </Button>
          <div className="bg-muted px-3 py-1 rounded-md border text-[10px] font-bold uppercase tracking-wider">
            {meta.current_page} / {meta.last_page}
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 text-xs"
            onClick={() => onPageChange?.(meta.current_page + 1)} 
            disabled={meta.current_page === meta.last_page || isLoading}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};
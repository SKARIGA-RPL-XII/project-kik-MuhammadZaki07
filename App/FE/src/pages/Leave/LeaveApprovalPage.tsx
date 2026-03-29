import * as React from "react";
import { useLeaves, useApproveLeave } from "@/hooks/react-query/useLeave";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Eye } from "lucide-react";

interface ApprovalProps {
  leaves: any;
  approveMutation: any;
}

class LeaveApprovalContent extends React.Component<ApprovalProps> {
  private handleAction = (id: number, status: "approved" | "rejected") => {
    let reason = undefined;
    if (status === "rejected") {
      reason = prompt("Alasan penolakan:") || "";
      if (!reason) return;
    }
    this.props.approveMutation.mutate({ id, status, reason });
  };

  render() {
    const { leaves } = this.props;

    return (
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold">Persetujuan Izin</h1>
        <div className="border rounded-xl bg-card overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Pegawai</TableHead>
                <TableHead>Tipe</TableHead>
                <TableHead>Bukti</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaves.data?.map((l: any) => (
                <TableRow key={l.id}>
                  <TableCell className="font-medium">{l.user.username}</TableCell>
                  <TableCell className="capitalize">{l.type}</TableCell>
                  <TableCell>
                    <a href={`${import.meta.env.VITE_STORAGE_URL}/${l.proof_file}`} target="_blank" className="text-blue-500 text-xs flex items-center gap-1">
                      <Eye size={14} /> Lihat
                    </a>
                  </TableCell>
                  <TableCell><Badge>{l.status}</Badge></TableCell>
                  <TableCell className="text-right space-x-2">
                    {l.status === "pending" && (
                      <>
                        <Button variant="outline" size="icon" className="size-8 text-green-600" onClick={() => this.handleAction(l.id, "approved")}><Check size={14} /></Button>
                        <Button variant="outline" size="icon" className="size-8 text-red-600" onClick={() => this.handleAction(l.id, "rejected")}><X size={14} /></Button>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }
}

export default function LeaveApprovalPage() {
  const leaves = useLeaves();
  const approveMutation = useApproveLeave();
  return <LeaveApprovalContent leaves={leaves} approveMutation={approveMutation} />;
}
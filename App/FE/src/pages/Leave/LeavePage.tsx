import * as React from "react";
import { useMyLeaves, useCreateLeave } from "@/hooks/react-query/useLeave";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { UploadCloud, Send, Calendar } from "lucide-react";

interface LeavePageProps {
  myLeaves: any;
  createLeave: any;
}

class LeavePageContent extends React.Component<LeavePageProps, { file: File | null }> {
  constructor(props: LeavePageProps) {
    super(props);
    this.state = { file: null };
  }

  private handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    if (!this.state.file) return alert("Wajib upload bukti!");

    this.props.createLeave.mutate({
      type: formData.get("type") as string,
      start_date: formData.get("start_date") as string,
      end_date: formData.get("end_date") as string,
      reason: formData.get("reason") as string,
      proof_file: this.state.file,
    });

    e.currentTarget.reset();
    this.setState({ file: null });
  };

  render() {
    const { myLeaves, createLeave } = this.props;

    return (
      <div className="container mx-auto p-6 max-w-5xl space-y-8">
        <header>
          <h1 className="text-2xl font-bold">Pengajuan Izin</h1>
          <p className="text-muted-foreground text-sm">Ajukan sakit atau izin kerja di sini.</p>
        </header>

        <div className="grid lg:grid-cols-5 gap-8">
          <Card className="lg:col-span-2 h-fit">
            <CardHeader><CardTitle className="text-lg">Form Izin</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={this.handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase">Tipe Izin</label>
                  <select name="type" className="w-full h-10 px-3 rounded-md border bg-background text-sm">
                    <option value="sick">Sakit</option>
                    <option value="leave">Izin</option>
                    <option value="permit">Keperluan Mendadak</option>
                    <option value="vacation">Cuti</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input type="date" name="start_date" required />
                  <Input type="date" name="end_date" required />
                </div>
                <Textarea name="reason" placeholder="Alasan..." required className="h-24" />
                <div className="border-2 border-dashed rounded-lg p-4">
                  <label className="flex flex-col items-center cursor-pointer gap-2">
                    <UploadCloud className="size-6 text-muted-foreground" />
                    <span className="text-xs font-medium text-blue-600">Upload Bukti</span>
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => this.setState({ file: e.target.files?.[0] || null })} />
                  </label>
                  {this.state.file && <p className="text-[10px] text-center mt-2 text-emerald-600 truncate">{this.state.file.name}</p>}
                </div>
                <Button type="submit" className="w-full" disabled={createLeave.isPending}>
                  {createLeave.isPending ? "Mengirim..." : "Kirim Pengajuan"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="lg:col-span-3 space-y-4">
            <h2 className="font-semibold flex items-center gap-2"><Calendar size={18} /> Riwayat Saya</h2>
            <div className="grid gap-3">
              {myLeaves.data?.map((l: any) => (
                <Card key={l.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4 flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold capitalize text-sm">{l.type}</span>
                        <Badge variant="outline" className="text-[10px]">{l.status}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{l.start_date} - {l.end_date}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default function LeavePage() {
  const myLeaves = useMyLeaves();
  const createLeave = useCreateLeave();
  return <LeavePageContent myLeaves={myLeaves} createLeave={createLeave} />;
}
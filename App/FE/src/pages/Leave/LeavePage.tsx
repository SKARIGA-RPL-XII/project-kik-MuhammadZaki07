import React, { useState } from "react";
import { useMyLeaves, useCreateLeave } from "@/hooks/react-query/useLeave";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, UploadCloud, X, Search } from "lucide-react";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { MyLeaveTable } from "@/components/tables/MyLeaveTable";
import useDebounce from "@/hooks/useDebounce";
import { useToast } from "@/context/ToastContext";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PageMeta from "@/components/common/PageMeta";

export default function LeavePage() {
 const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 500);

  const { data: response, isLoading } = useMyLeaves({ search: debouncedSearch, page });
  const createLeave = useCreateLeave();

  const serverErrors = (createLeave.error as any)?.response?.data?.errors;
  const today = new Date().toISOString().split("T")[0];
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    if (!file) return toast("error", "Wajib upload bukti!", "");
    
    formData.append("proof_file", file);

    createLeave.mutate(formData, {
      onSuccess: () => {
        setOpen(false);
        setFile(null);
        setPage(1);
      }
    });
  };

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      <PageMeta
      title="Riwayat Izin" 
      description="Halaman riwayat pengajuan izin dan sakit pegawai." 
    />

    <PageBreadcrumb
      pageTitle="Riwayat Izin" 
    />
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">Perizinan Pegawai</h1>
          <p className="text-sm text-muted-foreground">Kelola riwayat perizinan Anda.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input 
              placeholder="Cari perizinan..." 
              className="pl-9" 
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }} 
            />
          </div>

          <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
              <Button className="bg-red-600 hover:bg-red-700"><Plus className="mr-2 size-4" /> Buat Izin</Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="max-w-xl p-6">
              <AlertDialogHeader className="relative">
                <AlertDialogTitle>Formulir Pengajuan Izin</AlertDialogTitle>
                <Button variant="ghost" size="icon" className="absolute right-0 top-0" onClick={() => setOpen(false)}><X size={16} /></Button>
              </AlertDialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-normal text-neutral-500">Jenis Izin</label>
                  <Select name="type" defaultValue="sick">
                    <SelectTrigger className={serverErrors?.type ? "border-red-500" : ""}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sick">Sakit</SelectItem>
                      <SelectItem value="leave">Izin</SelectItem>
                      <SelectItem value="permit">Keperluan Mendadak</SelectItem>
                      <SelectItem value="vacation">Cuti</SelectItem>
                    </SelectContent>
                  </Select>
                  {serverErrors?.type && <p className="text-xs text-red-500">{serverErrors.type[0]}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-normal text-neutral-500">Mulai</label>
                    <Input type="date" name="start_date" min={today} className={serverErrors?.start_date ? "border-red-500" : ""} />
                    {serverErrors?.start_date && <p className="text-xs text-red-500">{serverErrors.start_date[0]}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-normal text-neutral-500">Berakhir</label>
                    <Input type="date" name="end_date" min={today} className={serverErrors?.end_date ? "border-red-500" : ""} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-normal text-neutral-500">Alasan</label>
                  <Textarea name="reason" className={serverErrors?.reason ? "border-red-500" : ""} />
                  {serverErrors?.reason && <p className="text-xs text-red-500">{serverErrors.reason[0]}</p>}
                </div>

                <div className={`border-2 border-dashed rounded-xl p-4 text-center ${serverErrors?.proof_file ? "border-red-500 bg-red-50" : "border-neutral-200"}`}>
                  <label className="cursor-pointer flex flex-col items-center gap-2">
                    <UploadCloud className="size-6 text-red-600" />
                    <span className="text-xs font-semibold">Upload Bukti</span>
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                  </label>
                  {file && <p className="mt-2 text-xs text-emerald-600 truncate">{file.name}</p>}
                  {serverErrors?.proof_file && <p className="text-xs text-red-500 mt-1">{serverErrors.proof_file[0]}</p>}
                </div>

                <Button type="submit" className="w-full bg-red-600" disabled={createLeave.isPending}>
                  {createLeave.isPending ? "Mengirim..." : "Kirim Pengajuan"}
                </Button>
              </form>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <MyLeaveTable 
        data={response?.data || []} 
        isLoading={isLoading} 
        meta={response?.meta}
        onPageChange={setPage}
      />
    </div>
  );
}
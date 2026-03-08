import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, Mail, Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { UserService } from "@/services/user.service";
import { useAuth } from "@/context/AuthContext";

export function SecurityView({ user }: { user: any }) {
  const { toast } = useToast();
  const { logout } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDeleteAccount = async () => {
    if (confirmText !== "HAPUS") return;
    
    setIsDeleting(true);
    try {
      const { error } = await UserService.deleteAccount(user.id);
      if (error) throw error;
      
      toast({ title: "Akun Dihapus", description: "Sampai jumpa lagi!" });
      logout();
    } catch (err) {
      toast({ title: "Gagal", description: "Terjadi kesalahan saat menghapus akun", variant: "destructive" });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Bagian Email & Password (Sama seperti sebelumnya) */}
      <div className="p-4 border border-neutral-100 rounded-2xl bg-neutral-50/30">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-red-50 text-red-600 rounded-lg"><Mail size={16}/></div>
          <h4 className="text-sm font-bold text-neutral-800">Email Utama</h4>
        </div>
        <div className="flex gap-2">
          <input className="flex-1 px-4 py-2.5 bg-white border border-neutral-100 rounded-xl text-sm text-neutral-400 outline-none" value={user?.email} disabled />
          <Button variant="outline" className="rounded-xl border-neutral-200 text-xs">Ganti</Button>
        </div>
      </div>

      <div className="p-4 border border-neutral-100 rounded-2xl bg-neutral-50/30">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-red-50 text-red-600 rounded-lg"><Lock size={16}/></div>
          <h4 className="text-sm font-bold text-neutral-800">Kata Sandi</h4>
        </div>
        <div className="space-y-3">
          <Button variant="outline" className="w-full justify-start h-11 rounded-xl border-neutral-200 font-normal text-neutral-400 text-sm italic">
            Klik untuk ubah kata sandi...
          </Button>
        </div>
      </div>

      {/* Danger Zone: Hapus Akun */}
      <div className="mt-12 p-5 border border-red-100 rounded-2xl bg-red-50/20">
        <div className="flex items-start gap-4 mb-4">
          <div className="p-2 bg-red-100 text-red-600 rounded-lg"><Trash2 size={20}/></div>
          <div>
            <h4 className="text-sm font-bold text-red-600">Zona Bahaya</h4>
            <p className="text-[11px] text-neutral-500 mt-0.5">Setelah dihapus, semua data pesanan dan badge kamu akan hilang permanen.</p>
          </div>
        </div>

        {!showDeleteConfirm ? (
          <Button 
            variant="ghost" 
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full text-red-600 hover:bg-red-100/50 rounded-xl h-11 text-xs font-bold"
          >
            Hapus Akun Saya
          </Button>
        ) : (
          <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
            <div className="p-3 bg-white border border-red-100 rounded-xl flex gap-3 items-center">
              <AlertTriangle className="text-amber-500" size={16} />
              <p className="text-[10px] text-neutral-600 font-medium leading-tight">
                Ketik <span className="font-bold text-red-600">HAPUS</span> di bawah untuk mengonfirmasi.
              </p>
            </div>
            <Input 
              className="rounded-xl border-red-200 h-11 text-center font-bold tracking-widest focus-visible:ring-red-500" 
              placeholder="HAPUS"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
            />
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 rounded-xl text-xs"
              >
                Batal
              </Button>
              <Button 
                disabled={confirmText !== "HAPUS" || isDeleting}
                onClick={handleDeleteAccount}
                className="flex-[2] bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-red-200"
              >
                {isDeleting ? <Loader2 className="animate-spin" size={16} /> : "Ya, Hapus Permanen"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
import { useState, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Camera, Loader2 } from "lucide-react";
import { UserService } from "@/services/user.service";
import { useToast } from "@/hooks/use-toast";

export function ProfileView({ user }: { user: any }) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    username: user?.username || "",
    no_tlp: user?.no_tlp || "",
    addres: user?.addres || ""
  });

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleUpdate = async () => {
    setLoading(true);
    const { error } = await UserService.updateProfile(user.id, formData);
    if (error) {
      toast({ title: "Gagal", description: "Perubahan gagal disimpan", variant: "destructive" });
    } else {
      toast({ title: "Berhasil", description: "Profil kamu sudah diperbarui" });
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-5 mb-6">
        <div className="relative group">
          <Avatar className="w-20 h-20 rounded-2xl border-2 border-white shadow-md ring-1 ring-neutral-100">
            <AvatarImage src={preview || user?.profile_image} className="object-cover" />
            <AvatarFallback className="bg-neutral-50 text-neutral-400 font-bold">
              {user?.username?.substring(0,2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="absolute -bottom-1 -right-1 p-1.5 bg-white rounded-lg shadow-lg border border-neutral-100 text-red-500 hover:scale-110 transition-all"
          >
            <Camera size={14} />
          </button>
          <input type="file" ref={fileInputRef} onChange={handleFile} className="hidden" accept="image/*" />
        </div>
        <div>
          <h3 className="text-base font-bold text-neutral-900 leading-tight">{user?.username}</h3>
          <p className="text-xs text-neutral-500">Ubah foto dan detail profil kamu</p>
        </div>
      </div>

      <div className="grid gap-4">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-neutral-400 ml-1 tracking-tight">USERNAME</label>
          <input 
            className="w-full px-4 py-2.5 bg-neutral-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-red-500/10 outline-none transition-all" 
            value={formData.username}
            onChange={(e) => setFormData({...formData, username: e.target.value})}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-neutral-400 ml-1 tracking-tight">NOMOR TELEPON</label>
          <input 
            className="w-full px-4 py-2.5 bg-neutral-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-red-500/10 outline-none transition-all" 
            value={formData.no_tlp}
            onChange={(e) => setFormData({...formData, no_tlp: e.target.value})}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-neutral-400 ml-1 tracking-tight">ALAMAT</label>
          <textarea 
            className="w-full px-4 py-2.5 bg-neutral-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-red-500/10 outline-none transition-all min-h-[80px] resize-none" 
            value={formData.addres}
            onChange={(e) => setFormData({...formData, addres: e.target.value})}
          />
        </div>
        <Button 
          onClick={handleUpdate}
          disabled={loading}
          className="w-full bg-red-600 hover:bg-red-700 h-11 rounded-xl mt-2 text-sm font-semibold shadow-lg shadow-red-100 transition-all"
        >
          {loading ? <Loader2 className="animate-spin" size={18} /> : "Simpan Perubahan"}
        </Button>
      </div>
    </div>
  );
}
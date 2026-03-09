import { useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Camera, Loader2 } from "lucide-react";
import { useProfileLogic } from "@/hooks/useProfileLogic";

export function ProfileView({ user }: { user: any }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logic = useProfileLogic(user);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-5 mb-6">
        <div className="relative group">
          <Avatar className="w-20 h-20 rounded-full border-2">
            <AvatarImage
              src={logic.preview || user?.profile_image}
              className="object-cover"
            />
            <AvatarFallback className="bg-neutral-50 text-neutral-400 font-">
              {user?.username?.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute -bottom-1 -right-1 p-1.5 bg-white rounded-lg shadow-lg border border-neutral-100 text-red-500 hover:scale-110 transition-all"
          >
            <Camera size={14} />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={logic.handleFileChange}
            className="hidden"
            accept="image/*"
          />
        </div>
        <div>
          <h3 className="text-sm font-bold text-neutral-900 leading-tight">
            {user?.username}
          </h3>
          <p className="text-xs text-neutral-500">
            Update your photo and personal details
          </p>
        </div>
      </div>

      <div className="grid gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-normal text-neutral-400 ml-1">
            Username
          </label>
          <input
            className="w-full px-4 py-2.5 bg-neutral-50 border-none rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-red-500/10"
            value={logic.formData.username}
            onChange={(e) => logic.updateField("username", e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-normal text-neutral-400 ml-1">
            Phone Number
          </label>
          <input
            className="w-full px-4 py-2.5 bg-neutral-50 border-none rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-red-500/10"
            value={logic.formData.no_tlp}
            onChange={(e) => logic.updateField("no_tlp", e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-normal text-neutral-400 ml-1">
            Address
          </label>
          <textarea
            className="w-full px-4 py-2.5 bg-neutral-50 border-none rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-red-500/10 min-h-[80px] resize-none"
            value={logic.formData.addres}
            onChange={(e) => logic.updateField("addres", e.target.value)}
          />
        </div>

        <Button
          onClick={logic.updateProfile}
          disabled={logic.loading}
          className="w-full bg-red-600 hover:bg-red-700 h-11 rounded-xl mt-2 text-sm font-semibold shadow-lg transition-all shadow-red-100"
        >
          {logic.loading ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>
    </div>
  );
}

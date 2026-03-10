import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Camera, Loader2 } from "lucide-react";
import { useProfileLogic } from "@/hooks/useProfileLogic";
import { getProfileImage } from "@/utils/imageHelper";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function ProfileView({ user }: { user: any }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logic = useProfileLogic(user);
  console.log(logic.errors);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-5 mb-6">
        <div className="relative group">
          <div className="relative w-20 h-20 overflow-hidden rounded-full border-2 bg-neutral-100 flex items-center justify-center">
            {logic.preview || user?.profile_image ? (
              <img
                src={getProfileImage(logic.preview || user?.profile_image)}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-neutral-400 font-semibold">
                {user?.username?.substring(0, 2).toUpperCase()}
              </span>
            )}
          </div>
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
          <Input
            value={logic.formData.username}
            placeholder="Your username"
            onChange={(e) => logic.updateField("username", e.target.value)}
            className={`focus-visible:ring-red-500 focus-visible:border-red-500 ${
              logic.errors.username ? "border-red-500" : ""
            }`}
          />
          {logic.errors.username && (
            <p className="text-xs text-red-600 font-normal mt-1 ml-1 animate-in fade-in slide-in-from-top-1">
              *{logic.errors.username}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-normal text-neutral-400 ml-1">
            Phone Number
          </label>
          <Input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={logic.formData.no_tlp}
            onChange={(e) => {
              const value = e.target.value.replace(/[^0-9]/g, "");
              logic.updateField("no_tlp", value);
            }}
            placeholder="Your phone"
            className={`focus-visible:ring-red-500 focus-visible:border-red-500 ${
              logic.errors.no_tlp ? "border-red-500" : ""
            }`}
          />

          {logic.errors.no_tlp && (
            <p className="text-xs text-red-600 font-normal mt-1 ml-1 animate-in fade-in slide-in-from-top-1">
              *{logic.errors.no_tlp}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-normal text-neutral-400 ml-1">
            Address
          </label>
          <Textarea
            value={logic.formData.addres}
            placeholder="Your address"
            onChange={(e) => logic.updateField("addres", e.target.value)}
            className={`focus-visible:ring-red-500 focus-visible:border-red-500 ${
              logic.errors.addres ? "border-red-500" : ""
            }`}
          />
          {logic.errors.addres && (
            <p className="text-xs text-red-600 font-normal mt-1 ml-1 animate-in fade-in slide-in-from-top-1">
              *{logic.errors.addres}
            </p>
          )}
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

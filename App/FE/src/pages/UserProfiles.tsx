import { useEffect, useState } from "react";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";
import { UserService } from "../services/user.service";
import {
  Mail,
  Phone,
  MapPin,
  User as UserIcon,
  Shield,
  Pencil,
  Loader2,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Input from "../components/form/input/InputField";
import Label from "../components/form/Label";
import Select from "../components/form/Select";
import Button from "../components/ui/button/Button";
import { useToast } from "@/context/ToastContext";
import TextArea from "@/components/form/input/TextArea";
import LoadingSpinner from "@/components/skeleton/LoadingSpinner";

export default function UserProfiles() {
  const [user, setUser] = useState<any | null>(null);
  const [openEdit, setOpenEdit] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const { toast } = useToast();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    no_tlp: "",
    addres: "",
    gender: "",
  });

  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const fetchUser = async () => {
    try {
      const data = await UserService.getProfile();
      setUser(data);
      setForm({
        username: data.username || "",
        email: data.email || "",
        password: "",
        no_tlp: data.no_tlp || "",
        addres: data.addres || "",
        gender: data.gender || "LK",
      });
      setPreview(data.profile_image);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const res = await UserService.updateProfile(user.id, {
      ...form,
      profile_image: profileImage,
    });

    if (res.error) {
      setErrors(res.error);
    } else {
      setOpenEdit(false);
      toast(
        "success",
        "Profile Updated",
        "Your changes have been saved successfully.",
      );
      fetchUser();
    }
    setSubmitting(false);
  };

  if (!user) return null;

  return (
    <>
      <PageMeta
        title="Account Settings"
        description="Manage your personal information, contact details, and security preferences."
      />
      <PageBreadcrumb pageTitle="General Settings" />

      <div className="max-w-7xl mx-auto space-y-8 pb-20">
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 lg:col-span-4 space-y-6">
            <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-lg shadow-sm p-8 flex flex-col items-center text-center transition-colors">
              <div className="w-28 h-28 rounded-lg bg-slate-100 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 flex items-center justify-center overflow-hidden mb-4">
                {user.profile_image ? (
                  <img
                    src={user.profile_image}
                    className="w-full h-full object-cover"
                    alt="avatar"
                  />
                ) : (
                  <UserIcon
                    className="text-slate-400 dark:text-neutral-600"
                    size={40}
                    strokeWidth={1.5}
                  />
                )}
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-neutral-100 tracking-tight">
                {user.username}
              </h2>
              <p className="text-sm text-slate-500 dark:text-neutral-400 mb-6 font-medium">
                {user.email}
              </p>

              <Button
                onClick={() => {
                  setErrors({});
                  setOpenEdit(true);
                }}
                className="w-full h-10 bg-brand-600 hover:bg-brand-700 text-white dark:bg-brand-500 dark:hover:bg-brand-600"
              >
                <Pencil size={14} className="mr-2" /> Edit Profile
              </Button>
            </div>

            <div className="bg-slate-50 dark:bg-neutral-900/50 border border-slate-200 dark:border-neutral-800 rounded-lg p-5">
              <div className="flex items-center gap-2 mb-3 text-slate-800 dark:text-neutral-200">
                <Shield size={16} className="text-brand-500" />
                <span className="text-[10px] font-bold uppercase tracking-widest">
                  Account Status
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-neutral-400 leading-relaxed">
                Your profile information is private and used only for internal
                management purposes.
              </p>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-8">
            <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-lg shadow-sm overflow-hidden transition-colors">
              <div className="px-6 py-4 border-b border-slate-100 dark:border-neutral-800 bg-slate-50/30 dark:bg-neutral-800/20 flex justify-between items-center">
                <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-neutral-500">
                  Identity Details
                </h3>
              </div>

              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-y-10 gap-x-16">
                <InfoGroup
                  icon={<UserIcon size={14} />}
                  label="Username"
                  value={user.username}
                />
                <InfoGroup
                  icon={<Mail size={14} />}
                  label="Email Address"
                  value={user.email}
                />
                <InfoGroup
                  icon={<Phone size={14} />}
                  label="Phone Number"
                  value={user.no_tlp || "-"}
                />
                <InfoGroup
                  icon={<Shield size={14} />}
                  label="Gender"
                  value={user.gender === "LK" ? "Male" : "Female"}
                />

                <div className="col-span-full pt-8 border-t border-slate-50 dark:border-neutral-800">
                  <div className="flex gap-4">
                    <div className="mt-1 text-slate-300 dark:text-neutral-700">
                      <MapPin size={18} />
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-neutral-500 mb-1">
                        Office / Residential Address
                      </span>
                      <p className="text-sm text-slate-700 dark:text-neutral-300 leading-relaxed font-medium">
                        {user.addres || "Not provided."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AlertDialog open={openEdit} onOpenChange={setOpenEdit}>
        <AlertDialogContent
        size=""
          className="max-w-3xl rounded-lg p-0 border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden shadow-2xl transition-colors"
        >
          <AlertDialogHeader className="px-8 py-6 bg-slate-50 dark:bg-neutral-800/40 border-b border-slate-100 dark:border-neutral-800">
            <AlertDialogTitle className="text-md font-bold text-slate-900 dark:text-neutral-100 uppercase tracking-tight">
              Edit Account Data
            </AlertDialogTitle>
          </AlertDialogHeader>

          <form onSubmit={handleUpdate} className="p-8 space-y-6">
            <div className="flex items-center gap-6 pb-6 border-b border-slate-50 dark:border-neutral-800">
              <div className="relative w-20 h-20 rounded-lg bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 overflow-hidden shrink-0">
                {preview ? (
                  <img src={preview} className="w-full h-full object-cover" />
                ) : (
                  <UserIcon className="m-auto mt-5 text-slate-300 dark:text-neutral-700" size={32} />
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-neutral-400">
                  Avatar Image
                </Label>
                <input
                  type="file"
                  onChange={handleImageChange}
                  className="block w-full text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-[11px] file:font-bold file:bg-slate-100 dark:file:bg-neutral-800 file:text-slate-700 dark:file:text-neutral-300 hover:file:bg-slate-200 dark:hover:file:bg-neutral-700 transition-all cursor-pointer"
                />
                {errors?.profile_image?.[0] && (
                  <p className="text-[10px] text-red-500 font-medium">
                    {errors.profile_image[0]}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-6 gap-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="username" className="dark:text-neutral-300">Username</Label>
                <Input
                  value={form.username}
                  error={errors?.username?.[0]}
                  onChange={(e) =>
                    setForm({ ...form, username: e.target.value })
                  }
                  className="dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-100"
                />
                {errors?.username?.[0] && (
                  <p className="text-[10px] text-red-500 font-medium">
                    {errors.username[0]}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="dark:text-neutral-300">Email Address</Label>
                <Input
                  value={form.email}
                  error={errors?.email?.[0]}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-100"
                />
                {errors?.email?.[0] && (
                  <p className="text-[10px] text-red-500 font-medium">
                    {errors.email[0]}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="no_tlp" className="dark:text-neutral-300">Phone Number</Label>
                <Input
                  value={form.no_tlp}
                  error={errors?.no_tlp?.[0]}
                  onChange={(e) => setForm({ ...form, no_tlp: e.target.value })}
                  className="dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-100"
                />
                {errors?.no_tlp?.[0] && (
                  <p className="text-[10px] text-red-500 font-medium">
                    {errors.no_tlp[0]}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="gender" className="dark:text-neutral-300">Gender</Label>
                <Select
                  value={form.gender}
                  onChange={(val: any) => setForm({ ...form, gender: val })}
                  options={[
                    { label: "Male", value: "LK" },
                    { label: "Female", value: "PR" },
                  ]}
                />
                {errors?.gender?.[0] && (
                  <p className="text-[10px] text-red-500 font-medium">
                    {errors.gender[0]}
                  </p>
                )}
              </div>

              <div className="space-y-1.5 col-span-full">
                <Label htmlFor="password" className="dark:text-neutral-300">Change Password</Label>
                <Input
                  type="password"
                  placeholder="Leave empty if no change"
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  className="dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-100"
                />
                {errors?.password?.[0] && (
                  <p className="text-[10px] text-red-500 font-medium">
                    {errors.password[0]}
                  </p>
                )}
              </div>

              <div className="space-y-1.5 col-span-full">
                <Label htmlFor="addres" className="dark:text-neutral-300">Full Address</Label>
                <TextArea
                  value={form.addres}
                  onChange={(value) => setForm({ ...form, addres: value })}
                  className="dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-100"
                />

                {errors?.addres?.[0] && (
                  <p className="text-[10px] text-red-500 font-medium">
                    {errors.addres[0]}
                  </p>
                )}
              </div>
            </div>

            <AlertDialogFooter className="pt-6 border-t border-slate-100 dark:border-neutral-800 gap-3">
              <AlertDialogCancel
                onClick={() => setErrors({})}
                className="rounded-md border-slate-200 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400 font-semibold h-10 text-xs uppercase tracking-widest"
              >
                Cancel
              </AlertDialogCancel>
              <Button
                type="submit"
                disabled={submitting}
                className="bg-brand-600 dark:bg-brand-500 text-white font-bold h-10 px-8 rounded-md"
              >
                {submitting ? (
                  <LoadingSpinner className="w-5 h-5" />
                ) : (
                  "Save Changes"
                )}
              </Button>
            </AlertDialogFooter>
          </form>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function InfoGroup({
  icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2 text-slate-400 dark:text-neutral-500">
        <span className="opacity-70 text-brand-500 dark:text-brand-400">{icon}</span>
        <span className="text-[9px] font-black uppercase tracking-[0.2em]">
          {label}
        </span>
      </div>
      <p className="text-[13px] font-bold text-slate-700 dark:text-neutral-200 ml-6 tracking-tight">
        {value}
      </p>
    </div>
  );
}
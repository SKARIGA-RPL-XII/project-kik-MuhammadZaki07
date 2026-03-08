import { useState, ChangeEvent, useRef } from "react";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";
import Input from "../../components/form/input/InputField";
import Switch from "../../components/form/switch/Switch";
import Select from "../../components/form/Select";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogCancel,
} from "../../components/ui/alert-dialog";
import BadgeTable from "../../components/tables/BadgeTable";
import useDebounce from "../../hooks/useDebounce";
import { ActionGuard } from "@/components/guard/ActionGuard";
import { useBadges, useBadgeMutations } from "@/hooks/react-query/useBadge";
import { useToast } from "@/context/ToastContext";

export default function BadgePage() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [name, setName] = useState("");
  const [minSpend, setMinSpend] = useState<number>(0); 
  const [icon, setIcon] = useState("");
  const [color, setColor] = useState("#000000");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(true);
  const [errors, setErrors] = useState<any>({});

  const { toast } = useToast();
  const { data: badgeRes, isLoading: loading } = useBadges({
    search: debouncedSearch,
    status: statusFilter ?? undefined,
  });
  const { createBadge, updateBadge, deleteBadge } = useBadgeMutations();

  const badges = badgeRes?.data?.data || [];

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setMinSpend(0);
    setIcon("");
    setColor("#000000");
    setImage(null);
    setPreview(null);
    setIsActive(true);
    setErrors({});
  };

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleImage = (file: File) => {
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    const fd = new FormData();
    fd.append("name", name);
    fd.append("min_spend", minSpend.toString());
    fd.append("icon", icon);
    fd.append("color", color);
    fd.append("is_active", isActive ? "1" : "0");
    if (image) fd.append("badge_image", image);

    const mutation = editingId ? updateBadge : createBadge;

    mutation.mutate(
      editingId ? { id: editingId, formData: fd } : fd,
      {
        onSuccess: () => {
          toast("success", "Success", editingId ? "Badge updated" : "Badge created");
          resetForm();
          setOpen(false);
        },
        onError: (err: any) => {
          if (typeof err === "object") {
            setErrors(err);
          } else {
            toast("error", "Error", err || "Action failed");
          }
        }
      }
    );
  };

  const handleDelete = (id: number) => {
    if (!confirm("Delete this badge?")) return;
    deleteBadge.mutate(id, {
      onSuccess: () => toast("success", "Success", "Badge deleted"),
    });
  };

  const isSubmitting = createBadge.isPending || updateBadge.isPending;

  return (
    <>
      <PageMeta title="Badge Management" description="Manage badges" />
      <PageBreadcrumb pageTitle="Badges" />

      <ComponentCard title="Badge Management">
        <div className="flex justify-between mb-4">
          <div className="flex gap-2">
            <Input
              placeholder="Search..."
              value={search}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            />

            <div className="w-40">
              <Select
                options={[
                  { label: "All", value: "" },
                  { label: "Active", value: "active" },
                  { label: "Inactive", value: "inactive" },
                ]}
                value={statusFilter ?? ""}
                onChange={(v) => setStatusFilter(v || null)}
              />
            </div>
          </div>

       <ActionGuard module="badge" action="write">
  <AlertDialog open={open} onOpenChange={setOpen}>
    <AlertDialogTrigger asChild>
      <Button className="h-10" onClick={resetForm}>
        Create Badge
      </Button>
    </AlertDialogTrigger>

    <AlertDialogContent size="" className="max-w-2xl">
      <AlertDialogHeader>
        <AlertDialogTitle>
          {editingId ? "Edit Badge" : "Create Badge"}
        </AlertDialogTitle>
      </AlertDialogHeader>

      <div className="space-y-4 mt-2 overflow-y-auto px-1">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">
              Name <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="Ex: Gold Member"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
          </div>

          <div>
            <label className="text-sm font-medium">
              Minimum Spend (Rp) <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              min="0"
              placeholder="0"
              value={minSpend === 0 ? "" : minSpend}
              onChange={(e) => {
                const val = e.target.value;
                setMinSpend(val === "" ? 0 : Math.max(0, parseInt(val, 10)));
              }}
            />
            {errors.min_spend && <p className="text-sm text-red-500">{errors.min_spend}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Icon (Emoji/Shortcode)</label>
            <Input
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              placeholder="e.g. ⭐ or 'star'"
            />
          </div>

          <div>
            <label className="text-sm font-medium">
              Badge Color <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-3 items-center border border-neutral-200 dark:border-white/10 rounded-lg px-3 py-1 h-[46px]">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-8 h-8 rounded-full cursor-pointer border-none bg-transparent"
                />
                <span className="text-xs text-neutral-500 font-mono uppercase flex-1">{color}</span>
            </div>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">Badge Image Asset</label>
          <input
            type="file"
            accept="image/*"
            hidden
            ref={fileInputRef}
            onChange={(e) => {
              if (e.target.files?.[0]) handleImage(e.target.files[0]);
            }}
          />
          <div
            onClick={() => fileInputRef.current?.click()}
            className="group mt-1 border-2 border-dashed border-neutral-200 dark:border-white/10 rounded-xl p-8 text-center cursor-pointer hover:border-red-500 transition-all bg-neutral-50/50 dark:bg-white/5"
          >
            {preview ? (
              <div className="relative inline-block">
                <img
                  src={preview.startsWith('blob:') ? preview : `${import.meta.env.VITE_STORAGE_URL}/${preview}`}
                  className="w-32 h-32 object-contain mx-auto drop-shadow-md"
                  alt="Preview"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                  <p className="text-white text-xs font-medium">Change Image</p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="mx-auto w-12 h-12 rounded-full bg-neutral-100 dark:bg-white/5 flex items-center justify-center">
                   <span className="text-xl">📁</span>
                </div>
                <p className="text-neutral-500 text-sm">Click or drag to upload badge icon</p>
                <p className="text-[10px] text-neutral-400">PNG, JPG up to 2MB</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-white/5 rounded-xl border border-neutral-100 dark:border-white/5">
            <div className="space-y-0.5">
                <p className="text-sm font-medium">Status Visibility</p>
                <p className="text-[11px] text-neutral-500">Enable this to make the badge attainable by users.</p>
            </div>
            <Switch
                checked={isActive}
                onChange={(v) => setIsActive(v)}
            />
        </div>

        <AlertDialogFooter className="flex items-center gap-2 pt-4 border-t border-neutral-100 dark:border-white/5">
          <AlertDialogCancel onClick={resetForm} disabled={isSubmitting}>
            Cancel
          </AlertDialogCancel>
          <Button 
            className="h-11 px-8 shadow-lg shadow-red-500/20" 
            onClick={handleSubmit} 
            disabled={isSubmitting}
          >
            {isSubmitting ? "Processing..." : editingId ? "Save Changes" : "Create Badge"}
          </Button>
        </AlertDialogFooter>
      </div>
    </AlertDialogContent>
  </AlertDialog>
</ActionGuard>
        </div>

        <BadgeTable
          badges={badges}
          loading={loading}
          onEdit={(badge) => {
            setEditingId(badge.id);
            setName(badge.name);
            setMinSpend(badge.min_spend || 0);
            setIcon(badge.icon || "");
            setColor(badge.color || "#000000");
            setPreview(badge.badge_image);
            setIsActive(badge.is_active === 1 || badge.is_active === true);
            setOpen(true);
          }}
          onDelete={handleDelete}
        />
      </ComponentCard>
    </>
  );
}
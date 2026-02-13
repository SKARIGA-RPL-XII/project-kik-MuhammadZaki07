import { useEffect, useState, ChangeEvent, useRef } from "react";
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
import { BadgeService } from "../../services/badge.service";
import useDebounce from "../../hooks/useDebounce";

export default function BadgePage() {
  const [badges, setBadges] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [name, setName] = useState("");
  const [icon, setIcon] = useState("");
  const [color, setColor] = useState("#000000");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(true);

  const [errors, setErrors] = useState<any>({});

  const fetchBadges = async () => {
    setLoading(true);
    const { data } = await BadgeService.getBadges({
      search: debouncedSearch,
      status: statusFilter ?? undefined,
    });
    if (data) setBadges(data.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchBadges();
  }, [debouncedSearch, statusFilter]);

  const resetForm = () => {
    setEditingId(null);
    setName("");
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
    fd.append("icon", icon);
    fd.append("color", color);
    fd.append("is_active", isActive ? "1" : "0");
    if (image) fd.append("badge_image", image);

    let res;
    if (editingId) {
      res = await BadgeService.updateBadge(editingId, fd);
    } else {
      res = await BadgeService.createBadge(fd);
    }

    if (res.error) {
      setErrors(res.error);
    } else {
      resetForm();
      setOpen(false);
      fetchBadges();
    }
  };

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
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setSearch(e.target.value)
              }
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

          <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
              <Button className="h-10" onClick={resetForm}>Create Badge</Button>
            </AlertDialogTrigger>

            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {editingId ? "Edit Badge" : "Create Badge"}
                </AlertDialogTitle>
              </AlertDialogHeader>

              <div className="space-y-4 mt-2">
                <div>
                  <label className="text-sm font-medium">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium">Icon</label>
                  <Input
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">
                    Color <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-full h-10 rounded-md"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Image</label>

                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    ref={fileInputRef}
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        handleImage(e.target.files[0]);
                      }
                    }}
                  />

                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (e.dataTransfer.files[0]) {
                        handleImage(e.dataTransfer.files[0]);
                      }
                    }}
                    className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-brand-500 transition"
                  >
                    {preview ? (
                      <img
                         src={`${import.meta.env.VITE_STORAGE_URL}/${preview}`}
                        className="w-24 h-24 object-cover mx-auto rounded-lg"
                      />
                    ) : (
                      <p className="text-neutral-500">
                        Drag & drop image here or click to browse
                      </p>
                    )}
                  </div>
                </div>

                <Switch
                  checked={isActive}
                  label="Active"
                  onChange={(v) => setIsActive(v)}
                />

                <AlertDialogFooter className="flex items-center">
                  <AlertDialogCancel onClick={resetForm}>
                    Cancel
                  </AlertDialogCancel>
                  <Button className="h-10" onClick={handleSubmit}>
                    {editingId ? "Update" : "Create"}
                  </Button>
                </AlertDialogFooter>
              </div>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <BadgeTable
          badges={badges}
          loading={loading}
          onEdit={(badge) => {
            setEditingId(badge.id);
            setName(badge.name);
            setIcon(badge.icon);
            setColor(badge.color);
            setPreview(badge.badge_image);
            setIsActive(badge.is_active);
            setOpen(true);
          }}
          onDelete={async (id) => {
            if (!confirm("Delete this badge?")) return;
            await BadgeService.deleteBadge(id);
            fetchBadges();
          }}
        />
      </ComponentCard>
    </>
  );
}

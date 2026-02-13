import { useEffect, useState, ChangeEvent } from "react";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";
import Input from "../../components/form/input/InputField";
import Textarea from "../../components/form/input/TextArea";
import Switch from "../../components/form/switch/Switch";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../../components/ui/alert-dialog";
import { BannerService } from "../../services/banner.service";
import { useDropzone } from "react-dropzone";
import BannerTable from "../../components/tables/BannerTable";
import BannerCarousel from "../../components/carousel/BannerCarousel";

function Banner() {
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [bannerImage, setBannerImage] = useState<File | null>(null);
  const [isActive, setIsActive] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  const fetchBanners = async () => {
    setLoading(true);
    const { data } = await BannerService.getBanners();
    if (data) {
      const mapped = data.data.map((b: any) => ({
        ...b,
        banner_image: `${import.meta.env.VITE_STORAGE_URL}/${b.banner_image}`,
      }));
      setBanners(mapped);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const onDrop = (files: File[]) => {
    if (files.length) setBannerImage(files[0]);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      "image/png": [],
      "image/jpeg": [],
      "image/webp": [],
    },
  });

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setDescription("");
    setBannerImage(null);
    setIsActive(true);
    setErrors({});
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setErrors({});
    const fd = new FormData();
    fd.append("title", title);
    fd.append("description", description);
    fd.append("is_active", isActive ? "1" : "0");
    if (bannerImage) fd.append("banner_image", bannerImage);

    try {
      let error = null;
      if (editingId) {
        const res = await BannerService.updateBanner(editingId, fd);
        error = res.error;
      } else {
        const res = await BannerService.createBanner(fd);
        error = res.error;
      }

      if (error) {
        setErrors(typeof error === "object" ? error : { form: error });
      } else {
        resetForm();
        setOpenDialog(false);
        fetchBanners();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (banner: any) => {
    setEditingId(banner.id);
    setTitle(banner.title);
    setDescription(banner.description);
    setIsActive(banner.is_active);
    setOpenDialog(true);
    setBannerImage(null);
    setBannerPreview(
      `${banner.banner_image}`,
    );
  };

  return (
    <>
      <PageMeta title="Banner Management" description="Manage banners" />
      <PageBreadcrumb pageTitle="Banner" />
      {banners.length > 0 && (
        <BannerCarousel banners={banners} autoLoop loopInterval={3000} />
      )}
      <ComponentCard
        title="Banner Management"
        desc="Create, edit, delete banners"
        className="mt-5"
      >
        <div className="flex justify-between items-center mb-4">
          <AlertDialog open={openDialog} onOpenChange={setOpenDialog}>
            <AlertDialogTrigger asChild>
              <Button onClick={resetForm} className="h-10">
                {editingId ? "Edit Banner" : "Create Banner"}
              </Button>
            </AlertDialogTrigger>

            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {editingId ? "Edit Banner" : "Create Banner"}
                </AlertDialogTitle>
              </AlertDialogHeader>

              <div className="space-y-4">
                <div
                  {...getRootProps()}
                  className={`border rounded-xl p-6 text-center ${
                    isDragActive
                      ? "border-brand-500 border-dashed bg-neutral-100 dark:bg-neutral-800"
                      : "border-neutral-300 dark:border-neutral-500 border-dashed bg-neutral-50 dark:bg-neutral-800"
                  }`}
                >
                  <input {...getInputProps()} />
                  {bannerImage ? (
                    <>
                      <img
                        src={URL.createObjectURL(bannerImage)}
                        className="w-full h-52 object-cover rounded-lg mb-2"
                      />
                      <p className="text-green-600">{bannerImage.name}</p>
                    </>
                  ) : bannerPreview ? (
                    <img
                      src={bannerPreview}
                      className="w-full h-52 object-cover rounded-lg mb-2"
                    />
                  ) : (
                    <p>Drag & drop image here</p>
                  )}
                </div>
                {errors.banner_image && (
                  <p className="text-sm text-red-500">{errors.banner_image}</p>
                )}

                <Input
                  placeholder="Title"
                  value={title}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setTitle(e.target.value)
                  }
                />
                {errors.title && (
                  <p className="text-sm text-red-500">{errors.title}</p>
                )}

                <Textarea
                  placeholder="Description"
                  value={description}
                  onChange={(val) => setDescription(val)}
                />
                {errors.description && (
                  <p className="text-sm text-red-500">{errors.description}</p>
                )}

                <div className="flex items-center gap-2">
                  <Switch
                    checked={isActive}
                    label="Active"
                    onChange={(v) => setIsActive(v)}
                  />
                  {errors.is_active && (
                    <p className="text-sm text-red-500">{errors.is_active}</p>
                  )}
                </div>

                <AlertDialogFooter className="justify-between mt-4 items-center">
                  <AlertDialogCancel onClick={resetForm} disabled={submitting}>
                    Cancel
                  </AlertDialogCancel>
                  <Button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="h-10"
                  >
                    {submitting
                      ? "Saving..."
                      : editingId
                        ? "Update Banner"
                        : "Create Banner"}
                  </Button>
                </AlertDialogFooter>
              </div>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <BannerTable
          banners={banners}
          loading={loading}
          onRefresh={fetchBanners}
          onEdit={handleEdit}
        />
      </ComponentCard>
    </>
  );
}

export default Banner;

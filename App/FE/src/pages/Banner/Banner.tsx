import { useState, ChangeEvent, useMemo, useEffect } from "react";
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
import { useDropzone } from "react-dropzone";
import BannerTable from "../../components/tables/BannerTable";
import BannerCarousel from "../../components/carousel/BannerCarousel";
import { Plus, UploadCloud, Image as ImageIcon } from "lucide-react";
import LoadingSpinner from "@/components/skeleton/LoadingSpinner";
import { useToast } from "@/context/ToastContext";
import { ActionGuard } from "@/components/guard/ActionGuard";
import {
  useBannersAdmin,
  useBannerMutations,
} from "@/hooks/react-query/useBanner";

function Banner() {
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [bannerImage, setBannerImage] = useState<File | null>(null);
  const [isActive, setIsActive] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  const { toast } = useToast();
  const { data: bannerRes, isLoading, refetch } = useBannersAdmin();
  const { createBanner, updateBanner } = useBannerMutations();
const isBlob = (url: string | null) => url?.startsWith("blob:");
const isHttp = (url: string | null) => url?.startsWith("http");

  const banners = useMemo(() => {
    if (!bannerRes?.data?.data) return [];
    return bannerRes.data.data.map((b: any) => ({
      ...b,
      banner_image: `${b.banner_image}`,
    }));
  }, [bannerRes]);

const getImageSrc = (path: string | null) => {
  if (!path) return "";

  if (path.startsWith("blob:")) return path;

  if (path.startsWith("http")) return path;

  return `${import.meta.env.VITE_STORAGE_URL}/${path}`;
};

const onDrop = (files: File[]) => {
  if (!files.length) return;

  const file = files[0];

  if (bannerPreview?.startsWith("blob:")) {
    URL.revokeObjectURL(bannerPreview);
  }

  const preview = URL.createObjectURL(file);

  setBannerImage(file);
  setBannerPreview(preview);
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
    setBannerPreview(null);
    setIsActive(true);
    setErrors({});
  };

  const handleSubmit = async () => {
    setErrors({});

    const fd = new FormData();
    fd.append("title", title);
    fd.append("description", description);
    fd.append("is_active", isActive ? "1" : "0");
    if (bannerImage) fd.append("banner_image", bannerImage);

    const mutation = editingId ? updateBanner : createBanner;

    mutation.mutate(editingId ? { id: editingId, formData: fd } : fd, {
      onSuccess: () => {
        toast(
          "success",
          "Success",
          editingId
            ? "Banner updated successfully"
            : "Banner published successfully",
        );
        resetForm();
        setOpenDialog(false);
      },
      onError: (err: any) => {
        if (typeof err === "object") {
          const validationErrors: Record<string, string> = {};
          Object.entries(err).forEach(([key, messages]) => {
            validationErrors[key] = Array.isArray(messages)
              ? messages[0]
              : (messages as string);
          });
          setErrors(validationErrors);
          toast("error", "Validation Error", "Please check your input");
        } else {
          toast("error", "Failed", err || "Something went wrong");
        }
      },
    });
  };

  const handleEdit = (banner: any) => {
    setEditingId(banner.id);
    setTitle(banner.title);
    setDescription(banner.description);
    setIsActive(banner.is_active === 1 || banner.is_active === true);
    setOpenDialog(true);
    setBannerImage(null);
    setBannerPreview(banner.banner_image);
  };

useEffect(() => {
  return () => {
    if (bannerPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(bannerPreview);
    }
  };
}, []);

  const submitting = createBanner.isPending || updateBanner.isPending;

  return (
    <>
      <PageMeta
        title="Banner Management"
        description="Manage high-impact marketing banners"
      />
      <PageBreadcrumb pageTitle="Marketing Banners" />

      {banners && banners.length > 0 && (
        <div className="mb-8 overflow-hidden rounded-2xl shadow-sm border border-gray-100 dark:border-white/5">
          <BannerCarousel
            banners={banners}
            autoLoop={true}
            isLoading={isLoading}
            loopInterval={5000}
          />
        </div>
      )}

      <ComponentCard
        title="Active Banners"
        desc="Visual promotion items displayed on the homepage"
        className="shadow-sm border-gray-100 dark:border-white/5"
      >
        <div className="flex justify-between items-center mb-6">
          <div className="space-y-1">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
              Banner List
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Manage your promotional content
            </p>
          </div>

          <ActionGuard module="banner" action="write">
            <AlertDialog
              open={openDialog}
              onOpenChange={(val) => {
                setOpenDialog(val);
                if (!val) resetForm();
              }}
            >
              <AlertDialogTrigger asChild>
                <Button
                  onClick={resetForm}
                  className="flex items-center gap-2 bg-red-500 hover:bg-red-600 transition-all shadow-md shadow-red-500/20"
                >
                  <Plus size={18} />
                  <span>Create New Banner</span>
                </Button>
              </AlertDialogTrigger>

              <AlertDialogContent className="max-w-xl border-none shadow-2xl">
                <AlertDialogHeader className="mb-4">
                  <AlertDialogTitle className="text-2xl font-bold">
                    {editingId ? "Modify Banner" : "New Promotion Banner"}
                  </AlertDialogTitle>
                  <p className="text-sm text-gray-500">
                    Enter details below to publish your banner
                  </p>
                </AlertDialogHeader>

                <div className="space-y-5">
                  <div
                    {...getRootProps()}
                    className={`relative group border-2 border-dashed rounded-2xl transition-all flex flex-col items-center justify-center cursor-pointer min-h-[240px] overflow-hidden ${
                      isDragActive
                        ? "border-red-500 bg-red-50/50 dark:bg-red-500/5"
                        : "border-gray-200 dark:border-gray-700 hover:border-red-400 bg-gray-50/50 dark:bg-neutral-900/50"
                    }`}
                  >
                    <input {...getInputProps()} />
                    {bannerPreview ? (
                      <div className="relative w-full h-full group">
                        <img
                        src={
    isBlob(bannerPreview)
      ? bannerPreview
      : getImageSrc(bannerPreview)
  }
                          className="w-full h-60 object-cover"
                          alt="Preview"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="bg-white/20 backdrop-blur-md p-3 rounded-full">
                            <UploadCloud className="text-white" />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-10 flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-red-50 dark:bg-red-500/10 rounded-full flex items-center justify-center mb-4">
                          <ImageIcon className="text-red-500" size={28} />
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 font-medium">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          SVG, PNG, JPG or WEBP (Max. 2MB)
                        </p>
                      </div>
                    )}
                  </div>
                  {errors.banner_image && (
                    <p className="text-xs font-medium text-red-500 -mt-2 ml-1">
                      {errors.banner_image}
                    </p>
                  )}

                  <div className="space-y-4">
                    <Input
                      label="Banner Title"
                      placeholder="e.g. Summer Special 2026"
                      value={title}
                      error={!!errors.title}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setTitle(e.target.value)
                      }
                    />
                    {errors.title && (
                      <p className="text-xs font-medium text-red-500 mt-1 ml-1">
                        {errors.title}
                      </p>
                    )}

                    <Textarea
                      label="Description"
                      placeholder="Describe your promotion briefly..."
                      value={description}
                      onChange={(val) => setDescription(val)}
                    />
                    {errors.description && (
                      <p className="text-xs font-medium text-red-500 mt-1 ml-1">
                        {errors.description}
                      </p>
                    )}

                    <div className="p-4 bg-gray-100 dark:bg-neutral-900/50 rounded-xl border border-gray-100 dark:border-white/5">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <p className="text-sm font-semibold">
                            Visibility Status
                          </p>
                          <p className="text-xs text-gray-500">
                            Toggle to show/hide this banner
                          </p>
                        </div>
                        <Switch
                          checked={isActive}
                          onChange={(v) => setIsActive(v)}
                        />
                      </div>
                    </div>
                  </div>

                  <AlertDialogFooter className="gap-3 mt-6 flex items-center">
                    <AlertDialogCancel
                      onClick={resetForm}
                      disabled={submitting}
                    >
                      Discard
                    </AlertDialogCancel>
                    <Button
                      onClick={handleSubmit}
                      disabled={submitting}
                      className="h-10 min-w-[140px]"
                    >
                      {submitting ? (
                        <LoadingSpinner />
                      ) : (
                        <span>
                          {editingId ? "Save Changes" : "Publish Banner"}
                        </span>
                      )}
                    </Button>
                  </AlertDialogFooter>
                </div>
              </AlertDialogContent>
            </AlertDialog>
          </ActionGuard>
        </div>

        <BannerTable
          banners={banners}
          loading={isLoading}
          onRefresh={refetch}
          onEdit={handleEdit}
        />
      </ComponentCard>
    </>
  );
}

export default Banner;

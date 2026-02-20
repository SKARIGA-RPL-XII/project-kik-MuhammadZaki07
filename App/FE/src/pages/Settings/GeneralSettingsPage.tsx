import { useEffect, useState } from "react";
import { SettingsService } from "@/services/settings.service";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Alert from "@/components/ui/alert/Alert";
import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import {
  Store,
  Palette,
  BellRing,
  Loader2,
  Save,
  Upload,
  Image as ImageIcon,
  Sun,
  Moon,
} from "lucide-react";
import { subscribeToPush } from "@/utils/pushSubscription";
import PageMeta from "@/components/common/PageMeta";
import GeneralConfigSkeleton from "@/components/skeleton/settings/GeneralConfigSkeleton";
import { ActionGuard } from "@/components/guard/ActionGuard";

export default function GeneralSettingsPage() {
  const [form, setForm] = useState<any>({
    store_name: "",
    phone: "",
    address: "",
    logo_light: null,
    logo_dark: null,
  });

  const [previewLight, setPreviewLight] = useState<string | null>(null);
  const [previewDark, setPreviewDark] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [success, setSuccess] = useState("");
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  useEffect(() => {
    SettingsService.getAll({ group: "general" })
      .then((res) => {
        const rawData = res.data?.data || res.data || res;
        const data = rawData.settings || rawData;

        if (data) {
          const formattedData = Object.keys(data).reduce((acc: any, key) => {
            if (
              data[key] &&
              typeof data[key] === "object" &&
              "value" in data[key]
            ) {
              acc[key] = data[key].value;
            } else {
              acc[key] = data[key];
            }
            return acc;
          }, {});

          setForm((prev: any) => ({ ...prev, ...formattedData }));

          if (
            formattedData.logo_light &&
            typeof formattedData.logo_light === "string"
          ) {
            setPreviewLight(
              `${import.meta.env.VITE_STORAGE_URL}/${formattedData.logo_light}`,
            );
          }
          if (
            formattedData.logo_dark &&
            typeof formattedData.logo_dark === "string"
          ) {
            setPreviewDark(
              `${import.meta.env.VITE_STORAGE_URL}/${formattedData.logo_dark}`,
            );
          }
        }
      })
      .finally(() => setFetching(false));

    return () => {
      if (previewLight?.startsWith("blob:")) URL.revokeObjectURL(previewLight);
      if (previewDark?.startsWith("blob:")) URL.revokeObjectURL(previewDark);
    };
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "logo_light" | "logo_dark",
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setForm({ ...form, [type]: file });
      if (type === "logo_light") setPreviewLight(URL.createObjectURL(file));
      if (type === "logo_dark") setPreviewDark(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setSuccess("");
    setErrors({});

    const res = await SettingsService.updateBulk({
      group: "general",
      settings: form,
    });

    if (!res.status && res.errors) {
      setErrors(res.errors);
      setLoading(false);
      return;
    }

    setSuccess("Store configuration updated successfully.");
    setLoading(false);
  };

  if (fetching) return <GeneralConfigSkeleton />;

  return (
    <ActionGuard module="general" action="view">
      <div className="w-full space-y-6">
        <PageMeta
          title="General Settings | Dashboard"
          description="Manage your restaurant's identity and visual branding."
        />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-neutral-200 dark:border-neutral-800 pb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
              General Settings
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-1">
              Manage your restaurant's public information and visual branding.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              className="text-neutral-500 font-bold"
              onClick={() => window.location.reload()}
            >
              Reset
            </Button>
            <ActionGuard module="general" action="write">
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-brand-500 hover:bg-brand-700 text-white h-11 px-8 rounded-lg flex items-center gap-3"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save Changes
              </Button>
            </ActionGuard>
          </div>
        </div>

        {success && (
          <Alert title="Success" variant="success" message={success} />
        )}

        <div className="grid grid-cols-1 gap-6">
          <Card className="border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-none">
            <div className="p-6 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50">
              <div className="flex items-center gap-2">
                <Palette className="h-4 w-4 text-brand-500" />
                <h2 className="font-semibold text-neutral-800 dark:text-neutral-200">
                  Visual Identity
                </h2>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 items-start">
                <div className="flex flex-col items-center space-y-3">
                  <div className="flex items-center gap-2 self-start sm:self-center mb-1">
                    <Sun className="h-3.5 w-3.5 text-orange-500" />
                    <Label className="text-[10px] uppercase tracking-widest font-bold text-neutral-500">
                      Light Mode Logo
                    </Label>
                  </div>
                  <div className="relative group w-full max-w-[240px]">
                    <div className="aspect-[1/1] rounded-xl border-2 border-dashed border-neutral-300 dark:border-neutral-700 overflow-hidden bg-white flex items-center justify-center transition-all group-hover:border-brand-500">
                      {previewLight ? (
                        <img
                          src={previewLight}
                          alt="Light Logo"
                          className="h-full w-full object-contain p-4"
                        />
                      ) : (
                        <ImageIcon className="h-8 w-8 text-neutral-300" />
                      )}
                    </div>
                    <label className="absolute inset-0 cursor-pointer flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
                      <Upload className="h-6 w-6 text-white" />
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, "logo_light")}
                      />
                    </label>
                  </div>
                </div>

                <div className="flex flex-col items-center space-y-3">
                  <div className="flex items-center gap-2 self-start sm:self-center mb-1">
                    <Moon className="h-3.5 w-3.5 text-blue-500" />
                    <Label className="text-[10px] uppercase tracking-widest font-bold text-neutral-500">
                      Dark Mode Logo
                    </Label>
                  </div>
                  <div className="relative group w-full max-w-[240px]">
                    <div className="aspect-[1/1] rounded-xl border-2 border-dashed border-neutral-700 overflow-hidden bg-neutral-900 flex items-center justify-center transition-all group-hover:border-brand-500">
                      {previewDark ? (
                        <img
                          src={previewDark}
                          alt="Dark Logo"
                          className="h-full w-full object-contain p-4"
                        />
                      ) : (
                        <ImageIcon className="h-8 w-8 text-neutral-800" />
                      )}
                    </div>
                    <label className="absolute inset-0 cursor-pointer flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
                      <Upload className="h-6 w-6 text-white" />
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, "logo_dark")}
                      />
                    </label>
                  </div>
                </div>
              </div>
              <p className="text-center text-[10px] text-neutral-400 mt-6 italic">
                Recommended: Landscape orientation with transparent background
                (PNG/WebP)
              </p>
            </div>
          </Card>

          <Card className="border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-none">
            <div className="p-6 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50">
              <div className="flex items-center gap-2">
                <Store className="h-4 w-4 text-brand-500" />
                <h2 className="font-semibold text-neutral-800 dark:text-neutral-200">
                  Restaurant Information
                </h2>
              </div>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider font-bold text-neutral-500">
                  Store Name
                </Label>
                <Input
                  name="store_name"
                  value={form.store_name}
                  onChange={handleChange}
                  className={errors.store_name ? "border-red-500" : ""}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider font-bold text-neutral-500">
                  Phone Number
                </Label>
                <Input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className={errors.phone ? "border-red-500" : ""}
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label className="text-xs uppercase tracking-wider font-bold text-neutral-500">
                  Full Address
                </Label>
                <TextArea
                  name="address"
                  rows={3}
                  value={form.address}
                  onChange={(val) => setForm({ ...form, address: val })}
                />
              </div>
            </div>
          </Card>

          {/* System Section */}
          <Card className="border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50">
              <div className="flex items-center gap-2">
                <BellRing className="h-4 w-4 text-brand-500" />
                <h2 className="font-semibold text-neutral-800 dark:text-neutral-200">
                  System Notifications
                </h2>
              </div>
            </div>
            <div className="p-6 flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base font-medium">
                  Push Notifications
                </Label>
                <p className="text-sm text-neutral-500">
                  Receive order updates directly in your browser.
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => subscribeToPush()}
                className="gap-2"
              >
                <BellRing /> Enable
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </ActionGuard>
  );
}

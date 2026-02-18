import { useEffect, useState } from "react";
import { SettingsService } from "@/services/settings.service";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Alert from "@/components/ui/alert/Alert";
import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import { Store, Palette, BellRing, Loader2, Save } from "lucide-react";
import { subscribeToPush } from "@/utils/pushSubscription";
import PageMeta from "@/components/common/PageMeta";
import GeneralConfigSkeleton from "@/components/skeleton/settings/GeneralConfigSkeleton";

export default function GeneralSettingsPage() {
  const [form, setForm] = useState({
    store_name: "",
    phone: "",
    address: "",
  });

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [success, setSuccess] = useState("");
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  useEffect(() => {
    SettingsService.getAll({ group: "general" })
      .then((res) => {
        const data = res.data?.data || res.data || res;
        if (data) {
          const formattedData = Object.keys(data).reduce(
            (acc: any, key) => {
              if (data[key] && typeof data[key] === 'object' && 'value' in data[key]) {
                acc[key] = data[key].value;
              } else {
                acc[key] = data[key];
              }
              return acc;
            },
            {},
          );
          setForm((prev) => ({ ...prev, ...formattedData }));
        }
      })
      .finally(() => setFetching(false));
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
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

    setSuccess("Store information updated successfully.");
    setLoading(false);
  };

  if (fetching) return <GeneralConfigSkeleton/>

  return (
    <div className="w-full space-y-6">
      <PageMeta 
        title="General Settings | Dashboard" 
        description="Manage your restaurant's public information and identity." 
      />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-neutral-200 dark:border-neutral-800 pb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            General Settings
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-1">
            Manage your restaurant's public information and identity.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            className="text-neutral-500 hover:text-neutral-700 font-bold"
            onClick={() => window.location.reload()}
          >
            Reset
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-brand-500 hover:bg-brand-700 text-white h-11 px-8 rounded-lg text-sm transition-all active:scale-95 flex items-center gap-3 shadow-sm shadow-brand-500/20"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save Changes
          </Button>
        </div>
      </div>

      {success && (
        <Alert title="Success" variant="success" message={success} />
      )}

      <div className="grid grid-cols-1 gap-6">
        <Card className="border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-none">
          <div className="p-6 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50">
            <div className="flex items-center gap-2">
              <Store className="h-4 w-4 text-brand-500" />
              <h2 className="font-semibold text-neutral-800 dark:text-neutral-200">
                Restaurant Profile
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
                placeholder="Example: Nusantara Delight"
                value={form.store_name}
                onChange={handleChange}
                className={errors.store_name ? "border-red-500" : ""}
              />
              {errors.store_name && (
                <p className="text-xs text-red-500">{errors.store_name[0]}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider font-bold text-neutral-500">
                Phone Number
              </Label>
              <div className="relative">
                <Input
                  name="phone"
                  placeholder="0812xxxx"
                  value={form.phone}
                  onChange={handleChange}
                  className={errors.phone ? "border-red-500" : ""}
                />
              </div>
              {errors.phone && (
                <p className="text-xs text-red-500">{errors.phone[0]}</p>
              )}
            </div>

            <div className="md:col-span-2 space-y-2">
              <Label className="text-xs uppercase tracking-wider font-bold text-neutral-500">
                Full Address
              </Label>
              <TextArea
                name="address"
                rows={3}
                placeholder="Jl. Sudirman No. 123..."
                value={form.address}
                onChange={(val) => setForm({ ...form, address: val })}
                error={errors.address ? errors.address[0] : ""}
                hint={
                  errors.address
                    ? errors.address[0]
                    : "Enter the complete operational address of the restaurant."
                }
              />
            </div>
          </div>
        </Card>

        <Card className="border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50">
            <div className="flex items-center gap-2">
              <Palette className="h-4 w-4 text-brand-500" />
              <h2 className="font-semibold text-neutral-800 dark:text-neutral-200">
                Appearance & System
              </h2>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base font-medium">Push Notifications</Label>
                <p className="text-sm text-neutral-500">
                  Receive order updates directly in your browser.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => subscribeToPush()}
                className="gap-2 border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
              >
                <BellRing className="h-4 w-4 text-orange-500" />
                Enable
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
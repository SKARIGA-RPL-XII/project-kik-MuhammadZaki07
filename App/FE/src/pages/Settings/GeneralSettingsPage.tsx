import { useEffect, useState } from "react";
import { SettingsService } from "@/services/settings.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Alert from "@/components/ui/alert/Alert";
import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";

export default function GeneralSettingsPage() {
const [form, setForm] = useState({
  store_name: "",
  phone: "",
  address: "",
  theme: "light",
  sidebar_config: {},
  pages_config: {},
});


  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  useEffect(() => {
    SettingsService.getAll().then((res) => {
      if (res.data) {
        setForm((prev) => ({ ...prev, ...res.data }));
      }
    });
  }, []);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setLoading(true);
    setSuccess("");
    setErrors({});

    const res = await SettingsService.update(form);

    if (!res.status && res.errors) {
      setErrors(res.errors);
      setLoading(false);
      return;
    }

    setSuccess("Settings updated successfully.");
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>General Settings</CardTitle>
      </CardHeader>

      <CardContent>
        {success && (
          <div className="mb-4">
            <Alert title="Success" variant="success" message={success} />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Store Name */}
          <div>
            <Label>Store Name</Label>
            <Input
              name="store_name"
              placeholder="Enter store name"
              value={form.store_name}
              onChange={handleChange}
            />
            {errors.store_name && (
              <p className="text-sm text-red-500 mt-1">
                {errors.store_name[0]}
              </p>
            )}
          </div>

          {/* Phone */}
          <div>
            <Label>Phone</Label>
            <Input
              name="phone"
              placeholder="Enter phone number"
              value={form.phone}
              onChange={handleChange}
            />
            {errors.phone && (
              <p className="text-sm text-red-500 mt-1">
                {errors.phone[0]}
              </p>
            )}
          </div>

          {/* Theme */}
          <div>
            <Label>Theme</Label>
            <select
              name="theme"
              value={form.theme}
              onChange={handleChange}
              className="w-full border rounded-md p-2"
            >
              <option value="">Select theme</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
            {errors.theme && (
              <p className="text-sm text-red-500 mt-1">
                {errors.theme[0]}
              </p>
            )}
          </div>

          {/* Address */}
          <div className="md:col-span-2">
            <Label>Address</Label>
            <TextArea
              name="address"
              placeholder="Enter store address"
              value={form.address}
              onChange={handleChange}
            />
            {errors.address && (
              <p className="text-sm text-red-500 mt-1">
                {errors.address[0]}
              </p>
            )}
          </div>

        </div>

        <div className="mt-6">
          <Button
            className="bg-brand-500 hover:bg-brand-500/50"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

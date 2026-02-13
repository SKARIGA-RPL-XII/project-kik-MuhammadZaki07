import { useEffect, useState } from "react";
import { SettingsService } from "@/services/settings.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function TaxSettingsPage() {
  const [form, setForm] = useState({
    tax_percentage: 0,
    service_percentage: 0,
  });

  useEffect(() => {
    SettingsService.getAll().then((res) => {
      if (res.data) setForm((prev) => ({ ...prev, ...res.data }));
    });
  }, []);

  const handleSubmit = async () => {
    await SettingsService.update(form);
    alert("Tax settings updated.");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tax & Service Settings</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <Label>Tax (%)</Label>
          <Input
            type="number"
            value={form.tax_percentage}
            onChange={(e) =>
              setForm({ ...form, tax_percentage: Number(e.target.value) })
            }
          />
        </div>

        <div>
          <Label>Service (%)</Label>
          <Input
            type="number"
            value={form.service_percentage}
            onChange={(e) =>
              setForm({ ...form, service_percentage: Number(e.target.value) })
            }
          />
        </div>

        <Button onClick={handleSubmit}>Save</Button>
      </CardContent>
    </Card>
  );
}

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { SettingsService } from "@/services/settings.service";

export default function PaymentSettingsPage() {
  const [form, setForm] = useState({
    cash_enabled: true,
    qris_enabled: false,
    card_enabled: false,
  });

  const handleSubmit = async () => {
    await SettingsService.update(form);
    alert("Payment settings updated.");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Methods</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Cash</Label>
          <Switch
            checked={form.cash_enabled}
            onCheckedChange={(val) =>
              setForm({ ...form, cash_enabled: val })
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <Label>QRIS</Label>
          <Switch
            checked={form.qris_enabled}
            onCheckedChange={(val) =>
              setForm({ ...form, qris_enabled: val })
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <Label>Card</Label>
          <Switch
            checked={form.card_enabled}
            onCheckedChange={(val) =>
              setForm({ ...form, card_enabled: val })
            }
          />
        </div>

        <Button onClick={handleSubmit}>Save</Button>
      </CardContent>
    </Card>
  );
}

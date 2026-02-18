import { useEffect, useState } from "react";
import { SettingsService } from "@/services/settings.service";
import { useSettings } from "@/context/SettingsContext";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Alert from "@/components/ui/alert/Alert";
import PageMeta from "@/components/common/PageMeta";
import {
  HandCoins,
  Calculator,
  Loader2,
  Save,
  Check,
  Receipt,
} from "lucide-react";
import TaxPaymentSkeleton from "@/components/skeleton/settings/TaxPaymentSkeleton";

export default function TaxSettingsPage() {
  const { refreshSettings } = useSettings();
  const [form, setForm] = useState({
    tax_percent: "0",
    service_percent: "0",
    is_tax_active: false,
    is_service_active: false,
    tax_type: "after_service",
  });

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    SettingsService.getAll({ group: "billing" })
      .then((res) => {
        const data = res.data?.data || res.data || res;
        if (data) {
          const formatted = Object.keys(data).reduce((acc: any, key) => {
            const val = data[key]?.value !== undefined ? data[key].value : data[key];
            
            if (val === "true" || val === "1" || val === 1 || val === true) {
              acc[key] = true;
            } else if (val === "false" || val === "0" || val === 0 || val === false) {
              acc[key] = false;
            } else {
              acc[key] = val.toString();
            }
            
            return acc;
          }, {});
          setForm((prev) => ({ ...prev, ...formatted }));
        }
      })
      .finally(() => setFetching(false));
  }, []);

  const handleSubmit = async () => {
    setLoading(true);
    setSuccess("");

    const payload = {
      ...form,
      tax_percent: Number(form.tax_percent),
      service_percent: Number(form.service_percent),
      is_tax_active: form.is_tax_active ? 1 : 0,
      is_service_active: form.is_service_active ? 1 : 0,
    };

    const res = await SettingsService.updateBulk({
      group: "billing",
      settings: payload,
    });

    if (res.status) {
      setSuccess("Billing configuration updated successfully.");
      await refreshSettings();
    }
    setLoading(false);
  };

  const calculatePreview = () => {
    const subtotal = 100000;
    const servicePercent = Number(form.service_percent) || 0;
    const taxPercent = Number(form.tax_percent) || 0;

    const service = form.is_service_active
      ? subtotal * (servicePercent / 100)
      : 0;
    const baseTax =
      form.tax_type === "after_service" ? subtotal + service : subtotal;
    const tax = form.is_tax_active ? baseTax * (taxPercent / 100) : 0;
    return { service, tax, total: subtotal + service + tax };
  };

  const preview = calculatePreview();

  if (fetching) return <TaxPaymentSkeleton/>

  return (
    <div className="w-full space-y-8 px-2 pb-10">
      <PageMeta 
        title="Tax & Billing | Dashboard" 
        description="Configure restaurant tax parameters and operational service charges." 
      />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-neutral-200 dark:border-neutral-800 pb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Tax & Billing
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-1">
            Configure restaurant tax parameters and operational service charges.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            className="bg-brand-500 text-white hover:bg-brand-500 h-11 px-8 text-sm transition-all gap-3 rounded-lg"
            onClick={handleSubmit}
            disabled={loading}
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

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
        <div className="xl:col-span-2 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-neutral-200 shadow-none dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden">
              <div className="p-5 border-b border-neutral-100 dark:border-neutral-800 flex justify-between items-center bg-neutral-50/50 dark:bg-neutral-900/50">
                <div className="flex items-center gap-3">
                  <Receipt className="h-5 w-5 text-brand-500" />
                  <span className="text-sm font-semibold text-muted-foreground dark:text-neutral-300">
                    Restaurant Tax
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setForm({
                      ...form,
                      is_tax_active: !form.is_tax_active,
                    })
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    form.is_tax_active
                      ? "bg-brand-500"
                      : "bg-neutral-200 dark:bg-neutral-800"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      form.is_tax_active ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              <div className="p-6 space-y-5">
                <div className="space-y-2">
                  <Label className="text-xs uppercase font-bold text-neutral-500 tracking-wide">
                    Tax Amount
                  </Label>

                  <div
                    className={`flex items-center overflow-hidden rounded-lg border-2 transition-all ${
                      form.is_tax_active
                        ? "border-neutral-200 dark:border-neutral-700 focus-within:border-brand-500"
                        : "bg-neutral-50 dark:bg-neutral-800/50 opacity-50"
                    }`}
                  >
                    <input
                      type="text"
                      inputMode="numeric"
                      className="w-full bg-transparent px-4 py-3 text-lg font-bold outline-none"
                      value={form.tax_percent}
                      disabled={!form.is_tax_active}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (/^\d*\.?\d*$/.test(val)) {
                          setForm({ ...form, tax_percent: val });
                        }
                      }}
                    />

                    <div className="px-5 text-base font-black text-neutral-400 border-l border-neutral-100 dark:border-neutral-800 bg-neutral-50/30 dark:bg-neutral-900/30">
                      %
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="shadow-none border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden">
              <div className="p-5 border-b border-neutral-100 dark:border-neutral-800 flex justify-between items-center bg-neutral-50/50 dark:bg-neutral-900/50">
                <div className="flex items-center gap-3">
                  <HandCoins className="h-5 w-5 text-brand-500" />
                  <span className="text-sm font-semibold text-muted-foreground">
                    Service Charge
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setForm({
                      ...form,
                      is_service_active: !form.is_service_active,
                    })
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    form.is_service_active
                      ? "bg-brand-500"
                      : "bg-neutral-200 dark:bg-neutral-800"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      form.is_service_active ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              <div className="p-6 space-y-5">
                <Label className="text-xs uppercase font-bold text-neutral-500 tracking-wide">
                  Service Fee
                </Label>

                <div
                  className={`flex items-center overflow-hidden rounded-lg border-2 transition-all ${
                    form.is_service_active
                      ? "border-neutral-200 dark:border-neutral-700 focus-within:border-brand-500"
                      : "bg-neutral-50 dark:bg-neutral-800/50 opacity-50"
                  }`}
                >
                  <input
                    type="text"
                    inputMode="numeric"
                    className="w-full bg-transparent px-4 py-3 text-lg font-bold outline-none"
                    value={form.service_percent}
                    disabled={!form.is_service_active}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (/^\d*\.?\d*$/.test(val)) {
                        setForm({ ...form, service_percent: val });
                      }
                    }}
                  />

                  <div className="px-5 text-base font-black text-neutral-400 border-l border-neutral-100 dark:border-neutral-800 bg-neutral-50/30 dark:bg-neutral-900/30">
                    %
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 px-1">
              <Calculator className="h-5 w-5 text-brand-500" />
              <span className="text-sm font-semibold text-muted-foreground">
                Calculation Method
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  id: "after_service",
                  title: "Standard Resto",
                  formula: "(Price + Service) x Tax",
                },
                {
                  id: "subtotal_only",
                  title: "Flat Rate",
                  formula: "Price x (Tax + Service)",
                },
              ].map((item) => (
                <div
                  key={item.id}
                  onClick={() =>
                    setForm({
                      ...form,
                      tax_type: item.id,
                    })
                  }
                  className={`p-5 rounded-sm border-2 transition-all cursor-pointer flex items-center justify-between ${
                    form.tax_type === item.id
                      ? "border-brand-500 bg-brand-50 dark:bg-brand-500/10"
                      : "border-neutral-200 dark:border-neutral-800 hover:border-brand-400 opacity-70 hover:opacity-100"
                  }`}
                >
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                      {item.title}
                    </p>
                    <p className="text-[11px] font-mono text-neutral-500 uppercase tracking-tight">
                      {item.formula}
                    </p>
                  </div>

                  {form.tax_type === item.id && (
                    <Check className="h-5 w-5 text-brand-500 stroke-[3px]" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="xl:col-span-1 sticky top-8">
          <Card className="border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/40 p-6 shadow-none space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-neutral-400 border-b border-neutral-200 dark:border-neutral-800 pb-3">
              Calculation Preview
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Subtotal Simulation</span>
                <span className="font-semibold text-neutral-900 dark:text-neutral-200">
                  100,000
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Service Charge</span>
                <span className="font-semibold text-neutral-900 dark:text-neutral-200">
                  +{preview.service.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">
                  Tax ({form.tax_percent || "0"}%)
                </span>
                <span className="font-semibold text-neutral-900 dark:text-neutral-200">
                  +{preview.tax.toLocaleString()}
                </span>
              </div>
              <div className="pt-5 border-t border-neutral-200 dark:border-neutral-800 flex justify-between items-baseline">
                <span className="text-xs font-bold uppercase text-neutral-400 tracking-wider">
                  Total
                </span>
                <span className="text-3xl font-bold text-neutral-900 dark:text-white tracking-tighter italic">
                  {preview.total.toLocaleString()}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
import { useEffect, useState } from "react";
import { SettingsService } from "@/services/settings.service";
import { useSettings } from "@/context/SettingsContext";
import { Button } from "@/components/ui/button";
import Alert from "@/components/ui/alert/Alert";
import PageMeta from "@/components/common/PageMeta";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import {
  CreditCard,
  Loader2,
  Save,
  Plus,
  Trash2,
  Wallet,
  ChevronLeft,
} from "lucide-react";
import DeleteAlertDialog from "@/components/dialog/DeleteAlertDialog";
import TaxPaymentSkeleton from "@/components/skeleton/settings/TaxPaymentSkeleton";
import { ActionGuard } from "@/components/guard/ActionGuard";

interface PaymentMethod {
  id: string;
  name: string;
  active: boolean;
}

export default function PaymentSettingsPage() {
  const { refreshSettings } = useSettings();
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [success, setSuccess] = useState("");

  const [newMethodName, setNewMethodName] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  useEffect(() => {
    SettingsService.getAll({ group: "payment" })
      .then((res) => {
        const responseData = res.data?.data || res.data || res;
        if (responseData?.available_methods) {
          const rawValue = responseData.available_methods.value;
          let parsedMethods = [];
          
          if (typeof rawValue === "string") {
            try {
              parsedMethods = JSON.parse(rawValue);
            } catch (e) {
              parsedMethods = [];
            }
          } else {
            parsedMethods = rawValue;
          }

          const sanitizedMethods = Array.isArray(parsedMethods) 
            ? parsedMethods.map((m: any) => ({
                ...m,
                active: m.active === "1" || m.active === 1 || m.active === true || m.active === "true"
              }))
            : [];

          setMethods(sanitizedMethods);
        }
      })
      .catch((err) => console.error("Fetch error:", err))
      .finally(() => setFetching(false));
  }, []);

  const handleToggle = (id: string) => {
    setMethods(
      methods.map((m) => (m.id === id ? { ...m, active: !m.active } : m)),
    );
  };

  const handleAddMethod = () => {
    if (newMethodName.trim()) {
      const newMethod = {
        id: newMethodName.toLowerCase().replace(/\s+/g, "-"),
        name: newMethodName,
        active: true,
      };
      setMethods([...methods, newMethod]);
      setNewMethodName("");
      setIsAddDialogOpen(false);
    }
  };

  const removeMethod = (id: string) => {
    setMethods(methods.filter((m) => m.id !== id));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setSuccess("");
    
    const payload = methods.map(m => ({
      ...m,
      active: m.active ? 1 : 0
    }));

    const res = await SettingsService.updateBulk({
      group: "payment",
      settings: { available_methods: payload },
    });

    if (res.status) {
      setSuccess("Payment methods updated and synchronized.");
      await refreshSettings();
      setTimeout(() => setSuccess(""), 5000);
    }
    setLoading(false);
  };

  if (fetching) return <TaxPaymentSkeleton/>

  return (
<ActionGuard module="payment methods" action="view">
  <div className="w-full space-y-8 px-2 pb-10">
    <PageMeta 
      title="Payment Configuration | Dashboard" 
      description="Manage the active payment rails for your point of sale terminals." 
    />

    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-neutral-200 dark:border-neutral-800 pb-8">
      <div className="flex items-center gap-4">
        <button className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors md:hidden">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Gateways
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-1">
            Manage the active payment rails for your point of sale terminals.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <ActionGuard module="payment methods" action="write">
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-red-500 hover:bg-red-700 text-white h-11 px-8 text-sm transition-all gap-3 rounded-lg shadow-sm"
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

    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-md font-semibold text-muted-foreground">
          Registry List
        </h3>
        
        <ActionGuard module="payment methods" action="write">
          <AlertDialog
            open={isAddDialogOpen}
            onOpenChange={setIsAddDialogOpen}
          >
            <AlertDialogTrigger asChild>
              <button className="flex items-center gap-2 text-sm font-bold text-red-500 hover:text-red-700 transition-colors">
                <Plus className="h-4 w-4" />
                Add New Method
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent className="max-w-md rounded-xl border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 shadow-2xl">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-xl font-bold text-neutral-900 dark:text-white">
                  Add Payment Method
                </AlertDialogTitle>
                <AlertDialogDescription className="text-sm text-neutral-500">
                  Enter the display name for the new payment rail.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="py-4">
                <Input
                  placeholder="e.g. ShopeePay, Bank Transfer"
                  value={newMethodName}
                  onChange={(e) => setNewMethodName(e.target.value)}
                  className="h-11 bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-sm font-medium rounded-lg focus-visible:ring-1 focus-visible:ring-red-500"
                />
              </div>
              <AlertDialogFooter className="gap-2">
                <AlertDialogCancel
                  className="rounded-lg border-none bg-neutral-100 dark:bg-neutral-800 text-xs font-bold"
                  onClick={() => setNewMethodName("")}
                >
                  Cancel
                </AlertDialogCancel>
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    handleAddMethod();
                  }}
                  className="bg-red-500 hover:bg-red-700 text-white text-xs font-bold rounded-lg"
                >
                  Confirm
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </ActionGuard>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {methods.length > 0 ? (
          methods.map((method) => (
            <div
              key={method.id}
              className={`flex items-center justify-between p-5 rounded-sm border transition-all duration-200 ${
                method.active
                  ? "bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800"
                  : "bg-neutral-50/50 dark:bg-neutral-900/20 opacity-60"
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 flex justify-center items-center rounded-full ${
                    method.active 
                      ? "bg-red-50 text-red-500 dark:bg-red-500/10" 
                      : "bg-neutral-200 dark:bg-neutral-800 text-neutral-400"
                  }`}
                >
                  {method.id === "cash" ? (
                    <Wallet className="h-6 w-6" />
                  ) : (
                    <CreditCard className="h-6 w-6" />
                  )}
                </div>
                <div>
                  <h4 className="text-base font-bold text-neutral-900 dark:text-white tracking-tight">
                    {method.name}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <div
                      className={`w-1.5 h-1.5 rounded-full animate-caret-blink ${
                        method.active ? "bg-green-500" : "bg-neutral-400"
                      }`}
                    ></div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                      {method.active ? "Active" : "Disabled"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {method.id !== "cash" && (
                  <ActionGuard module="payment methods" action="delete">
                    <DeleteAlertDialog
                      title={`Remove ${method.name}?`}
                      description="This will permanently delete this payment method from the system."
                      onConfirm={() => removeMethod(method.id)}
                    >
                      <button className="p-2 text-neutral-400 hover:text-red-500 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </DeleteAlertDialog>
                  </ActionGuard>
                )}
                
                <ActionGuard module="payment methods" action="write">
                  <button
                    onClick={() => handleToggle(method.id)}
                    className={`w-10 h-5 rounded-full transition-all duration-300 relative ${
                      method.active ? "bg-red-500" : "bg-neutral-300 dark:bg-neutral-700"
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300 ${
                        method.active ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </ActionGuard>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-16 text-center border border-dashed border-neutral-200 dark:border-neutral-800 rounded-xl bg-neutral-50/50 dark:bg-neutral-900/20">
            <p className="text-xs text-neutral-400 font-bold uppercase tracking-[0.2em]">
              No Payment Methods Configured
            </p>
          </div>
        )}
      </div>
    </div>
  </div>
</ActionGuard>
  );
}
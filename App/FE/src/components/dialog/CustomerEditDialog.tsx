import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useUpdateCustomer } from "@/hooks/react-query/useCustomers";

export default function CustomerEditDialog({
  open,
  onOpenChange,
  customer,
}: any) {
  const { mutateAsync, isPending } = useUpdateCustomer();

  const [form, setForm] = useState<any>({
    username: "",
    email: "",
    no_tlp: "",
  });

  useEffect(() => {
    if (customer) {
      setForm({
        username: customer.username || "",
        email: customer.email || "",
        no_tlp: customer.no_tlp || "",
      });
    }
  }, [customer]);

  const handleSubmit = async () => {
    await mutateAsync({
      id: customer.id,
      payload: form,
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Customer</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            placeholder="Username"
            value={form.username}
            onChange={(e) =>
              setForm({ ...form, username: e.target.value })
            }
          />

          <Input
            placeholder="Email"
            value={form.email}
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
          />

          <Input
            placeholder="Phone"
            value={form.no_tlp}
            onChange={(e) =>
              setForm({ ...form, no_tlp: e.target.value })
            }
          />

          <Button
            onClick={handleSubmit}
            disabled={isPending}
            className="w-full"
          >
            {isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
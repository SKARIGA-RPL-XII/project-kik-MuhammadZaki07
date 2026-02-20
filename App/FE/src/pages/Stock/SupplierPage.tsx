import React, { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  Check,
} from "lucide-react";
import Button from "@/components/ui/button/Button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Toggle } from "@/components/ui/toggle";
import { supplierService, Supplier } from "@/services/supplier.service";
import { useToast } from "@/context/ToastContext";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import PageMeta from "@/components/common/PageMeta";
import { ActionGuard } from "@/components/guard/ActionGuard";
import TableSupplier from "@/components/tables/TableSupplier";
import LoadingSpinner from "@/components/skeleton/LoadingSpinner";

const INITIAL_FORM = {
  name: "",
  contact_person: "",
  phone: "",
  address: "",
  is_active: true,
};

const SupplierPage: React.FC = () => {
  const { toast } = useToast();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const [meta, setMeta] = useState({
    current_page: 1,
    last_page: 1,
  });

  const [errors, setErrors] = useState({
    message: "",
    ErrorField: {} as Record<string, string[]>,
  });

  const [formData, setFormData] = useState(INITIAL_FORM);

  const fetchSuppliers = useCallback(
    async (page: number = 1, searchTerm: string = "") => {
      setLoading(true);
      try {
        const result = await supplierService.getAll(page, 10, searchTerm);
        setSuppliers(result.data);
        setMeta({
          current_page: result.current_page,
          last_page: result.last_page,
        });
      } catch (error) {
        toast("error", "Error", "Failed to load suppliers");
      } finally {
        setLoading(false);
      }
    },
    [toast],
  );

  useEffect(() => {
    let isActive = true;
    const delayDebounceFn = setTimeout(() => {
      if (isActive) {
        fetchSuppliers(1, search);
      }
    }, 500);

    return () => {
      isActive = false;
      clearTimeout(delayDebounceFn);
    };
  }, []);

  const handleOpenModal = (supplier?: Supplier) => {
    if (supplier) {
      setFormData({
        name: supplier.name,
        contact_person: supplier.contact_person,
        phone: supplier.phone,
        address: supplier.address || "",
        is_active: supplier.is_active ?? true,
      });
      setSelectedId(supplier.id);
    } else {
      setFormData(INITIAL_FORM);
      setSelectedId(null);
    }
    setErrors({ message: "", ErrorField: {} });
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    setSubmitLoading(true);
    setErrors({ message: "", ErrorField: {} });

    try {
      if (selectedId) {
        await supplierService.update(selectedId, formData);
        toast("success", "Success", "Supplier updated");
      } else {
        await supplierService.create(formData);
        toast("success", "Success", "Supplier created");
      }
      setIsModalOpen(false);
      // fetchSuppliers(meta.current_page, search);
    } catch (error: any) {
      const res = error.response?.data;
      if (error.response?.status === 422 && res.errors) {
        setErrors({ message: res.message, ErrorField: res.errors });
        toast("error", "Validation Error", res.message);
      } else {
        toast("error", "Error", "Something went wrong");
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <PageMeta title="Suppliers | Inventory" description="Manage vendors" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Suppliers</h1>
          <p className="text-sm text-muted-foreground">
            Kelola vendor dan kontak pemasok.
          </p>
        </div>
        <ActionGuard module="suppliers" action="write">
          <Button className="h-10" onClick={() => handleOpenModal()}>
            <Plus className="w-4 h-4 mr-2" /> Add Supplier
          </Button>
        </ActionGuard>
      </div>

      <div className="flex items-center relative max-w-sm">
        <Search className="absolute left-3 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search supplier..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <TableSupplier
        data={suppliers}
        loading={loading}
        onEdit={(s) => handleOpenModal(s)}
        onRefresh={() => fetchSuppliers(meta.current_page, search)}
      />

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Page {meta.current_page} of {meta.last_page}
        </p>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchSuppliers(meta.current_page - 1, search)}
            disabled={meta.current_page === 1 || loading}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchSuppliers(meta.current_page + 1, search)}
            disabled={meta.current_page >= meta.last_page || loading}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <AlertDialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {selectedId ? "Edit Supplier" : "Add New Supplier"}
            </AlertDialogTitle>
          </AlertDialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label
                className={errors.ErrorField?.name ? "text-destructive" : ""}
              >
                Supplier Name
              </Label>
              <Input
                placeholder="e.g. PT. Sembako Jaya"
                className={
                  errors.ErrorField?.name
                    ? "border-destructive focus-visible:ring-destructive"
                    : ""
                }
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
              {errors.ErrorField?.name && (
                <span className="text-[10px] text-destructive">
                  {errors.ErrorField.name[0]}
                </span>
              )}
            </div>

            <div className="grid gap-2">
              <Label
                className={
                  errors.ErrorField?.contact_person ? "text-destructive" : ""
                }
              >
                Contact Person
              </Label>
              <Input
                placeholder="e.g. Budi Santoso"
                className={
                  errors.ErrorField?.contact_person
                    ? "border-destructive focus-visible:ring-destructive"
                    : ""
                }
                value={formData.contact_person}
                onChange={(e) =>
                  setFormData({ ...formData, contact_person: e.target.value })
                }
              />
              {errors.ErrorField?.contact_person && (
                <span className="text-[10px] text-destructive">
                  {errors.ErrorField.contact_person[0]}
                </span>
              )}
            </div>

            <div className="grid gap-2">
              <Label
                className={errors.ErrorField?.phone ? "text-destructive" : ""}
              >
                Phone
              </Label>
              <Input
                placeholder="e.g. 081234567890"
                className={
                  errors.ErrorField?.phone
                    ? "border-destructive focus-visible:ring-destructive"
                    : ""
                }
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
              {errors.ErrorField?.phone && (
                <span className="text-[10px] text-destructive">
                  {errors.ErrorField.phone[0]}
                </span>
              )}
            </div>

            <div className="grid gap-2">
              <Label>Address</Label>
              <Textarea
                placeholder="Enter complete address here..."
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <Label
                  className={
                    errors.ErrorField?.is_active ? "text-destructive" : ""
                  }
                >
                  Active Status
                </Label>
                <p className="text-[10px] text-muted-foreground">
                  Enable or disable this supplier.
                </p>
              </div>
              <Toggle
                variant="outline"
                pressed={formData.is_active}
                onPressedChange={(pressed) =>
                  setFormData({ ...formData, is_active: pressed })
                }
                aria-label="Toggle active"
                className="data-[state=on]:bg-emerald-50 data-[state=on]:text-emerald-700 data-[state=on]:border-emerald-200"
              >
                {formData.is_active ? <Check className="w-4 h-4 mr-1" /> : null}
                <span className="text-xs">
                  {formData.is_active ? "Active" : "Inactive"}
                </span>
              </Toggle>
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitLoading}>
              Cancel
            </AlertDialogCancel>
            <Button
              className="h-9"
              onClick={handleSubmit}
              disabled={submitLoading}
            >
              {submitLoading ? <LoadingSpinner /> : "Save"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SupplierPage;

import { useEffect, useState, ChangeEvent } from "react";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";
import Input from "../../components/form/input/InputField";
import Textarea from "../../components/form/input/TextArea";
import Switch from "../../components/form/switch/Switch";
import Label from "../../components/form/Label";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../../components/ui/alert-dialog";
import { DiscountService } from "../../services/discount.service";
import DiscountTable from "../../components/tables/DiscountTable";
import Select from "../../components/form/Select";
import DatePicker from "../../components/form/date-picker";
import useDebounce from "../../hooks/useDebounce";
import { useToast } from "@/context/ToastContext";
import { ActionGuard } from "@/components/guard/ActionGuard";

function Discount() {
  const [discounts, setDiscounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [valueDiscount, setValueDiscount] = useState(0);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<{
    start?: string;
    end?: string;
  }>({});

  const debouncedSearch = useDebounce(search, 500);
  const { toast } = useToast();

  const fetchDiscounts = async () => {
    setLoading(true);
    try {
      const { data } = await DiscountService.getDiscounts({
        search: debouncedSearch,
        status: statusFilter ?? undefined,
        start_date: dateFilter.start ?? undefined,
        end_date: dateFilter.end ?? undefined,
      });
      if (data) setDiscounts(data);
    } catch (err) {
      toast("error", "Error", "Failed to fetch discounts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscounts();
  }, [debouncedSearch, statusFilter, dateFilter]);

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setDescription("");
    setValueDiscount(0);
    setStartDate("");
    setEndDate("");
    setIsActive(true);
    setErrors({});
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setErrors({});

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("value_discount", valueDiscount.toString());
    formData.append("start_date", startDate);
    formData.append("end_date", endDate);
    formData.append("is_active", isActive ? "1" : "0");

    try {
      let response;
      if (editingId) {
        response = await DiscountService.updateDiscount(editingId, formData);
      } else {
        response = await DiscountService.createDiscount(formData);
      }

      if (response.error) {
        if (typeof response.error === "object") {
          const validationErrors: Record<string, string> = {};
          Object.entries(response.error).forEach(([key, messages]) => {
            validationErrors[key] = Array.isArray(messages)
              ? messages[0]
              : (messages as string);
          });
          setErrors(validationErrors);
          toast("error", "Validation Error", "Please check your inputs");
        } else {
          toast("error", "Failed", response.error);
        }
      } else {
        toast(
          "success",
          "Success",
          editingId ? "Discount updated" : "Discount created",
        );
        setOpenDialog(false);
        resetForm();
        fetchDiscounts();
      }
    } catch (err) {
      toast("error", "System Error", "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (discount: any) => {
    setEditingId(discount.id);
    setTitle(discount.title);
    setDescription(discount.description);
    setValueDiscount(discount.value_discount);
    setStartDate(discount.start_date);
    setEndDate(discount.end_date);
    setIsActive(discount.is_active === 1 || discount.is_active === true);
    setErrors({});
    setOpenDialog(true);
  };

  return (
  <>
  <PageMeta title="Discount Management" description="Manage discounts" />
  <PageBreadcrumb pageTitle="Discounts" />

  <ComponentCard
    title="Discount Management"
    desc="Create, edit, delete discounts"
  >
    <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
      <div className="flex flex-wrap gap-3">
        <div className="w-64">
          <Input
            placeholder="Search by title..."
            value={search}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setSearch(e.target.value)
            }
          />
        </div>

        <div className="w-40">
          <Select
            options={[
              { label: "All Status", value: "" },
              { label: "Active", value: "active" },
              { label: "Inactive", value: "inactive" },
            ]}
            value={statusFilter ?? ""}
            onChange={(v) => setStatusFilter(v || null)}
            placeholder="Status"
          />
        </div>

        <div className="w-44">
          <DatePicker
            id="filter-start"
            placeholder="Start Date"
            value={dateFilter.start ?? ""}
            onChange={(_, dateStr) =>
              setDateFilter((p) => ({ ...p, start: dateStr }))
            }
          />
        </div>

        <div className="w-44">
          <DatePicker
            id="filter-end"
            placeholder="End Date"
            value={dateFilter.end ?? ""}
            minDate={dateFilter.start ?? undefined}
            onChange={(_, dateStr) =>
              setDateFilter((p) => ({ ...p, end: dateStr }))
            }
          />
        </div>
      </div>

      <ActionGuard module="discount" action="write">
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
              className="bg-brand-500 hover:bg-brand-600"
            >
              Create Discount
            </Button>
          </AlertDialogTrigger>

          <AlertDialogContent className="max-w-lg">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl font-bold">
                {editingId ? "Edit Discount" : "Create New Discount"}
              </AlertDialogTitle>
            </AlertDialogHeader>

            <div className="space-y-4 mt-2 text-left">
              <div>
                <Label htmlFor="form-title">Discount Title</Label>
                <Input
                  id="form-title"
                  placeholder="Promo Summer"
                  value={title}
                  error={!!errors.title}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setTitle(e.target.value)
                  }
                />
                {errors.title && (
                  <p className="text-xs text-red-500 mt-1">{errors.title}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <DatePicker
                  id="form-start-date"
                  label="Start Date"
                  placeholder="Select date"
                  defaultDate={startDate}
                  onChange={(_, dateStr) => setStartDate(dateStr)}
                />
                <DatePicker
                  id="form-end-date"
                  label="End Date"
                  placeholder="Select date"
                  defaultDate={endDate}
                  minDate={startDate || undefined}
                  onChange={(_, dateStr) => setEndDate(dateStr)}
                />
              </div>

              <div>
                <Label htmlFor="form-value">Discount Value (%)</Label>
                <Input
                  id="form-value"
                  type="number"
                  placeholder="0"
                  value={valueDiscount}
                  error={!!errors.value_discount}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setValueDiscount(
                      Math.max(0, parseInt(e.target.value, 10) || 0),
                    )
                  }
                />
                {errors.value_discount && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.value_discount}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="form-desc">Description</Label>
                <Textarea
                  id="form-desc"
                  placeholder="Short description..."
                  value={description}
                  onChange={(val: any) =>
                    setDescription(
                      typeof val === "string" ? val : val.target.value,
                    )
                  }
                />
                {errors.description && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.description}
                  </p>
                )}
              </div>

              <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-lg">
                <Switch
                  checked={isActive}
                  label="Enable Discount Status"
                  onChange={(v) => setIsActive(v)}
                />
              </div>

              <AlertDialogFooter className="gap-3 mt-4">
                <AlertDialogCancel onClick={resetForm} disabled={submitting}>
                  Cancel
                </AlertDialogCancel>
                <Button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="min-w-[120px]"
                >
                  {submitting ? "Saving..." : editingId ? "Update" : "Create"}
                </Button>
              </AlertDialogFooter>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      </ActionGuard>
    </div>

    <DiscountTable
      discounts={discounts}
      loading={loading}
      onRefresh={fetchDiscounts}
      onEdit={handleEdit}
    />
  </ComponentCard>
</>
  );
}

export default Discount;

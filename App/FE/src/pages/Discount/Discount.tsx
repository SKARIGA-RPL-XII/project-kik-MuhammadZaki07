import { useEffect, useState, ChangeEvent } from "react";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";
import Input from "../../components/form/input/InputField";
import Textarea from "../../components/form/input/TextArea";
import Switch from "../../components/form/switch/Switch";
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

  const fetchDiscounts = async () => {
    setLoading(true);
    const { data, error } = await DiscountService.getDiscounts({
      search,
      status: statusFilter ?? undefined,
      start_date: dateFilter.start ?? undefined,
      end_date: dateFilter.end ?? undefined,
    });

    if (data) setDiscounts(data.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchDiscounts({ search: debouncedSearch });
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
    const fd = new FormData();
    fd.append("title", title);
    fd.append("description", description);
    fd.append("value_discount", valueDiscount.toString());
    fd.append("start_date", startDate);
    fd.append("end_date", endDate);
    fd.append("is_active", isActive ? "1" : "0");

    try {
      let error = null;
      if (editingId) {
        const res = await DiscountService.updateDiscount(editingId, fd);
        error = res.error;
      } else {
        const res = await DiscountService.createDiscount(fd);
        error = res.error;
      }

      if (error) {
        setErrors(typeof error === "object" ? error : { form: error });
      } else {
        resetForm();
        setOpenDialog(false);
        fetchDiscounts();
      }
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
    setIsActive(discount.is_active);
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
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-2">
            <Input
              placeholder="Search..."
              value={search}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setSearch(e.target.value)
              }
            />

            <div className="w-40">
              <Select
                options={[
                  { label: "All Status", value: "" },
                  { label: "Active", value: "active" },
                  { label: "Inactive", value: "inactive" },
                ]}
                value={statusFilter ?? ""}
                onChange={(v) => setStatusFilter(v || null)}
                className="dark:bg-dark-900"
                placeholder="Select Status"
              />
            </div>

            <div className="w-52">
              <DatePicker
                id="start-date"
                placeholder="Select start date"
                value={dateFilter.start ?? ""}
                onChange={(dates, dateStr) =>
                  setDateFilter((p) => ({ ...p, start: dateStr }))
                }
              />
            </div>

            <div className="w-52">
              <DatePicker
                id="end-date"
                placeholder="Select end date"
                defaultDate={dateFilter.end ?? undefined}
                minDate={dateFilter.start ?? undefined}
                onChange={(selectedDates) => {
                  setDateFilter((p) => ({
                    ...p,
                    end: selectedDates[0]?.toISOString().split("T")[0],
                  }));
                }}
              />
            </div>
          </div>

          <AlertDialog open={openDialog} onOpenChange={setOpenDialog}>
            <AlertDialogTrigger asChild>
              <Button onClick={resetForm}>Create Discount</Button>
            </AlertDialogTrigger>

            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {editingId ? "Edit Discount" : "Create Discount"}
                </AlertDialogTitle>
              </AlertDialogHeader>

              <div className="space-y-4 mt-2">
                <Input
                  placeholder="Title"
                  value={title}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setTitle(e.target.value)
                  }
                />
                {errors.title && (
                  <p className="text-sm text-red-500">{errors.title}</p>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <DatePicker
                      id="form-start-date"
                      placeholder="Select start date"
                      defaultDate={startDate || undefined}
                      onChange={(dates, dateStr) => {
                        setStartDate(dateStr);
                        if (endDate && new Date(endDate) < new Date(dateStr)) {
                          setEndDate(dateStr);
                        }
                      }}
                    />
                    {errors.start_date && (
                      <p className="text-sm text-red-500">
                        {errors.start_date}
                      </p>
                    )}
                  </div>

                  <div>
                    <DatePicker
                      id="form-end-date"
                      placeholder="Select end date"
                      defaultDate={endDate || undefined}
                      minDate={startDate ?? undefined}
                      onChange={(dates, dateStr) => setEndDate(dateStr)}
                      options={{
                        minDate: startDate || undefined,
                      }}
                    />

                    {errors.end_date && (
                      <p className="text-sm text-red-500">{errors.end_date}</p>
                    )}
                  </div>
                </div>

                <Input
                  type="number"
                  placeholder="Value Discount %"
                  value={valueDiscount}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setValueDiscount(Math.max(0, parseInt(e.target.value, 10)))
                  }
                />

                {errors.value_discount && (
                  <p className="text-sm text-red-500">
                    {errors.value_discount}
                  </p>
                )}

                <Textarea
                  placeholder="Description"
                  value={description}
                  onChange={(val) => setDescription(val)}
                />
                {errors.description && (
                  <p className="text-sm text-red-500">{errors.description}</p>
                )}

                <div className="flex items-center gap-2">
                  <Switch
                    checked={isActive}
                    label="Active"
                    onChange={(v) => setIsActive(v)}
                  />
                  {errors.is_active && (
                    <p className="text-sm text-red-500">{errors.is_active}</p>
                  )}
                </div>

                <AlertDialogFooter className="justify-between mt-4 items-center">
                  <AlertDialogCancel onClick={resetForm} disabled={submitting}>
                    Cancel
                  </AlertDialogCancel>
                  <Button onClick={handleSubmit} disabled={submitting}>
                    {submitting
                      ? "Saving..."
                      : editingId
                        ? "Update Discount"
                        : "Create Discount"}
                  </Button>
                </AlertDialogFooter>
              </div>
            </AlertDialogContent>
          </AlertDialog>
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

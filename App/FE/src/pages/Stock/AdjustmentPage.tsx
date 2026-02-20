import React, { useState, useEffect, useCallback } from "react";
import { Plus, Search } from "lucide-react";
import Button  from "@/components/ui/button/Button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { adjustmentService, Adjustment } from "@/services/adjustment.service";
import { stockService } from "@/services/stock.service";
import { Stock } from "../Stock/StockPage";
import { useToast } from "@/context/ToastContext";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PageMeta from "@/components/common/PageMeta";
import { ActionGuard } from "@/components/guard/ActionGuard";
import TableAdjustment from "@/components/tables/TableAdjustment";
import LoadingSpinner from "@/components/skeleton/LoadingSpinner";

const INITIAL_FORM = {
  stock_id: "",
  type: "in" as "in" | "out",
  amount: 0,
  reason: "",
};

const AdjustmentPage: React.FC = () => {
  const { toast } = useToast();
  const [adjustments, setAdjustments] = useState<Adjustment[]>([]);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errors, setErrors] = useState<{ message: string; ErrorField: Record<string, string[]> }>({
    message: "",
    ErrorField: {},
  });

  const [formData, setFormData] = useState(INITIAL_FORM);

  const fetchAdjustments = useCallback(async (searchTerm: string = "") => {
    setLoading(true);
    try {
      const result = await adjustmentService.getAll(0, 50, searchTerm);
      setAdjustments(result.data);
    } catch (error) {
      toast("error", "Error", "Failed to load adjustment history");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchStocks = async () => {
    try {
      const result = await stockService.getAll(0, 100);
      setStocks(result.data);
    } catch (error) {
      console.error("Failed to fetch stocks", error);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchAdjustments(search);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [search, fetchAdjustments]);

  useEffect(() => {
    if (isModalOpen) fetchStocks();
  }, [isModalOpen]);

  const handleOpenModal = () => {
    setFormData(INITIAL_FORM);
    setErrors({ message: "", ErrorField: {} });
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    setSubmitLoading(true);
    setErrors({ message: "", ErrorField: {} });

    try {
      await adjustmentService.create({
        ...formData,
        stock_id: Number(formData.stock_id),
        amount: Number(formData.amount),
      });

      toast("success", "Success", "Adjustment recorded successfully");
      setIsModalOpen(false);
      fetchAdjustments();
    } catch (error: any) {
      const res = error.response?.data;

      const err_message = res?.message; 
      const err_field = res?.errors

        setErrors({
          message: err_message,
          ErrorField: err_field,
        });
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <PageMeta title="Stock Adjustment | Inventory" description="Track stock movements" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Stock Adjustment</h1>
          <p className="text-sm text-muted-foreground">Manage and track manual stock adjustments.</p>
        </div>
        <ActionGuard module="stock adjustment" action="write">
          <Button className="h-10" onClick={handleOpenModal}>
            <Plus className="w-4 h-4 mr-2" /> Record Adjustment
          </Button>
        </ActionGuard>
      </div>

      <div className="flex items-center relative max-w-sm">
        <Search className="absolute left-3 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by stock name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <TableAdjustment
        data={adjustments}
        loading={loading}
        onRefresh={() => fetchAdjustments(search)}
      />

      <AlertDialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>New Stock Adjustment</AlertDialogTitle>
          </AlertDialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label className={errors.ErrorField?.stock_id ? "text-destructive" : ""}>
                Select Item
              </Label>
              <Select
                value={formData.stock_id}
                onValueChange={(val) => setFormData({ ...formData, stock_id: val })}
              >
                <SelectTrigger
                  className={errors.ErrorField?.stock_id ? "border-destructive focus:ring-destructive" : ""}
                >
                  <SelectValue placeholder="Select stock item" />
                </SelectTrigger>
                <SelectContent>
                  {stocks.map((s) => (
                    <SelectItem key={s.id} value={s.id.toString()}>
                      {s.name} (Current: {s.quantity} {s.unit})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.ErrorField?.stock_id && (
                <span className="text-[10px] font-medium text-destructive">
                  {errors.ErrorField.stock_id[0]}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Type */}
              <div className="grid gap-2">
                <Label>Adjustment Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(val: "in" | "out") => setFormData({ ...formData, type: val })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in">Stock In (+)</SelectItem>
                    <SelectItem value="out">Stock Out (-)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Amount */}
              <div className="grid gap-2">
                <Label className={errors.ErrorField?.amount ? "text-destructive" : ""}>
                  Amount
                </Label>
                <Input
                  type="number"
                  placeholder="0"
                  className={errors.ErrorField?.amount ? "border-destructive focus-visible:ring-destructive" : ""}
                  value={formData.amount || ""}
                  onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                />
                {errors.ErrorField?.amount && (
                  <span className="text-[10px] font-medium text-destructive">
                    {errors.ErrorField.amount[0]}
                  </span>
                )}
              </div>
            </div>

            {/* Reason */}
            <div className="grid gap-2">
              <Label className={errors.ErrorField?.reason ? "text-destructive" : ""}>
                Reason / Note
              </Label>
              <Input
                placeholder="e.g. Supplier delivery, expired item"
                className={errors.ErrorField?.reason ? "border-destructive focus-visible:ring-destructive" : ""}
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              />
              {errors.ErrorField?.reason && (
                <span className="text-[10px] font-medium text-destructive">
                  {errors.ErrorField.reason[0]}
                </span>
              )}
            </div>
          </div>

          <AlertDialogFooter className="flex items-center gap-2">
            <AlertDialogCancel disabled={submitLoading}>Cancel</AlertDialogCancel>
            <Button onClick={handleSubmit} disabled={submitLoading} className="h-10">
              {submitLoading ? <LoadingSpinner /> : "Submit Adjustment"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdjustmentPage;
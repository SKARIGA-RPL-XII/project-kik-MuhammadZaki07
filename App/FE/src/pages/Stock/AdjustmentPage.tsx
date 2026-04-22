import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Plus, Search, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { adjustmentService, Adjustment } from "@/services/adjustment.service";
import { stockService } from "@/services/stock.service";
import { UnitService } from "@/services/unit.service";
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
import { fromBaseValue } from "@/utils/unitHelper";
import { Textarea } from "@/components/ui/textarea";

const INITIAL_FORM = {
  stock_id: "",
  type: "in" as "in" | "out",
  amount: "" as string,
  unit_id: "",
  reason: "",
};

const AdjustmentPage: React.FC = () => {
  const { toast } = useToast();
  const [adjustments, setAdjustments] = useState<Adjustment[]>([]);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fetchData = async () => {
    try {
      const [stockRes, unitRes] = await Promise.all([
        stockService.getAll(0, 100),
        UnitService.getUnits(),
      ]);
      setStocks(stockRes.data);
      setUnits(unitRes.data);
    } catch (error) {
      console.error("Failed to fetch dependencies", error);
    }
  };

  const fetchAdjustments = useCallback(
    async (searchTerm: string = "") => {
      setLoading(true);
      try {
        const result = await adjustmentService.getAll(0, 50, searchTerm);
        setAdjustments(result.data);
      } catch (error) {
        toast("error", "Error", "Gagal memuat riwayat adjustment");
      } finally {
        setLoading(false);
      }
    },
    [toast],
  );

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => fetchAdjustments(search), 500);
    return () => clearTimeout(delayDebounceFn);
  }, [search, fetchAdjustments]);

  useEffect(() => {
    if (isModalOpen) fetchData();
  }, [isModalOpen]);

  const selectedStock = useMemo(
    () => stocks.find((s) => s.id === Number(formData.stock_id)),
    [formData.stock_id, stocks],
  );

  const filteredUnits = useMemo(() => {
    if (!selectedStock || !selectedStock.unit) return [];
    const stockMultiplier = Number(selectedStock.unit.multiplier);
    return units.filter(
      (u) =>
        u.category === selectedStock.unit?.category &&
        Number(u.multiplier) <= stockMultiplier,
    );
  }, [selectedStock, units]);

  const handleNumberChange = (value: string) => {
    let sanitized = value.replace(/[^0-9]/g, "");
    if (sanitized.length > 1 && sanitized.startsWith("0")) {
      sanitized = sanitized.replace(/^0+/, "");
    }
    setFormData((prev) => ({ ...prev, amount: sanitized }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.stock_id) newErrors.stock_id = "Pilih stok barang";
    if (!formData.unit_id) newErrors.unit_id = "Pilih satuan";
    if (!formData.amount || Number(formData.amount) <= 0) {
      newErrors.amount = "Jumlah harus lebih dari 0";
    } else if (formData.type === "out" && selectedStock) {
      const selectedUnit = units.find((u) => u.id === Number(formData.unit_id));
      const inputBaseQty =
        Number(formData.amount) * Number(selectedUnit?.multiplier || 1);
      const currentStockBaseQty = Number(selectedStock.quantity);

      if (inputBaseQty > currentStockBaseQty) {
        newErrors.amount = `Stok tidak cukup! (Max: ${fromBaseValue(
          currentStockBaseQty,
          Number(selectedUnit?.multiplier || 1),
        )} ${selectedUnit?.abbreviation})`;
      }
    }
    if (!formData.reason.trim()) newErrors.reason = "Alasan wajib diisi";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitLoading(true);
    try {
      const selectedUnit = units.find((u) => u.id === Number(formData.unit_id));
      await adjustmentService.create({
        stock_id: Number(formData.stock_id),
        type: formData.type,
        amount: Number(formData.amount) * Number(selectedUnit?.multiplier || 1),
        reason: formData.reason,
      });
      toast("success", "Berhasil", "Adjustment berhasil dicatat");
      setIsModalOpen(false);
      fetchAdjustments();
    } catch (error: any) {
      toast(
        "error",
        "Error",
        error.response?.data?.message || "Gagal menyimpan",
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <PageMeta title="Stock Adjustment" description="Track stock movements" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="lg:text-4xl text-2xl font-bold tracking-tight text-neutral-900">
            Stock Adjustment
          </h1>
          <p className="text-sm text-neutral-500">
            Kelola perubahan stok dengan validasi ketat.
          </p>
        </div>
        <ActionGuard module="stock adjustment" action="write">
          <Button
            onClick={() => {
              setFormData(INITIAL_FORM);
              setErrors({});
              setIsModalOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" /> Record Adjustment
          </Button>
        </ActionGuard>
      </div>

      <TableAdjustment
        data={adjustments}
        loading={loading}
        onRefresh={() => fetchAdjustments(search)}
      />

      <AlertDialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <AlertDialogContent className="max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>New Stock Adjustment</AlertDialogTitle>
          </AlertDialogHeader>

          <div className="grid gap-4 py-4 text-start">
            <div className="grid gap-2">
              <Label className={errors.stock_id ? "text-red-500" : ""}>
                Stok Barang
              </Label>
              <Select
                value={formData.stock_id}
                onValueChange={(val) =>
                  setFormData({
                    ...formData,
                    stock_id: val,
                    unit_id: "",
                    amount: "",
                  })
                }
              >
                <SelectTrigger
                  className={errors.stock_id ? "border-red-500" : ""}
                >
                  <SelectValue placeholder="Pilih barang..." />
                </SelectTrigger>
                <SelectContent>
                  {stocks.map((s) => (
                    <SelectItem key={s.id} value={s.id.toString()}>
                      {s.name} (Sisa:{" "}
                      {fromBaseValue(
                        Number(s.quantity),
                        Number(s.unit?.multiplier || 1),
                      )}{" "}
                      {s.unit?.abbreviation})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.stock_id && (
                <span className="text-xs text-red-500">{errors.stock_id}</span>
              )}
            </div>

            <div className="grid gap-2">
              <Label className={errors.unit_id ? "text-red-500" : ""}>
                1. Pilih Satuan Dulu
              </Label>
              <Select
                disabled={!formData.stock_id}
                value={formData.unit_id}
                onValueChange={(val) => {
                  setFormData({ ...formData, unit_id: val, amount: "" });
                  setErrors({});
                }}
              >
                <SelectTrigger
                  className={errors.unit_id ? "border-red-500" : ""}
                >
                  <SelectValue
                    placeholder={
                      formData.stock_id
                        ? "Pilih satuan..."
                        : "Pilih barang dulu"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {filteredUnits.map((u) => (
                    <SelectItem key={u.id} value={u.id.toString()}>
                      {u.name} ({u.abbreviation})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.unit_id && (
                <span className="text-xs text-red-500">{errors.unit_id}</span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>2. Tipe</Label>
                <Select
                  value={formData.type}
                  onValueChange={(val: "in" | "out") => {
                    setFormData({ ...formData, type: val, amount: "" });
                    setErrors({});
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in">
                      <div className="flex items-center gap-2">
                        <ArrowUpCircle className="w-4 h-4 text-green-500" />{" "}
                        <span>Masuk (+)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="out">
                      <div className="flex items-center gap-2">
                        <ArrowDownCircle className="w-4 h-4 text-red-500" />{" "}
                        <span>Keluar (-)</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label className={errors.amount ? "text-red-500" : ""}>
                  3. Jumlah
                </Label>
                <Input
                  type="text"
                  placeholder="0"
                  disabled={!formData.unit_id}
                  error={!!errors.amount}
                  value={formData.amount}
                  onChange={(e) => handleNumberChange(e.target.value)}
                />
              </div>
            </div>
            {errors.amount && (
              <span className="text-[11px] font-medium text-red-500 -mt-2">
                {errors.amount}
              </span>
            )}

            <div className="grid gap-2">
              <Label className={errors.reason ? "text-red-500" : ""}>
                Alasan
              </Label>
              <Textarea
                placeholder="Alasan adjustment..."
                error={!!errors.reason}
                value={formData.reason}
                onChange={(e) =>
                  setFormData({ ...formData, reason: e.target.value })
                }
              />
              {/* <Input
                placeholder="Alasan adjustment..."
                error={!!errors.reason}
                value={formData.reason}
                onChange={(e) =>
                  setFormData({ ...formData, reason: e.target.value })
                }
              /> */}
              {errors.reason && (
                <span className="text-xs text-red-500">{errors.reason}</span>
              )}
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitLoading}>
              Batal
            </AlertDialogCancel>
            <Button
              onClick={handleSubmit}
              disabled={submitLoading || !!errors.amount}
            >
              {submitLoading ? <LoadingSpinner /> : "Simpan Adjustment"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdjustmentPage;

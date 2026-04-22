import React, { useState, useEffect, useMemo } from "react";
import { Plus, Search } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { stockService } from "@/services/stock.service";
import { supplierService } from "@/services/supplier.service";
import { UnitService } from "@/services/unit.service";
import PageMeta from "@/components/common/PageMeta";
import TableStock from "@/components/tables/TableStock";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import LoadingSpinner from "@/components/skeleton/LoadingSpinner";
import { ActionGuard } from "@/components/guard/ActionGuard";
import { fromBaseValue } from "@/utils/unitHelper";

export interface Stock {
  id: number;
  name: string;
  unit_id: number;
  quantity: number | string;
  low_stock_threshold: number | string;
  supplier_id?: number | null;
  unit?: {
    id: number;
    name: string;
    abbreviation: string;
    multiplier: number | string;
  };
  supplier?: {
    id: number;
    name: string;
    contact_person: string;
    phone: string;
    address: string;
  };
}

const StockPage: React.FC = () => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [metadata, setMetadata] = useState({ page: 0, size: 10, total: 0 });

  const [formData, setFormData] = useState({
    name: "",
    qty_unit_id: "",
    min_unit_id: "",
    supplier_id: "",
    quantity: "" as string | number,
    low_stock_threshold: "" as string | number,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const fetchData = async () => {
    try {
      const [suppRes, unitRes] = await Promise.all([
        supplierService.getAll(0, 100),
        UnitService.getUnits(),
      ]);
      setSuppliers(suppRes.data || []);
      setUnits(unitRes.data || []);
    } catch (error) {
      console.error("Error fetching dependencies:", error);
    }
  };

  const fetchStocks = async (page: number = 0, searchTerm: string = "") => {
    setLoading(true);
    try {
      const result = await stockService.getAll(page, 10, searchTerm);
      setStocks(result.data);
      setMetadata(result.metadata);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const delayDebounceFn = setTimeout(() => {
      fetchStocks(0, search);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  // Logic Filtering Unit: Batas Min tidak boleh > Unit Utama
  const filteredMinUnits = useMemo(() => {
    const selectedQtyUnit = units.find((u) => u.id === parseInt(formData.qty_unit_id));
    if (!selectedQtyUnit) return [];

    return units.filter((u) => 
      u.category === selectedQtyUnit.category && 
      Number(u.multiplier) <= Number(selectedQtyUnit.multiplier)
    );
  }, [formData.qty_unit_id, units]);

  const handleOpenModal = (stock: Stock | null = null) => {
    if (stock) {
      const multiplier = Number(stock.unit?.multiplier) || 1;
      setSelectedStock(stock);
      setFormData({
        name: stock.name,
        qty_unit_id: stock.unit_id?.toString() || "",
        min_unit_id: stock.unit_id?.toString() || "",
        supplier_id: stock.supplier_id?.toString() || "",
        quantity: fromBaseValue(Number(stock.quantity), multiplier),
        low_stock_threshold: fromBaseValue(Number(stock.low_stock_threshold), multiplier),
      });
    } else {
      setSelectedStock(null);
      setFormData({
        name: "",
        qty_unit_id: "",
        min_unit_id: "",
        supplier_id: "",
        quantity: "",
        low_stock_threshold: "",
      });
    }
    setErrors({});
    setIsModalOpen(true);
  };

  const handleNumberChange = (value: string, field: string) => {
    let sanitized = value.replace(/[^0-9]/g, "");
    if (sanitized.length > 1 && sanitized.startsWith("0")) {
      sanitized = sanitized.replace(/^0+/, "");
    }
    setFormData((prev) => ({ ...prev, [field]: sanitized }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Nama stok wajib diisi";
    if (!formData.qty_unit_id) newErrors.qty_unit_id = "Pilih satuan stok";
    if (!formData.min_unit_id) newErrors.min_unit_id = "Pilih satuan batas";

    const qtyVal = Number(formData.quantity);
    const minVal = Number(formData.low_stock_threshold);

    if (!formData.quantity || qtyVal <= 0) newErrors.qty = "Stok awal harus > 0";
    if (!formData.low_stock_threshold || minVal <= 0) newErrors.min = "Batas harus > 0";

    if (formData.qty_unit_id && formData.min_unit_id && !newErrors.qty && !newErrors.min) {
      const qtyUnit = units.find((u) => u.id === parseInt(formData.qty_unit_id));
      const minUnit = units.find((u) => u.id === parseInt(formData.min_unit_id));

      if (qtyUnit && minUnit) {
        const baseQty = qtyVal * Number(qtyUnit.multiplier);
        const baseMin = minVal * Number(minUnit.multiplier);

        if (baseMin > baseQty) {
          newErrors.min = `Batas (${minVal} ${minUnit.abbreviation}) tidak boleh melebihi stok awal!`;
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitLoading(true);
    try {
      let payload: any;
      if (selectedStock) {
        payload = { name: formData.name };
        await stockService.update(selectedStock.id, payload);
      } else {
        const qtyUnit = units.find((u) => u.id === parseInt(formData.qty_unit_id));
        const minUnit = units.find((u) => u.id === parseInt(formData.min_unit_id));

        payload = {
          name: formData.name,
          unit_id: parseInt(formData.qty_unit_id),
          supplier_id: formData.supplier_id ? parseInt(formData.supplier_id) : null,
          quantity: Number(formData.quantity) * (Number(qtyUnit?.multiplier) || 1),
          low_stock_threshold: Number(formData.low_stock_threshold) * (Number(minUnit?.multiplier) || 1),
        };
        await stockService.create(payload);
      }
      setIsModalOpen(false);
      fetchStocks(metadata.page, search);
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <PageMeta title="Stock List" description="Manage stocks" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="lg:text-4xl text-2xl font-bold tracking-tight text-neutral-900">
            Stock List
          </h1>
          <p className="text-sm text-neutral-500">
            Kelola stok bahan baku dengan kontrol logika satuan yang ketat.
          </p>
        </div>
        <ActionGuard module="stock list" action="write">
          <Button className="h-10" onClick={() => handleOpenModal()}>
            <Plus className="w-4 h-4 mr-2" /> Add Stock
          </Button>
        </ActionGuard>
      </div>

      <div className="flex items-center relative max-w-sm">
        <Search className="absolute left-3 w-4 h-4 text-neutral-400" />
        <Input
          placeholder="Cari stok..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <TableStock
        data={stocks}
        loading={loading}
        onEdit={(stock) => handleOpenModal(stock)}
        onRefresh={() => fetchStocks(metadata.page, search)}
      />

      <AlertDialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <AlertDialogContent className="max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {selectedStock ? "Edit Nama Stok" : "Tambah Stok Baru"}
            </AlertDialogTitle>
          </AlertDialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>1. Nama Stok</Label>
              <Input
                placeholder="Contoh: Beras Ramos"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                error={!!errors.name}
              />
              {errors.name && <span className="text-xs text-red-500">{errors.name}</span>}
            </div>

            <div className="grid gap-2">
              <Label>2. Supplier</Label>
              <select
                className="flex h-10 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={formData.supplier_id}
                onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value })}
              >
                <option value="">Pembelian Pribadi</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <hr className="my-2" />

            <div className="grid grid-cols-12 gap-4 items-start">
              <div className="col-span-7 grid gap-2">
                <Label className={errors.qty ? "text-red-500" : ""}>3. Jumlah Stok Awal</Label>
                <Input
                  type="text"
                  placeholder="0"
                  disabled={!!selectedStock}
                  value={formData.quantity}
                  onChange={(e) => {
                    handleNumberChange(e.target.value, "quantity");
                    setErrors(prev => ({ ...prev, min: "" })); // Clear min error when qty changes
                  }}
                  error={!!errors.qty}
                />
              </div>
              <div className="col-span-5 grid gap-2">
                <Label>Satuan</Label>
                <select
                  disabled={!!selectedStock}
                  className={`flex h-10 w-full rounded-md border ${errors.qty_unit_id ? "border-red-500" : "border-neutral-200"} bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500`}
                  value={formData.qty_unit_id}
                  onChange={(e) => setFormData({ ...formData, qty_unit_id: e.target.value, min_unit_id: "", low_stock_threshold: "" })}
                >
                  <option value="">Pilih</option>
                  {units.map((u) => (
                    <option key={u.id} value={u.id}>{u.name} ({u.abbreviation})</option>
                  ))}
                </select>
              </div>
            </div>
            {errors.qty && <span className="text-[10px] text-red-500 -mt-3 ml-1">{errors.qty}</span>}

            <div className="grid grid-cols-12 gap-4 items-start">
              <div className="col-span-7 grid gap-2">
                <Label className={errors.min ? "text-red-500" : ""}>4. Batas Stok Minimum</Label>
                <Input
                  type="text"
                  placeholder="0"
                  disabled={!formData.qty_unit_id || !!selectedStock}
                  value={formData.low_stock_threshold}
                  onChange={(e) => handleNumberChange(e.target.value, "low_stock_threshold")}
                  error={!!errors.min}
                />
              </div>
              <div className="col-span-5 grid gap-2">
                <Label>Satuan</Label>
                <select
                  disabled={!formData.qty_unit_id || !!selectedStock}
                  className={`flex h-10 w-full rounded-md border ${errors.min_unit_id ? "border-red-500" : "border-neutral-200"} bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-neutral-50`}
                  value={formData.min_unit_id}
                  onChange={(e) => setFormData({ ...formData, min_unit_id: e.target.value })}
                >
                  <option value="">Pilih</option>
                  {filteredMinUnits.map((u) => (
                    <option key={u.id} value={u.id}>{u.name} ({u.abbreviation})</option>
                  ))}
                </select>
              </div>
            </div>
            {errors.min && <span className="text-[10px] font-medium text-red-500 -mt-3 ml-1">{errors.min}</span>}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitLoading}>Batal</AlertDialogCancel>
            <Button
              onClick={handleSubmit}
              disabled={submitLoading || !!errors.min || !!errors.qty}
              className="h-9 px-6"
            >
              {submitLoading ? <LoadingSpinner /> : selectedStock ? "Update Nama" : "Simpan Stok"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default StockPage;
import React, { useState, useEffect } from "react";
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
import PageMeta from "@/components/common/PageMeta";
import TableStock from "@/components/tables/TableStock";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import LoadingSpinner from "@/components/skeleton/LoadingSpinner";
import { ActionGuard } from "@/components/guard/ActionGuard";

export interface Stock {
  id: number;
  name: string;
  unit: string;
  quantity: number;
  low_stock_threshold: number;
}

const StockPage: React.FC = () => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [metadata, setMetadata] = useState({ page: 0, size: 10, total: 0 });

  const [formData, setFormData] = useState({
    name: "",
    unit: "",
    quantity: 0,
    low_stock_threshold: 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

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
    const delayDebounceFn = setTimeout(() => {
      fetchStocks(0, search);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  const handleOpenModal = (stock: Stock | null = null) => {
    if (stock) {
      setSelectedStock(stock);
      setFormData({
        name: stock.name,
        unit: stock.unit,
        quantity: stock.quantity,
        low_stock_threshold: stock.low_stock_threshold,
      });
    } else {
      setSelectedStock(null);
      setFormData({ name: "", unit: "", quantity: 0, low_stock_threshold: 10 });
    }
    setErrors({});
    setIsModalOpen(true);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Stock name is required";
    if (!formData.unit.trim()) newErrors.unit = "Unit is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitLoading(true);
    try {
      if (selectedStock) {
        await stockService.update(selectedStock.id, formData);
      } else {
        await stockService.create(formData);
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
          <h1 className="lg:text-4xl text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Stock List
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Manage your raw materials, monitor stock levels, and set low
            inventory alerts.
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
          placeholder="Search stock by name..."
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
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {selectedStock ? "Edit Stock Item" : "Create New Stock"}
            </AlertDialogTitle>
          </AlertDialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Stock Name</Label>
              <Input
                placeholder="e.g. Chicken Meat"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                error={!!errors.name}
              />
              {errors.name && (
                <span className="text-xs text-red-500">{errors.name}</span>
              )}
            </div>
            <div className="grid gap-2">
              <Label>Unit</Label>
              <Input
                placeholder="e.g. kg, pcs, ml"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                error={!!errors.unit}
              />
              {errors.unit && (
                <span className="text-xs text-red-500">{errors.unit}</span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Quantity</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData({ ...formData, quantity: e.target.valueAsNumber || 0 })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>Low Stock Threshold</Label>
                <Input
                  type="number"
                  placeholder="10"
                  value={formData.low_stock_threshold}
                  onChange={(e) =>
                    setFormData({ 
                      ...formData, 
                      low_stock_threshold: e.target.valueAsNumber || 0 
                    })
                  }
                />
              </div>
            </div>
          </div>
          <AlertDialogFooter className="flex items-center gap-2">
            <AlertDialogCancel disabled={submitLoading}>
              Cancel
            </AlertDialogCancel>
            <Button
              onClick={handleSubmit}
              disabled={submitLoading}
              className="h-9 px-6"
            >
              {submitLoading ? <LoadingSpinner /> : null}
              {selectedStock ? "Update Stock" : "Save Stock"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default StockPage;
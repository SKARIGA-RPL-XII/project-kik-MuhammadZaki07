import { useEffect, useState } from "react";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";
import Input from "../../components/form/input/InputField";
import { Plus } from "lucide-react";
import UnitTable from "../../components/tables/UnitTable";
import { useUnit } from "@/hooks/useUnit"; // Import hook React Query kita
import LoadingSpinner from "@/components/skeleton/LoadingSpinner";
import { ActionGuard } from "@/components/guard/ActionGuard";
import { useToast } from "@/context/ToastContext";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../../components/ui/alert-dialog";
import { Label } from "@/components/ui/label";

function UnitPage() {
  const { toast } = useToast();

  // State Logic
  const [search, setSearch] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState<Record<string, string>>({});

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    abbreviation: "",
    category: "weight",
    base_unit_id: "" as string | number,
    multiplier: 1,
  });

  // Hook React Query
  const {
    units,
    metadata,
    isLoading,
    handleSearch,
    handlePageChange,
    createUnit,
    updateUnit,
    refresh,
    isMutating,
  } = useUnit();

  // Debounce Search
  useEffect(() => {
    const timeout = setTimeout(() => {
      handleSearch(search);
    }, 500);
    return () => clearTimeout(timeout);
  }, [search]);

  const resetForm = () => {
    setFormData({
      name: "",
      abbreviation: "",
      category: "weight",
      base_unit_id: "",
      multiplier: 1,
    });
    setEditingId(null);
    setError({});
  };

  const handleEdit = (unit: any) => {
    setEditingId(unit.id);
    setFormData({
      name: unit.name,
      abbreviation: unit.abbreviation,
      category: unit.category,
      base_unit_id: unit.base_unit_id || "",
      multiplier: unit.multiplier,
    });
    setOpenDialog(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError({});

    const action = editingId
      ? updateUnit({ id: editingId, payload: formData })
      : createUnit(formData);

    try {
      await action;
      toast(
        "success",
        "Success",
        `Unit ${editingId ? "updated" : "created"} successfully`,
      );
      setOpenDialog(false);
      resetForm();
    } catch (err: any) {
      const serverErrors = err?.response?.data?.errors;
      if (serverErrors) {
        const validationErrors: Record<string, string> = {};
        Object.entries(serverErrors).forEach(([key, val]) => {
          validationErrors[key] = Array.isArray(val) ? val[0] : (val as string);
        });
        setError(validationErrors);
      }
      toast(
        "error",
        "Failed",
        err?.response?.data?.message || "Something went wrong",
      );
    }
  };

  const totalPage = Math.ceil(metadata.total / metadata.size) || 1;

  return (
    <>
      <PageMeta
        title="Unit Management"
        description="Manage stock units and conversions"
      />
      <PageBreadcrumb pageTitle="Units" />

      <ComponentCard
        title="Management Unit"
        desc="Manage weight, volume, and piece units"
      >
        <div className="flex justify-between items-center gap-4 mb-4">
          <Input
            type="text"
            placeholder="Search unit (name/abbr)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-sm"
          />

          <ActionGuard module="units" action="write">
            <AlertDialog
              open={openDialog}
              onOpenChange={(val) => {
                setOpenDialog(val);
                if (!val) resetForm();
              }}
            >
              <AlertDialogTrigger asChild>
                <Button className="h-10" onClick={resetForm}>
                  Create <Plus className="ml-1" size={18} />
                </Button>
              </AlertDialogTrigger>

              <AlertDialogContent className="max-w-md">
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {editingId ? "Edit Unit Configuration" : "Create New Unit"}
                  </AlertDialogTitle>
                </AlertDialogHeader>

                <form onSubmit={handleSubmit} className="space-y-5 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="unit_name">Unit Name</Label>
                    <Input
                      id="unit_name"
                      placeholder="e.g. Kilogram, Liter, or Box"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      error={!!error.name}
                    />
                    {error.name && (
                      <p className="text-xs text-red-500">{error.name}</p>
                    )}
                    <p className="text-[11px] text-neutral-500">
                      Gunakan nama lengkap satuan (bukan singkatan).
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="abbr">Abbreviation</Label>
                      <Input
                        id="abbr"
                        placeholder="e.g. kg, ml, pcs"
                        value={formData.abbreviation}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            abbreviation: e.target.value,
                          })
                        }
                        error={!!error.abbreviation}
                      />
                      {error.abbreviation && (
                        <p className="text-xs text-red-500">
                          {error.abbreviation}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Unit Category</Label>
                      <select
                        className="w-full h-10 rounded-md border border-neutral-200 bg-transparent px-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none dark:border-white/10 dark:bg-neutral-900"
                        value={formData.category}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            category: e.target.value as any,
                            base_unit_id: "",
                          })
                        }
                      >
                        <option value="weight">Weight (Berat)</option>
                        <option value="volume">Volume (Cair)</option>
                        <option value="unit">Unit (Biji/Pcs)</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Base Unit Reference</Label>
                    <select
                      className="w-full h-10 rounded-md border border-neutral-200 bg-transparent px-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none dark:border-white/10 dark:bg-neutral-900"
                      value={formData.base_unit_id}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          base_unit_id: e.target.value,
                        })
                      }
                    >
                      <option value="">
                        Set as Base Unit (Satuan Terkecil)
                      </option>
                      {units
                        .filter(
                          (u) =>
                            u.category === formData.category &&
                            u.id !== editingId,
                        )
                        .map((u) => (
                          <option key={u.id} value={u.id}>
                            Reference to: {u.name} ({u.abbreviation})
                          </option>
                        ))}
                    </select>
                    <p className="text-[11px] text-neutral-500 italic">
                      Kosongkan jika unit ini adalah satuan terkecil (seperti
                      Gram atau Ml).
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="multiplier">Conversion Multiplier</Label>
                    <Input
                      id="multiplier"
                      type="number"
                      step="0.0001"
                      disabled={!formData.base_unit_id}
                      value={formData.base_unit_id ? formData.multiplier : 1}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          multiplier: parseFloat(e.target.value),
                        })
                      }
                      error={!!error.multiplier}
                    />
                    <p className="text-[11px] text-blue-500 font-medium">
                      {!formData.base_unit_id
                        ? "Base unit multiplier otomatis 1."
                        : `Info: 1 ${formData.abbreviation || "Unit"} = ${
                            formData.multiplier
                          } x Satuan Dasar.`}
                    </p>
                  </div>

                  <AlertDialogFooter className="mt-6 gap-2">
                    <AlertDialogCancel
                      type="button"
                      disabled={isMutating}
                      onClick={resetForm}
                    >
                      Batal
                    </AlertDialogCancel>
                    <Button type="submit" disabled={isMutating}>
                      {isMutating ? (
                        <Loader2 className="animate-spin" />
                      ) : editingId ? (
                        "Update Data"
                      ) : (
                        "Simpan Unit"
                      )}
                    </Button>
                  </AlertDialogFooter>
                </form>
              </AlertDialogContent>
            </AlertDialog>
          </ActionGuard>
        </div>

        <UnitTable
          units={units}
          loading={isLoading}
          onRefresh={refresh}
          onEdit={handleEdit}
        />

        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-neutral-500 font-medium">
            Showing {units.length} of {metadata.total} items (Page{" "}
            {metadata.page} of {totalPage})
          </p>

          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={metadata.page === 1 || isLoading}
              onClick={() => handlePageChange(metadata.page - 1)}
            >
              Prev
            </Button>

            <Button
              size="sm"
              variant="outline"
              disabled={metadata.page >= totalPage || isLoading}
              onClick={() => handlePageChange(metadata.page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </ComponentCard>
    </>
  );
}

export default UnitPage;

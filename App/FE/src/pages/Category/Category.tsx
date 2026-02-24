import { useEffect, useState } from "react";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";
import CategoryTable from "../../components/tables/CategoryTable";
import Input from "../../components/form/input/InputField";
import { Plus } from "lucide-react";
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
import { useToast } from "@/context/ToastContext";
import LoadingSpinner from "@/components/skeleton/LoadingSpinner";
import { ActionGuard } from "@/components/guard/ActionGuard";
import { useCategories, useCategoryMutations } from "@/hooks/react-query/useCategory";

function Category() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(0);

  const [openDialog, setOpenDialog] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState<Record<string, string>>({});
  
  const { toast } = useToast();

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(0);
    }, 500);
    return () => clearTimeout(timeout);
  }, [search]);

  const { data: categoryRes, isLoading: loading, refetch } = useCategories({
    page,
    size: 10,
    search: debouncedSearch,
  });

  const { createCategory, updateCategory } = useCategoryMutations();

  const categories = categoryRes?.data || [];
  const totalItems = categoryRes?.total || 0;
  const totalPage = Math.ceil(totalItems / 10) || 1;

  const resetForm = () => {
    setCategoryName("");
    setIsActive(true);
    setEditingId(null);
    setError({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError({});

    const payload = { name: categoryName, is_active: isActive ? 1 : 0 };

    const mutation = editingId 
      ? updateCategory 
      : createCategory;

    mutation.mutate(
      editingId ? { id: editingId, payload } : payload,
      {
        onSuccess: () => {
          toast("success", "Success", `Category ${editingId ? 'updated' : 'created'} successfully`);
          setOpenDialog(false);
          resetForm();
        },
        onError: (err: any) => {
          const serverErrors = err?.response?.data?.errors;
          const message = err?.response?.data?.message || "Something went wrong";

          if (serverErrors) {
            const validationErrors: Record<string, string> = {};
            Object.entries(serverErrors).forEach(([key, val]) => {
              validationErrors[key] = Array.isArray(val) ? val[0] : (val as string);
            });
            setError(validationErrors);
          }
          toast("error", "Action Failed", message);
        }
      }
    );
  };

  const handleEdit = (cat: any) => {
    setEditingId(cat.id);
    setCategoryName(cat.name);
    setIsActive(cat.is_active === 1 || cat.is_active === true);
    setError({});
    setOpenDialog(true);
  };

  const isSubmitting = createCategory.isPending || updateCategory.isPending;

  return (
    <>
      <PageMeta title="Category Management" description="Manage product categories" />
      <PageBreadcrumb pageTitle="Category" />
      
      <ComponentCard
        title="Management Category"
        desc="Manage categories for menu products"
      >
        <div className="flex justify-between items-center gap-4 mb-4">
          <Input
            type="text"
            placeholder="Search category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-sm rounded border px-3 py-2 text-sm"
          />

          <ActionGuard module="category" action="write">
            <AlertDialog
              open={openDialog}
              onOpenChange={(val) => {
                setOpenDialog(val);
                if (!val) resetForm();
              }}
            >
              <AlertDialogTrigger asChild>
                <Button className="h-10" onClick={resetForm}>
                  Create <Plus className="ml-1" />
                </Button>
              </AlertDialogTrigger>

              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {editingId ? "Edit Category" : "Create Category"}
                  </AlertDialogTitle>
                </AlertDialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <Input
                      label="Category Name"
                      placeholder="Enter category name"
                      value={categoryName}
                      error={!!error.name}
                      onChange={(e) => {
                        setCategoryName(e.target.value);
                        if (error.name) {
                          const newErrors = { ...error };
                          delete newErrors.name;
                          setError(newErrors);
                        }
                      }}
                    />
                    {error.name && <p className="text-sm text-red-500">{error.name}</p>}
                  </div>

                  <Switch
                    label={isActive ? "Active" : "Inactive"}
                    checked={isActive}
                    onChange={(checked) => setIsActive(checked)}
                  />

                  <AlertDialogFooter className="gap-2 mt-4 flex items-center">
                    <AlertDialogCancel
                      type="button"
                      disabled={isSubmitting}
                      onClick={resetForm}
                    >
                      Batal
                    </AlertDialogCancel>

                    <Button type="submit" className="h-10" disabled={isSubmitting}>
                      {isSubmitting ? <LoadingSpinner /> : "Submit"}
                    </Button>
                  </AlertDialogFooter>
                </form>
              </AlertDialogContent>
            </AlertDialog>
          </ActionGuard>
        </div>

        <CategoryTable
          categories={categories}
          loading={loading}
          onRefresh={refetch}
          onEdit={handleEdit}
        />

        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-neutral-500 font-medium">
            Showing {categories.length} of {totalItems} items (Page {page + 1} of {totalPage})
          </p>

          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={page === 0 || loading}
              onClick={() => setPage((p) => p - 1)}
            >
              Prev
            </Button>

            <Button
              size="sm"
              variant="outline"
              disabled={page + 1 >= totalPage || loading}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </ComponentCard>
    </>
  );
}

export default Category;
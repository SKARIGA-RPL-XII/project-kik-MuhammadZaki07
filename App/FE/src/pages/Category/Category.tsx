import { useEffect, useState } from "react";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";
import { CategoryService } from "../../services/category.service";
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

function Category() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [page, setPage] = useState(0);
  const size = 10;

  const [total, setTotal] = useState(0);
  const totalPage = Math.ceil(total / size);

  const [openDialog, setOpenDialog] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    const res = await CategoryService.getCategories({
      page,
      size,
      search: debouncedSearch,
    });
    if (res.data) {
      setCategories(res.data);
      setTotal(res.total);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, [page, debouncedSearch]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(0);
    }, 500);
    return () => clearTimeout(timeout);
  }, [search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) {
      setError("Category name wajib diisi");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const payload = { name: categoryName, is_active: isActive };

      if (editingId) {
        await CategoryService.updateCategory(editingId, payload);
      } else {
        await CategoryService.createCategory(payload);
      }

      setOpenDialog(false);
      setCategoryName("");
      setIsActive(true);
      setEditingId(null);
      fetchCategories();
    } catch (e: any) {
      if (e?.response?.data?.data?.errors) {
        const messages = Object.values(e.response.data.data.errors)
          .flat()
          .join(", ");
        setError(messages);
      } else if (e?.response?.data?.message) {
        setError(e.response.data.message);
      } else {
        setError("Gagal menyimpan category");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (cat: any) => {
    setEditingId(cat.id);
    setCategoryName(cat.name);
    setIsActive(cat.is_active ?? true);
    setError("");
    setOpenDialog(true);
  };

  //   const { toast } = useToast();

  // toast(
  //   "success",
  //   "Success 🎉",
  //   "Room created successfully"
  // );

  return (
    <>
      <PageMeta
        title="Category Management"
        description="Manage product categories"
      />
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

          <AlertDialog open={openDialog} onOpenChange={setOpenDialog}>
            <AlertDialogTrigger asChild>
              <Button
                className="h-10"
                onClick={() => {
                  setEditingId(null);
                  setCategoryName("");
                  setIsActive(true);
                  setError("");
                }}
              >
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
                    placeholder="Category name"
                    value={categoryName}
                    onChange={(e) => {
                      setCategoryName(e.target.value);
                      setError("");
                    }}
                  />
                  {error && <p className="text-sm text-red-500">{error}</p>}
                </div>

                <Switch
                  label={isActive ? "Active" : "Inactive"}
                  checked={isActive}
                  onChange={(checked) => setIsActive(checked)}
                />

                <AlertDialogFooter className="justify-between mt-4">
                  <AlertDialogCancel
                    disabled={submitting}
                    onClick={() => {
                      setCategoryName("");
                      setIsActive(true);
                      setEditingId(null);
                      setError("");
                    }}
                  >
                    Batal
                  </AlertDialogCancel>

                  <Button type="submit" disabled={submitting}>
                    {submitting ? "Menyimpan..." : "Submit"}
                  </Button>
                </AlertDialogFooter>
              </form>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <CategoryTable
          categories={categories}
          loading={loading}
          onRefresh={fetchCategories}
          onEdit={handleEdit}
        />

        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-neutral-500">
            Page {page + 1} of {totalPage} — Total {total} data
          </p>

          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
            >
              Prev
            </Button>

            <Button
              size="sm"
              variant="outline"
              disabled={page + 1 >= totalPage}
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

import { useEffect, useState } from "react";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";
import Input from "../../components/form/input/InputField";
import { Plus } from "lucide-react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { AdminService } from "../../services/admin.service";
import AdminTable from "@/components/tables/adminTable";

function Admin() {
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [page, setPage] = useState(1);
  const size = 10;

  const [total, setTotal] = useState(0);
  const totalPage = Math.ceil(total / size);

  const [openDialog, setOpenDialog] = useState(false);
  const [editingData, setEditingData] = useState<any | null>(null);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<any>({});
  const [submitting, setSubmitting] = useState(false);

  const fetchAdmins = async () => {
    setLoading(true);

    const res = await AdminService.getAll({
      page,
      search: debouncedSearch,
    });

    if (res?.data) {
      setAdmins(res.data.data);
      setTotal(res.data.total);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchAdmins();
  }, [page, debouncedSearch]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);

    return () => clearTimeout(timeout);
  }, [search]);

  const resetForm = () => {
    setForm({
      email: "",
      password: "",
    });
    setErrors({});
    setEditingData(null);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});

    let res;

    if (editingData) {
      res = await AdminService.update(editingData.id, {
        email: form.email,
        password: form.password || undefined,
      });
    } else {
      res = await AdminService.create({
        email: form.email,
        password: form.password,
      });
    }

    if (res.error) {
      setErrors(res.error);
      setSubmitting(false);
      return;
    }

    handleCloseDialog();
    fetchAdmins();
    setSubmitting(false);
  };

  const handleEdit = (data: any) => {
    setEditingData(data);
    setForm({
      email: data.email,
      password: "",
    });
    setOpenDialog(true);
  };

  return (
    <>
      <PageMeta title="Admin Management" description="Manage Admins" />
      <PageBreadcrumb pageTitle="Admin" />

      <ComponentCard title="Management Admin" desc="Manage all Admin data">
        <div className="flex justify-between items-center mb-4">
          <Input
            type="text"
            placeholder="Search email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-72"
          />

          <AlertDialog open={openDialog} onOpenChange={setOpenDialog}>
            <AlertDialogTrigger asChild>
              <Button className="h-10" onClick={resetForm}>
                Create <Plus className="ml-1" />
              </Button>
            </AlertDialogTrigger>

            <AlertDialogContent className="max-w-md">
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {editingData ? "Edit Admin" : "Create Admin"}
                </AlertDialogTitle>
              </AlertDialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="email"
                    value={form.email}
                    placeholder="Email"
                    error={errors?.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                  />
                  {errors?.email && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.email[0]}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium">
                    Password{" "}
                    {!editingData && <span className="text-red-500">*</span>}
                  </label>
                  <Input
                    type="password"
                    placeholder="Password"
                    value={form.password}
                    error={errors?.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                  />
                  {errors?.password && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.password[0]}
                    </p>
                  )}
                </div>

                <AlertDialogFooter className="flex mt-4 items-center">
                  <AlertDialogCancel
                    disabled={submitting}
                    onClick={handleCloseDialog}
                  >
                    Cancel
                  </AlertDialogCancel>

                  <Button type="submit" disabled={submitting} className="h-10">
                    {submitting ? "Saving..." : "Submit"}
                  </Button>
                </AlertDialogFooter>
              </form>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <AdminTable
          admins={admins}
          loading={loading}
          onRefresh={fetchAdmins}
          onEdit={handleEdit}
        />

        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-neutral-500">
            Page {page} of {totalPage || 1} — Total {total} data
          </p>

          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Prev
            </Button>

            <Button
              size="sm"
              variant="outline"
              disabled={page >= totalPage}
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

export default Admin;

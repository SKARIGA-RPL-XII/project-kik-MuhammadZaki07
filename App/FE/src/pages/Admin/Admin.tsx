import { useEffect, useState, useRef } from "react";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";
import Input from "../../components/form/input/InputField";
import {
  Plus,
  Download,
  FileSpreadsheet,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { AdminService } from "../../services/admin.service";
import AdminTable from "@/components/tables/AdminTable";
import Select from "@/components/form/Select";
import { useToast } from "@/context/ToastContext";
import { ActionGuard } from "@/components/guard/ActionGuard";
import { useAdmins, useAdminMutations } from "@/hooks/react-query/useAdmin";

function Admin() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);

  const [openDialog, setOpenDialog] = useState(false);
  const [openImportDialog, setOpenImportDialog] = useState(false);
  const [editingData, setEditingData] = useState<any | null>(null);

  const [form, setForm] = useState({ email: "", username: "", password: "" });
  const [errors, setErrors] = useState<any>({});
  const [exporting, setExporting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [mapping, setMapping] = useState({ email: "", username: "" });
  const { toast } = useToast();

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(timeout);
  }, [search]);

  const { data, isLoading } = useAdmins({
    page,
    search: debouncedSearch,
  });

  const { createAdmin, updateAdmin, importAdmin } = useAdminMutations();

  const admins = data?.admins || [];
  const total = data?.total || 0;
  const totalPage = data?.totalPage || 0;

  const handleExport = async () => {
    if (exporting) return;
    setExporting(true);
    try {
      await AdminService.export();
      toast(
        "success",
        "Export Started",
        "Proses export sedang berjalan di latar belakang."
      );
    } catch (error) {
      toast("error", "Export Failed", "Terjadi kesalahan saat memulai export.");
    } finally {
      setExporting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const rows = text.split("\n").filter((row) => row.trim() !== "");
      if (rows.length === 0) return;

      const headers = rows[0].split(",").map((h) => h.trim());
      const data = rows.slice(1).map((row) => {
        const values = row.split(",").map((v) => v.trim());
        return headers.reduce((obj: any, header, index) => {
          obj[header] = values[index];
          return obj;
        }, {});
      });

      setCsvHeaders(headers);
      setCsvData(data);
      setOpenImportDialog(true);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleImportSubmit = () => {
    const payload = {
      data: csvData.map((row) => ({
        email: row[mapping.email],
        username: row[mapping.username],
      })),
    };

    importAdmin.mutate(payload, {
      onSuccess: () => {
        setOpenImportDialog(false);
        setMapping({ email: "", username: "" });
        setCsvHeaders([]);
        setCsvData([]);
        toast("success", "Import Success", "Data admin berhasil diimport.");
      },
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (editingData) {
      updateAdmin.mutate(
        {
          id: editingData.id,
          payload: { ...form, password: form.password || undefined },
        },
        {
          onSuccess: (res) => {
            if (res?.error) {
              setErrors(res.error);
            } else {
              setOpenDialog(false);
              setEditingData(null);
              setForm({ email: "", username: "", password: "" });
              toast("success", "Success", "Admin updated");
            }
          },
        }
      );
    } else {
      createAdmin.mutate(form as any, {
        onSuccess: (res) => {
          if (res?.error) {
            setErrors(res.error);
          } else {
            setOpenDialog(false);
            setForm({ email: "", username: "", password: "" });
            toast("success", "Success", "Admin created");
          }
        },
      });
    }
  };

  const isSubmitting = createAdmin.isPending || updateAdmin.isPending || importAdmin.isPending;

  return (
    <>
      <PageMeta title="Admin Management" description="Manage Admins" />
      <PageBreadcrumb pageTitle="Admin" />

      <ComponentCard title="Management Admin" desc="Manage all Admin data">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
          <Input
            type="text"
            placeholder="Search email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-72"
          />

          <div className="flex items-center gap-2 w-full md:w-auto">
            <input
              type="file"
              accept=".csv"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
            />

            <ActionGuard module="admin" action="write">
              <Button
                variant="outline"
                className="flex-1 md:flex-none gap-2 h-10"
                onClick={() => fileInputRef.current?.click()}
              >
                Import <FileSpreadsheet className="ml-2" size={18} />
              </Button>
            </ActionGuard>

            <ActionGuard module="admin" action="view">
              <Button
                variant="outline"
                className="flex-1 md:flex-none gap-2 h-10"
                onClick={handleExport}
                disabled={exporting}
              >
                {exporting ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <Download size={18} />
                )}
                Export
              </Button>
            </ActionGuard>

            <ActionGuard module="admin" action="write">
              <AlertDialog open={openDialog} onOpenChange={setOpenDialog}>
                <AlertDialogTrigger asChild>
                  <Button
                    className="flex-1 md:flex-none gap-2 h-10"
                    onClick={() => {
                      setEditingData(null);
                      setForm({ email: "", username: "", password: "" });
                      setErrors({});
                    }}
                  >
                    <Plus size={18} /> Create
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="max-w-md">
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      {editingData ? "Update Admin" : "Register Admin"}
                    </AlertDialogTitle>
                  </AlertDialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Username <span className="text-red-500">*</span>
                      </label>
                      <Input
                        placeholder="Enter username"
                        value={form.username}
                        onChange={(e) =>
                          setForm({ ...form, username: e.target.value })
                        }
                      />
                      {errors?.username && (
                        <p className="text-xs text-red-500">
                          {errors.username[0]}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="email"
                        placeholder="admin@example.com"
                        value={form.email}
                        onChange={(e) =>
                          setForm({ ...form, email: e.target.value })
                        }
                      />
                      {errors?.email && (
                        <p className="text-xs text-red-500">{errors.email[0]}</p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Password{" "}
                        {!editingData && <span className="text-red-500">*</span>}
                      </label>
                      <Input
                        type="password"
                        placeholder={
                          editingData
                            ? "Leave blank to keep current"
                            : "Min. 6 characters"
                        }
                        value={form.password}
                        onChange={(e) =>
                          setForm({ ...form, password: e.target.value })
                        }
                      />
                      {errors?.password && (
                        <p className="text-xs text-red-500">
                          {errors.password[0]}
                        </p>
                      )}
                    </div>

                    <AlertDialogFooter className="pt-4 gap-2">
                      <AlertDialogCancel onClick={() => setOpenDialog(false)}>
                        Cancel
                      </AlertDialogCancel>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? (
                          <div className="flex items-center gap-2">
                            <Loader2 className="animate-spin" size={16} />{" "}
                            Saving...
                          </div>
                        ) : (
                          "Save Admin"
                        )}
                      </Button>
                    </AlertDialogFooter>
                  </form>
                </AlertDialogContent>
              </AlertDialog>
            </ActionGuard>
          </div>
        </div>

        <AdminTable
          admins={admins}
          loading={isLoading}
          onRefresh={() => {}}
          onEdit={(data) => {
            setEditingData(data);
            setForm({
              email: data.email,
              username: data.username,
              password: "",
            });
            setErrors({});
            setOpenDialog(true);
          }}
          page={page}
        />

        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-gray-500">
            Showing {(page - 1) * 10 + 1} to {(page - 1) * 10 + admins.length} of {total}
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

      <AlertDialog open={openImportDialog} onOpenChange={setOpenImportDialog}>
        <AlertDialogContent className="max-w-lg">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-brand-500/10 rounded-full text-brand-500">
                <FileSpreadsheet size={24} />
              </div>
              <AlertDialogTitle>Map CSV Columns</AlertDialogTitle>
            </div>
            <AlertDialogDescription>
              Cocokkan header dari file CSV Anda dengan kolom data di sistem.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="grid gap-5 py-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Username Column <span className="text-red-500">*</span>
              </label>
              <Select
                value={mapping.username}
                onChange={(val) => setMapping({ ...mapping, username: val })}
                options={csvHeaders.map((h) => ({ value: h, label: h }))}
                placeholder="Select Username Header"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Email Column <span className="text-red-500">*</span>
              </label>
              <Select
                value={mapping.email}
                onChange={(val) => setMapping({ ...mapping, email: val })}
                options={csvHeaders.map((h) => ({ value: h, label: h }))}
                placeholder="Select Email Header"
              />
            </div>
          </div>

          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="h-11">Discard</AlertDialogCancel>
            <Button
              onClick={handleImportSubmit}
              disabled={!mapping.email || !mapping.username || isSubmitting}
              className="h-11 gap-2 min-w-[140px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={18} /> Importing...
                </>
              ) : (
                <>
                  <CheckCircle2 size={18} /> Start Import
                </>
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default Admin;
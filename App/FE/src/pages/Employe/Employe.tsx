import { useEffect, useState, useRef } from "react";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";
import Input from "../../components/form/input/InputField";
import { Plus, Download, FileSpreadsheet, Loader2 } from "lucide-react";
import { EmployeService } from "../../services/employe.service";
const loadXLSX = async () => {
  const mod = await import("xlsx");
  return mod;
};
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Select from "../../components/form/Select";
import EmployeTable from "../../components/tables/EmployeTable";
import TextArea from "../../components/form/input/TextArea";
import { useToast } from "@/context/ToastContext";
import Label from "@/components/form/Label";
import LoadingSpinner from "@/components/skeleton/LoadingSpinner";
import { ActionGuard } from "@/components/guard/ActionGuard";
import {
  useEmployes,
  useEmployeMutations,
} from "@/hooks/react-query/useEmploye";

function Employe() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [genderFilter, setGenderFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage] = useState(1);
  const size = 10;

  const [openDialog, setOpenDialog] = useState(false);
  const [openImport, setOpenImport] = useState(false);
  const [editingData, setEditingData] = useState<any | null>(null);
  const { toast } = useToast();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    password_confirmation: "",
    addres: "",
    no_tlp: "",
    gender: "",
    role_id: "",
  });

  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [identityCard, setIdentityCard] = useState<File | null>(null);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [identityPreview, setIdentityPreview] = useState<string | null>(null);

  const [errors, setErrors] = useState<any>({});
  const [exporting, setExporting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [excelData, setExcelData] = useState<any[]>([]);
  const [excelHeaders, setExcelHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState({
    username: "",
    email: "",
    gender: "",
    no_tlp: "",
    addres: "",
  });

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(timeout);
  }, [search]);

  const { data, isLoading } = useEmployes({
    page,
    size,
    search: debouncedSearch,
    gender: genderFilter || undefined,
    role_id: roleFilter || undefined,
  });

  const { createEmploye, updateEmploye, importEmploye } = useEmployeMutations();

  const employes = data?.employes || [];
  const total = data?.metadata?.total || 0;
  const totalPage = Math.ceil(total / size);

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "profile" | "identity",
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === "profile") {
          setProfileImage(file);
          setProfilePreview(reader.result as string);
        } else {
          setIdentityCard(file);
          setIdentityPreview(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileImportChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = async (evt) => {
      const XLSX = await loadXLSX();

      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: "binary" });

      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];

      const dataJson = XLSX.utils.sheet_to_json(ws);

      if (dataJson.length > 0) {
        setExcelData(dataJson);
        setExcelHeaders(Object.keys(dataJson[0]));
        setOpenImport(true);
      }
    };

    reader.readAsBinaryString(file);
    e.target.value = "";
  };

  const handleProcessImport = () => {
    if (excelData.length === 0) return;

    const formattedData = excelData.map((row) => ({
      username: row[mapping.username],
      email: row[mapping.email],
      gender: row[mapping.gender],
      no_tlp: row[mapping.no_tlp],
      addres: row[mapping.addres],
    }));

    importEmploye.mutate(
      { data: formattedData },
      {
        onSuccess: () => {
          toast("success", "Berhasil", "Data employee berhasil diimport.");
          setOpenImport(false);
          setExcelData([]);
          setExcelHeaders([]);
        },
        onError: (err: any) => {
          toast("error", "Import Gagal", "Periksa kembali mapping kolom Anda.");
          setErrors(err);
        },
      },
    );
  };

  const handleExport = async () => {
    setExporting(true);
    const res = await EmployeService.exportEmploye();
    if (res.data) {
      toast(
        "success",
        "Export Diproses",
        "Silakan cek menu notifikasi untuk mendownload file.",
      );
    } else if (res.error) {
      toast("error", "Export Gagal", res.error);
    }
    setExporting(false);
  };

  const resetForm = () => {
    setForm({
      username: "",
      email: "",
      password: "",
      password_confirmation: "",
      addres: "",
      no_tlp: "",
      gender: "",
      role_id: "",
    });
    setProfileImage(null);
    setIdentityCard(null);
    setProfilePreview(null);
    setIdentityPreview(null);
    setErrors({});
    setEditingData(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (value) formData.append(key, value);
    });
    if (profileImage) formData.append("profile_image", profileImage);
    if (identityCard) formData.append("identity_card", identityCard);

    if (editingData) {
      updateEmploye.mutate(
        { id: editingData.id, formData },
        {
          onSuccess: () => {
            setOpenDialog(false);
            resetForm();
            toast("success", "Success", "Data berhasil diperbarui");
          },
          onError: (err: any) => setErrors(err),
        },
      );
    } else {
      createEmploye.mutate(formData, {
        onSuccess: () => {
          setOpenDialog(false);
          resetForm();
          toast("success", "Success", "Data berhasil disimpan");
        },
        onError: (err: any) => setErrors(err),
      });
    }
  };

  const isSubmitting =
    createEmploye.isPending ||
    updateEmploye.isPending ||
    importEmploye.isPending;

  return (
    <>
      <PageMeta title="Employe Management" description="Manage employes" />
      <PageBreadcrumb pageTitle="Employe" />

      <ComponentCard title="Management Employe" desc="Manage all employe data">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
          <div className="flex gap-3">
            <Input
              placeholder="Search username..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Select
              value={genderFilter}
              onChange={(val: any) => setGenderFilter(val)}
              placeholder="Gender"
              options={[
                { label: "All", value: "" },
                { label: "Laki-laki", value: "LK" },
                { label: "Perempuan", value: "PR" },
              ]}
            />
          </div>

          <div className="flex gap-2">
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileImportChange}
            />

            <ActionGuard module="staff" action="write">
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                Import <FileSpreadsheet className="ml-2" size={18} />
              </Button>
            </ActionGuard>

            <ActionGuard module="staff" action="view">
              <Button
                variant="outline"
                onClick={handleExport}
                disabled={exporting}
              >
                {exporting ? (
                  <Loader2 className="animate-spin mr-2" size={18} />
                ) : (
                  <Download className="mr-2" size={18} />
                )}{" "}
                Export
              </Button>
            </ActionGuard>

            <ActionGuard module="staff" action="write">
              <Button
                onClick={() => {
                  resetForm();
                  setOpenDialog(true);
                }}
              >
                <Plus className="mr-2" size={18} /> Create
              </Button>
            </ActionGuard>
          </div>
        </div>

        <EmployeTable
          employes={employes}
          loading={isLoading}
          onRefresh={() => {}}
          onEdit={(data) => {
            setEditingData(data);
            setForm({
              username: data.user?.username ?? "",
              email: data.user?.email ?? "",
              password: "",
              password_confirmation: "",
              addres: data.addres ?? "",
              no_tlp: data.no_tlp?.toString() ?? "",
              gender: data.gender ?? "",
              role_id: data.user?.role_id?.toString() ?? "",
            });
            setOpenDialog(true);
          }}
        />

        <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4 border-t border-gray-100 pt-6">
          <div className="text-sm text-neutral-500">
            Showing{" "}
            <span className="font-semibold text-neutral-700">
              {Math.min((page - 1) * size + 1, total)}
            </span>{" "}
            to{" "}
            <span className="font-semibold text-neutral-700">
              {Math.min(page * size, total)}
            </span>{" "}
            of <span className="font-semibold text-neutral-700">{total}</span>{" "}
            entries
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="h-9 w-9 p-0"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              &lt;
            </Button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPage }, (_, i) => i + 1)
                .filter((p) => p >= page - 1 && p <= page + 1)
                .map((p) => (
                  <Button
                    key={p}
                    size="sm"
                    variant={page === p ? "primary" : "outline"}
                    className={`h-9 w-9 p-0 ${page === p ? "bg-blue-600 text-white" : ""}`}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </Button>
                ))}
            </div>

            <Button
              size="sm"
              variant="outline"
              className="h-9 w-9 p-0"
              disabled={page >= totalPage}
              onClick={() => setPage((p) => p + 1)}
            >
              &gt;
            </Button>
          </div>
        </div>
      </ComponentCard>

      <AlertDialog open={openDialog} onOpenChange={setOpenDialog}>
        <AlertDialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {editingData ? "Edit Employe" : "Create Employe"}
            </AlertDialogTitle>
          </AlertDialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="Enter username"
                  value={form.username}
                  onChange={(e) =>
                    setForm({ ...form, username: e.target.value })
                  }
                />
                {errors?.username?.[0] && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.username[0]}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter email address"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
                {errors?.email?.[0] && (
                  <p className="text-xs text-red-500 mt-1">{errors.email[0]}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                />
                {errors?.password?.[0] && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.password[0]}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password_confirmation">Confirm Password</Label>
                <Input
                  id="password_confirmation"
                  type="password"
                  placeholder="••••••••"
                  value={form.password_confirmation}
                  onChange={(e) =>
                    setForm({ ...form, password_confirmation: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="no_tlp">No Tlp</Label>
                <Input
                  id="no_tlp"
                  placeholder="Enter phone number"
                  value={form.no_tlp}
                  onChange={(e) => setForm({ ...form, no_tlp: e.target.value })}
                />
                {errors?.no_tlp?.[0] && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.no_tlp[0]}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="role_id">Role</Label>
                <Select
                  placeholder="Select role"
                  value={form.role_id}
                  onChange={(val: any) => setForm({ ...form, role_id: val })}
                  options={[
                    { label: "Employe", value: "2" },
                    { label: "Cashier", value: "5" },
                  ]}
                />
                {errors?.role_id?.[0] && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.role_id[0]}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select
                  placeholder="Select gender"
                  value={form.gender}
                  onChange={(val: any) => setForm({ ...form, gender: val })}
                  options={[
                    { label: "Laki-laki", value: "LK" },
                    { label: "Perempuan", value: "PR" },
                  ]}
                />
                {errors?.gender?.[0] && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.gender[0]}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="addres">Address</Label>
                <TextArea
                  placeholder="Enter full address"
                  value={form.addres}
                  onChange={(val) => setForm({ ...form, addres: val })}
                />
                {errors?.addres?.[0] && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.addres[0]}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t pt-4">
              <div className="space-y-2">
                <Label>Profile Image</Label>
                <div className="flex items-center gap-4">
                  {profilePreview && (
                    <img
                      src={profilePreview}
                      className="w-16 h-16 rounded-full object-cover border"
                      alt="Profile"
                    />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="text-xs"
                    onChange={(e) => handleImageChange(e, "profile")}
                  />
                </div>
                {errors?.profile_image?.[0] && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.profile_image[0]}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Identity Card (KTP)</Label>
                <div className="flex items-center gap-4">
                  {identityPreview && (
                    <img
                      src={identityPreview}
                      className="w-16 h-10 rounded object-cover border"
                      alt="KTP"
                    />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="text-xs"
                    onChange={(e) => handleImageChange(e, "identity")}
                  />
                </div>
                {errors?.identity_card?.[0] && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.identity_card[0]}
                  </p>
                )}
              </div>
            </div>

            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setOpenDialog(false)}>
                Cancel
              </AlertDialogCancel>
              <Button className="h-10" type="submit" disabled={isSubmitting}>
                {isSubmitting ? <LoadingSpinner /> : "Submit"}
              </Button>
            </AlertDialogFooter>
          </form>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={openImport} onOpenChange={setOpenImport}>
        <AlertDialogContent className="max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Import Mapping (Role: Employe)</AlertDialogTitle>
          </AlertDialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            {Object.keys(mapping).map((key) => (
              <div key={key} className="space-y-1">
                <label className="text-sm font-bold uppercase text-neutral-500">
                  {key.replace("_", " ")}
                </label>
                <select
                  className="w-full h-10 border rounded-md px-3 text-sm"
                  value={(mapping as any)[key]}
                  onChange={(e) =>
                    setMapping({ ...mapping, [key]: e.target.value })
                  }
                >
                  <option value="">-- Pilih Kolom Excel --</option>
                  {excelHeaders.map((head, idx) => (
                    <option key={idx} value={head}>
                      {head}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setOpenImport(false)}>
              Batal
            </AlertDialogCancel>
            <Button
              onClick={handleProcessImport}
              disabled={isSubmitting || !mapping.username || !mapping.email}
            >
              {isSubmitting ? "Processing..." : "Mulai Import"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default Employe;

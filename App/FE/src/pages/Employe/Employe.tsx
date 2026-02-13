import { useEffect, useState, useRef } from "react";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";
import Input from "../../components/form/input/InputField";
import { Plus, Upload } from "lucide-react";
import { EmployeService } from "../../services/employe.service";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import Select from "../../components/form/Select";
import EmployeTable from "../../components/tables/EmployeTable";
import TextArea from "../../components/form/input/TextArea";

function Employe() {
  const [employes, setEmployes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [genderFilter, setGenderFilter] = useState("");

  const [page, setPage] = useState(1);
  const size = 10;

  const [total, setTotal] = useState(0);
  const totalPage = Math.ceil(total / size);

  const [openDialog, setOpenDialog] = useState(false);
  const [editingData, setEditingData] = useState<any | null>(null);
  const [roleFilter, setRoleFilter] = useState("");

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    password_confirmation: "",
    addres: "",
    no_tlp: "",
    gender: "",
    role: "",
  });

  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [identityCard, setIdentityCard] = useState<File | null>(null);

  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [identityPreview, setIdentityPreview] = useState<string | null>(null);

  const [errors, setErrors] = useState<any>({});
  const [submitting, setSubmitting] = useState(false);

  const profileRef = useRef<HTMLInputElement>(null);
  const identityRef = useRef<HTMLInputElement>(null);

  const fetchEmployes = async () => {
    setLoading(true);
    const res = await EmployeService.getEmployes({
      page,
      size,
      search: debouncedSearch,
      gender: genderFilter || undefined,
      role_id: roleFilter || undefined,
    });

    if (res.data) {
      setEmployes(res.data.data.employes);
      setTotal(res.data.data.metadata.total);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchEmployes();
  }, [page, debouncedSearch, genderFilter, roleFilter]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [genderFilter, roleFilter]);

  const resetForm = () => {
    setForm({
      username: "",
      email: "",
      password: "",
      password_confirmation: "",
      addres: "",
      no_tlp: "",
      gender: "",
      role: "",
    });
    setProfileImage(null);
    setIdentityCard(null);
    setProfilePreview(null);
    setIdentityPreview(null);
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

    const formData = new FormData();

    formData.append("username", form.username);
    formData.append("email", form.email);
    formData.append("addres", form.addres);
    formData.append("no_tlp", form.no_tlp);
    formData.append("gender", form.gender);

    if (!editingData) {
      formData.append("password", form.password);
      formData.append("password_confirmation", form.password_confirmation);
    }

    if (profileImage) formData.append("profile_image", profileImage);
    if (identityCard) formData.append("identity_card", identityCard);

    const res = editingData
      ? await EmployeService.updateEmploye(editingData.id, formData)
      : await EmployeService.createEmploye(formData);

    if (res.error) {
      setErrors(res.error);
      setSubmitting(false);
      return;
    }

    handleCloseDialog();
    fetchEmployes();
    setSubmitting(false);
  };

  const handleEdit = (data: any) => {
    setEditingData(data);
    setForm({
      username: data.user?.username ?? "",
      email: data.user?.email ?? "",
      password: "",
      password_confirmation: "",
      addres: data.addres ?? "",
      no_tlp: data.no_tlp?.toString() ?? "",
      gender: data.gender ?? "",
      role: data.role ?? "",
    });

    setProfilePreview(
      data.profile_image
        ? `${import.meta.env.VITE_STORAGE_URL}/${data.profile_image}`
        : null,
    );

    setIdentityPreview(
      data.identity_card
        ? `${import.meta.env.VITE_STORAGE_URL}/${data.identity_card}`
        : null,
    );

    setOpenDialog(true);
  };

  const handleFile = (file: File, type: "profile" | "identity") => {
    const preview = URL.createObjectURL(file);
    if (type === "profile") {
      setProfileImage(file);
      setProfilePreview(preview);
    } else {
      setIdentityCard(file);
      setIdentityPreview(preview);
    }
  };

  return (
    <>
      <PageMeta title="Employe Management" description="Manage employes" />
      <PageBreadcrumb pageTitle="Employe" />

      <ComponentCard title="Management Employe" desc="Manage all employe data">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
          <div className="flex gap-3">
            <div className="">
              <Input
                type="text"
                placeholder="Search username..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full"
              />
            </div>

            <div className="">
              <Select
                value={genderFilter}
                onChange={(val: any) => setGenderFilter(val)}
                placeholder="Filter Gender"
                options={[
                  { label: "All Gender", value: "" },
                  { label: "Laki-laki", value: "LK" },
                  { label: "Perempuan", value: "PR" },
                ]}
              />
            </div>
            <div className="">
              <Select
                value={roleFilter}
                onChange={(val: any) => setRoleFilter(val)}
                placeholder="Filter Role"
                options={[
                  { label: "All Role", value: "" },
                  { label: "Employe", value: "2" },
                  { label: "Cashier", value: "5" },
                ]}
              />
            </div>
          </div>

          <AlertDialog open={openDialog} onOpenChange={setOpenDialog}>
            <AlertDialogTrigger asChild>
              <Button className="h-10" onClick={resetForm}>
                Create <Plus className="ml-1" />
              </Button>
            </AlertDialogTrigger>

            <AlertDialogContent
              size="xl"
              className="max-h-[90vh] max-w-3xl overflow-y-auto"
            >
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {editingData ? "Edit Employe" : "Create Employe"}
                </AlertDialogTitle>
              </AlertDialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-sm font-medium">
                      Username <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={form.username}
                      onChange={(e) =>
                        setForm({ ...form, username: e.target.value })
                      }
                    />
                    {errors?.username && (
                      <p className="text-sm text-red-500">
                        {errors.username[0]}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="email"
                      value={form.email}
                      onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                      }
                    />
                    {errors?.email && (
                      <p className="text-sm text-red-500">{errors.email[0]}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium">
                      Role <span className="text-red-500">*</span>
                    </label>
                    <Select
                      value={form.role}
                      onChange={(val: any) => setForm({ ...form, role: val })}
                      options={[
                        { label: "Employe", value: "2" },
                        { label: "Cashier", value: "5" },
                      ]}
                    />
                    {errors?.role && (
                      <p className="text-sm text-red-500">{errors.role[0]}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium">
                      Phone <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="number"
                      min={0}
                      value={form.no_tlp}
                      onChange={(e) =>
                        setForm({ ...form, no_tlp: e.target.value })
                      }
                    />
                    {errors?.no_tlp && (
                      <p className="text-sm text-red-500">{errors.no_tlp[0]}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium">
                      Gender <span className="text-red-500">*</span>
                    </label>
                    <Select
                      value={form.gender}
                      onChange={(val: any) => setForm({ ...form, gender: val })}
                      options={[
                        { label: "Laki-laki", value: "LK" },
                        { label: "Perempuan", value: "PR" },
                      ]}
                    />
                    {errors?.gender && (
                      <p className="text-sm text-red-500">{errors.gender[0]}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium">
                      Profile Image{" "}
                      {!editingData && <span className="text-red-500">*</span>}
                    </label>
                    <div
                      onClick={() => profileRef.current?.click()}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        if (e.dataTransfer.files[0])
                          handleFile(e.dataTransfer.files[0], "profile");
                      }}
                      className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer"
                    >
                      {profilePreview ? (
                        <img
                          src={profilePreview}
                          className="h-24 mx-auto object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center text-sm text-neutral-500">
                          <Upload size={20} />
                          Drag & drop or click to upload
                        </div>
                      )}
                    </div>
                    <input
                      type="file"
                      hidden
                      ref={profileRef}
                      onChange={(e) =>
                        e.target.files &&
                        handleFile(e.target.files[0], "profile")
                      }
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">
                      Identity Card{" "}
                      {!editingData && <span className="text-red-500">*</span>}
                    </label>
                    <div
                      onClick={() => identityRef.current?.click()}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        if (e.dataTransfer.files[0])
                          handleFile(e.dataTransfer.files[0], "identity");
                      }}
                      className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer"
                    >
                      {identityPreview ? (
                        <img
                          src={identityPreview}
                          className="h-24 mx-auto object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center text-sm text-neutral-500">
                          <Upload size={20} />
                          Drag & drop or click to upload
                        </div>
                      )}
                    </div>
                    <input
                      type="file"
                      hidden
                      ref={identityRef}
                      onChange={(e) =>
                        e.target.files &&
                        handleFile(e.target.files[0], "identity")
                      }
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <TextArea
                    value={form.addres}
                    onChange={(value) => setForm({ ...form, addres: value })}
                  />
                  {errors?.addres && (
                    <p className="text-sm text-red-500">{errors.addres[0]}</p>
                  )}
                </div>

                <AlertDialogFooter className="flex mt-4">
                  <AlertDialogCancel
                    disabled={submitting}
                    onClick={handleCloseDialog}
                  >
                    Batal
                  </AlertDialogCancel>

                  <Button className="h-9" type="submit" disabled={submitting}>
                    {submitting ? "Menyimpan..." : "Submit"}
                  </Button>
                </AlertDialogFooter>
              </form>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <EmployeTable
          employes={employes}
          loading={loading}
          onRefresh={fetchEmployes}
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

export default Employe;

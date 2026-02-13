import { useEffect, useState, ChangeEvent } from "react";
import { useParams, useNavigate } from "react-router";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Input from "../../components/form/input/InputField";
import Textarea from "../../components/form/input/TextArea";
import Label from "../../components/form/Label";
import Button from "../../components/ui/button/Button";
import Select from "../../components/form/Select";
import Switch from "../../components/form/switch/Switch";
import { useDropzone } from "react-dropzone";
import { MenuService } from "../../services/menu.service";
import { CategoryService } from "../../services/category.service";
import { DiscountService } from "../../services/discount.service";

function EditMenu() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    menu_image: null as File | null,
    name: "",
    category_id: "",
    discount_id: "",
    description: "",
    price: 0,
    stock: 0,
    is_active: 0,
  });

  const [preview, setPreview] = useState<string | null>(null);
  const [categories, setCategories] = useState<
    { label: string; value: string }[]
  >([]);
  const [discounts, setDiscounts] = useState<
    { label: string; value: string; discount: number }[]
  >([]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    CategoryService.getCategories().then(({ data }) => {
      setCategories(
        data?.data?.category.map((c: any) => ({
          label: c.name,
          value: c.id.toString(),
        })) || [],
      );
    });

    DiscountService.getDiscounts().then(({ data }) => {
      setDiscounts(
        data?.data?.map((d: any) => ({
          label: `${d.title} (${d.value_discount}%)`,
          value: d.id.toString(),
          discount: d.value_discount,
        })) || [],
      );
    });

    MenuService.getMenuById(Number(id)).then(({ data }) => {
      const m = data?.data;
      if (!m) return;

      setForm({
        menu_image: null,
        name: m.name,
        category_id: m.category?.id?.toString() || "",
        discount_id: m.discount?.id?.toString() || "",
        description: m.description || "",
        price: m.price ?? 0,
        stock: m.stock ?? 0,
        is_active: m.is_active == 1 ? 1 : 0,
      });

      setPreview(`${import.meta.env.VITE_STORAGE_URL}/${m.menu_image}`);
    });
  }, [id]);

  const onDrop = (files: File[]) => {
    if (!files.length) return;
    setForm((p) => ({ ...p, menu_image: files[0] }));
    setPreview(URL.createObjectURL(files[0]));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      "image/png": [],
      "image/jpeg": [],
      "image/webp": [],
      "image/svg+xml": [],
    },
  });

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setForm((p) => ({
      ...p,
      [name]: ["price", "stock"].includes(name) ? Number(value) : value,
    }));
  };

  const selectedDiscount = discounts.find((d) => d.value === form.discount_id);

  const finalPrice =
    form.price > 0
      ? Math.max(
          form.price - (form.price * (selectedDiscount?.discount ?? 0)) / 100,
          0,
        )
      : 0;

  const handleSubmit = async () => {
    setLoading(true);
    setErrors({});

    const fd = new FormData();
    fd.append("_method", "PUT");

    Object.entries(form).forEach(([k, v]) => {
      if (v === null || v === "" || (k === "discount_id" && !v)) return;
      if (k === "menu_image" && !(v instanceof File)) return;

      if (k === "is_active") {
        fd.append("is_active", v ? "1" : "0");
      } else {
        fd.append(k, v as any);
      }
    });

    try {
      const { error } = await MenuService.updateMenu(Number(id), fd);
      if (error) {
        typeof error === "object" ? setErrors(error) : alert(error);
      } else {
        alert("Menu updated successfully!");
        navigate("/menu");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageBreadcrumb pageTitle="Edit Menu" />
      <ComponentCard title="Edit Menu" desc="Update menu data">
        <div className="grid grid-cols-2 gap-8">
          <div>
            <div
              {...getRootProps()}
              className={`border border-dashed rounded-xl p-6 text-center ${
                isDragActive
                  ? "border-brand-500 bg-neutral-100"
                  : "border-neutral-300 bg-neutral-50"
              }`}
            >
              <input {...getInputProps()} />
              {preview ? (
                <img
                  src={preview}
                  className="w-[500px] h-[500px] object-cover rounded-lg mb-2"
                />
              ) : (
                <>
                  <p className="font-semibold">Drag & drop image here</p>
                  <p className="text-sm text-neutral-500">PNG, JPG, WebP</p>
                </>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label>
                Name <span className="text-red-500">*</span>
              </Label>
              <Input name="name" value={form.name} onChange={handleChange} />
            </div>

            <div>
              <Label>
                Category <span className="text-red-500">*</span>
              </Label>
              <Select
                options={categories}
                value={form.category_id}
                onChange={(v) => setForm((p) => ({ ...p, category_id: v }))}
              />
            </div>

            <div>
              <Label>Discount</Label>
              <Select
                options={discounts}
                value={form.discount_id}
                onChange={(v) => setForm((p) => ({ ...p, discount_id: v }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Price</Label>
                <Input
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                />
                {finalPrice > 0 && (
                  <p className="text-sm text-green-600">
                    Final Price: Rp {finalPrice.toLocaleString()}
                  </p>
                )}
              </div>

              <div>
                <Label>
                  Stock <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="number"
                  name="stock"
                  value={form.stock}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(value: string) =>
                  setForm((p) => ({ ...p, description: value }))
                }
              />
            </div>

            <div className="flex items-center gap-2">
              <Switch
                label="Status"
                checked={form.is_active}
                onChange={(v) => setForm((p) => ({ ...p, is_active: v }))}
              />
            </div>

            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? "Saving..." : "Update Menu"}
            </Button>
          </div>
        </div>
      </ComponentCard>
    </>
  );
}

export default EditMenu;

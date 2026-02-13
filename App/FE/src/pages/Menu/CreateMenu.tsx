import { useEffect, useState, ChangeEvent } from "react";
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

function CreateMenu() {
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
        data?.map((c: any) => ({
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
  }, []);

  const onDrop = (files: File[]) => {
    if (files.length) setForm((p) => ({ ...p, menu_image: files[0] }));
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
    setForm((p) => ({ ...p, [name]: value }));
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
    Object.entries(form).forEach(([k, v]) => {
      if (v === null || v === "") return;
      if (k === "discount_id" && !v) return;
      if (k === "menu_image" && !(v instanceof File)) return;

      if (k === "is_active") {
        fd.append(k, v ? "1" : "0");
        return;
      }

      fd.append(k, v as any);
    });

    try {
      const { error } = await MenuService.createMenu(fd);
      if (error) {
        typeof error === "object" ? setErrors(error) : alert(error);
      } else {
        alert("Menu created!");
        setForm({
          menu_image: null,
          name: "",
          category_id: "",
          discount_id: "",
          description: "",
          price: 0,
          stock: 0,
          is_active: 0,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageBreadcrumb pageTitle="Create Menu" />
      <ComponentCard title="Create Menu" desc="Halaman ini untuk membuat menu">
        <div className="grid grid-cols-2 gap-8">
          <div>
            <div
              {...getRootProps()}
              className={`border border-dashed rounded-xl p-6 text-center ${
                isDragActive
                  ? "border-brand-500 bg-neutral-100 dark:bg-neutral-900"
                  : "border-neutral-300 bg-neutral-50 dark:bg-neutral-900"
              }`}
            >
              <input {...getInputProps()} />
              {form.menu_image ? (
                <>
                  <img
                    src={URL.createObjectURL(form.menu_image)}
                    className="w-[500px] h-[500px] object-cover rounded-lg mb-2"
                  />
                  <p className="text-green-600">{form.menu_image.name}</p>
                </>
              ) : (
                <>
                  <p className="font-semibold">Drag & drop image here</p>
                  <p className="text-sm text-neutral-500">PNG, JPG, WebP</p>
                </>
              )}
            </div>
            {errors.menu_image && (
              <p className="mt-1 text-sm text-red-500">{errors.menu_image}</p>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <Label>
                Name <span className="text-red-500">*</span>
              </Label>
              <Input name="name" placeholder="menu name" value={form.name} onChange={handleChange} />
              {errors.name && (
                <p className="mt-1 text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            <div>
              <Label>
                Category <span className="text-red-500">*</span>
              </Label>
              <Select
                options={categories}
                value={form.category_id}
                onChange={(v) =>
                  setForm((p) => ({ ...p, category_id: v as string }))
                }
              />
              {errors.category_id && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.category_id}
                </p>
              )}
            </div>

            <div>
              <Label>Discount</Label>
              <Select
                options={discounts}
                value={form.discount_id}
                onChange={(v) =>
                  setForm((p) => ({ ...p, discount_id: v as string }))
                }
              />
              {errors.discount_id && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.discount_id}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Price</Label>
                <Input
                  type="number"
                  name="price"
                  placeholder="min:0"
                  value={form.price}
                  onChange={handleChange}
                />
                {finalPrice > 0 && (
                  <p className="text-sm text-green-600">
                    Final Price: Rp {finalPrice.toLocaleString()}
                  </p>
                )}
                {errors.price && (
                  <p className="mt-1 text-sm text-red-500">{errors.price}</p>
                )}
              </div>

              <div>
                <Label>
                  Stock <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="number"
                  name="stock"
                  placeholder="min:0"
                  value={form.stock}
                  onChange={handleChange}
                />
                {errors.stock && (
                  <p className="mt-1 text-sm text-red-500">{errors.stock}</p>
                )}
              </div>
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(value) =>
                  setForm((prev) => ({ ...prev, description: value }))
                }
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.description}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={!!form.is_active}
                label="Status"
                onChange={(v) =>
                  setForm((p) => ({ ...p, is_active: v ? 1 : 0 }))
                }
              />
              {errors.status && (
                <p className="mt-1 text-sm text-red-500">{errors.status}</p>
              )}
            </div>

            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? "Saving..." : "Create Menu"}
            </Button>
          </div>
        </div>
      </ComponentCard>
    </>
  );
}

export default CreateMenu;

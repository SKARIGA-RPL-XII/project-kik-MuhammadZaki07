import { useEffect, useState } from "react";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Input from "../../components/form/input/InputField";
import Textarea from "../../components/form/input/TextArea";
import Label from "../../components/form/Label";
import Button from "../../components/ui/button/Button";
import Switch from "../../components/form/switch/Switch";
import { useDropzone } from "react-dropzone";
import { MenuService } from "../../services/menu.service";
import { AttributeService } from "../../services/attribute.service";
import Select from "../../components/form/Select";
import { CategoryService } from "../../services/category.service";
import { DiscountService } from "../../services/discount.service";
import { useToast } from "@/context/ToastContext";
import { useNavigate } from "react-router";

interface AttributeLevel {
  id: number;
  name: string;
}

interface Attribute {
  id: number;
  name: string;
  levels: AttributeLevel[];
}

function CreateMenu() {
  const [form, setForm] = useState({
    menu_image: null as File | null,
    name: "",
    category_id: "",
    discount_id: "",
    description: "",
    price: 0,
    stock: 0,
    is_active: 1,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [categories, setCategories] = useState<
    { label: string; value: string }[]
  >([]);
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [activeAttributes, setActiveAttributes] = useState<number[]>([]);
  const [selectedLevels, setSelectedLevels] = useState<
    Record<number, number[]>
  >({});
  const [discounts, setDiscounts] = useState<
    { label: string; value: string }[]
  >([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    AttributeService.getAttributes().then(({ data }) =>
      setAttributes(data || []),
    );

    CategoryService.getCategories().then(({ data }) =>
      setCategories(
        data?.map((c: any) => ({
          label: c.name,
          value: c.id.toString(),
        })) || [],
      ),
    );

    DiscountService.getDiscounts().then(({ data }) =>
      setDiscounts(
        data?.map((d: any) => ({
          label: d.title,
          value: d.id.toString(),
        })) || [],
      ),
    );
  }, []);

  const handleNumberInput = (field: string, value: string) => {
    if (value === "") {
      setForm((prev) => ({ ...prev, [field]: 0 }));
      return;
    }
    const numValue = Math.max(0, parseInt(value, 10));
    setForm((prev) => ({ ...prev, [field]: numValue }));

    if (numValue >= 0) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const toggleAttribute = (attributeId: number) => {
    if (activeAttributes.includes(attributeId)) {
      setActiveAttributes((prev) => prev.filter((id) => id !== attributeId));
      setSelectedLevels((prev) => {
        const copy = { ...prev };
        delete copy[attributeId];
        return copy;
      });
    } else {
      setActiveAttributes((prev) => [...prev, attributeId]);
    }
  };

  const toggleLevel = (attributeId: number, levelId: number) => {
    const current = selectedLevels[attributeId] || [];
    if (current.includes(levelId)) {
      setSelectedLevels((prev) => ({
        ...prev,
        [attributeId]: current.filter((id) => id !== levelId),
      }));
    } else {
      setSelectedLevels((prev) => ({
        ...prev,
        [attributeId]: [...current, levelId],
      }));
    }
  };

  const onDrop = (files: File[]) => {
    if (files.length) {
      setForm((prev) => ({ ...prev, menu_image: files[0] }));
      setErrors((prev) => ({ ...prev, menu_image: "" }));
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp"],
    },
    multiple: false,
  });

  const handleSubmit = async () => {
    setErrors({});

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (v !== null && v !== "") fd.append(k, v as any);
    });

    Object.entries(selectedLevels).forEach(([attrId, levels]) => {
      levels.forEach((level, index) => {
        fd.append(`attributes[${attrId}][${index}]`, level.toString());
      });
    });

    const response = await MenuService.createMenu(fd);

    if (response.error) {
      if (typeof response.error === "object") {
        const validationErrors: Record<string, string> = {};
        Object.entries(response.error).forEach(([key, messages]) => {
          validationErrors[key] = Array.isArray(messages)
            ? messages[0]
            : (messages as string);
        });
        setErrors(validationErrors);
      } else {
        toast("error", "Failed", response.error);
      }
    } else {
      toast("success", "Success Create Menu", `Menu created successfully!`);
      navigate("/menu")
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <>
      <PageBreadcrumb pageTitle="Menu Management" />
      <ComponentCard
        title="Menu Management Configuration"
        desc="Interface for establishing new navigational entries and defining system menu hierarchies."
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="space-y-2">
            <Label>Menu Image</Label>
            <div
              {...getRootProps()}
              className={`border-2 ${errors.menu_image ? "border-red-500 bg-red-50/50" : "border-gray-300 dark:border-gray-700"} border-dashed rounded-2xl p-8 text-center hover:border-brand-500 transition-all cursor-pointer bg-gray-50 dark:bg-gray-800/50`}
            >
              <input {...getInputProps()} />
              {form.menu_image ? (
                <div className="space-y-4">
                  <div className="relative group">
                    <img
                      src={URL.createObjectURL(form.menu_image)}
                      className="w-full max-h-[400px] object-cover mx-auto rounded-xl shadow-md"
                      alt="Preview"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-xl transition-opacity">
                      <span className="text-white font-medium text-sm">
                        Change Image
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-10">
                  <div className="mx-auto w-12 h-12 mb-4 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-500 font-medium">
                    Click or drag image to upload
                  </p>
                  <p className="text-gray-400 text-xs mt-1 uppercase tracking-wider">
                    JPG, JPEG, PNG, WEBP (Max 2MB)
                  </p>
                </div>
              )}
            </div>
            {form.menu_image !== null && (
              <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="p-2 bg-brand-50 dark:bg-brand-500/10 rounded">
                    <svg
                      className="w-5 h-5 text-brand-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div className="text-left overflow-hidden">
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 truncate">
                      {form.menu_image.name}
                    </p>
                    <p className="text-xs text-gray-400 font-medium">
                      {formatFileSize(form.menu_image.size)}
                    </p>
                  </div>
                </div>
                <div className="text-brand-500">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            )}
            {errors.menu_image && (
              <p className="text-xs text-red-500 mt-1 font-medium italic">
                *{errors.menu_image}
              </p>
            )}
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 lg:col-span-1">
                <Label>Product Name</Label>
                <Input
                  name="name"
                  placeholder="e.g. Special Roasted Coffee"
                  value={form.name}
                  error={errors.name}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
                {errors.name && (
                  <p className="text-xs text-red-500 mt-1 font-medium">
                    {errors.name}
                  </p>
                )}
              </div>
              <div className="col-span-2 lg:col-span-1">
                <Label>Category</Label>
                <Select
                  options={categories}
                  value={form.category_id}
                  error={errors.category_id}
                  onChange={(value) =>
                    setForm((prev) => ({
                      ...prev,
                      category_id: value as string,
                    }))
                  }
                />
                {errors.category_id && (
                  <p className="text-xs text-red-500 mt-1 font-medium">
                    {errors.category_id}
                  </p>
                )}
              </div>
              <div className="col-span-2 lg:col-span-1">
                <Label>Discount</Label>
                <Select
                  options={[{ label: "No Discount", value: "" }, ...discounts]}
                  value={form.discount_id}
                  error={errors.discount_id}
                  onChange={(value) =>
                    setForm((prev) => ({
                      ...prev,
                      discount_id: value as string,
                    }))
                  }
                />
                {errors.discount_id && (
                  <p className="text-xs text-red-500 mt-1 font-medium">
                    {errors.discount_id}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                placeholder="Tell more about this menu..."
                value={form.description}
                error={errors.description}
                onChange={(v) =>
                  setForm((prev) => ({ ...prev, description: v }))
                }
              />
              {errors.description && (
                <p className="text-xs text-red-500 mt-1 font-medium">
                  {errors.description}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Price (IDR)</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={form.price === 0 ? "" : form.price}
                  onChange={(e) => handleNumberInput("price", e.target.value)}
                />
                {errors.price && (
                  <p className="text-xs text-red-500 mt-1 font-medium">
                    {errors.price}
                  </p>
                )}
              </div>
              <div>
                <Label>Inventory Stock</Label>
                <Input
                  type="number"
                  placeholder="Available qty"
                  error={!!errors.stock}
                  value={form.stock === 0 ? "" : form.stock}
                  onChange={(e) => handleNumberInput("stock", e.target.value)}
                />
                {errors.stock && (
                  <p className="text-xs text-red-500 mt-1 font-medium">
                    {errors.stock}
                  </p>
                )}
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800/40 p-4 rounded-2xl border border-gray-100 dark:border-gray-700">
              <Switch
                checked={!!form.is_active}
                label="Visibility Status"
                onChange={(v) =>
                  setForm((prev) => ({ ...prev, is_active: v ? 1 : 0 }))
                }
              />
              <p className="text-xs text-gray-500 mt-1 ml-12">
                Make this menu visible to customers on the main page.
              </p>
            </div>

            <div className="space-y-4">
              <Label className="block border-b pb-2 dark:border-gray-700">
                Available Attributes
              </Label>
              <div className="flex gap-3 flex-wrap">
                {attributes.map((attr) => (
                  <label
                    key={attr.id}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl border cursor-pointer transition-all ${
                      activeAttributes.includes(attr.id)
                        ? "border-brand-500 bg-brand-50 dark:bg-brand-500/10 text-brand-600 shadow-sm"
                        : "border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={activeAttributes.includes(attr.id)}
                      onChange={() => toggleAttribute(attr.id)}
                    />
                    <span
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${activeAttributes.includes(attr.id) ? "border-brand-500 bg-brand-500" : "border-gray-300"}`}
                    >
                      {activeAttributes.includes(attr.id) && (
                        <div className="w-1.5 h-1.5 bg-white rounded-full" />
                      )}
                    </span>
                    <span className="text-sm font-semibold uppercase tracking-tight">
                      {attr.name}
                    </span>
                  </label>
                ))}
              </div>

              <div className="grid grid-cols-1 gap-4 mt-4">
                {attributes
                  .filter((attr) => activeAttributes.includes(attr.id))
                  .map((attr) => (
                    <div
                      key={attr.id}
                      className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 shadow-sm animate-in fade-in slide-in-from-top-2"
                    >
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-1.5 h-4 bg-brand-500 rounded-full" />
                        <p className="font-bold text-gray-800 dark:text-white uppercase tracking-wider text-xs">
                          {attr.name} Options
                        </p>
                      </div>
                      <div className="flex gap-4 flex-wrap">
                        {attr.levels.map((level) => (
                          <button
                            key={level.id}
                            type="button"
                            onClick={() => toggleLevel(attr.id, level.id)}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-300 ${
                              selectedLevels[attr.id]?.includes(level.id)
                                ? "bg-brand-500 text-white shadow-md shadow-brand-200 scale-105 ring-2 ring-brand-500 ring-offset-2 dark:ring-offset-gray-900"
                                : "bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700"
                            }`}
                          >
                            {level.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            <div className="pt-6">
              <Button
                onClick={handleSubmit}
                className="w-full py-4 rounded-2xl shadow-lg shadow-brand-100 dark:shadow-none font-bold text-sm tracking-wide transition-transform active:scale-[0.98]"
              >
                Create & Save Menu
              </Button>
            </div>
          </div>
        </div>
      </ComponentCard>
    </>
  );
}

export default CreateMenu;

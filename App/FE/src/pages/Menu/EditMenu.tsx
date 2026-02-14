import { useEffect, useState } from "react";
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
import { AttributeService } from "../../services/attribute.service";
import MenuEditSkeleton from "@/components/skeleton/menu/MenuEditSkeleton";
import { useToast } from "@/context/ToastContext";

interface AttributeLevel {
  id: number;
  name: string;
}

interface Attribute {
  id: number;
  name: string;
  levels: AttributeLevel[];
}

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
    is_active: 1,
  });

  const [preview, setPreview] = useState<string | null>(null);
  const [categories, setCategories] = useState<
    { label: string; value: string }[]
  >([]);
  const [discounts, setDiscounts] = useState<
    { label: string; value: string }[]
  >([]);
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [activeAttributes, setActiveAttributes] = useState<number[]>([]);
  const [selectedLevels, setSelectedLevels] = useState<
    Record<number, number[]>
  >({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const {toast} = useToast()

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [resAttr, resCat, resDisc, resMenu] = await Promise.all([
          AttributeService.getAttributes(),
          CategoryService.getCategories(),
          DiscountService.getDiscounts(),
          MenuService.getMenuById(Number(id)),
        ]);

        setAttributes(resAttr.data || []);
        setCategories(
          resCat.data?.map((c: any) => ({
            label: c.name,
            value: c.id.toString(),
          })) || [],
        );
        setDiscounts(
          resDisc.data?.map((d: any) => ({
            label: d.title,
            value: d.id.toString(),
          })) || [],
        );

        const m = resMenu.data;
        if (m) {
          setForm({
            menu_image: null,
            name: m.name || "",
            category_id: m.category?.id?.toString() || "",
            discount_id: m.discount?.id?.toString() || "",
            description: m.description || "",
            price: m.price ?? 0,
            stock: m.stock ?? 0,
            is_active: m.is_active,
          });

          if (m.menu_image) {
            setPreview(`${import.meta.env.VITE_STORAGE_URL}/${m.menu_image}`);
          }

          if (m.attributes && m.attributes.length > 0) {
            const activeIds: number[] = [];
            const levelsMap: Record<number, number[]> = {};

            m.attributes.forEach((attr: any) => {
              activeIds.push(attr.id);
              if (attr.pivot && attr.pivot.attribute_level_id) {
                levelsMap[attr.id] = [attr.pivot.attribute_level_id];
              }
            });

            setActiveAttributes(activeIds);
            setSelectedLevels(levelsMap);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleNumberInput = (field: string, value: string) => {
    if (value === "") {
      setForm((p) => ({ ...p, [field]: 0 }));
      return;
    }
    const numValue = Math.max(0, parseInt(value, 10));
    setForm((p) => ({ ...p, [field]: numValue }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
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
    setSelectedLevels((prev) => {
      const currentLevels = prev[attributeId] || [];

      if (currentLevels.includes(levelId)) {
        return {
          ...prev,
          [attributeId]: currentLevels.filter((id) => id !== levelId),
        };
      }

      return {
        ...prev,
        [attributeId]: [...currentLevels, levelId],
      };
    });
  };

  const onDrop = (files: File[]) => {
    if (files.length) {
      setForm((p) => ({ ...p, menu_image: files[0] }));
      setPreview(URL.createObjectURL(files[0]));
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpeg", ".jpg", ".png", ".webp"] },
    multiple: false,
  });

  const handleSubmit = async () => {
    setLoading(true);
    setErrors({});

    const fd = new FormData();
    fd.append("_method", "PUT");

    Object.entries(form).forEach(([k, v]) => {
      if (k === "menu_image") {
        if (v instanceof File) fd.append(k, v);
      } else {
        if (v !== null && v !== "") fd.append(k, v.toString());
      }
    });

    Object.entries(selectedLevels).forEach(([attrId, levels]) => {
      levels.forEach((level, index) => {
        fd.append(`attributes[${attrId}][${index}]`, level.toString());
      });
    });

    try {
      const response = await MenuService.updateMenu(Number(id), fd);
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
          alert(response.error);
        }
      } else {
        toast("success" , "Success Update Menu" , `Menu ${form.name} updated successfully!`)
        navigate("/menu");
      }
    } catch (err) {
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <MenuEditSkeleton />
      </div>
    );
  }
  return (
    <>
      <PageBreadcrumb pageTitle="Edit Menu" />
      <ComponentCard
        title="Edit Menu Configuration"
        desc="Update your menu details and attributes."
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="space-y-4">
            <Label>Menu Image</Label>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer min-h-[400px] flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800/50 ${
                errors.menu_image
                  ? "border-red-500"
                  : "border-gray-300 dark:border-gray-700"
              }`}
            >
              <input {...getInputProps()} />
              {preview ? (
                <div className="relative group w-full">
                  <img
                    src={preview}
                    className="w-full max-h-[500px] object-cover rounded-xl shadow-md"
                    alt="Preview"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-xl transition-opacity">
                    <span className="text-white font-medium">
                      Click to Change Image
                    </span>
                  </div>
                </div>
              ) : (
                <div className="py-10">
                  <p className="text-gray-500 font-medium">
                    No image available
                  </p>
                  <p className="text-sm text-gray-400">Click to upload image</p>
                </div>
              )}
            </div>
            {errors.menu_image && (
              <p className="text-xs text-red-500 font-medium">
                {errors.menu_image}
              </p>
            )}
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 lg:col-span-1">
                <Label>Product Name</Label>
                <Input
                  value={form.name}
                  error={errors.name}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, name: e.target.value }))
                  }
                />
              </div>
              <div className="col-span-2 lg:col-span-1">
                <Label>Category</Label>
                <Select
                  options={categories}
                  value={form.category_id}
                  onChange={(v) => setForm((p) => ({ ...p, category_id: v }))}
                />
              </div>
              <div className="col-span-2 lg:col-span-1">
                <Label>Discount</Label>
                <Select
                  options={[{ label: "No Discount", value: "" }, ...discounts]}
                  value={form.discount_id}
                  onChange={(v) => setForm((p) => ({ ...p, discount_id: v }))}
                />
              </div>
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(v: string) =>
                  setForm((p) => ({ ...p, description: v }))
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Price (IDR)</Label>
                <Input
                  type="number"
                  value={form.price === 0 ? "" : form.price}
                  onChange={(e) => handleNumberInput("price", e.target.value)}
                />
              </div>
              <div>
                <Label>Stock</Label>
                <Input
                  type="number"
                  value={form.stock === 0 ? "" : form.stock}
                  onChange={(e) => handleNumberInput("stock", e.target.value)}
                />
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
              <Switch
                label="Active Status"
                checked={form.is_active === 1}
                onChange={(v) =>
                  setForm((p) => ({ ...p, is_active: v ? 1 : 0 }))
                }
              />
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
                        : "border-gray-200 dark:border-gray-700 text-gray-500"
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={activeAttributes.includes(attr.id)}
                      onChange={() => toggleAttribute(attr.id)}
                    />
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
                      className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-5"
                    >
                      <p className="font-bold text-gray-800 dark:text-white uppercase tracking-wider text-xs mb-4">
                        {attr.name} Options
                      </p>
                      <div className="flex gap-4 flex-wrap">
                        {attr.levels.map((level) => {
                          const isSelected = selectedLevels[attr.id]?.includes(
                            level.id,
                          );
                          return (
                            <button
                              key={level.id}
                              type="button"
                              onClick={() => toggleLevel(attr.id, level.id)}
                              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                                isSelected
                                  ? "bg-brand-500 text-white scale-105"
                                  : "bg-gray-100 dark:bg-gray-800 text-gray-500"
                              }`}
                            >
                              {level.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            <div className="pt-4">
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full py-4 rounded-xl font-bold"
              >
                {loading ? "Updating..." : "Update Menu Data"}
              </Button>
            </div>
          </div>
        </div>
      </ComponentCard>
    </>
  );
}

export default EditMenu;

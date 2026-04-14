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
import { stockService } from "../../services/stock.service";
import MenuEditSkeleton from "@/components/skeleton/menu/MenuEditSkeleton";
import { useToast } from "@/context/ToastContext";
import LoadingSpinner from "@/components/skeleton/LoadingSpinner";
import { useQueryClient } from "@tanstack/react-query";

interface AttributeLevel {
  id: number;
  name: string;
}

interface Attribute {
  id: number;
  name: string;
  levels: AttributeLevel[];
}

interface Stock {
  id: number;
  name: string;
  unit: string;
}

interface SelectedStock extends Stock {
  amount: number;
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
  const [availableStocks, setAvailableStocks] = useState<Stock[]>([]);
  const [selectedIngredients, setSelectedIngredients] = useState<
    SelectedStock[]
  >([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [resAttr, resCat, resDisc, resStock, resMenu] = await Promise.all(
          [
            AttributeService.getAttributes(),
            CategoryService.getCategories(),
            DiscountService.getDiscounts(),
            stockService.getAll(0, 100),
            MenuService.getMenuById(Number(id)),
          ],
        );

        setAttributes(resAttr.data || []);
        setAvailableStocks(resStock.data || []);
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
            is_active: m.is_active,
          });

          if (m.menu_image) {
            setPreview(`${import.meta.env.VITE_STORAGE_URL}/${m.menu_image}`);
          }

          if (m.stocks) {
            setSelectedIngredients(
              m.stocks.map((s: any) => ({
                id: s.id,
                name: s.name,
                unit: s.unit,
                amount: s.pivot?.amount || 1,
              })),
            );
          }

          if (m.attributes && m.attributes.length > 0) {
            const activeIds: number[] = [];
            const levelsMap: Record<number, number[]> = {};

            m.attributes.forEach((attr: any) => {
              if (!activeIds.includes(attr.id)) activeIds.push(attr.id);
              if (attr.pivot && attr.pivot.attribute_level_id) {
                if (!levelsMap[attr.id]) levelsMap[attr.id] = [];
                levelsMap[attr.id].push(attr.pivot.attribute_level_id);
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
    if (!/^\d*$/.test(value)) return;

    if (value === "") {
      setForm((p) => ({ ...p, [field]: 0 }));
      return;
    }

    const cleaned = value.replace(/^0+(?=\d)/, "");

    const numValue = parseInt(cleaned, 10);

    setForm((p) => ({ ...p, [field]: numValue }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const addIngredient = (stockId: string) => {
    const stock = availableStocks.find((s) => s.id.toString() === stockId);
    if (stock) {
      setSelectedIngredients((prev) => [...prev, { ...stock, amount: 1 }]);
    }
  };

  const removeIngredient = (id: number) => {
    setSelectedIngredients((prev) => prev.filter((item) => item.id !== id));
  };

  const updateIngredientAmount = (id: number, amount: string) => {
    setSelectedIngredients((prev) =>
      prev.map((item) => (item.id === id ? { ...item, amount } : item)),
    );
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
      return { ...prev, [attributeId]: [...currentLevels, levelId] };
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

  const queryClient = useQueryClient();

  const handleSubmit = async () => {
    setLoading(true);
    setErrors({});

    const fd = new FormData();
    fd.append("_method", "PUT");

    Object.entries(form).forEach(([k, v]) => {
      if (k === "menu_image") {
        if (v instanceof File) fd.append(k, v);
      } else if (k === "discount_id") {
        fd.append(
          k,
          v === null || v === "null" || v === "" ? "" : v.toString(),
        );
      } else if (k === "is_active") {
        fd.append(k, v ? "1" : "0");
      } else {
        if (v !== null && v !== "" && v !== undefined)
          fd.append(k, v.toString());
      }
    });

    Object.entries(selectedLevels).forEach(([attrId, levels]) => {
      const uniqueLevels = Array.from(new Set(levels));
      uniqueLevels.forEach((level, index) => {
        fd.append(`attributes[${attrId}][${index}]`, level.toString());
      });
    });

    selectedIngredients.forEach((ing, index) => {
      fd.append(`stocks[${index}][stock_id]`, ing.id.toString());
      fd.append(`stocks[${index}][amount]`, ing.amount.toString());
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
          toast("error", "Validation Error", "Please check the form again.");
        } else {
          toast("error", "Failed", response.error);
        }
      } else {
        toast(
          "success",
          "Success Update Menu",
          `Menu ${form.name} updated successfully!`,
        );
        queryClient.invalidateQueries({ queryKey: ["menus-admin"] });
        navigate("/menu");
      }
    } catch (err) {
      toast("error", "Error", "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const filteredStockOptions = availableStocks
    .filter((s) => !selectedIngredients.find((si) => si.id === s.id))
    .map((s) => ({ label: `${s.name} (${s.unit})`, value: s.id.toString() }));

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

            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label>Price (IDR)</Label>
                <Input
                  type="text"
                  value={form.price === 0 ? "" : form.price}
                  onChange={(e) => handleNumberInput("price", e.target.value)}
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
                Recipe Ingredients
              </Label>
              <Select
                options={[
                  { label: "Add more ingredient...", value: "" },
                  ...filteredStockOptions,
                ]}
                value=""
                error={errors.stocks}
                onChange={(val) => val && addIngredient(val as string)}
              />

              {errors.stocks && (
                <p className="text-xs text-red-500 mt-1 font-medium">
                  {errors.stocks}
                </p>
              )}

              <div className="space-y-2 mt-3">
                {selectedIngredients.map((ing) => (
                  <div
                    key={ing.id}
                    className="flex items-center justify-between bg-white dark:bg-gray-900 p-3 rounded-xl border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-bold text-gray-700 dark:text-gray-200 uppercase">
                        {ing.name}
                      </p>
                      <p className="text-xs text-gray-400">Unit: {ing.unit}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        step="0.01"
                        className="w-20 px-2 py-1 text-sm border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                        min="0"
                        value={ing.amount}
                        onChange={(e) =>
                          updateIngredientAmount(ing.id, e.target.value)
                        }
                      />
                      <button
                        onClick={() => removeIngredient(ing.id)}
                        className="text-red-500 p-2"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <Label className="block border-b pb-2 dark:border-gray-700">
                Available Attributes
              </Label>
              <div className="flex gap-3 flex-wrap">
                {attributes.map((attr) => (
                  <label
                    key={attr.id}
                    className={`flex items-center gap-2 px-4 py-2 rounded-sm border cursor-pointer transition-all ${
                      activeAttributes.includes(attr.id)
                        ? "border-red-500 bg-red-50 dark:bg-red-500/10 text-red-600 shadow-sm"
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
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        activeAttributes.includes(attr.id)
                          ? "border-red-500 bg-red-500"
                          : "border-gray-300"
                      }`}
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
                      className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-5 animate-in fade-in slide-in-from-top-2"
                    >
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-1.5 h-4 bg-red-500 rounded-full" />
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
                            className={`px-4 py-2 rounded-sm text-xs transition-all duration-300 ${
                              selectedLevels[attr.id]?.includes(level.id)
                                ? "bg-red-500 text-white scale-105 ring-1 ring-red-500 ring-offset-2 dark:ring-offset-gray-900"
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

            <div className="pt-4">
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full font-semibold"
              >
                {loading ? <LoadingSpinner /> : "Update Menu Data"}
              </Button>
            </div>
          </div>
        </div>
      </ComponentCard>
    </>
  );
}

export default EditMenu;

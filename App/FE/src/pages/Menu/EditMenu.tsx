import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
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
import { stockService } from "../../services/stock.service";
import { UnitService } from "../../services/unit.service";
import { useToast } from "@/context/ToastContext";
import { useQueryClient } from "@tanstack/react-query";
import MenuEditSkeleton from "@/components/skeleton/menu/MenuEditSkeleton";
import { getProfileImage } from "@/utils/imageHelper";
import LoadingSpinner from "@/components/skeleton/LoadingSpinner";

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
  unit?: any;
  unit_id: number;
  unit_category?: string;
}

interface SelectedStock extends Stock {
  amount: string;
}

interface LevelStockImpact {
  stock_id: number;
  amount: string;
  unit_id: number;
}

function EditMenu() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    menu_image: null as File | null,
    image_preview: "",
    name: "",
    category_id: "",
    discount_id: "",
    description: "",
    price: "",
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
  const [levelPrices, setLevelPrices] = useState<Record<number, string>>({});
  const [levelStocks, setLevelStocks] = useState<
    Record<number, LevelStockImpact[]>
  >({});
  const [discounts, setDiscounts] = useState<
    { label: string; value: string }[]
  >([]);
  const [allUnits, setAllUnits] = useState<any[]>([]);
  const [availableStocks, setAvailableStocks] = useState<Stock[]>([]);
  const [selectedIngredients, setSelectedIngredients] = useState<
    SelectedStock[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [resAttr, resCat, resDisc, resStock, resUnits, resMenu] =
          await Promise.all([
            AttributeService.getAttributes(),
            CategoryService.getCategories(),
            DiscountService.getDiscounts(),
            stockService.getAll(0, 100),
            UnitService.getUnits({ size: 100 }),
            MenuService.getMenuById(id!),
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
        setAvailableStocks(resStock.data || []);
        setAllUnits(resUnits.data || []);

        const menu = resMenu.data;
        setForm({
          menu_image: null,
          image_preview: menu.menu_image
            ? `${import.meta.env.VITE_STORAGE_URL}${menu.menu_image}`
            : "",
          name: menu.name,
          category_id: menu.category?.id?.toString() || "",
          discount_id: menu.discount?.id?.toString() || "",
          description: menu.description || "",
          price: menu.price?.toString() || "",
          is_active: menu.is_active ? 1 : 0,
        });

        if (menu.stocks) {
          setSelectedIngredients(
            menu.stocks.map((s: any) => ({
              id: s.id,
              name: s.name,
              amount: s.pivot.amount.toString(),
              unit_id: s.pivot.unit_id || s.unit_id,
              unit_category: s.unit?.category,
            })),
          );
        }

        if (menu.attribute_levels) {
          const levelsMap: Record<number, number[]> = {};
          const pricesMap: Record<number, string> = {};
          const lStocksMap: Record<number, LevelStockImpact[]> = {};
          const activeIdsSet = new Set<number>();

          menu.attribute_levels.forEach((l: any) => {
            activeIdsSet.add(l.attribute_id);

            if (!levelsMap[l.attribute_id]) levelsMap[l.attribute_id] = [];
            levelsMap[l.attribute_id].push(l.id);

            pricesMap[l.id] = l.pivot.price.toString();

            if (l.stocks && l.stocks.length > 0) {
              lStocksMap[l.id] = l.stocks.map((ls: any) => ({
                stock_id: ls.id,
                amount: ls.pivot.amount.toString(),
                unit_id: ls.pivot.unit_id,
              }));
            }
          });

          setActiveAttributes(Array.from(activeIdsSet));
          setSelectedLevels(levelsMap);
          setLevelPrices(pricesMap);
          setLevelStocks(lStocksMap);
        }
      } catch (err) {
        toast("error", "Error", "Failed to load menu data");
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, [id]);

  const validateAndFormatNumber = (value: string) => {
    const cleaned = value.replace(/[^0-9]/g, "");
    if (cleaned === "" || cleaned === "0") return "";
    return cleaned.replace(/^0+/, "");
  };

  const handlePriceInput = (value: string) => {
    setForm((p) => ({ ...p, price: validateAndFormatNumber(value) }));
  };

  const handleLevelPriceInput = (levelId: number, value: string) => {
    const formatted = validateAndFormatNumber(value);
    setLevelPrices((prev) => ({ ...prev, [levelId]: formatted }));
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

  const addIngredient = (stockId: string) => {
    const stock = availableStocks.find((s) => s.id.toString() === stockId);
    if (stock) {
      setSelectedIngredients((prev) => [...prev, { ...stock, amount: "1" }]);
    }
  };

  const removeIngredient = (id: number) => {
    setSelectedIngredients((prev) => prev.filter((item) => item.id !== id));
  };

  const updateIngredientAmount = (id: number, value: string) => {
    const cleaned = value.replace(/[^0-9.]/g, "");
    setSelectedIngredients((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, amount: cleaned } : item,
      ),
    );
  };

  const updateIngredientUnit = (id: number, unitId: string) => {
    setSelectedIngredients((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, unit_id: parseInt(unitId) } : item,
      ),
    );
  };

  const addStockToLevel = (levelId: number, stockId: string) => {
    const stock = availableStocks.find((s) => s.id.toString() === stockId);
    if (!stock) return;
    setLevelStocks((prev) => ({
      ...prev,
      [levelId]: [
        ...(prev[levelId] || []),
        { stock_id: stock.id, amount: "1", unit_id: stock.unit_id },
      ],
    }));
  };

  const updateLevelStock = (
    levelId: number,
    stockId: number,
    field: string,
    value: any,
  ) => {
    let finalValue = value;
    if (field === "amount") finalValue = value.replace(/[^0-9.]/g, "");
    setLevelStocks((prev) => ({
      ...prev,
      [levelId]: (prev[levelId] || []).map((s) =>
        s.stock_id === stockId ? { ...s, [field]: finalValue } : s,
      ),
    }));
  };

  const removeLevelStock = (levelId: number, stockId: number) => {
    setLevelStocks((prev) => ({
      ...prev,
      [levelId]: prev[levelId].filter((s) => s.stock_id !== stockId),
    }));
  };

  const onDrop = (files: File[]) => {
    if (files.length) {
      setForm((prev) => ({
        ...prev,
        menu_image: files[0],
        image_preview: URL.createObjectURL(files[0]),
      }));
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpeg", ".jpg", ".png", ".webp"] },
    multiple: false,
  });

  const handleSubmit = async () => {
    setErrors({});
    setSubmitting(true);

    const fd = new FormData();
    fd.append("_method", "PUT");
    fd.append("name", form.name);
    fd.append("category_id", form.category_id);
    fd.append("description", form.description);
    fd.append("price", form.price || "0");
    fd.append("is_active", form.is_active.toString());
    if (form.menu_image) fd.append("menu_image", form.menu_image);
    if (form.discount_id && form.discount_id !== "null")
      fd.append("discount_id", form.discount_id);

    let attrIdx = 0;
    Object.entries(selectedLevels).forEach(([attrId, levels]) => {
      if (levels.length > 0) {
        fd.append(`attributes[${attrIdx}][attribute_id]`, attrId);
        levels.forEach((lId, lIdx) => {
          fd.append(
            `attributes[${attrIdx}][levels][${lIdx}][attribute_level_id]`,
            lId.toString(),
          );
          fd.append(
            `attributes[${attrIdx}][levels][${lIdx}][price]`,
            levelPrices[lId] || "0",
          );
        });
        attrIdx++;
      }
    });

    selectedIngredients.forEach((s, sIdx) => {
      fd.append(`stocks[${sIdx}][stock_id]`, s.id.toString());
      fd.append(`stocks[${sIdx}][amount]`, s.amount);
      fd.append(`stocks[${sIdx}][unit_id]`, s.unit_id.toString());
    });

    let lsIdx = 0;
    Object.entries(levelStocks).forEach(([levelId, stocks]) => {
      stocks.forEach((s) => {
        fd.append(`level_stocks[${lsIdx}][level_id]`, levelId);
        fd.append(`level_stocks[${lsIdx}][stock_id]`, s.stock_id.toString());
        fd.append(`level_stocks[${lsIdx}][amount]`, s.amount);
        fd.append(`level_stocks[${lsIdx}][unit_id]`, s.unit_id.toString());
        lsIdx++;
      });
    });

    try {
      const response = await MenuService.updateMenu(id!, fd);
      if (response.error) {
        setErrors(response.error.errors || {});
        toast("error", "Validation Error", "Please check the form.");
      } else {
        toast("success", "Success", "Menu updated successfully!");
        queryClient.invalidateQueries({ queryKey: ["menus-admin"] });
        navigate("/menu");
      }
    } catch (err: any) {
      toast("error", "Error", err?.response?.data?.message || "Update failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <MenuEditSkeleton />;

  const filteredStockOptions = availableStocks
    .filter((s) => !selectedIngredients.find((si) => si.id === s.id))
    .map((s) => ({
      label: `${s.name} (${
        typeof s.unit === "object" ? s.unit.abbreviation : s.unit
      })`,
      value: s.id.toString(),
    }));
        
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
              className={`border-2 ${
                errors.menu_image
                  ? "border-red-500 bg-red-50/50"
                  : "border-neutral-300 dark:border-neutral-700"
              } border-dashed rounded-2xl p-8 text-center hover:border-red-500 transition-all cursor-pointer bg-neutral-50 dark:bg-neutral-800/50`}
            >
              <input {...getInputProps()} />
              {form.image_preview ? (
                <div className="space-y-4">
                  <div className="relative group">
                    <img
                      src={form.image_preview}
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
                  <div className="mx-auto w-12 h-12 mb-4 bg-neutral-200 dark:bg-neutral-700 rounded-full flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-neutral-500"
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
                  <p className="text-neutral-500 font-medium">
                    Click or drag image to upload
                  </p>
                  <p className="text-neutral-400 text-xs mt-1 uppercase tracking-wider">
                    JPG, JPEG, PNG, WEBP (Max 2MB)
                  </p>
                </div>
              )}
            </div>
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
            </div>

            <div>
              <Label>Base Price (IDR)</Label>
              <Input
                type="text"
                placeholder="e.g. 25000"
                value={form.price}
                onChange={(e) => handlePriceInput(e.target.value)}
              />
            </div>

            <div className="bg-neutral-50 dark:bg-neutral-800/40 p-4 rounded-2xl border border-neutral-100 dark:border-neutral-700">
              <Switch
                checked={!!form.is_active}
                label="Visibility Status"
                onChange={(v) =>
                  setForm((prev) => ({ ...prev, is_active: v ? 1 : 0 }))
                }
              />
            </div>

            <div className="space-y-4">
              <Label className="block border-b pb-2 dark:border-neutral-700">
                Recipe Ingredients
              </Label>
              <Select
                options={[
                  { label: "Select ingredient to add...", value: "" },
                  ...filteredStockOptions,
                ]}
                value=""
                onChange={(val) => val && addIngredient(val as string)}
              />
              <div className="space-y-2 mt-3">
                {selectedIngredients.map((ing: any) => {
                  const stockCategory =
                    ing.unit_category ||
                    (typeof ing.unit === "object" ? ing.unit?.category : null);
                  const filteredUnits = allUnits.filter(
                    (u) => u.category === stockCategory,
                  );

                  const groupedUnits = allUnits.reduce((acc, unit) => {
                    const category = unit.category;
                    if (!acc[category]) {
                      acc[category] = [];
                    }
                    acc[category].push(unit);
                    return acc;
                  }, {});

                  return (
                    <div
                      key={ing.id}
                      className="flex items-center justify-between bg-white dark:bg-neutral-900 p-3 rounded-xl border border-neutral-200 dark:border-neutral-700"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-bold text-neutral-700 dark:text-neutral-200 uppercase">
                          {ing.name}
                        </p>
                        <p className="text-[10px] text-neutral-400">
                          Default:{" "}
                          {typeof ing.unit === "object"
                            ? ing.unit?.abbreviation
                            : ing.unit}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          className="w-16 px-2 py-1 text-sm border rounded-lg dark:bg-neutral-800 dark:border-neutral-700"
                          value={ing.amount}
                          onChange={(e) =>
                            updateIngredientAmount(ing.id, e.target.value)
                          }
                        />
                        <select
                          className="text-xs p-1 border rounded-lg bg-transparent dark:bg-neutral-800 dark:border-neutral-700"
                          value={
                            ing.unit_id ||
                            (typeof ing.unit === "object" ? ing.unit.id : "")
                          }
                          onChange={(e) =>
                            updateIngredientUnit(ing.id, e.target.value)
                          }
                        >
                          <option value="">Pilih Satuan</option>
                          {Object.keys(groupedUnits).map((category) => (
                            <optgroup
                              key={category}
                              label={category.toUpperCase()}
                            >
                              {groupedUnits[category].map((u) => (
                                <option key={u.id} value={u.id}>
                                  {u.name} ({u.abbreviation})
                                </option>
                              ))}
                            </optgroup>
                          ))}
                        </select>
                        <button
                          onClick={() => removeIngredient(ing.id)}
                          className="text-red-500 hover:bg-red-50 p-1 rounded-lg"
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
                  );
                })}
              </div>
            </div>

            <div className="space-y-4">
              <Label className="block border-b pb-2 dark:border-neutral-700">
                Available Attributes
              </Label>
              <div className="flex gap-3 flex-wrap">
                {attributes.map((attr) => (
                  <label
                    key={attr.id}
                    className={`flex items-center gap-2 px-4 py-2 rounded-sm border cursor-pointer transition-all ${
                      activeAttributes.includes(attr.id)
                        ? "border-red-500 bg-red-50 text-red-600"
                        : "border-neutral-200 text-neutral-500"
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
                      className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg p-5"
                    >
                      <p className="font-bold text-neutral-800 dark:text-white uppercase text-xs mb-4">
                        {attr.name} Options
                      </p>
                      <div className="space-y-4">
                        {attr.levels.map((level) => (
                          <div key={level.id} className="w-full">
                            <div className="flex items-center gap-4">
                              <button
                                type="button"
                                onClick={() => toggleLevel(attr.id, level.id)}
                                className={`px-4 py-2 rounded-sm text-xs transition-all min-w-[100px] ${
                                  selectedLevels[attr.id]?.includes(level.id)
                                    ? "bg-red-500 text-white"
                                    : "bg-neutral-100 text-neutral-500"
                                }`}
                              >
                                {level.name}
                              </button>
                              {selectedLevels[attr.id]?.includes(level.id) && (
                                <div className="flex-1">
                                  <input
                                    type="text"
                                    placeholder="Extra Price (e.g. 5000)"
                                    className="w-full px-3 py-1.5 text-xs border rounded bg-transparent dark:border-neutral-700"
                                    value={levelPrices[level.id] || ""}
                                    onChange={(e) =>
                                      handleLevelPriceInput(
                                        level.id,
                                        e.target.value,
                                      )
                                    }
                                  />
                                </div>
                              )}
                            </div>

                            {selectedLevels[attr.id]?.includes(level.id) && (
                              <div className="mt-3 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg border-l-4 border-red-500 space-y-3 ml-4">
                                <p className="text-[10px] font-bold uppercase">
                                  Stock Impact: {level.name}
                                </p>
                                <Select
                                  options={[
                                    {
                                      label: "+ Add Ingredient Impact",
                                      value: "",
                                    },
                                    ...availableStocks.map((s) => ({
                                      label: s.name,
                                      value: s.id.toString(),
                                    })),
                                  ]}
                                  value=""
                                  onChange={(val) =>
                                    val &&
                                    addStockToLevel(level.id, val as string)
                                  }
                                />
                                {levelStocks[level.id]?.map((ls) => {
                                  const sInfo = availableStocks.find(
                                    (as) => as.id === ls.stock_id,
                                  );

                                  const stockCategory = sInfo?.unit?.category;
                                  const filteredUnits = allUnits?.filter(
                                    (u) => u.category === stockCategory,
                                  );

                                  return (
                                    <div
                                      key={ls.stock_id}
                                      className="flex gap-2 items-center bg-white dark:bg-neutral-900 p-2 rounded border border-neutral-100 dark:border-neutral-700"
                                    >
                                      <div className="flex-1">
                                        <span className="text-xs block font-medium">
                                          {sInfo?.name}
                                        </span>
                                        <span className="text-[10px] text-neutral-500 dark:text-neutral-400">
                                          Standard: {sInfo?.unit?.name}
                                        </span>
                                      </div>

                                      <input
                                        type="text"
                                        className="w-16 p-1 text-xs border rounded bg-transparent dark:border-neutral-600"
                                        value={ls.amount}
                                        onChange={(e) =>
                                          updateLevelStock(
                                            level.id,
                                            ls.stock_id,
                                            "amount",
                                            e.target.value,
                                          )
                                        }
                                      />

                                      <select
                                        className="text-xs p-1 border rounded bg-transparent dark:bg-neutral-800 dark:border-neutral-600"
                                        value={ls.unit_id}
                                        onChange={(e) =>
                                          updateLevelStock(
                                            level.id,
                                            ls.stock_id,
                                            "unit_id",
                                            e.target.value,
                                          )
                                        }
                                      >
                                        {(filteredUnits &&
                                        filteredUnits.length > 0
                                          ? filteredUnits
                                          : allUnits
                                        ).map((u) => (
                                          <option key={u.id} value={u.id}>
                                            {u.abbreviation} ({u.name})
                                          </option>
                                        ))}
                                      </select>

                                      <button
                                        onClick={() =>
                                          removeLevelStock(
                                            level.id,
                                            ls.stock_id,
                                          )
                                        }
                                        className="text-red-500"
                                      >
                                        <svg
                                          className="w-4 h-4"
                                          fill="none"
                                          stroke="currentColor"
                                          viewBox="0 0 24 24"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M6 18L18 6M6 6l12 12"
                                          />
                                        </svg>
                                      </button>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            <div className="pt-6">
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full py-4 rounded-2xl font-bold text-sm"
              >
                {loading ? <LoadingSpinner /> : <span>Create & Save Menu</span>}
              </Button>
            </div>
          </div>
        </div>
      </ComponentCard>
    </>
  );
}

export default EditMenu;

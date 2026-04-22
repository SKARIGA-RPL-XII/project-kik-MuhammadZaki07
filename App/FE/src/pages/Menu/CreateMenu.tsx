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
import { stockService } from "../../services/stock.service";
import { UnitService } from "../../services/unit.service";
import { useToast } from "@/context/ToastContext";
import { useNavigate } from "react-router";
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
  unit_id: number;
  unit_category: string;
}

interface SelectedStock extends Stock {
  amount: string;
}

interface LevelStockImpact {
  stock_id: number;
  amount: string;
  unit_id: number;
}

function CreateMenu() {
  const [form, setForm] = useState({
    menu_image: null as File | null,
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

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resAttr, resCat, resDisc, resStock, resUnits] =
          await Promise.all([
            AttributeService.getAttributes(),
            CategoryService.getCategories(),
            DiscountService.getDiscounts(),
            stockService.getAll(0, 100),
            UnitService.getUnits({ size: 100 }),
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
      } catch (err) {
        toast("error", "Error", "Failed to load initial data");
      }
    };
    fetchData();
  }, []);

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
      setLevelStocks((prev) => {
        const copy = { ...prev };
        delete copy[levelId];
        return copy;
      });
      setLevelPrices((prev) => {
        const copy = { ...prev };
        delete copy[levelId];
        return copy;
      });
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
    if (field === "amount") {
      finalValue = value.replace(/[^0-9.]/g, "");
    }
    setLevelStocks((prev) => ({
      ...prev,
      [levelId]: prev[levelId].map((s) =>
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
      setForm((prev) => ({ ...prev, menu_image: files[0] }));
      setErrors((prev) => ({ ...prev, menu_image: "" }));
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpeg", ".jpg", ".png", ".webp"] },
    multiple: false,
  });

  const handleSubmit = async () => {
    setErrors({});
    setLoading(true);

    const payload = {
      ...form,
      attributes: Object.entries(selectedLevels || {}).map(
        ([attrId, levels]) => ({
          attribute_id: attrId,
          levels: (levels || [])
            .filter((lId) => lId !== undefined && lId !== null)
            .map((lId) => ({
              attribute_level_id: lId.toString(),
              price: levelPrices?.[lId]?.toString() || "0",
            })),
        }),
      ),

      stocks: (selectedIngredients || []).map((ing) => ({
        stock_id: ing.id?.toString() || "",
        amount: ing.amount?.toString() || "0",
        unit_id: ing.unit_id?.toString() || "",
      })),

      level_stocks: Object.entries(levelStocks || {}).flatMap(
        ([levelId, stocks]) =>
          (stocks || []).map((s) => ({
            level_id: levelId?.toString() || "",
            stock_id: s.stock_id?.toString() || "",
            amount: s.amount?.toString() || "0",
            unit_id: s.unit_id?.toString() || "",
          })),
      ),
    };
    console.log("Payload Object:", JSON.stringify(payload, null, 2));

    try {
      const fd = new FormData();
      fd.append("name", payload.name);
      fd.append("category_id", payload.category_id);
      fd.append("description", payload.description);
      fd.append("price", payload.price || "0");
      fd.append("is_active", payload.is_active.toString());
      if (payload.menu_image) fd.append("menu_image", payload.menu_image);
      if (payload.discount_id && payload.discount_id !== "null")
        fd.append("discount_id", payload.discount_id);

      payload.attributes.forEach((attr, aIdx) => {
        if (!attr?.attribute_id) return;

        fd.append(
          `attributes[${aIdx}][attribute_id]`,
          attr.attribute_id.toString(),
        );

        (attr.levels || []).forEach((lvl, lIdx) => {
          if (!lvl?.attribute_level_id) return;

          fd.append(
            `attributes[${aIdx}][levels][${lIdx}][attribute_level_id]`,
            lvl.attribute_level_id.toString(),
          );

          fd.append(
            `attributes[${aIdx}][levels][${lIdx}][price]`,
            lvl.price?.toString() || "0",
          );
        });
      });

      payload.stocks.forEach((s, sIdx) => {
        fd.append(`stocks[${sIdx}][stock_id]`, s.stock_id.toString());
        fd.append(`stocks[${sIdx}][amount]`, s.amount);
        fd.append(`stocks[${sIdx}][unit_id]`, s.unit_id.toString());
      });

      payload.level_stocks.forEach((ls, lsIdx) => {
        fd.append(`level_stocks[${lsIdx}][level_id]`, ls.level_id);
        fd.append(`level_stocks[${lsIdx}][stock_id]`, ls.stock_id.toString());
        fd.append(`level_stocks[${lsIdx}][amount]`, ls.amount);
        fd.append(`level_stocks[${lsIdx}][unit_id]`, ls.unit_id.toString());
      });

      const response = await MenuService.createMenu(fd);
      console.log("Server Response:", response);

      if (response.error) {
        const validationErrors: Record<string, string> = {};
        const rawErrors = response.error.errors || response.error;
        if (typeof rawErrors === "object") {
          Object.entries(rawErrors).forEach(([key, messages]) => {
            validationErrors[key] = Array.isArray(messages)
              ? messages[0]
              : (messages as string);
          });
          setErrors(validationErrors);
        }
        toast("error", "Validation Error", "Please check the form again.");
      } else {
        toast("success", "Success", "Menu created successfully!");
        queryClient.invalidateQueries({ queryKey: ["menus-admin"] });
        navigate("/menu");
      }
    } catch (err: any) {
      console.error("Submission Error:", err);
      toast(
        "error",
        "Error",
        err?.response?.data?.message || "An unexpected error occurred",
      );
    } finally {
      setLoading(false);
    }
  };

  const filteredStockOptions = availableStocks
    .filter((s) => !selectedIngredients.find((si) => si.id === s.id))
    .map((s) => ({
      label: `${s.name} (${
        typeof s.unit === "object" ? (s.unit as any).abbreviation : s.unit
      })`,
      value: s.id.toString(),
    }));

  const updateIngredientUnit = (id: number, unitId: string) => {
    setSelectedIngredients((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, unit_id: parseInt(unitId) } : item,
      ),
    );
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
              className={`border-2 ${
                errors.menu_image
                  ? "border-red-500 bg-red-50/50"
                  : "border-gray-300 dark:border-gray-700"
              } border-dashed rounded-2xl p-8 text-center hover:border-red-500 transition-all cursor-pointer bg-gray-50 dark:bg-gray-800/50`}
            >
              <input {...getInputProps()} />
              {form?.menu_image ? (
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

            <div className="bg-gray-50 dark:bg-gray-800/40 p-4 rounded-2xl border border-gray-100 dark:border-gray-700">
              <Switch
                checked={!!form.is_active}
                label="Visibility Status"
                onChange={(v) =>
                  setForm((prev) => ({ ...prev, is_active: v ? 1 : 0 }))
                }
              />
            </div>

            <div className="space-y-4">
              <Label className="block border-b pb-2 dark:border-gray-700">
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

                  return (
                    <div
                      key={ing.id}
                      className="flex items-center justify-between bg-white dark:bg-gray-900 p-3 rounded-xl border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-bold text-gray-700 dark:text-gray-200 uppercase">
                          {ing.name}
                        </p>
                        <p className="text-[10px] text-gray-400">
                          Default:{" "}
                          {typeof ing.unit === "object"
                            ? ing.unit?.abbreviation
                            : ing.unit}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          className="w-16 px-2 py-1 text-sm border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                          value={ing.amount}
                          onChange={(e) =>
                            updateIngredientAmount(ing.id, e.target.value)
                          }
                        />
                        <select
                          className="text-xs p-1 border rounded-lg bg-transparent dark:bg-gray-800 dark:border-gray-700"
                          value={
                            ing.unit_id ||
                            (typeof ing.unit === "object" ? ing.unit.id : "")
                          }
                          onChange={(e) =>
                            updateIngredientUnit(ing.id, e.target.value)
                          }
                        >
                          {(filteredUnits.length > 0
                            ? filteredUnits
                            : allUnits
                          ).map((u) => (
                            <option key={u.id} value={u.id}>
                              {u.abbreviation}
                            </option>
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
              <Label className="block border-b pb-2 dark:border-gray-700">
                Available Attributes
              </Label>
              <div className="flex gap-3 flex-wrap">
                {attributes.map((attr) => (
                  <label
                    key={attr.id}
                    className={`flex items-center gap-2 px-4 py-2 rounded-sm border cursor-pointer transition-all ${
                      activeAttributes.includes(attr.id)
                        ? "border-red-500 bg-red-50 text-red-600"
                        : "border-gray-200 text-gray-500"
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
                      className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-5"
                    >
                      <p className="font-bold text-gray-800 dark:text-white uppercase text-xs mb-4">
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
                                    : "bg-gray-100 text-gray-500"
                                }`}
                              >
                                {level.name}
                              </button>
                              {selectedLevels[attr.id]?.includes(level.id) && (
                                <div className="flex-1">
                                  <input
                                    type="text"
                                    placeholder="Extra Price (e.g. 5000)"
                                    className="w-full px-3 py-1.5 text-xs border rounded bg-transparent dark:border-gray-700"
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
                              <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border-l-4 border-red-500 space-y-3 ml-4">
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
                                      className="flex gap-2 items-center bg-white dark:bg-gray-900 p-2 rounded border border-gray-100 dark:border-gray-700"
                                    >
                                      <div className="flex-1">
                                        <span className="text-xs block font-medium">
                                          {sInfo?.name}
                                        </span>
                                        <span className="text-[10px] text-gray-500 dark:text-gray-400">
                                          Standard: {sInfo?.unit?.name}
                                        </span>
                                      </div>

                                      <input
                                        type="text"
                                        className="w-16 p-1 text-xs border rounded bg-transparent dark:border-gray-600"
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
                                        className="text-xs p-1 border rounded bg-transparent dark:bg-gray-800 dark:border-gray-600"
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

export default CreateMenu;

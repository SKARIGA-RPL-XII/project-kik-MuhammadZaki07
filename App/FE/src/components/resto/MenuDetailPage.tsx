import { motion } from "framer-motion";
import { useState, useMemo } from "react";
import { Minus, Plus, ShoppingBag, ArrowLeft, Loader2 } from "lucide-react";
import { useNavigate, useParams } from "react-router";
import { useCart } from "@/hooks/useCart";
import { MenuService } from "@/services/menu.service";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/context/ToastContext";
import { useTranslation } from "react-i18next";

export default function MenuDetailPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const { t } = useTranslation();
  const { addToCart } = useCart();
  const { toast } = useToast();

  const [quantity, setQuantity] = useState(1);
  const [selectedAttributes, setSelectedAttributes] = useState<
    Record<number, number>
  >({});

  const {
    data: menu,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["menu", id],
    queryFn: async () => {
      const response = await MenuService.getMenuById(id!);
      return response.data;
    },
    enabled: !!id,
  });

  const uniqueAttributes = useMemo(() => {
    if (!menu?.attributes || !Array.isArray(menu.attributes)) return [];
    const seen = new Set();
    return menu.attributes.filter((attr: any) => {
      const duplicate = seen.has(attr?.id);
      seen.add(attr?.id);
      return !duplicate;
    });
  }, [menu]);

  const priceData = useMemo(() => {
    const originalPrice = menu?.price ?? 0;
    const discountValue =
      menu?.discount?.is_active && menu?.discount?.value_discount
        ? menu.discount.value_discount
        : 0;
    const discountedPrice =
      originalPrice - (originalPrice * discountValue) / 100;
    return { originalPrice, discountValue, discountedPrice };
  }, [menu]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-neutral-900">
        <Loader2 className="animate-spin text-red-600" size={32} />
      </div>
    );
  }

  if (isError || !menu) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-50 p-6 text-center">
        <p className="text-neutral-500 mb-4">{t("md_error_title")}</p>
        <button
          onClick={() => nav(-1)}
          className="text-red-600 font-bold underline"
        >
          {t("md_error_back")}
        </button>
      </div>
    );
  }

  const imageUrl = menu.menu_image
    ? `${import.meta.env.VITE_STORAGE_URL}/${menu.menu_image}`
    : "https://placehold.co/600x400?text=No+Image";

  const handleAdd = () => {
    const isAllAttributesSelected = uniqueAttributes.every(
      (attr: any) => selectedAttributes[attr.id],
    );
    if (!isAllAttributesSelected) {
      toast("warning", t("md_toast_warning"), "");
      return;
    }

    addToCart(
      { ...menu, selectedAttributes, finalPrice: priceData.discountedPrice },
      quantity,
    );
    nav(-1);
  };

return (
  <div className="min-h-screen pb-40">
    <div className="max-w-5xl mx-auto px-4 lg:px-6 pt-6">
      <button
        onClick={() => nav(-1)}
        className="mb-4 flex items-center gap-2 text-neutral-700 dark:text-neutral-300"
      >
        <ArrowLeft size={18} />
        <span className="text-sm">Back</span>
      </button>

      {/* GRID LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* IMAGE - MOBILE TOP, DESKTOP RIGHT */}
        <div className="order-1 lg:order-2">
          <div className="relative w-full h-[280px] lg:h-[420px] overflow-hidden rounded-xl">
            <img
              src={imageUrl}
              className="w-full h-full object-cover"
              alt={menu.name}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-neutral-900 via-transparent to-transparent" />
          </div>
        </div>

        {/* CONTENT */}
        <div className="order-2 lg:order-1 space-y-5">
          <div>
            <span className="text-[10px] font-semibold text-red-600 bg-red-50 px-2 py-1 rounded">
              {menu.category?.name ?? t("md_category_default")}
            </span>

            <h1 className="text-2xl lg:text-3xl font-bold text-neutral-900 dark:text-neutral-300 mt-2">
              {menu.name}
            </h1>

            <p className="text-neutral-500 dark:text-neutral-300 text-sm mt-3">
              {menu.description}
            </p>
          </div>

          {/* PRICE */}
          <div className="flex items-end justify-between">
            <div>
              {priceData.discountValue > 0 && (
                <p className="text-xs text-rose-500 line-through">
                  Rp {priceData.originalPrice.toLocaleString("id-ID")}
                </p>
              )}
              <p className="text-xl font-black text-red-600 dark:text-white">
                Rp {priceData.discountedPrice.toLocaleString("id-ID")}
              </p>
            </div>
          </div>

          {/* ATTRIBUTES */}
          <div className="space-y-5">
            {uniqueAttributes.map((attr: any) => (
              <div key={attr.id}>
                <h3 className="text-xs font-medium text-neutral-500 mb-2">
                  {attr.name}
                </h3>

                <div className="flex flex-wrap gap-2">
                  {attr.levels?.map((level: any) => (
                    <button
                      key={level.id}
                      onClick={() =>
                        setSelectedAttributes((prev) => ({
                          ...prev,
                          [attr.id]: level.id,
                        }))
                      }
                      className={`px-3 py-1 text-xs rounded-sm border transition ${
                        selectedAttributes[attr.id] === level.id
                          ? "bg-red-600 text-white border-red-600"
                          : "bg-white dark:bg-neutral-800 text-neutral-500"
                      }`}
                    >
                      {level.name}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* STOCK COMPOSITION (MINIMALIST VERSION) */}
          {menu?.stocks?.length > 0 && (
            <div className="pt-3">
              <p className="text-xs text-neutral-400 mb-2">Komposisi</p>

              <div className="flex flex-wrap gap-2">
                {menu.stocks.slice(0, 2).map((s: any) => (
                  <div
                    key={s.id}
                    className="flex items-center gap-2 px-3 py-1 bg-neutral-100 dark:bg-neutral-800 rounded-full text-[11px] text-neutral-600 dark:text-neutral-300"
                  >
                    <span className="font-medium">{s.name}</span>
                    <span className="opacity-60">
                      {s.pivot.amount} {s.unit}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>

    {/* BOTTOM BAR */}
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 dark:bg-neutral-900/60 backdrop-blur border-t">
      <div className="max-w-2xl mx-auto flex gap-3">
        <div className="flex items-center bg-neutral-100 dark:bg-neutral-800 rounded-sm">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="w-10 h-10 flex items-center justify-center"
          >
            <Minus size={16} />
          </button>

          <span className="w-10 text-center text-sm font-bold">
            {quantity}
          </span>

          <button
            onClick={() => setQuantity(quantity + 1)}
            className="w-10 h-10 flex items-center justify-center"
          >
            <Plus size={16} />
          </button>
        </div>

        <button
          onClick={handleAdd}
          className="flex-1 h-11 bg-red-600 text-white rounded-sm text-sm flex items-center justify-between px-4"
        >
          <div className="flex items-center gap-2">
            <ShoppingBag size={16} />
            <span>Add</span>
          </div>
          <span>
            Rp {(priceData.discountedPrice * quantity).toLocaleString("id-ID")}
          </span>
        </button>
      </div>
    </div>
  </div>
);
}

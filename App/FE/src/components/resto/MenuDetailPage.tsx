  import { motion } from "framer-motion";
  import { useState, useMemo } from "react";
  import { Minus, Plus, ShoppingBag, ArrowLeft, Loader2 } from "lucide-react";
  import { useNavigate, useParams } from "react-router";
  import { useCart } from "@/hooks/useCart";
  import { MenuService } from "@/services/menu.service";
  import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/context/ToastContext";

  export default function MenuDetailPage() {
    const { id } = useParams();
    const nav = useNavigate();
    const { addToCart } = useCart();
    const {toast} = useToast()

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
        <div className="min-h-screen flex items-center justify-center bg-white">
          <Loader2 className="animate-spin text-red-600" size={32} />
        </div>
      );
    }

    if (isError || !menu) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-50 p-6 text-center">
          <p className="text-neutral-500 mb-4">
            Waduh, menu tidak ditemukan atau server lagi capek, Bos.
          </p>
          <button
            onClick={() => nav(-1)}
            className="text-red-600 font-bold underline"
          >
            Kembali
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
        toast("warning" , "Pilih semua opsi dulu ya!" , "");
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
        <div className="relative h-[300px] overflow-hidden">
          <img
            src={imageUrl}
            className="absolute inset-0 w-full h-full object-cover"
            alt={menu.name}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
          <button
            onClick={() => nav(-1)}
            className="absolute top-4 left-10 bg-white shadow-lg rounded-full p-3 active:scale-90 transition-transform"
          >
            <ArrowLeft size={18} className="text-neutral-900" />
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto px-6 -mt-10 relative"
        >
          <div className="bg-white rounded-t-xl p-5">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <span className="text-[10px] font-semibold text-red-600 bg-red-50 px-2 py-1 rounded">
                  {menu.category?.name ?? "Umum"}
                </span>
                <h1 className="text-2xl font-bold text-neutral-900 mt-2">
                  {menu.name}
                </h1>
              </div>

              <div className="text-right">
                {priceData.discountValue > 0 && (
                  <p className="text-xs text-rose-500 line-through font-bold">
                    Rp {priceData.originalPrice.toLocaleString("id-ID")}
                  </p>
                )}
                <p className="text-xl font-black text-red-600">
                  Rp {priceData.discountedPrice.toLocaleString("id-ID")}
                </p>
              </div>
            </div>

            <p className="text-neutral-500 text-sm mb-8 leading-relaxed">
              {menu.description}
            </p>

            <div className="space-y-8">
              {uniqueAttributes.length > 0 ? (
                uniqueAttributes.map((attr: any) => (
                  <div key={attr.id}>
                    <h3 className="text-sm font-medium dark:text-neutral-200 mb-3">
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
                          className={`px-4 py-2 rounded-sm text-xs font-normal border transition-all ${
                            selectedAttributes[attr.id] === level.id
                              ? "bg-red-500 text-white"
                              : "bg-white text-neutral-500 border-neutral-200"
                          }`}
                        >
                          {level.name}
                        </button>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 bg-neutral-50 rounded-2xl text-center">
                  <p className="text-sm text-neutral-400">
                    No extra options available
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        <div className="fixed bottom-0 left-0 right-0 p-5 bg-white/90 backdrop-blur-md border-t border-neutral-100">
          <div className="max-w-2xl mx-auto flex gap-4">
            <div className="flex items-center bg-neutral-100 rounded-sm p-1">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 flex items-center justify-center"
              >
                <Minus size={16} />
              </button>
              <span className="w-8 text-center font-black text-sm">
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
              className="flex-1 h-12 bg-red-600 text-white rounded-sm font-medium flex items-center justify-between px-6 text-sm shadow-lg shadow-red-600/20"
            >
              <div className="flex items-center gap-2">
                <ShoppingBag size={16} />
                <span>Tambah ke keranjang</span>
              </div>
              <span>
                Rp{" "}
                {(priceData.discountedPrice * quantity).toLocaleString("id-ID")}
              </span>
            </button>
          </div>
        </div>
      </div>
    );
  }

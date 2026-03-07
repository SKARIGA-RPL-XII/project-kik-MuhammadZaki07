import { Card, CardContent } from "@/components/ui/card";
import { PackageX, Plus, Tag } from "lucide-react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { motion } from "framer-motion";

interface ProductCardProps {
  item: any;
  onClick: (item: any) => void;
}

export function ProductCard({ item, onClick }: ProductCardProps) {
  const isOutOfStock = item.stocks?.some(
    (stock: any) => stock.quantity < (stock.pivot?.amount || 0),
  );
  const discountData = item.discount;
  const hasDiscount = discountData && discountData.is_active === 1;

  const originalPrice = Number(item.price);
  const discountValue = hasDiscount ? Number(discountData.value_discount) : 0;
  const finalPrice = hasDiscount
    ? originalPrice - originalPrice * (discountValue / 100)
    : originalPrice;

  return (
    <TooltipProvider>
      <Card
        className={`group relative border-2 transition-all duration-300 rounded-xl bg-white overflow-hidden select-none
          ${
            isOutOfStock
              ? "opacity-75 cursor-not-allowed border-zinc-100 grayscale-[0.5]"
              : "cursor-pointer border-transparent hover:border-red-600 hover:shadow-2xl hover:shadow-red-100/50 active:scale-95"
          }`}
        onClick={() => !isOutOfStock && onClick(item)}
      >
        <CardContent className="p-0">
          <div className="aspect-square bg-zinc-50 relative overflow-hidden">
            <img
              src={`${import.meta.env.VITE_STORAGE_URL}/${item.menu_image}`}
              alt={item.name}
              loading="lazy"
              className={`object-cover w-full h-full transition-transform duration-700 
                ${!isOutOfStock && "group-hover:scale-110"}`}
            />

            {!isOutOfStock && hasDiscount && (
              <div className="absolute top-4 right-4 z-20">
                <motion.div
                  initial={{ opacity: 0, scale: 0.5, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                  className="relative overflow-hidden bg-red-600 text-white px-3 py-1 rounded-full shadow-[0_8px_16px_-4px_rgba(220,38,38,0.5)] flex items-center gap-1.5 border border-white/20"
                >
                  <Tag className="h-3 w-3 relative z-10" />
                  <span className="text-[10px] font-black relative z-10 tracking-tighter uppercase">
                    {discountValue}% OFF
                  </span>

                  <motion.div
                    initial={{ left: "-100%" }}
                    animate={{ left: "200%" }}
                    transition={{
                      repeat: Infinity,
                      duration: 1.8,
                      ease: "linear",
                      repeatDelay: 1,
                    }}
                    className="absolute top-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-20deg]"
                  />
                </motion.div>
              </div>
            )}

            {isOutOfStock && (
              <div className="absolute inset-0 bg-zinc-900/70 backdrop-blur-[2px] flex flex-col items-center justify-center text-white p-4 text-center">
                <PackageX className="h-14 w-14 mb-2 text-red-500" strokeWidth={1} />
                <span className="text-sm">
                  Insufficient Stock
                </span>
              </div>
            )}
          </div>

          <div className="p-3 space-y-1">
            <div className="flex flex-col">
              <span className="text-xs text-zinc-400 leading-none mb-1">
                {item.category?.name || "Menu"}
              </span>
              <h3 className="font-bold text-zinc-900 text-lg leading-tight truncate group-hover:text-red-600 transition-colors">
                {item.name}
              </h3>
            </div>

            <div className="pt-z flex items-end justify-between">
              <div className="flex flex-col">
                {hasDiscount && (
                  <span className="text-xs text-zinc-400 line-through decoration-red-400 font-bold">
                    Rp {originalPrice.toLocaleString()}
                  </span>
                )}
                <p className="text-red-600 font-bold text-md leading-none">
                  Rp {finalPrice.toLocaleString()}
                </p>
              </div>

              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center transition-all duration-300
                ${isOutOfStock ? "bg-zinc-100" : "bg-zinc-100 group-hover:bg-red-600 shadow-sm"}`}
              >
                <span
                  className={`${isOutOfStock ? "text-zinc-300" : "text-zinc-400 group-hover:text-white"}`}
                >
                  <Plus size={23}/>
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}

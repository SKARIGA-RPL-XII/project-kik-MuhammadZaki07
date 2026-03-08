import { motion } from "framer-motion";
import { Star, Zap, Plus, PackageX, Crown } from "lucide-react";
import { useNavigate } from "react-router";

interface MenuCardProps {
  item: any;
  onOpenDetail: (item: any) => void;
}

export function MenuCard({ item, onOpenDetail }: MenuCardProps) {
  const navigate = useNavigate();

  const isOutOfStock = item.stocks?.some(
    (stock: any) => (stock.quantity ?? 0) < (stock.pivot?.amount || 0),
  );

  const isBestSeller = !isOutOfStock && item.is_best_seller;

  const hasDiscount = item.discount && item.discount.value_discount > 0;
  const discountedPrice = hasDiscount
    ? item.price - (item.price * item.discount!.value_discount) / 100
    : item.price;

  const handleCardClick = () => {
    if (!isOutOfStock) {
      navigate(`/menu/${item.id}`);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      onClick={handleCardClick}
      className={`group relative flex flex-col bg-white rounded-xl border transition-all duration-300 overflow-hidden 
        ${
          isOutOfStock
            ? "opacity-80 grayscale-[0.6] cursor-not-allowed border-neutral-100"
            : isBestSeller
              ? "cursor-pointer border-amber-200 shadow-[0_0_15px_rgba(251,191,36,0.1)]"
              : "cursor-pointer border-neutral-100 hover:border-red-200"
        }`}
    >
      {isBestSeller && (
        <>
          <motion.div
            animate={{ opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute inset-0 border-2 border-amber-400/30 rounded-xl z-0"
          />
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={`border-p-${i}`}
                animate={{
                  top: ["0%", "100%", "0%"],
                  left: i % 2 === 0 ? ["0%", "100%"] : ["100%", "0%"],
                  opacity: [0, 0.4, 0],
                }}
                transition={{
                  duration: Math.random() * 5 + 5,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="absolute w-1 h-1 bg-amber-400 rounded-full blur-[1px]"
              />
            ))}
          </div>
        </>
      )}

      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]" />

      <div className="relative aspect-[5/4] overflow-hidden bg-neutral-50 border-b border-neutral-50">
        <img
          src={`${import.meta.env.VITE_STORAGE_URL}/${item.menu_image}`}
          alt={item.name}
          loading="lazy"
          draggable={false}
          className={`h-full w-full object-cover transition-transform duration-700 
            ${!isOutOfStock && "group-hover:scale-110"}`}
        />

        {isOutOfStock && (
          <div className="absolute inset-0 bg-neutral-500/50 backdrop-blur-[1px] flex items-center justify-center z-20">
            <div className="bg-red-500 text-white px-3 py-1 rounded-full flex items-center gap-1.5 shadow-lg">
              <PackageX size={12} strokeWidth={1} />
              <span className="text-sm font-normal">Sold Out</span>
            </div>
          </div>
        )}

        {isBestSeller && (
          <div className="absolute top-2 right-2 z-30">
            <div className="absolute inset-0 flex items-center justify-center">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    x: [0, (i % 2 === 0 ? 1 : -1) * (Math.random() * 25 + 15)],
                    y: [0, (i < 3 ? 1 : -1) * (Math.random() * 25 + 15)],
                    opacity: [0, 1, 0],
                    scale: [0, 1.2, 0],
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    delay: i * 0.4,
                  }}
                  className="absolute w-1 h-1 bg-amber-400 rounded-full blur-[0.5px]"
                />
              ))}
            </div>

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="relative"
            >
              <motion.div
                animate={{
                  boxShadow: [
                    "0px 0px 5px rgba(251, 191, 36, 0.3)",
                    "0px 0px 20px rgba(251, 191, 36, 0.7)",
                    "0px 0px 5px rgba(251, 191, 36, 0.3)",
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="relative bg-gradient-to-br from-amber-300 via-amber-500 to-amber-600 text-amber-950 px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-xl border border-amber-200/50 overflow-hidden"
              >
                <motion.div
                  animate={{ x: ["-150%", "150%"] }}
                  transition={{
                    duration: 1.8,
                    repeat: Infinity,
                    repeatDelay: 2,
                  }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/80 to-transparent -skew-x-12 w-[60%]"
                />
                <Crown
                  size={12}
                  strokeWidth={3}
                  className="fill-amber-950/80 relative z-10"
                />
                <span className="text-[10px] font-black uppercase tracking-tight relative z-10">
                  Best Seller
                </span>
              </motion.div>
            </motion.div>
          </div>
        )}

        {!isOutOfStock && hasDiscount && (
          <div className="absolute top-0 left-0 z-20">
            <div className="absolute inset-0 flex items-center justify-center">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={`discount-p-${i}`}
                  animate={{
                    x: [0, Math.random() * 30 + 10],
                    y: [0, Math.random() * 30 + 10],
                    opacity: [0, 1, 0],
                    scale: [0, 1.5, 0],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.3,
                    ease: "easeOut",
                  }}
                  className="absolute w-1 h-1 bg-rose-400 rounded-full blur-[0.5px]"
                />
              ))}
            </div>

            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="relative bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 text-white px-3 py-1.5 rounded-br-xl font-black text-[10px] uppercase tracking-tighter shadow-md overflow-hidden"
            >
              <motion.div
                animate={{ x: ["-150%", "150%"] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 1,
                  ease: "easeInOut",
                }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-12 w-[40%]"
              />

              <span className="relative z-10 flex items-center gap-1">
                {item.discount?.value_discount}% OFF
              </span>
            </motion.div>
          </div>
        )}
      </div>

      <div className="flex flex-col p-3.5 relative z-10">
        <div className="flex justify-between items-center mb-1">
          <span
            className={`text-[10px] font-medium ${isOutOfStock ? "text-neutral-400" : isBestSeller ? "text-amber-600" : "text-red-600"}`}
          >
            {item.category?.name}
          </span>
        </div>

        <h3
          className={`font-bold text-lg line-clamp-1 mb-1 transition-colors 
          ${isOutOfStock ? "text-neutral-400" : isBestSeller ? "text-neutral-900 group-hover:text-amber-600" : "text-neutral-900 group-hover:text-red-600"}`}
        >
          {item.name}
        </h3>

        <p className="text-neutral-400 text-xs line-clamp-2 mb-4 font-normal">
          {item.description}
        </p>

        <div className="flex items-center justify-between mt-auto">
          <div className="flex flex-col">
            {hasDiscount && (
              <span className="text-[9px] text-neutral-400 line-through font-bold decoration-red-400/50">
                Rp {item.price.toLocaleString("id-ID")}
              </span>
            )}
            <span
              className={`text-[14px] font-black tracking-tight 
              ${isOutOfStock ? "text-neutral-400" : hasDiscount ? "text-rose-600" : "text-neutral-900"}`}
            >
              Rp {discountedPrice.toLocaleString("id-ID")}
            </span>
          </div>

          <motion.button
            whileTap={!isOutOfStock ? { scale: 0.9 } : {}}
            disabled={isOutOfStock}
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetail(item);
            }}
            className={`flex items-center justify-center w-8 h-8 rounded-full transition-all
              ${
                isOutOfStock
                  ? "bg-neutral-100 text-neutral-300 shadow-none cursor-not-allowed"
                  : isBestSeller
                    ? "bg-amber-500 text-white hover:bg-amber-600 shadow-lg shadow-amber-200"
                    : "bg-red-500 text-white hover:bg-red-600"
              }`}
          >
            <Plus size={16} strokeWidth={3} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

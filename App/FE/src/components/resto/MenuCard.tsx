import { motion } from "framer-motion";
import { Star, Zap, Plus, PackageX } from "lucide-react";
import { useNavigate } from "react-router";

interface MenuCardProps {
  item: any;
  onOpenDetail: (item: any) => void;
}

export function MenuCard({ item, onOpenDetail }: MenuCardProps) {
  const navigate = useNavigate();
  
  // Logic Pengecekan Stok (Sama dengan ProductCard)
  const isOutOfStock = item.stocks?.some(
    (stock: any) => (stock.quantity ?? 0) < (stock.pivot?.amount || 0),
  );

  const hasDiscount = item.discount && item.discount.value_discount > 0;
  const discountedPrice = hasDiscount 
    ? item.price - (item.price * item.discount!.value_discount / 100) 
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
        ${isOutOfStock 
          ? "opacity-80 grayscale-[0.6] cursor-not-allowed border-neutral-100" 
          : "cursor-pointer border-neutral-100 hover:border-red-200"
        }`}
    >
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]" />
      
      <div className="relative aspect-[5/4] overflow-hidden bg-neutral-50 border-b border-neutral-50">
        <img
          src={`${import.meta.env.VITE_STORAGE_URL}/${item.menu_image}`}
          alt={item.name}
          loading="lazy"
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

        {!isOutOfStock && hasDiscount && (
          <div className="absolute top-0 left-0 bg-rose-500 text-white px-3 py-1.5 rounded-br-xl font-black text-[9px] uppercase tracking-tighter shadow-sm z-10">
            {item.discount?.value_discount}% OFF
          </div>
        )}

        {item.rating && (
          <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-white/80 backdrop-blur-md px-2 py-1 rounded-lg border border-white/50 shadow-sm">
            <Star size={10} className="fill-amber-400 text-amber-400" />
            <span className="text-[10px] font-black text-neutral-800">{item.rating}</span>
          </div>
        )}
      </div>

      <div className="flex flex-col p-3.5 relative z-10">
        <div className="flex justify-between items-center mb-1">
          <span className={`text-[10px] font-black uppercase ${isOutOfStock ? 'text-neutral-400' : 'text-red-600'}`}>
            {item.category?.name}
          </span>
          {!isOutOfStock && item.is_best_seller && (
            <div className="flex items-center gap-0.5 text-amber-500">
              <Zap size={10} fill="currentColor" />
              <span className="text-[8px] font-black uppercase">Best Seller</span>
            </div>
          )}
        </div>

        <h3 className={`font-bold text-lg line-clamp-1 mb-1 transition-colors 
          ${isOutOfStock ? 'text-neutral-400' : 'text-neutral-900 group-hover:text-red-600'}`}>
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
            <span className={`text-[14px] font-black tracking-tight 
              ${isOutOfStock ? 'text-neutral-400' : hasDiscount ? 'text-rose-600' : 'text-neutral-900'}`}>
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
              ${isOutOfStock 
                ? "bg-neutral-100 text-neutral-300 shadow-none cursor-not-allowed" 
                : "bg-red-500 text-white hover:bg-red-600"}`}
          >
            <Plus size={16} strokeWidth={3} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
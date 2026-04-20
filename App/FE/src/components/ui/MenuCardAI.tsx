import { motion } from "framer-motion";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/currency";

export function MenuCardAI({
  item,
  onAdd,
  onCustomize,
}: {
  item: any;
  onAdd: (item: any) => void;
  onCustomize?: (item: any) => void;
}) {
  const isOut = item.stock <= 0;

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className="bg-white dark:bg-neutral-900 rounded-xl border shadow-sm overflow-hidden flex flex-row"
    >
      <div className="w-28 h-30 bg-slate-100 relative shrink-0">
        {item.image ? (
          <img
            src={
              item.image?.startsWith("http")
                ? item.image
                : `${import.meta.env.VITE_STORAGE_URL}${item.image}`
            }
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-xs text-slate-400">
            No Image
          </div>
        )}

        {isOut && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-xs font-bold">
            Habis
          </div>
        )}
      </div>

      <div className="flex-1 p-3 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-bold line-clamp-2 leading-tight">
              {item.name}
            </h3>

            {item.category && (
              <span className="text-[10px] px-2 py-0.5 bg-slate-100 rounded-full whitespace-nowrap">
                {item.category}
              </span>
            )}
          </div>

          <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">
            {item.description}
          </p>
        </div>

        <div className="flex items-center justify-between mt-2">
          <p className="text-red-600 font-bold text-sm">
            {formatCurrency(item.price)}
          </p>

          <div className="flex gap-2">
            <Button
              size="sm"
              disabled={isOut}
              onClick={() => onAdd(item)}
              className="flex items-center gap-1"
            >
              <ShoppingCart size={14} />
            </Button>

            {item.hasAttributes && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onCustomize?.(item)}
              >
                Custom
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
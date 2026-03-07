import { useCategories } from "@/hooks/react-query/useCategory";
import { m } from "framer-motion";
import {
  Dessert,
  LayoutGrid,
  Pizza,
  Search,
  Coffee,
  Utensils,
  SlidersHorizontal,
  Beer,
  IceCream,
  Beef,
} from "lucide-react";
import { useState, useCallback, useMemo } from "react";

const iconMap: Record<string, any> = {
  all: LayoutGrid,
  "makanan-utama": Pizza,
  makanan: Beef,
  minuman: Coffee,
  "minuman-dingin": Beer,
  dessert: IceCream,
  snack: Utensils,
  cemilan: Dessert,
};

interface NavigationBarProps {
  selectedCategory: string;
  onCategoryChange: (slug: string) => void;
  onSearch: (value: string) => void;
}

export function NavigationBar({
  selectedCategory,
  onCategoryChange,
  onSearch,
}: NavigationBarProps) {
  const [isFocused, setIsFocused] = useState(false);

  const { data: categoryResponse } = useCategories({ size: 100 });

  const categories = useMemo(() => {
    const base = [{ id: "all", name: "All", slug: "all" }];
    if (categoryResponse?.data) {
      return [...base, ...categoryResponse.data];
    }
    return base;
  }, [categoryResponse]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onSearch?.(e.target.value);
  }, [onSearch]);

  return (
    <div className="sticky top-0 z-20 backdrop-blur-xl pb-3 space-y-4 bg-white/80 border-b border-neutral-100 will-change-transform">
      <div className="flex gap-3 items-center">
        <div className="relative flex-1 group">
          <Search
            className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200 ${
              isFocused ? "text-red-600" : "text-neutral-400"
            }`}
            size={16}
          />
          <input
            type="text"
            placeholder="Search menu..."
            onChange={handleSearchChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="w-full pl-10 pr-4 py-3.5 rounded-sm bg-neutral-50 border border-neutral-100 focus:bg-white focus:border-red-500/30 focus:ring-4 focus:ring-red-50 transition-all outline-none  text-sm text-neutral-900 shadow-sm"
          />
        </div>

        <button className="flex items-center gap-2 w-12 h-12 bg-white border border-neutral-200 rounded-sm hover:bg-neutral-50 transition-colors justify-center shrink-0 active:scale-95">
          <SlidersHorizontal size={25} strokeWidth={1.5} className="text-neutral-600" />
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
        {categories.map((cat) => {
          const Icon = iconMap[cat.slug] || Utensils;
          const isActive = selectedCategory === cat.slug;

          return (
            <button
              key={cat.id}
              onClick={() => onCategoryChange?.(cat.slug)}
              className={`relative flex items-center gap-2 px-5 py-2.5 rounded-sm whitespace-nowrap transition-colors duration-200 ${
                isActive ? "text-white" : "text-neutral-500 hover:bg-neutral-50"
              }`}
            >
              {isActive && (
                <m.div
                  layoutId="activeCategory"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  className="absolute inset-0 bg-red-500 rounded-sm shadow-md shadow-neutral-200 z-0 will-change-transform"
                />
              )}
              <Icon size={14} className="relative z-10" />
              <span className="relative z-10 font-normal text-sm">
                {cat.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
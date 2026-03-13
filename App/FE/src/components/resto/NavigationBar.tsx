import { useTranslation } from "react-i18next";
import { useNavigationBarLogic } from "@/hooks/useNavigationBar";
import { m, AnimatePresence } from "framer-motion";
import {
  Dessert, LayoutGrid, Pizza, Search, Coffee, Utensils,
  SlidersHorizontal, Beer, IceCream, Beef, Check, RotateCcw,
} from "lucide-react";

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
  onSortChange: (values: string[]) => void;
  selectedSorts: string[];
}

export function NavigationBar({
  selectedCategory,
  onCategoryChange,
  onSearch,
  onSortChange,
  selectedSorts = [],
}: NavigationBarProps) {
  const { t } = useTranslation();
  const { state, actions } = useNavigationBarLogic({
    onSearch,
    onSortChange,
    selectedSorts,
  });

  const sortOptions = [
    { id: "best_seller", label: t("nb_sort_best_seller") },
    { id: "stock_highest", label: t("nb_sort_stock_highest") },
    { id: "price_lowest", label: t("nb_sort_price_lowest") },
    { id: "price_highest", label: t("nb_sort_price_highest") },
  ];

  return (
    <div className="sticky top-0 z-40 bg-[#fcfcfc] dark:bg-neutral-900 pb-3 space-y-4 border-b px-4 pt-4">
      <div className="flex gap-3 items-center">
        <div className="relative w-full max-w-md">
          <Search
            className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200 ${
              state.isFocused ? "text-red-600" : "text-neutral-400"
            }`}
            size={16}
          />
          <input
            type="text"
            placeholder={t("nb_search_placeholder")}
            value={state.searchTerm}
            onChange={(e) => actions.setSearchTerm(e.target.value)}
            onFocus={() => actions.setIsFocused(true)}
            onBlur={() => actions.setIsFocused(false)}
            className="w-full pl-10 pr-4 py-3 rounded-sm bg-neutral-50 border dark:bg-neutral-900 focus:bg-white dark:text-neutral-300 focus:border-red-500 transition-all outline-none text-sm text-neutral-900 shadow-sm"
          />
        </div>

        <div className="relative shrink-0">
          <button
            onClick={() => actions.setShowSort(!state.showSort)}
            className={`relative flex items-center justify-center w-11 h-11 border rounded-sm transition-all ${
              selectedSorts.length > 0
                ? "bg-red-50 border-red-500 dark:bg-neutral-900 text-red-600"
                : "bg-white dark:bg-neutral-900 text-neutral-600 hover:bg-neutral-50"
            }`}
          >
            <SlidersHorizontal size={20} />
            {selectedSorts.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] text-white font-bold ring-2 ring-white">
                {selectedSorts.length}
              </span>
            )}
          </button>

          <AnimatePresence>
            {state.showSort && (
              <>
                <div
                  className="fixed inset-0 z-[45] bg-transparent"
                  onClick={() => actions.setShowSort(false)}
                />
                <m.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-64 bg-white dark:bg-neutral-900 border rounded-sm shadow-2xl z-[50] overflow-hidden"
                >
                  <div className="p-4 border-b bg-neutral-50/50 dark:bg-neutral-900 flex items-center justify-between">
                    <span className="text-sm font-medium text-neutral-900 dark:text-neutral-300">
                      {t("nb_filter_title")}
                    </span>
                    {selectedSorts.length > 0 && (
                      <button
                        onClick={() => onSortChange([])}
                        className="text-xs font-medium text-red-600 dark:text-neutral-300 flex items-center gap-1"
                      >
                        <RotateCcw size={10} /> {t("nb_filter_reset")}
                      </button>
                    )}
                  </div>

                  <div className="p-2 space-y-1">
                    {sortOptions.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => actions.handleToggleSort(opt.id)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm transition-colors hover:bg-neutral-50 dark:bg-neutral-900 group text-left"
                      >
                        <div
                          className={`flex items-center justify-center w-5 h-5 border rounded transition-all shrink-0 ${
                            selectedSorts.includes(opt.id)
                              ? "bg-red-600 border-red-600"
                              : "bg-white border-neutral-300 group-hover:border-neutral-400"
                          }`}
                        >
                          {selectedSorts.includes(opt.id) && (
                            <Check size={14} className="text-white" strokeWidth={4} />
                          )}
                        </div>
                        <span
                          className={`text-xs ${
                            selectedSorts.includes(opt.id)
                              ? "font-bold text-neutral-900 dark:text-neutral-300"
                              : "text-neutral-600 dark:text-neutral-300"
                          }`}
                        >
                          {opt.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </m.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {state.isLoading ? (
          <div className="h-9 w-24 rounded-sm bg-neutral-100 animate-pulse" />
        ) : (
          state.categories.map((cat) => {
            const Icon = iconMap[cat.slug] || Utensils;
            const isActive = selectedCategory === cat.slug;

            return (
              <button
                key={cat.id}
                onClick={() => onCategoryChange?.(cat.slug)}
                className={`relative flex items-center gap-2 px-5 py-2.5 rounded-sm whitespace-nowrap transition-all ${
                  isActive ? "text-white" : "text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                }`}
              >
                {isActive && (
                  <m.div
                    layoutId="activeCategory"
                    className="absolute inset-0 bg-red-600 rounded-sm z-0"
                  />
                )}
                <Icon size={14} className="relative z-10 text-[inherit] dark:text-neutral-300" />
                <span className="relative z-10 font-normal text-sm dark:text-neutral-300">
                  {cat.name}
                </span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
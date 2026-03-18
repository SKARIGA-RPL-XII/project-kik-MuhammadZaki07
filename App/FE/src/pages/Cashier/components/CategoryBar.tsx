import { motion } from "framer-motion";

interface CategoryBarProps {
  categories: any[];
  activeCategory: string;
  onCategoryChange: (name: string) => void;
  loading?: boolean;
}

export function CategoryBar({
  categories,
  activeCategory,
  onCategoryChange,
  loading,
}: CategoryBarProps) {
  if (loading) {
    return (
      <div className="border-b px-6 py-2 overflow-x-auto no-scrollbar flex gap-2 sticky top-20 z-10 bg-white dark:bg-neutral-950">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="h-10 w-28 rounded-full bg-neutral-100 dark:bg-neutral-800 animate-pulse shrink-0"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="border-b px-6 py-2 overflow-x-auto no-scrollbar flex gap-2 sticky top-20 z-10 bg-white dark:bg-neutral-950">
      <div className="flex gap-2 relative">
        <button
          onClick={() => onCategoryChange("All Items")}
          className={`relative h-10 px-6 rounded-full text-sm font-medium transition-colors duration-300 z-10 shrink-0 ${
            activeCategory === "All Items"
              ? "text-white"
              : "text-zinc-500 hover:text-zinc-800 dark:hover:text-neutral-200"
          }`}
        >
          {activeCategory === "All Items" && (
            <motion.div
              layoutId="activeCategory"
              className="absolute inset-0 bg-red-600 rounded-full -z-10"
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
          All Items
        </button>

        {categories.map((cat: any) => (
          <button
            key={cat.id}
            onClick={() => onCategoryChange(cat.name)}
            className={`relative h-10 px-6 rounded-full text-sm font-medium transition-colors duration-300 z-10 shrink-0 ${
              activeCategory === cat.name
                ? "text-white"
                : "text-zinc-500 hover:text-zinc-800 dark:hover:text-neutral-200"
          }`}
          >
            {activeCategory === cat.name && (
              <motion.div
                layoutId="activeCategory"
                className="absolute inset-0 bg-red-600 rounded-full -z-10"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            {cat.name}
          </button>
        ))}
      </div>
    </div>
  );
}
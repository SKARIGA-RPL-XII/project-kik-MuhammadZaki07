import { motion } from "framer-motion";

interface CategoryBarProps {
  categories: any[];
  activeCategory: string;
  onCategoryChange: (name: string) => void;
}

export function CategoryBar({ categories, activeCategory, onCategoryChange }: CategoryBarProps) {
  return (
    <div className="bg-white border-b border-zinc-200 px-6 py-2 overflow-x-auto no-scrollbar flex gap-2 sticky top-20 z-10">
      <div className="flex gap-2 relative">
        <button
          onClick={() => onCategoryChange("All Items")}
          className={`relative h-10 px-6 rounded-full text-md font-normal transition-colors duration-300 z-10 ${
            activeCategory === "All Items" ? "text-white" : "text-zinc-500 hover:text-zinc-800"
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
            className={`relative h-10 px-6 rounded-sm text-sm font-normal transition-colors duration-300 z-10 ${
              activeCategory === cat.name ? "text-white" : "text-zinc-500 hover:text-zinc-800"
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
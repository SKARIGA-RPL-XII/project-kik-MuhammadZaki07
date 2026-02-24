import { motion } from "framer-motion";
import { SearchX, ArrowLeft } from "lucide-react";

export function EmptyState() {
  const handleReset = () => {
    window.location.href = window.location.pathname;
  };

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="w-20 h-20 mb-6 flex items-center justify-center rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800">
        <SearchX size={32} className="text-neutral-400" />
      </div>

      <div className="text-center space-y-2 mb-8">
        <h3 className="text-xl font-bold text-neutral-900 dark:text-white tracking-tight">
          Menu not found
        </h3>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-xs mx-auto">
          Try checking the spelling of your keywords or use other categories to
          search for available menus.
        </p>
      </div>

      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={handleReset}
        className="flex items-center gap-2 px-6 py-3 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 rounded-xl text-sm font-semibold transition-colors hover:bg-neutral-800 dark:hover:bg-neutral-200"
      >
        Refresh
      </motion.button>
    </div>
  );
}

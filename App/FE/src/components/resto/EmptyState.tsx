import { motion } from "framer-motion";
import { SearchX } from "lucide-react";
import { useTranslation } from "react-i18next";

export function EmptyState() {
  const { t } = useTranslation();

  const handleReset = () => {
    window.location.href = window.location.pathname;
  };

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="w-20 h-20 mb-6 flex items-center justify-center rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800">
        <SearchX size={37} className="text-neutral-400" />
      </div>

      <div className="text-center space-y-2 mb-8">
        <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">
          {t("cp_empty_title")}
        </h3>
        <p className="text-md text-neutral-500 dark:text-neutral-400 max-w-xs mx-auto">
          {t("cp_empty_desc")}
        </p>
      </div>

      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={handleReset}
        className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-lg text-sm font-normal transition-colors hover:bg-red-600 dark:hover:bg-red-600"
      >
        {t("cp_empty_btn")}
      </motion.button>
    </div>
  );
}
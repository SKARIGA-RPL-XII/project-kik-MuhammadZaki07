import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useLanguageSwitcher } from "@/hooks/useLanguageSwitcher";

const FlagIcon = ({ countryCode }: { countryCode: string }) => {
  const code = countryCode === "en" ? "gb" : countryCode;
  return (
    <span className="flex-shrink-0 w-8 h-8 rounded-full overflow-hidden border flex items-center justify-center">
      <span className={`fi fi-${code} fis !block !w-full !h-full`} />
    </span>
  );
};

export default function LanguageSwitcher() {
  const {
    isOpen,
    setIsOpen,
    languages,
    selectedLanguage,
    handleLanguageChange,
    currentLang,
  } = useLanguageSwitcher();

  return (
    <div className="relative" title={selectedLanguage.key}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-3 py-2"
      >
        <FlagIcon countryCode={selectedLanguage.key} />
        <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 uppercase">
          {selectedLanguage.key}
        </span>
        <ChevronDown
          size={14}
          className={`text-neutral-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-[9998]" 
              onClick={() => setIsOpen(false)} 
            />
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute right-0 mt-2 w-40 bg-white border border-neutral-100 rounded-lg shadow-xl p-1.5 z-[9999] dark:bg-neutral-900 dark:border-neutral-800"
            >
              {languages.map((lang) => (
                <button
                  key={lang.key}
                  onClick={() => handleLanguageChange(lang.key)}
                  className={`flex w-full items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors 
                    ${
                      currentLang === lang.key
                        ? "bg-red-50 text-red-600 dark:bg-neutral-800"
                        : "hover:bg-neutral-50 dark:bg-neutral-900 text-neutral-600"
                    }`}
                >
                  <FlagIcon countryCode={lang.key} />
                  <span className="text-sm font-medium">{lang.name}</span>
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
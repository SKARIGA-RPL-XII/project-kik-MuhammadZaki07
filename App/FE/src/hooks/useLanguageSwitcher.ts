import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useMemo } from "react";

export function useLanguageSwitcher() {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [languages, setLanguages] = useState<any[]>([]);

  useEffect(() => {
    const fetchLanguages = async () => {
      const token = import.meta.env.VITE_SIMPLELOCALIZE_TOKEN;
      try {
        const response = await fetch(
          `https://cdn.simplelocalize.io/${token}/_latest/_languages`
        );
        const data = await response.json();

        const rawData = data.languages || data;
        const languageArray = Array.isArray(rawData)
          ? rawData
          : Object.values(rawData);

        const finalData = languageArray.filter((l: any) => l && l.key);

        if (finalData.length > 0) {
          setLanguages(finalData);
        } else {
          throw new Error("Data kosong");
        }
      } catch (err) {
        setLanguages([
          { key: "id", name: "Indonesia" },
          { key: "en", name: "English" },
        ]);
      }
    };
    fetchLanguages();
  }, []);

  const selectedLanguage = useMemo(() => {
    return Array.isArray(languages)
      ? languages.find((lang) => lang.key === i18n.language) || {
          key: "id",
          name: "Indonesia",
        }
      : { key: "id", name: "Indonesia" };
  }, [languages, i18n.language]);

  const handleLanguageChange = async (langKey: string) => {
    await i18n.changeLanguage(langKey);
    setIsOpen(false);
  };

  return {
    isOpen,
    setIsOpen,
    languages,
    selectedLanguage,
    handleLanguageChange,
    currentLang: i18n.language,
  };
}

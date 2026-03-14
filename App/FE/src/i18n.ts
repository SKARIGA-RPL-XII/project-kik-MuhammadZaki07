import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import HttpBackend from "i18next-http-backend";

const PROJECT_TOKEN = import.meta.env.VITE_SIMPLELOCALIZE_TOKEN;
const ENVIRONMENT = import.meta.env.VITE_SIMPLELOCALIZE_ENV || "_latest";

i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    lng: "id",
    fallbackLng: "id",
    debug: false,
    interpolation: { escapeValue: false },
    backend: {
      loadPath: `https://cdn.simplelocalize.io/${PROJECT_TOKEN}/${ENVIRONMENT}/{{lng}}?v=${new Date().getTime()}`,
    },
  });

export const loadTranslations = async (lng: string) => {
  try {
    const res = await fetch(
      `https://cdn.simplelocalize.io/${PROJECT_TOKEN}/${ENVIRONMENT}/${lng}`,
    );
    if (!res.ok) throw new Error("Gagal mengambil data dari CDN");
    const data = await res.json();
    i18n.addResourceBundle(lng, "translation", data, true, true);
  } catch (err) {
    console.error("Error loading translations:", err);
  }
};

export default i18n;

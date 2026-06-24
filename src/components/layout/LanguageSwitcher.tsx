import { useTranslation } from "react-i18next";
import { LANGUAGE_STORAGE_KEY, SUPPORTED_LANGUAGES, type SupportedLanguage } from "@/i18n";

const LABELS: Record<SupportedLanguage, string> = {
  es: "ES",
  en: "EN",
  pt: "PT",
};

export default function LanguageSwitcher() {
  const { i18n: i18nInstance } = useTranslation();
  const current = (SUPPORTED_LANGUAGES.includes(i18nInstance.language as SupportedLanguage)
    ? i18nInstance.language
    : "es") as SupportedLanguage;

  const setLanguage = (lng: SupportedLanguage) => {
    void i18nInstance.changeLanguage(lng);
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lng);
  };

  return (
    <div
      className="langSwitcher flex items-center rounded-lg overflow-hidden"
      role="group"
      aria-label="Language"
      style={{ border: "1px solid rgba(22,61,89,0.12)", backgroundColor: "#F4F6F8" }}
    >
      {SUPPORTED_LANGUAGES.map((lng, idx) => (
        <button
          key={lng}
          type="button"
          aria-label={lng === "es" ? "Español" : lng === "en" ? "English" : "Português"}
          aria-pressed={current === lng}
          onClick={() => setLanguage(lng)}
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)] focus-visible:ring-offset-1 transition-colors"
          style={{
            minWidth: "32px",
            height: "30px",
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "0.04em",
            color: current === lng ? "var(--regu-blue)" : "#7A8A97",
            backgroundColor: current === lng ? "rgba(68,137,198,0.14)" : "transparent",
            borderRight: idx < SUPPORTED_LANGUAGES.length - 1 ? "1px solid rgba(22,61,89,0.10)" : "none",
            lineHeight: 1,
            padding: "0 6px",
          }}
        >
          {LABELS[lng]}
        </button>
      ))}
    </div>
  );
}

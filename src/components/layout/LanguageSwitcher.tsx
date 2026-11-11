import { useTranslation } from "react-i18next";
import { ChevronDown } from "lucide-react";
import { LANGUAGE_STORAGE_KEY, SUPPORTED_LANGUAGES, type SupportedLanguage } from "@/i18n";

const ARIA_LABELS: Record<SupportedLanguage, string> = {
  es: "Español",
  en: "English",
  pt: "Português",
  it: "Italiano",
};

const LABELS: Record<SupportedLanguage, string> = {
  es: "ES",
  en: "EN",
  pt: "PT",
  it: "IT",
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
    <>
    {/* Escritorio (≥768px): botones ES | EN | PT | IT */}
    <div
      className="langSwitcher hidden md:flex items-center rounded-lg overflow-hidden"
      role="group"
      aria-label="Language"
      style={{ border: "1px solid rgba(22,61,89,0.12)", backgroundColor: "#F4F6F8" }}
    >
      {SUPPORTED_LANGUAGES.map((lng, idx) => (
        <button
          key={lng}
          type="button"
          aria-label={ARIA_LABELS[lng]}
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

    {/* Móvil (<768px): selector compacto (ES ▾) para que logo, idioma, búsqueda y menú
        quepan desde 320px. El <select> nativo va invisible encima del rótulo: abre el
        selector del sistema y, con 16px, iOS no hace zoom al tocarlo. */}
    <div
      className="langSwitcherCompact relative inline-flex shrink-0 items-center justify-center rounded-lg md:hidden has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[var(--regu-blue)]"
      style={{
        height: "32px",
        minWidth: "54px",
        padding: "0 7px 0 9px",
        gap: "3px",
        border: "1px solid rgba(22,61,89,0.12)",
        backgroundColor: "#F4F6F8",
      }}
    >
      <span
        aria-hidden
        style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.04em", lineHeight: 1, color: "var(--regu-blue)" }}
      >
        {LABELS[current]}
      </span>
      <ChevronDown aria-hidden style={{ width: "14px", height: "14px", color: "#7A8A97", flexShrink: 0 }} />
      <select
        aria-label="Language"
        value={current}
        onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
        className="absolute inset-0 h-full w-full cursor-pointer appearance-none opacity-0 focus-visible:outline-none"
        style={{ fontSize: "16px" }}
      >
        {SUPPORTED_LANGUAGES.map((lng) => (
          <option key={lng} value={lng} lang={lng}>
            {ARIA_LABELS[lng]}
          </option>
        ))}
      </select>
    </div>
    </>
  );
}

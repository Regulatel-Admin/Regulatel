import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Youtube } from "lucide-react";
import PageHero from "@/components/PageHero";

/**
 * Página informativa: canal de YouTube de REGULATEL en creación.
 * El enlace del icono YouTube en la topbar apunta aquí en lugar de un canal externo.
 */
export default function CanalYouTube() {
  const { t } = useTranslation();

  return (
    <>
      <PageHero
        title={t("pages.canalYoutube.pageTitle")}
        breadcrumb={[{ label: t("pages.canalYoutube.breadcrumb") }]}
      />
      <div
        className="w-full py-16 md:py-24"
        style={{
          background: "linear-gradient(to bottom, var(--regu-offwhite), var(--regu-gray-100))",
        }}
      >
        <div
          className="mx-auto max-w-2xl px-4 md:px-6 text-center"
          style={{ fontFamily: "var(--token-font-body)" }}
        >
          <div
            className="rounded-2xl border bg-white p-10 md:p-14 shadow-sm"
            style={{
              borderColor: "var(--regu-gray-100)",
              boxShadow: "0 4px 24px rgba(22, 61, 89, 0.06)",
            }}
          >
            <div
              className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full"
              style={{ backgroundColor: "rgba(229, 57, 53, 0.1)", color: "#E53935" }}
              aria-hidden
            >
              <Youtube className="h-9 w-9" />
            </div>
            <h2
              className="text-xl font-bold text-[var(--regu-gray-900)] md:text-2xl"
              style={{ fontFamily: "var(--token-font-heading)" }}
            >
              {t("pages.canalYoutube.channelInPreparation")}
            </h2>
            <p
              className="mt-4 text-base leading-relaxed text-[var(--regu-gray-700)] md:text-lg"
              style={{ fontFamily: "var(--token-font-body)" }}
            >
              {t("pages.canalYoutube.description")}
            </p>
            <p className="mt-3 text-sm text-[var(--regu-gray-500)]">
              {t("pages.canalYoutube.thankYou")}
            </p>
          </div>

          <nav className="mt-10 flex justify-center" aria-label="Navegación">
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-base font-semibold transition-colors bg-[#4489C6]/10 hover:bg-[#4489C6]/16 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4489C6] focus-visible:ring-offset-2"
              style={{ color: "var(--regu-blue)" }}
            >
              <ArrowLeft className="w-4 h-4 shrink-0" aria-hidden />
              {t("common.backToHomeShort")}
            </Link>
          </nav>
        </div>
      </div>
    </>
  );
}

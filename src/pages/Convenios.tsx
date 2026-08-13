import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ArrowRight, Plus } from "lucide-react";
import PageHero from "@/components/PageHero";
import ConveniosList from "@/components/convenios/ConveniosList";
import { useConveniosPublic } from "@/contexts/SiteSettingsContext";
import { useLocalizedConvenios } from "@/hooks/useLocalizedConvenios";
import { useSiteEdit } from "@/contexts/SiteEditContext";

export default function Convenios() {
  const { t } = useTranslation();
  const { enabled: siteEditEnabled, open: openSiteEdit, preview: siteEditPreview, target: siteEditTarget } =
    useSiteEdit();
  const rawConvenios = useConveniosPublic();
  const localized = useLocalizedConvenios(rawConvenios);
  const convenios = siteEditEnabled ? rawConvenios : localized;

  const draftingNew = Boolean(
    siteEditEnabled &&
      ((siteEditTarget?.kind === "convenio" && !siteEditTarget.slug) ||
        siteEditPreview.convenios?.some((c) => c.slug.startsWith("convenio-new-") && !c.title.trim() && !c.acronym.trim()))
  );
  const showAdd = siteEditEnabled && !draftingNew;

  return (
    <>
      <PageHero
        title={t("pages.conveniosPage.pageTitle")}
        subtitle={t("pages.conveniosPage.subtitle")}
        breadcrumb={[{ label: t("pages.conveniosPage.breadcrumb") }]}
        description={t("pages.conveniosPage.pageDescription")}
      />

      <div
        className="w-full py-12 md:py-16 lg:py-20"
        style={{
          backgroundColor: "#FAFBFC",
          borderTop: "1px solid rgba(22,61,89,0.07)",
          fontFamily: "var(--token-font-body)",
        }}
      >
        <div
          className="mx-auto px-4 md:px-6"
          style={{ maxWidth: "900px" }}
        >
          {/* Header de sección */}
          <div className="mb-10 flex items-start gap-4">
            <div
              className="mt-1 h-8 w-[3px] flex-shrink-0 rounded-full"
              style={{ backgroundColor: "var(--regu-blue)" }}
              aria-hidden
            />
            <div>
              <h2
                className="text-xl font-bold md:text-2xl"
                style={{ color: "var(--regu-navy)", fontFamily: "var(--token-font-heading)" }}
              >
                {t("pages.conveniosPage.activeAgreements")}
              </h2>
              <p className="mt-1 text-sm" style={{ color: "var(--regu-gray-500)" }}>
                {t("pages.conveniosPage.agreementsCount", { count: convenios.length })}
              </p>
            </div>
          </div>

          {showAdd && (
            <button
              type="button"
              onClick={() => openSiteEdit({ kind: "convenio" })}
              className="mb-5 flex w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-10 transition hover:bg-[rgba(15,118,110,0.06)] md:flex-row md:gap-8"
              style={{
                borderColor: "rgba(15,118,110,0.45)",
                minHeight: "160px",
                backgroundColor: "rgba(15,118,110,0.03)",
              }}
              aria-label="Añadir un convenio"
            >
              <span
                className="flex h-20 w-20 items-center justify-center rounded-full"
                style={{ backgroundColor: "rgba(15,118,110,0.10)", color: "#0f766e" }}
              >
                <Plus className="h-12 w-12" strokeWidth={1.5} aria-hidden />
              </span>
              <span className="text-center md:text-left">
                <span className="block text-lg font-bold" style={{ color: "#0f766e", fontFamily: "var(--token-font-heading)" }}>
                  Añadir convenio
                </span>
                <span className="mt-1 block max-w-md text-sm leading-relaxed" style={{ color: "var(--regu-gray-500)" }}>
                  Logo, acrónimo y texto. Se ve aquí y en el menú al instante.
                </span>
              </span>
            </button>
          )}

          {/* Lista de convenios */}
          <ConveniosList convenios={convenios} />

          {/* Bloque objetivos */}
          <section
            className="mt-10 rounded-2xl border bg-white p-7 md:p-10"
            style={{
              borderColor: "rgba(22,61,89,0.10)",
              boxShadow: "0 2px 6px rgba(22,61,89,0.04)",
            }}
          >
            <h2
              className="mb-5 flex items-center gap-3 text-lg font-bold md:text-xl"
              style={{ color: "var(--regu-navy)", fontFamily: "var(--token-font-heading)" }}
            >
              <span
                className="inline-block h-5 w-[3px] flex-shrink-0 rounded-full"
                style={{ backgroundColor: "var(--regu-blue)" }}
                aria-hidden
              />
              {t("pages.conveniosPage.objectivesTitle")}
            </h2>
            <div
              className="space-y-3 text-base leading-relaxed"
              style={{ color: "var(--regu-gray-600)" }}
            >
              <p>{t("pages.conveniosPage.objectivesP1")}</p>
              <p>{t("pages.conveniosPage.objectivesP2")}</p>
            </div>
          </section>

          {/* Footer nav */}
          <nav
            className="mt-10 flex flex-wrap items-center gap-4 border-t pt-8"
            style={{ borderColor: "rgba(22,61,89,0.08)" }}
            aria-label="Navegación final"
          >
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-xl border-2 px-5 py-3 text-sm font-semibold transition-colors hover:bg-[rgba(68,137,198,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)] focus-visible:ring-offset-2"
              style={{
                color: "var(--regu-blue)",
                borderColor: "var(--regu-blue)",
                backgroundColor: "rgba(68,137,198,0.06)",
              }}
            >
              <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
              {t("common.home")}
            </Link>
            <Link
              to="/miembros"
              className="inline-flex items-center gap-1.5 text-sm font-semibold transition-all hover:gap-2.5"
              style={{ color: "var(--regu-gray-500)" }}
            >
              {t("pages.conveniosPage.viewMembers")} <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </nav>
        </div>
      </div>
    </>
  );
}

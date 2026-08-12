import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, Download, ExternalLink, FileText } from "lucide-react";
import PageHero from "@/components/PageHero";
import NotFound from "@/pages/NotFound";
import { useBoletinesGtai } from "@/hooks/useBoletinesGtai";
import { useLocalizedBoletin } from "@/hooks/useLocalizedBoletines";
import {
  BOLETINES_GTAI_LIST_PATH,
  resolveBoletinBySlug,
  type BoletinGtaiSerialized,
} from "@/data/boletinesGtai";
import { EditableSpot } from "@/components/site-edit/EditableSpot";

export default function BoletinGtaiDetalle() {
  const { t, i18n } = useTranslation();
  const { slug } = useParams<{ slug: string }>();
  const { entries, loading } = useBoletinesGtai();
  const [entry, setEntry] = useState<BoletinGtaiSerialized | null | undefined>(undefined);

  useEffect(() => {
    if (!slug) {
      setEntry(null);
      return;
    }
    if (loading) return;
    setEntry(resolveBoletinBySlug(slug, entries));
  }, [slug, entries, loading]);

  const resolvedEntry = slug && !loading && entry !== undefined ? entry : null;
  const localizedEntry = useLocalizedBoletin(resolvedEntry);

  if (!slug) {
    return <NotFound />;
  }

  if (loading || entry === undefined) {
    return (
      <>
        <PageHero
          title={t("pages.boletinesGtai.detailTitle")}
          subtitle={t("pages.boletinesGtai.subtitle")}
          breadcrumb={[
            { label: t("pages.boletinesGtai.breadcrumb"), path: BOLETINES_GTAI_LIST_PATH },
            { label: "…" },
          ]}
        />
        <div className="py-20 text-center text-sm" style={{ color: "var(--regu-gray-500)" }}>
          {t("pages.shared.loading")}
        </div>
      </>
    );
  }

  if (!localizedEntry) return <NotFound />;

  const dateLocale = i18n.language === "en" ? "en-GB" : i18n.language === "pt" ? "pt-PT" : "es-ES";

  return (
    <>
      <PageHero
        title={localizedEntry.title}
        subtitle={t("pages.boletinesGtai.breadcrumb").toUpperCase()}
        breadcrumb={[
          { label: t("pages.boletinesGtai.resourcesBreadcrumb"), path: "/gestion" },
          { label: t("pages.boletinesGtai.breadcrumb"), path: BOLETINES_GTAI_LIST_PATH },
          { label: localizedEntry.title },
        ]}
        description={localizedEntry.shortSummary}
      />

      <div
        className="w-full py-12 md:py-16 lg:py-20"
        style={{
          backgroundColor: "#FAFBFC",
          borderTop: "1px solid rgba(22,61,89,0.07)",
          fontFamily: "var(--token-font-body)",
        }}
      >
        <div className="mx-auto px-4 md:px-6 lg:px-8" style={{ maxWidth: "1180px" }}>
          <div className="mb-8">
            <Link
              to={BOLETINES_GTAI_LIST_PATH}
              className="inline-flex items-center gap-2 text-sm font-semibold transition hover:gap-3"
              style={{ color: "var(--regu-blue)" }}
            >
              <ArrowLeft className="h-4 w-4" />
              {t("pages.boletinesGtai.backToBulletins")}
            </Link>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
            <EditableSpot target={{ kind: "boletin", slug: localizedEntry.slug }} label="Editar este boletín">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="overflow-hidden rounded-2xl border bg-white"
              style={{
                borderColor: "rgba(22,61,89,0.10)",
                boxShadow: "0 4px 24px rgba(22,61,89,0.06)",
              }}
            >
              <div className="border-b px-6 py-4 md:px-8" style={{ borderColor: "rgba(22,61,89,0.07)", backgroundColor: "#FAFBFC" }}>
                <div className="flex flex-wrap items-center gap-3 text-xs font-bold uppercase tracking-[0.08em]">
                  <span style={{ color: "var(--regu-blue)" }}>{localizedEntry.contentType}</span>
                  <span style={{ color: "var(--regu-gray-400)" }} aria-hidden>
                    ·
                  </span>
                  <span style={{ color: "var(--regu-gray-600)" }}>
                    {t("pages.boletinesGtai.edition", { number: localizedEntry.issueNumber, year: localizedEntry.year })}
                  </span>
                </div>
                <h1
                  className="mt-3 text-2xl font-bold md:text-3xl"
                  style={{ color: "var(--regu-navy)", fontFamily: "var(--token-font-heading)" }}
                >
                  {localizedEntry.title}
                </h1>
                <p className="mt-2 text-sm font-semibold" style={{ color: "var(--regu-gray-600)" }}>
                  {localizedEntry.groupName}
                </p>
                <p className="mt-2 flex items-center gap-2 text-sm" style={{ color: "var(--regu-gray-500)" }}>
                  <Calendar className="h-4 w-4" aria-hidden />
                  {t("pages.boletinesGtai.publishedOn")}{" "}
                  {new Date(localizedEntry.publicationDate + "T12:00:00").toLocaleDateString(dateLocale, {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div className="px-6 py-6 md:px-8 md:py-8">
                <h2 className="mb-3 text-sm font-bold uppercase tracking-[0.1em]" style={{ color: "var(--regu-gray-500)" }}>
                  {t("pages.boletinesGtai.summary")}
                </h2>
                <p className="text-base leading-relaxed" style={{ color: "var(--regu-gray-700)" }}>
                  {localizedEntry.description}
                </p>
              </div>
            </motion.div>
            </EditableSpot>

            <motion.aside
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 }}
              className="flex flex-col gap-4"
            >
              <div
                className="overflow-hidden rounded-2xl border bg-white"
                style={{ borderColor: "rgba(22,61,89,0.10)" }}
              >
                <div className="h-[3px] w-full" style={{ backgroundColor: "var(--regu-blue)" }} aria-hidden />
                <div className="p-6">
                  <h2 className="mb-4 flex items-center gap-2 text-sm font-bold" style={{ color: "var(--regu-navy)" }}>
                    <FileText className="h-4 w-4" style={{ color: "var(--regu-blue)" }} aria-hidden />
                    {t("common.officialDocument")}
                  </h2>
                  <div className="flex flex-col gap-3">
                    <a
                      href={localizedEntry.pdfFile}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold uppercase tracking-[0.06em] text-white transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)] focus-visible:ring-offset-2"
                      style={{ backgroundColor: "var(--regu-blue)" }}
                    >
                      <ExternalLink className="h-4 w-4" />
                      {t("pages.boletinesGtai.openPdf")}
                    </a>
                    <a
                      href={localizedEntry.pdfFile}
                      download
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 px-5 py-3 text-sm font-bold uppercase tracking-[0.06em] transition hover:bg-[rgba(68,137,198,0.07)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)] focus-visible:ring-offset-2"
                      style={{ borderColor: "var(--regu-blue)", color: "var(--regu-blue)" }}
                    >
                      <Download className="h-4 w-4" />
                      {t("common.downloadPdf")}
                    </a>
                  </div>
                </div>
              </div>

              {localizedEntry.coverImage && (
                <div className="overflow-hidden rounded-2xl border bg-white p-2" style={{ borderColor: "rgba(22,61,89,0.10)" }}>
                  <img src={localizedEntry.coverImage} alt="" className="w-full rounded-xl object-cover" />
                </div>
              )}
            </motion.aside>
          </div>

          <section
            className="mt-10 overflow-hidden rounded-2xl border bg-[#F4F6F8]"
            style={{ borderColor: "rgba(22,61,89,0.08)" }}
            aria-label={t("pages.shared.documentPreviewSubtitle")}
          >
            <div
              className="border-b px-5 py-3 text-xs font-semibold"
              style={{ borderColor: "rgba(22,61,89,0.08)", color: "var(--regu-gray-600)" }}
            >
              {t("pages.boletinesGtai.preview")}
            </div>
            <div className="bg-[#e8e8e8] p-2 md:p-4">
              <iframe
                title={`PDF — ${localizedEntry.title}`}
                src={`${localizedEntry.pdfFile}#toolbar=1`}
                className="h-[min(78vh,720px)] w-full rounded-lg border-0 bg-white shadow-sm"
              />
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

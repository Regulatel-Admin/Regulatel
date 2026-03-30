import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, Download, ExternalLink, FileText } from "lucide-react";
import PageHero from "@/components/PageHero";
import { api } from "@/lib/api";
import NotFound from "@/pages/NotFound";
import {
  BOLETINES_GTAI_LIST_PATH,
  BOLETINES_GTAI_SETTINGS_KEY,
  defaultBoletinesGtai,
  parseBoletinesGtaiFromSettingValue,
  type BoletinGtaiSerialized,
} from "@/data/boletinesGtai";

export default function BoletinGtaiDetalle() {
  const { slug } = useParams<{ slug: string }>();
  const [entry, setEntry] = useState<BoletinGtaiSerialized | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!slug) {
        if (!cancelled) setEntry(null);
        return;
      }
      const res = await api.settings.get(BOLETINES_GTAI_SETTINGS_KEY);
      let list = defaultBoletinesGtai;
      if (res.ok && res.data && res.data.value != null) {
        const parsed = parseBoletinesGtaiFromSettingValue(res.data.value);
        if (parsed) list = parsed;
      }
      if (cancelled) return;
      const found = list.find((b) => b.slug === slug);
      if (!found || !found.isPublished) {
        setEntry(null);
        return;
      }
      setEntry(found);
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (!slug) {
    return <NotFound />;
  }

  if (entry === undefined) {
    return (
      <>
        <PageHero
          title="Boletín GTAI"
          subtitle="RECURSOS — CONOCIMIENTO"
          breadcrumb={[
            { label: "Boletines GTAI", path: BOLETINES_GTAI_LIST_PATH },
            { label: "…" },
          ]}
        />
        <div className="py-20 text-center text-sm" style={{ color: "var(--regu-gray-500)" }}>
          Cargando…
        </div>
      </>
    );
  }

  if (!entry) return <NotFound />;

  return (
    <>
      <PageHero
        title={entry.title}
        subtitle="BOLETINES GTAI"
        breadcrumb={[
          { label: "Gestión y recursos", path: "/gestion" },
          { label: "Boletines GTAI", path: BOLETINES_GTAI_LIST_PATH },
          { label: entry.title },
        ]}
        description={entry.shortSummary}
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
              Volver a boletines GTAI
            </Link>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
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
                  <span style={{ color: "var(--regu-blue)" }}>{entry.contentType}</span>
                  <span style={{ color: "var(--regu-gray-400)" }} aria-hidden>
                    ·
                  </span>
                  <span style={{ color: "var(--regu-gray-600)" }}>
                    Edición {entry.issueNumber} — {entry.year}
                  </span>
                </div>
                <h1
                  className="mt-3 text-2xl font-bold md:text-3xl"
                  style={{ color: "var(--regu-navy)", fontFamily: "var(--token-font-heading)" }}
                >
                  {entry.title}
                </h1>
                <p className="mt-2 text-sm font-semibold" style={{ color: "var(--regu-gray-600)" }}>
                  {entry.groupName}
                </p>
                <p className="mt-2 flex items-center gap-2 text-sm" style={{ color: "var(--regu-gray-500)" }}>
                  <Calendar className="h-4 w-4" aria-hidden />
                  Publicado el{" "}
                  {new Date(entry.publicationDate + "T12:00:00").toLocaleDateString("es", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div className="px-6 py-6 md:px-8 md:py-8">
                <h2 className="mb-3 text-sm font-bold uppercase tracking-[0.1em]" style={{ color: "var(--regu-gray-500)" }}>
                  Resumen
                </h2>
                <p className="text-base leading-relaxed" style={{ color: "var(--regu-gray-700)" }}>
                  {entry.description}
                </p>
              </div>
            </motion.div>

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
                    Documento oficial
                  </h2>
                  <div className="flex flex-col gap-3">
                    <a
                      href={entry.pdfFile}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold uppercase tracking-[0.06em] text-white transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)] focus-visible:ring-offset-2"
                      style={{ backgroundColor: "var(--regu-blue)" }}
                    >
                      <ExternalLink className="h-4 w-4" />
                      Abrir PDF
                    </a>
                    <a
                      href={entry.pdfFile}
                      download
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 px-5 py-3 text-sm font-bold uppercase tracking-[0.06em] transition hover:bg-[rgba(68,137,198,0.07)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)] focus-visible:ring-offset-2"
                      style={{ borderColor: "var(--regu-blue)", color: "var(--regu-blue)" }}
                    >
                      <Download className="h-4 w-4" />
                      Descargar PDF
                    </a>
                  </div>
                </div>
              </div>

              {entry.coverImage && (
                <div className="overflow-hidden rounded-2xl border bg-white p-2" style={{ borderColor: "rgba(22,61,89,0.10)" }}>
                  <img src={entry.coverImage} alt="" className="w-full rounded-xl object-cover" />
                </div>
              )}
            </motion.aside>
          </div>

          <section
            className="mt-10 overflow-hidden rounded-2xl border bg-[#F4F6F8]"
            style={{ borderColor: "rgba(22,61,89,0.08)" }}
            aria-label="Vista previa del PDF"
          >
            <div
              className="border-b px-5 py-3 text-xs font-semibold"
              style={{ borderColor: "rgba(22,61,89,0.08)", color: "var(--regu-gray-600)" }}
            >
              Vista previa
            </div>
            <div className="bg-[#e8e8e8] p-2 md:p-4">
              <iframe
                title={`PDF — ${entry.title}`}
                src={`${entry.pdfFile}#toolbar=1`}
                className="h-[min(78vh,720px)] w-full rounded-lg border-0 bg-white shadow-sm"
              />
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

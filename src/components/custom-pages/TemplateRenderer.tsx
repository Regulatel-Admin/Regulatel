import { useState } from "react";
import { Link } from "react-router-dom";
import { Download, Eye, FileText } from "lucide-react";
import PageHero from "@/components/PageHero";
import DocumentPreviewModal from "@/components/DocumentPreviewModal";
import { MediaEmbed } from "@/components/custom-pages/MediaEmbed";
import type { CustomPage, CustomPageCard } from "@/data/customPages";
import { canPreviewDocument } from "@/lib/documentPreview";

function paragraphs(text?: string) {
  return (text ?? "")
    .split(/\n{2,}/)
    .map((chunk) => chunk.trim())
    .filter(Boolean);
}

function CardGrid({ cards, accent }: { cards: CustomPageCard[]; accent: string }) {
  const visible = cards.filter((card) => card.title.trim() || card.text.trim() || card.imageUrl);
  if (!visible.length) return null;
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {visible.map((card) => {
        const inner = (
          <>
            {card.imageUrl ? (
              <img src={card.imageUrl} alt="" className="h-40 w-full object-cover" />
            ) : (
              <div className="h-2 w-full" style={{ backgroundColor: card.color || accent }} />
            )}
            <div className="p-5">
              <h3 className="text-lg font-bold" style={{ color: "var(--regu-navy)" }}>
                {card.title || "Tarjeta"}
              </h3>
              {card.text && (
                <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--regu-gray-600)" }}>
                  {card.text}
                </p>
              )}
            </div>
          </>
        );
        const className = "overflow-hidden rounded-2xl border bg-white shadow-sm";
        const style = { borderColor: "rgba(22,61,89,0.10)" };
        if (card.href) {
          const external = card.href.startsWith("http");
          return external ? (
            <a key={card.id} href={card.href} target="_blank" rel="noreferrer" className={className} style={style}>
              {inner}
            </a>
          ) : (
            <Link key={card.id} to={card.href} className={className} style={style}>
              {inner}
            </Link>
          );
        }
        return (
          <div key={card.id} className={className} style={style}>
            {inner}
          </div>
        );
      })}
    </div>
  );
}

function DocumentList({ page }: { page: CustomPage }) {
  const [preview, setPreview] = useState<{ url: string; title: string } | null>(null);
  const docs = page.content.documents.filter((doc) => doc.title.trim() || doc.url.trim());
  if (!docs.length) return null;
  return (
    <>
      <div className="space-y-4">
        {docs.map((doc) => (
          <article
            key={doc.id}
            className="flex flex-col gap-4 rounded-2xl border bg-white p-5 md:flex-row md:items-center md:justify-between"
            style={{ borderColor: "rgba(22,61,89,0.10)" }}
          >
            <div className="flex min-w-0 items-start gap-3">
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                style={{ backgroundColor: "rgba(68,137,198,0.12)", color: "var(--regu-blue)" }}
              >
                <FileText className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-bold" style={{ color: "var(--regu-navy)" }}>
                  {doc.title || "Documento"}
                </h3>
                {doc.description && (
                  <p className="mt-1 text-sm" style={{ color: "var(--regu-gray-600)" }}>
                    {doc.description}
                  </p>
                )}
              </div>
            </div>
            {doc.url && (
              <div className="flex flex-wrap gap-2">
                {canPreviewDocument(doc.url) && (
                  <button
                    type="button"
                    onClick={() => setPreview({ url: doc.url, title: doc.title })}
                    className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-semibold"
                    style={{ borderColor: "rgba(22,61,89,0.14)", color: "var(--regu-navy)" }}
                  >
                    <Eye className="h-4 w-4" />
                    Ver
                  </button>
                )}
                <a
                  href={doc.url}
                  download
                  className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-white"
                  style={{ backgroundColor: "var(--regu-blue)" }}
                >
                  <Download className="h-4 w-4" />
                  Descargar
                </a>
              </div>
            )}
          </article>
        ))}
      </div>
      <DocumentPreviewModal doc={preview} onClose={() => setPreview(null)} />
    </>
  );
}

function BodyText({ text }: { text?: string }) {
  const chunks = paragraphs(text);
  if (!chunks.length) return null;
  return (
    <div className="space-y-4 text-base leading-relaxed" style={{ color: "var(--regu-gray-700)" }}>
      {chunks.map((chunk) => (
        <p key={chunk.slice(0, 24)}>{chunk}</p>
      ))}
    </div>
  );
}

function Cta({ page }: { page: CustomPage }) {
  const label = page.content.ctaLabel?.trim();
  const href = page.content.ctaHref?.trim();
  if (!label || !href) return null;
  const external = href.startsWith("http");
  const className = "mt-8 inline-flex rounded-xl px-5 py-2.5 text-sm font-semibold text-white";
  const style = { backgroundColor: page.content.accentColor || "var(--regu-blue)" };
  return external ? (
    <a href={href} target="_blank" rel="noreferrer" className={className} style={style}>
      {label}
    </a>
  ) : (
    <Link to={href} className={className} style={style}>
      {label}
    </Link>
  );
}

export function TemplateRenderer({ page }: { page: CustomPage }) {
  const content = page.content;
  const accent = content.accentColor || "#4489C6";
  const template = page.templateId || "articulo";
  const bg = content.backgroundColor || "#FAFBFC";

  if (template === "landing") {
    return (
      <div style={{ backgroundColor: bg }}>
        <section
          className="relative isolate min-h-[380px] overflow-hidden px-4 py-20 text-white md:min-h-[460px] md:py-28"
          style={{
            backgroundColor: "#163D59",
            backgroundImage: content.coverImageUrl
              ? `linear-gradient(120deg, rgba(11,38,57,0.72), rgba(22,61,89,0.45)), url(${content.coverImageUrl})`
              : "linear-gradient(135deg, #0b2639 0%, #163d59 54%, #1d567d 100%)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="relative z-[1] mx-auto max-w-4xl">
            {content.kicker && (
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-white/80">{content.kicker}</p>
            )}
            <h1 className="mt-3 text-4xl font-bold md:text-5xl" style={{ fontFamily: "var(--token-font-heading)" }}>
              {content.title}
            </h1>
            {content.subtitle && <p className="mt-4 max-w-2xl text-lg text-white/90">{content.subtitle}</p>}
          </div>
        </section>
        <div className="mx-auto max-w-[1180px] px-4 py-14 md:px-6">
          <CardGrid cards={content.cards} accent={accent} />
          <div className="mt-10 max-w-3xl">
            <BodyText text={content.body} />
            <Cta page={page} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: bg }}>
      {template !== "hub" && (
        <PageHero
          title={content.title}
          subtitle={content.kicker || undefined}
          description={content.subtitle || undefined}
          breadcrumb={[{ label: page.title }]}
        />
      )}
      {template === "hub" && (
        <div className="mx-auto max-w-[1180px] px-4 pb-4 pt-12 md:px-6 md:pt-16">
          {content.kicker && (
            <p className="text-[12px] font-bold uppercase tracking-[0.16em]" style={{ color: accent }}>
              {content.kicker}
            </p>
          )}
          <h1
            className="mt-2 text-4xl font-bold"
            style={{ color: "var(--regu-navy)", fontFamily: "var(--token-font-heading)" }}
          >
            {content.title}
          </h1>
          {content.subtitle && (
            <p className="mt-4 max-w-3xl text-lg" style={{ color: "var(--regu-gray-600)" }}>
              {content.subtitle}
            </p>
          )}
        </div>
      )}
      <div className="mx-auto max-w-[1180px] px-4 py-12 md:px-6 md:py-16">
        {template === "articulo" && (
          <div className="mx-auto max-w-3xl">
            {content.coverImageUrl && (
              <img
                src={content.coverImageUrl}
                alt=""
                className="mb-8 w-full rounded-2xl object-cover"
                style={{ maxHeight: 420 }}
              />
            )}
            <BodyText text={content.body} />
            <Cta page={page} />
          </div>
        )}
        {template === "hub" && (
          <>
            <BodyText text={content.body} />
            <div className="mt-8">
              <CardGrid cards={content.cards} accent={accent} />
            </div>
            <Cta page={page} />
          </>
        )}
        {template === "multimedia" && (
          <div className="space-y-8">
            {content.videoUrl && (
              <div className="overflow-hidden rounded-2xl" style={{ aspectRatio: "16 / 9" }}>
                <MediaEmbed url={content.videoUrl} title={content.title} className="h-full w-full" />
              </div>
            )}
            <BodyText text={content.body} />
            {content.images.length > 0 && (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {content.images.map((src) => (
                  <img key={src} src={src} alt="" className="h-52 w-full rounded-xl object-cover" />
                ))}
              </div>
            )}
            <Cta page={page} />
          </div>
        )}
        {template === "documentos" && (
          <div className="space-y-8">
            <BodyText text={content.body} />
            <DocumentList page={page} />
            <Cta page={page} />
          </div>
        )}
      </div>
    </div>
  );
}

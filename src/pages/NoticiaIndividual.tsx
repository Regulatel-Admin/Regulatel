import { motion } from "framer-motion";
import { useParams, useLocation, useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Maximize2,
  FileText,
  Image as ImageIcon,
  Pause,
  Play,
  Share2,
  Tag,
  ArrowRight,
} from "lucide-react";
import ImageCarousel from "@/components/ImageCarousel";
import { noticiasData, type NoticiaData } from "./noticiasData";
import { useAdminData, type AdminNewsItem } from "@/contexts/AdminDataContext";
import type { EventAttachment } from "@/types/event";
import { localizeNoticiaData } from "@/hooks/useLocalizedNews";
import { EditableSpot } from "@/components/site-edit/EditableSpot";
import EventDocumentsSection from "@/components/events/EventDocumentsSection";
import { SEMANA_REGULATEL_2026_NEWS_SLUG, SEMANA_REGULATEL_2026_IMAGE, SEMANA_REGULATEL_2026_NEWS_IMAGE, resolveNewsAttachments } from "@/data/semanaRegulatel2026";
import ContentBlocksEditor from "@/components/site-edit/ContentBlocksEditor";
import { SiteEditUndoRedo } from "@/components/site-edit/SiteEditUndoRedo";
import { useSiteEdit } from "@/contexts/SiteEditContext";
import { useDraftHistory } from "@/hooks/useDraftHistory";
import { usePreviewSync } from "@/hooks/usePreviewSync";
import { useRecoverableDraft } from "@/hooks/useRecoverableDraft";
import { DraftRecoveryNotice } from "@/components/site-edit/DraftRecoveryNotice";
import { DraftEditableText } from "@/components/site-edit/DraftEditableText";
import { cloneJson, notifyCmsSaved } from "@/lib/siteEdit";
import { type ContentBlock } from "@/types/contentBlocks";
import { safeContentUrl } from "@/types/contentBlocks";
import { legacyNewsBlocks, newsVisualPayload } from "@/lib/newsVisualContent";
import { slugify } from "@/lib/slugify";

const fadeIn = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const CONTAINER_MAX = "1060px";

function newsLinkLabelKey(slug: string) {
  return slug === "agenda-de-la-cumbre-regulatel-asiet-comtelca"
    ? "pages.noticias.viewRegistrationLink"
    : "pages.noticias.viewOfficialLink";
}

/** Slugs de notas estáticas de la Cumbre que comparten el bloque (YouTube, Flickr, PDFs). */
const STATIC_CUMBRE_EXTRA_SLUGS = new Set([
  "cumbre-regulatel-asiet-comtelca",
  "cumbre-regulatel-asiet-comtelca-2024",
]);

interface ArticlePayload {
  title: string;
  dateFormatted: string;
  category: string;
  imageUrl: string | null;
  additionalImages?: string[];
  author?: string;
  excerpt?: string;
  content: string[];
  quotes?: { text: string; author?: string }[];
  highlights?: { title?: string; text: string }[];
  tags?: string[];
  link?: string;
  videoUrl?: string;
  slug: string;
  attachments?: EventAttachment[];
  contentBlocks?: ContentBlock[];
}

function normalizeAdminNoticia(admin: {
  title: string;
  dateFormatted: string;
  category: string;
  imageUrl?: string | null;
  additionalImages?: string[];
  author?: string;
  excerpt?: string;
  content?: string;
  link?: string;
  videoUrl?: string;
  slug?: string;
  id?: string;
  attachments?: EventAttachment[];
  contentBlocks?: ContentBlock[];
}): ArticlePayload {
  const paragraphs = admin.content ? admin.content.split(/\n\n+/).filter(Boolean) : [];
  const staticArticle = noticiasData.find((item) => item.slug === admin.slug);
  return {
    title: admin.title,
    dateFormatted: admin.dateFormatted,
    category: admin.category,
    imageUrl: admin.imageUrl ?? null,
    additionalImages: admin.additionalImages ?? [],
    author: admin.author,
    excerpt: admin.excerpt,
    content: paragraphs,
    slug: admin.slug ?? admin.id ?? "",
    link: admin.link,
    videoUrl: admin.videoUrl,
    attachments: admin.attachments,
    contentBlocks: admin.contentBlocks,
    quotes: staticArticle?.quotes,
    highlights: staticArticle?.highlights,
    tags: staticArticle?.tags,
  };
}

function normalizeStaticNoticia(n: NoticiaData): ArticlePayload {
  return {
    title: n.title,
    dateFormatted: n.dateFormatted,
    category: n.category,
    imageUrl: n.imageUrl ?? null,
    author: n.author,
    excerpt: n.excerpt,
    content: n.content,
    quotes: n.quotes,
    highlights: n.highlights,
    tags: n.tags,
    slug: n.slug,
    link: n.link,
    videoUrl: n.videoUrl,
  };
}

function ArticleBreadcrumb({ title }: { title: string }) {
  const { t } = useTranslation();
  return (
    <nav aria-label="Breadcrumb" className="text-xs sm:text-[0.8125rem] mb-6 flex flex-wrap items-center gap-1" style={{ color: "var(--regu-gray-500)" }}>
      <Link to="/" className="hover:text-[var(--regu-blue)] transition-colors">{t("pages.shared.breadcrumbHome")}</Link>
      <span aria-hidden className="mx-0.5">/</span>
      <Link to="/noticias" className="hover:text-[var(--regu-blue)] transition-colors">{t("pages.noticias.breadcrumb")}</Link>
      <span aria-hidden className="mx-0.5">/</span>
      <span className="font-semibold line-clamp-1" style={{ color: "var(--regu-blue)" }}>{title}</span>
    </nav>
  );
}

function CategoryBadge({ label }: { label: string }) {
  return (
    <span
      className="inline-block rounded-sm px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em]"
      style={{ backgroundColor: "rgba(68,137,198,0.10)", color: "var(--regu-blue)" }}
    >
      {label}
    </span>
  );
}

function ArticleHeader({ payload }: { payload: ArticlePayload }) {
  return (
    <EditableSpot target={{ kind: "noticia", slug: payload.slug }} label="Editar esta noticia">
    <header className="mb-6">
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <CategoryBadge label={payload.category} />
        <time
          className="text-[0.8125rem] font-medium"
          style={{ color: "var(--regu-gray-500)" }}
        >
          {payload.dateFormatted}
        </time>
        {payload.author && (
          <>
            <span style={{ color: "var(--regu-gray-300)" }}>·</span>
            <span className="text-[0.8125rem]" style={{ color: "var(--regu-gray-500)" }}>{payload.author}</span>
          </>
        )}
      </div>
      <h1
        className="font-bold leading-tight tracking-tight"
        style={{
          color: "var(--regu-navy)",
          fontSize: "clamp(1.5rem, 2.2vw, 2.25rem)",
          lineHeight: 1.25,
          fontFamily: "var(--token-font-heading)",
        }}
      >
        {payload.title}
      </h1>
      {payload.excerpt && (
        <p
          className="mt-3 text-base leading-relaxed"
          style={{ color: "var(--regu-gray-600)" }}
        >
          {payload.excerpt}
        </p>
      )}
    </header>
    </EditableSpot>
  );
}

function ArticleImage({ imageUrl, link, slug }: { imageUrl: string; link?: string; slug: string }) {
  const { t } = useTranslation();
  const image = (
    <figure
      className="mb-0 w-full overflow-hidden rounded-2xl"
      style={{
        boxShadow: "0 4px 16px rgba(22,61,89,0.08)",
      }}
    >
      <img
        src={imageUrl}
        alt=""
        className="mx-auto h-auto w-full max-h-[90vh] object-contain"
        onError={(e) => { e.currentTarget.style.display = "none"; }}
      />
    </figure>
  );
  return link && /^https?:\/\//i.test(link) ? (
    <a href={link} aria-label={t(newsLinkLabelKey(slug))} className="block rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4">
      {image}
    </a>
  ) : image;
}

const bodyTextStyle: React.CSSProperties = {
  color: "var(--regu-gray-800)",
  lineHeight: 1.8,
  fontSize: "1.0rem",
};

function ArticleBody({ payload, isStaticCumbre }: { payload: ArticlePayload; isStaticCumbre?: boolean }) {
  const { t } = useTranslation();
  const urlRegex = /(https?:\/\/[^\s]+)/g;

  const renderParagraph = (text: string, key: number) => {
    const parts = text.split(urlRegex);
    return (
      <p key={key} className="mb-5 last:mb-0" style={bodyTextStyle}>
        {parts.map((part, i) => {
          if (part.match(urlRegex)) {
            return (
              <a
                key={i}
                href={part}
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-medium inline-flex items-center gap-1 break-all"
                style={{ color: "var(--regu-blue)" }}
              >
                {part}
                <Maximize2 className="h-3 w-3 flex-shrink-0" />
              </a>
            );
          }
          return <span key={i}>{part}</span>;
        })}
      </p>
    );
  };

  return (
    <div className="article-body">
      {payload.contentBlocks !== undefined ? (
        <PublishedNewsBlocks blocks={payload.contentBlocks} payload={payload} />
      ) : <div className="space-y-1">
        {payload.content.map((paragraph, index) => {
          if (paragraph.startsWith("**") && paragraph.endsWith("**")) {
            const title = paragraph.replace(/\*\*/g, "");
            return (
              <h2
                key={index}
                className="text-lg md:text-xl font-bold mt-8 mb-3 first:mt-0 flex items-center gap-3"
                style={{ color: "var(--regu-navy)", fontFamily: "var(--token-font-heading)" }}
              >
                <span
                  className="inline-block h-5 w-[3px] rounded-full flex-shrink-0"
                  style={{ backgroundColor: "var(--regu-blue)" }}
                  aria-hidden
                />
                {title}
              </h2>
            );
          }
          if (paragraph.trim().startsWith("- ")) {
            const items = paragraph.split("\n").filter((p) => p.trim().startsWith("- "));
            return (
              <ul key={index} className="pl-0 space-y-2 my-4 list-none">
                {items.map((item, idx) => {
                  const text = item.replace(/^- /, "").replace(/\*\*/g, "");
                  const parts = text.split(urlRegex);
                  return (
                    <li key={idx} className="flex items-start gap-2.5 leading-relaxed text-[0.9375rem]" style={{ color: "var(--regu-gray-800)" }}>
                      <span
                        className="mt-2 h-1.5 w-1.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: "var(--regu-blue)" }}
                        aria-hidden
                      />
                      <span>
                        {parts.map((part, partIdx) => {
                          if (part.match(urlRegex)) {
                            return (
                              <a
                                key={partIdx}
                                href={part}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline font-medium inline-flex items-center gap-1"
                                style={{ color: "var(--regu-blue)" }}
                              >
                                {part}
                                <Maximize2 className="h-3 w-3" />
                              </a>
                            );
                          }
                          return <span key={partIdx}>{part}</span>;
                        })}
                      </span>
                    </li>
                  );
                })}
              </ul>
            );
          }
          return renderParagraph(paragraph, index);
        })}
      </div>}

      {/* Quotes */}
      {payload.quotes && payload.quotes.length > 0 && (
        <div className="mt-10 space-y-4">
          {payload.quotes.map((quote, index) => (
            <blockquote
              key={index}
              className="relative pl-6 py-4 pr-4 rounded-xl"
              style={{
                borderLeft: "4px solid var(--regu-blue)",
                backgroundColor: "rgba(68,137,198,0.04)",
              }}
            >
              <p
                className="text-base md:text-lg leading-relaxed italic m-0"
                style={{ color: "var(--regu-gray-800)", fontFamily: "var(--token-font-heading)" }}
              >
                &ldquo;{quote.text}&rdquo;
              </p>
              {quote.author && (
                <footer className="mt-3 text-[0.8125rem] font-semibold" style={{ color: "var(--regu-gray-500)" }}>
                  — {quote.author}
                </footer>
              )}
            </blockquote>
          ))}
        </div>
      )}

      {/* Highlights */}
      {payload.highlights && payload.highlights.length > 0 && (
        <div className="mt-10">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] mb-4" style={{ color: "var(--regu-gray-500)" }}>
            {t("pages.noticias.highlights")}
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            {payload.highlights.map((h, index) => (
              <div
                key={index}
                className="p-5 rounded-2xl border"
                style={{
                  borderColor: "rgba(22,61,89,0.10)",
                  backgroundColor: "rgba(68,137,198,0.04)",
                  borderTop: "3px solid var(--regu-blue)",
                }}
              >
                {h.title && (
                  <p className="font-bold text-lg mb-1" style={{ color: "var(--regu-navy)" }}>
                    {h.title}
                  </p>
                )}
                <p className="text-[0.8125rem] leading-relaxed" style={{ color: "var(--regu-gray-600)" }}>
                  {h.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tags */}
      {payload.tags && payload.tags.length > 0 && (
        <div className="mt-10 pt-6 border-t flex flex-wrap items-center gap-2" style={{ borderColor: "rgba(22,61,89,0.08)" }}>
          <Tag className="h-3.5 w-3.5 flex-shrink-0" style={{ color: "var(--regu-gray-400)" }} />
          {payload.tags.map((tag, index) => (
            <span
              key={index}
              className="rounded-full px-3 py-1 text-[11px] font-medium"
              style={{
                backgroundColor: "rgba(22,61,89,0.06)",
                color: "var(--regu-gray-600)",
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {(() => {
        if (payload.contentBlocks !== undefined) return null;
        const documents = resolveNewsAttachments(payload.slug, payload.attachments);
        if (documents.length === 0) return null;
        return <EventDocumentsSection documents={documents} hint={t("pages.noticias.documentsHint")} />;
      })()}

      {payload.slug === "webinar-violencia-digital-rol-entes-reguladores" && (
        <Link
          to="/violencia-digital"
          className="mt-8 flex items-center justify-between gap-4 rounded-2xl border px-5 py-4 transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)]"
          style={{
            borderColor: "rgba(22,61,89,0.12)",
            backgroundColor: "rgba(68,137,198,0.06)",
          }}
        >
          <span>
            <span className="block text-[0.68rem] font-bold uppercase tracking-[0.14em]" style={{ color: "var(--regu-blue)" }}>
              {t("nav.columns.knowledge")}
            </span>
            <span className="mt-1 block text-base font-bold" style={{ color: "var(--regu-navy)" }}>
              {t("pages.violenciaDigital.newsCta")}
            </span>
          </span>
          <ArrowRight className="h-5 w-5 shrink-0" style={{ color: "var(--regu-blue)" }} aria-hidden />
        </Link>
      )}

      {/* Embedded video at end of article */}
      {payload.videoUrl?.startsWith("/") && (
        <ArticleEndVideo
          src={payload.videoUrl}
          title={t("pages.noticias.videoSectionTitle")}
          subtitle={t("pages.noticias.videoSectionDesc")}
        />
      )}

      {/* External link */}
      {payload.link && (
        <div className="mt-6 pt-4 border-t" style={{ borderColor: "rgba(22,61,89,0.08)" }}>
          <a
            href={payload.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition-opacity hover:opacity-85"
            style={{ backgroundColor: "var(--regu-blue)", color: "#fff" }}
          >
            <Maximize2 className="h-4 w-4" />
            {t(newsLinkLabelKey(payload.slug))}
          </a>
        </div>
      )}

      {/* External video link (skip when the video is already embedded) */}
      {payload.videoUrl && !payload.videoUrl.startsWith("/") && (
        <div className="mt-4">
          <a
            href={payload.videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition-opacity hover:opacity-85"
            style={{ backgroundColor: "var(--regu-navy)", color: "#fff" }}
          >
            <Play className="h-4 w-4" />
            {t("pages.noticias.viewVideo")}
          </a>
        </div>
      )}

      {/* Bloque especial Cumbre */}
      {isStaticCumbre && STATIC_CUMBRE_EXTRA_SLUGS.has(payload.slug) && (
        <CumbreExtraBlock />
      )}
    </div>
  );
}

function ArticleEndVideo({
  src,
  title,
  subtitle,
}: {
  src: string;
  title: string;
  subtitle: string;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onEnded = () => setPlaying(false);
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("ended", onEnded);
    return () => {
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("ended", onEnded);
    };
  }, []);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      void video.play();
    } else {
      video.pause();
    }
  }, []);

  return (
    <div className="mt-10 pt-8 border-t" style={{ borderColor: "rgba(22,61,89,0.08)" }}>
      <div
        className="overflow-hidden rounded-2xl border"
        style={{
          borderColor: "rgba(22,61,89,0.10)",
          backgroundColor: "#fff",
          boxShadow: "0 8px 28px rgba(22,61,89,0.08)",
        }}
      >
        <div
          className="flex items-center gap-3 px-5 py-4 border-b"
          style={{
            borderColor: "rgba(22,61,89,0.08)",
            background:
              "linear-gradient(135deg, rgba(68,137,198,0.10) 0%, rgba(22,61,89,0.04) 100%)",
          }}
        >
          <button
            type="button"
            onClick={togglePlay}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full flex-shrink-0 border-0 cursor-pointer transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)] focus-visible:ring-offset-2"
            style={{ backgroundColor: "var(--regu-blue)", color: "#fff" }}
            aria-label={playing ? "Pausar video" : "Reproducir video"}
          >
            {playing ? (
              <Pause className="h-4 w-4 fill-current" />
            ) : (
              <Play className="h-4 w-4 fill-current" />
            )}
          </button>
          <div className="min-w-0 flex-1">
            <p
              className="text-[10px] font-bold uppercase tracking-[0.14em] m-0"
              style={{ color: "var(--regu-blue)" }}
            >
              {title}
            </p>
            <p
              className="text-sm font-semibold m-0 truncate"
              style={{ color: "var(--regu-navy)" }}
            >
              {subtitle}
            </p>
          </div>
        </div>
        <div className="relative bg-black">
          <video
            ref={videoRef}
            src={src}
            controls
            playsInline
            preload="metadata"
            className="w-full h-auto max-h-[70vh] block"
          />
          {!playing && (
            <button
              type="button"
              onClick={togglePlay}
              className="absolute inset-0 z-[1] flex items-center justify-center border-0 cursor-pointer bg-black/25 transition-opacity hover:bg-black/35"
              aria-label="Reproducir video"
            >
              <span
                className="inline-flex h-16 w-16 items-center justify-center rounded-full shadow-lg"
                style={{ backgroundColor: "var(--regu-blue)", color: "#fff" }}
              >
                <Play className="h-7 w-7 fill-current ml-0.5" />
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function CumbreExtraBlock() {
  const { t } = useTranslation();
  return (
    <div className="mt-12 pt-10 border-t space-y-8" style={{ borderColor: "rgba(22,61,89,0.08)" }}>
      {/* YouTube */}
      <div
        className="rounded-2xl p-6 border"
        style={{ borderColor: "rgba(22,61,89,0.10)", backgroundColor: "rgba(68,137,198,0.04)", borderTop: "3px solid var(--regu-blue)" }}
      >
        <div className="flex items-start gap-4 mb-4">
          <Play className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: "var(--regu-blue)" }} />
          <div className="flex-1">
            <h4 className="text-base font-bold mb-1" style={{ color: "var(--regu-navy)" }}>{t("pages.noticias.cumbreReviveTitle")}</h4>
            <p className="text-sm" style={{ color: "var(--regu-gray-500)" }}>{t("pages.noticias.cumbreReviveDesc")}</p>
          </div>
        </div>
        <a
          href="https://youtube.com/watch?time_continue=31795&v=2JG3kB0zMGY"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white text-sm transition-opacity hover:opacity-85"
          style={{ backgroundColor: "var(--regu-blue)" }}
        >
          <Play className="w-4 h-4" />
          {t("pages.noticias.viewOnYoutube")}
        </a>
      </div>

      {/* Flickr galleries */}
      <div className="grid sm:grid-cols-2 gap-4">
        {[
          { title: "Galería – Cumbre", desc: "Álbum oficial de la Cumbre.", href: "https://www.flickr.com/photos/indotel/albums/72177720330839315" },
          { title: "Galería – Asamblea Plenaria", desc: "Álbum oficial de la Asamblea Plenaria.", href: "https://www.flickr.com/photos/indotel/albums/72177720330864280" },
        ].map((g, i) => (
          <div key={i} className="rounded-2xl p-5 border" style={{ borderColor: "rgba(22,61,89,0.10)", backgroundColor: "#fff" }}>
            <div className="flex items-start gap-3 mb-3">
              <ImageIcon className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: "var(--regu-blue)" }} />
              <div>
                <h4 className="text-sm font-bold mb-1" style={{ color: "var(--regu-navy)" }}>{g.title}</h4>
                <p className="text-xs" style={{ color: "var(--regu-gray-500)" }}>{g.desc}</p>
              </div>
            </div>
            <a
              href={g.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-white text-xs transition-opacity hover:opacity-85"
              style={{ backgroundColor: "var(--regu-blue)" }}
            >
              {t("pages.noticias.viewAlbumFlickr")}
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>
        ))}
      </div>

      {/* Presentations */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <FileText className="h-5 w-5" style={{ color: "var(--regu-blue)" }} />
          <h3 className="text-base font-bold" style={{ color: "var(--regu-navy)" }}>{t("pages.noticias.presentationsTitle")}</h3>
        </div>
        <div className="rounded-2xl border overflow-hidden" style={{ borderColor: "rgba(22,61,89,0.10)" }}>
          {[
            { name: "Cristhian Lizcano", format: "PPTX", file: "presentacion-cristhian-lizcano.pptx" },
            { name: "Lucas Gallitto", format: "PDF", file: "presentacion-lucas-gallitto.pdf" },
            { name: "Ana Valero", format: "PDF", file: "presentacion-ana-valero.pdf" },
            { name: "Óscar León", format: "PDF", file: "presentacion-oscar-leon.pdf" },
            { name: "Julissa Cruz", format: "PPTX", file: "presentacion-julissa-cruz.pptx" },
            { name: "Claudia X. Bustamante", format: "PDF", file: "presentacion-claudia-bustamante.pdf" },
            { name: "Edwin Castillo", format: "PPTX", file: "presentacion-edwin-castillo.pptx" },
            { name: "Carolina Limbatto", format: "PPTX", file: "presentacion-carolina-limbatto.pptx" },
            { name: "Carlos Lugo", format: "PPTX", file: "presentacion-carlos-lugo.pptx" },
            { name: "Robert Mourik", format: "PPTX", file: "presentacion-robert-mourik.pptx" },
          ].map((p, idx, arr) => (
            <div
              key={idx}
              className={`flex items-center gap-4 px-5 py-3 ${idx < arr.length - 1 ? "border-b" : ""}`}
              style={{ borderColor: "rgba(22,61,89,0.07)", backgroundColor: idx % 2 === 0 ? "#fff" : "rgba(22,61,89,0.015)" }}
            >
              <span className="flex-1 text-sm font-medium" style={{ color: "var(--regu-navy)" }}>{p.name}</span>
              <a
                href={`/documents/cumbre-regulatel-asiet-comtelca/${p.file}`}
                download
                className="px-3 py-1.5 rounded-lg font-bold text-white text-xs"
                style={{ backgroundColor: p.format === "PPTX" ? "#ea580c" : "var(--regu-blue)" }}
              >
                {p.format}
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Comunicado */}
      <div
        className="rounded-2xl p-5 border flex items-center gap-4"
        style={{ borderColor: "rgba(22,61,89,0.10)", backgroundColor: "rgba(68,137,198,0.06)" }}
      >
        <FileText className="h-5 w-5 flex-shrink-0" style={{ color: "var(--regu-blue)" }} />
        <span className="flex-1 text-sm font-semibold" style={{ color: "var(--regu-navy)" }}>
          Comunicado – Cumbre Regulatel ASIET Comtelca
        </span>
        <a
          href="/documents/cumbre-regulatel-asiet-comtelca/comunicado-cumbre-regulatel-asiet-comtelca.pdf"
          download
          className="flex-shrink-0 px-4 py-2 rounded-xl font-bold text-white text-sm transition-opacity hover:opacity-85"
          style={{ backgroundColor: "var(--regu-blue)" }}
        >
          {t("common.downloadPdf")}
        </a>
      </div>

      <p className="text-sm" style={{ color: "var(--regu-gray-500)" }}>
        📍 Complejo Barceló Bávaro – Punta Cana, República Dominicana
      </p>
    </div>
  );
}

function ArticleShareFooter({ title }: { title: string }) {
  const { t } = useTranslation();
  const location = useLocation();
  const [copied, setCopied] = useState(false);

  const handleShare = useCallback(() => {
    const url = window.location.origin + location.pathname;
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator.share({ title, url }).catch(() => copyToClipboard(url));
    } else {
      copyToClipboard(url);
    }
  }, [title, location.pathname]);

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="pt-6 pb-2 flex items-center justify-between border-t mt-8" style={{ borderColor: "rgba(22,61,89,0.08)" }}>
      <Link
        to="/noticias"
        className="inline-flex items-center gap-2 text-sm font-semibold transition-colors hover:text-[var(--regu-blue)]"
        style={{ color: "var(--regu-gray-600)" }}
      >
        <ArrowLeft className="h-4 w-4" />
        {t("pages.noticias.backToNews")}
      </Link>
      <button
        type="button"
        onClick={handleShare}
        className="flex items-center gap-2 text-sm font-semibold cursor-pointer border-0 bg-transparent p-0 hover:text-[var(--regu-blue)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)] focus-visible:ring-offset-2 rounded"
        style={{ color: "var(--regu-gray-500)" }}
        aria-label={t("pages.noticias.shareArticle")}
      >
        <Share2 className="h-4 w-4" aria-hidden />
        <span>{copied ? t("pages.shared.linkCopied") : t("pages.shared.share")}</span>
      </button>
    </div>
  );
}

function ArticleLayout({ payload, isStaticCumbre }: { payload: ArticlePayload; isStaticCumbre?: boolean }) {
  return (
    <motion.article initial="hidden" animate="visible" variants={fadeIn} className="w-full">
      <ArticleBreadcrumb title={payload.title} />
      <ArticleHeader payload={payload} />

      {/* Main image / video carousel */}
      {(() => {
        if (payload.contentBlocks !== undefined) return null;
        let allImages = [payload.imageUrl, ...(payload.additionalImages ?? [])].filter(
          (url): url is string => Boolean(url)
        );
        if (payload.slug === SEMANA_REGULATEL_2026_NEWS_SLUG) {
          allImages = [
            SEMANA_REGULATEL_2026_IMAGE,
            ...allImages.filter(
              (url) => url !== SEMANA_REGULATEL_2026_IMAGE && url !== SEMANA_REGULATEL_2026_NEWS_IMAGE
            ),
          ];
        }
        const videos = payload.videoUrl?.startsWith("/") ? [payload.videoUrl] : [];
        const hasCarousel = allImages.length + videos.length > 1;

        if (allImages.length === 0 && videos.length === 0) return null;

        if (!hasCarousel) {
          if (videos.length === 1) {
            return (
              <div className="mb-8">
                <figure
                  className="mb-0 w-full overflow-hidden rounded-2xl"
                  style={{ boxShadow: "0 4px 16px rgba(22,61,89,0.08)" }}
                >
                  <video
                    src={videos[0]}
                    controls
                    playsInline
                    className="w-full h-auto max-h-[60vh] bg-black"
                  />
                </figure>
              </div>
            );
          }
          return (
            <div className="mb-8">
              <ArticleImage imageUrl={allImages[0]} link={payload.link} slug={payload.slug} />
            </div>
          );
        }

        return (
          <div className="mb-8">
            <ImageCarousel
              images={allImages}
              videos={videos}
              variant="article"
              aspectRatio="auto"
              slideHeight="60vh"
              autoPlayMs={videos.length > 0 ? 0 : 6000}
              className="rounded-2xl overflow-hidden"
            />
          </div>
        );
      })()}

      <ArticleBody payload={payload} isStaticCumbre={isStaticCumbre} />
      <ArticleShareFooter title={payload.title} />
    </motion.article>
  );
}

function ArticleWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="w-full"
      style={{ backgroundColor: "#FAFBFC", fontFamily: "var(--token-font-body)", borderTop: "1px solid rgba(22,61,89,0.07)" }}
    >
      {/* Blue accent bar */}
      <div style={{ backgroundColor: "var(--regu-blue)", height: "4px" }} aria-hidden />

      <div className="mx-auto px-4 md:px-6 lg:px-8 py-10 md:py-14" style={{ maxWidth: CONTAINER_MAX }}>
        {children}
      </div>
    </div>
  );
}

function renderNewsText(text: string) {
  return <ArticleBody payload={{ title: "", dateFormatted: "", category: "", imageUrl: null, slug: "", content: [text], attachments: [] }} />;
}

function PublishedNewsBlocks({ blocks, payload }: { blocks: ContentBlock[]; payload: ArticlePayload }) {
  const groups: ContentBlock[][] = [];
  for (const block of blocks) {
    const previous = groups[groups.length - 1];
    if (block.type === "image" && previous?.[0].type === "image") previous.push(block);
    else groups.push([block]);
  }
  return <div className="space-y-6">{groups.map((group, index) => {
    if (group[0].type !== "image") return <ContentBlocksEditor key={group[0].id} blocks={group} renderText={renderNewsText} />;
    const images = group.map(block => safeContentUrl(block.url)).filter(Boolean);
    const videos = index === 0 && payload.videoUrl?.startsWith("/") ? [payload.videoUrl] : [];
    if (!images.length && !videos.length) return null;
    return <div key={group[0].id} className={index === 0 ? "mb-8" : undefined}>
      {images.length + videos.length > 1 ? <ImageCarousel images={images} videos={videos} variant="article" aspectRatio="auto" slideHeight="60vh" autoPlayMs={videos.length ? 0 : 6000} className="rounded-2xl overflow-hidden" />
        : images.length ? <ArticleImage imageUrl={images[0]} link={payload.link} slug={payload.slug} />
          : <video src={videos[0]} controls playsInline className="h-auto max-h-[60vh] w-full rounded-2xl bg-black" />}
      {group.some(block => block.caption) && <p className="mt-2 text-center text-sm text-slate-500">{group.map(block => block.caption).filter(Boolean).join(" · ")}</p>}
    </div>;
  })}</div>;
}

function staticNewsForEditing(article: NoticiaData): AdminNewsItem {
  return {
    id: "", slug: article.slug, title: article.title, date: article.date, dateFormatted: article.dateFormatted,
    category: article.category, excerpt: article.excerpt, imageUrl: article.imageUrl,
    content: article.content.join("\n\n"), author: article.author, link: article.link, videoUrl: article.videoUrl,
    published: true, attachments: resolveNewsAttachments(article.slug, undefined),
  };
}

function newsDraftPreview(row: AdminNewsItem) {
  return { slug: row.slug, title: row.title, excerpt: row.excerpt, date: row.date, dateFormatted: row.dateFormatted, imageUrl: row.imageUrl, category: row.category, contentBlocks: row.contentBlocks, draftSignature: JSON.stringify(row) };
}

function legacyNewsImageOrder(row: AdminNewsItem) {
  const images = [row.imageUrl, ...(row.additionalImages ?? [])].filter(Boolean);
  return row.slug === SEMANA_REGULATEL_2026_NEWS_SLUG
    ? [SEMANA_REGULATEL_2026_IMAGE, ...images.filter(url => url !== SEMANA_REGULATEL_2026_IMAGE && url !== SEMANA_REGULATEL_2026_NEWS_IMAGE)]
    : images;
}

function editableLegacyNewsBlocks(row: AdminNewsItem) {
  return legacyNewsBlocks(row, legacyNewsImageOrder(row));
}

function InlineNewsEditor({ initial }: { initial: AdminNewsItem }) {
  const navigate = useNavigate();
  const { adminNews, addNews, updateNews, deleteNews } = useAdminData();
  const { recordPersistedChange, clearPreview } = useSiteEdit();
  const { value: row, setValue: setRow, reset } = useDraftHistory<AdminNewsItem>(() => {
    const seed = cloneJson({ ...initial, attachments: resolveNewsAttachments(initial.slug, initial.attachments) });
    return { ...seed, contentBlocks: seed.contentBlocks ?? editableLegacyNewsBlocks(seed) };
  });
  const [saving, setSaving] = useState(false);
  const [uploadBusy, setUploadBusy] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const busyRef = useRef(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const baselineRow = useRef(JSON.stringify(row));
  const sourceRevision = useRef(JSON.stringify(initial));
  const preview = newsDraftPreview(row);
  const captureBaseline = usePreviewSync("news", preview);
  const draft = useRecoverableDraft({ identity: `news:${initial.slug}`, kind: "news", path: initial.slug.startsWith("preview-news-") ? "/noticias/nueva" : `/noticias/${encodeURIComponent(initial.slug)}`,
    label: row.title, value: row, baseline: JSON.parse(baselineRow.current) as AdminNewsItem, enabled: true, onRestore: reset });
  useEffect(() => {
    const revision = JSON.stringify(initial);
    if (revision === sourceRevision.current) return;
    sourceRevision.current = revision;
    // Published undo/redo updates the article without replacing a user's current draft.
    if (JSON.stringify(row) !== baselineRow.current) return;
    const seed = { ...initial, attachments: resolveNewsAttachments(initial.slug, initial.attachments) };
    const next = { ...seed, contentBlocks: seed.contentBlocks ?? editableLegacyNewsBlocks(seed) };
    baselineRow.current = JSON.stringify(next);
    reset(next);
    captureBaseline(newsDraftPreview(next));
    clearPreview("news");
  }, [initial, row, reset, captureBaseline, clearPreview]);
  const patch = (value: Partial<AdminNewsItem>) => { setRow(current => ({ ...current, ...value })); setMessage(null); };
  const unpublish = async () => {
    if (busyRef.current || uploadBusy) return;
    const before = adminNews.find(item => item.id === row.id || item.slug === row.slug);
    const stored = before ?? (initial.slug.startsWith("preview-news-") ? undefined : initial);
    if (!stored) { setMessage("Este borrador todavía no está publicado."); return; }
    const hadDraft = JSON.stringify(row) !== baselineRow.current;
    busyRef.current = true; setSaving(true); setError(null); setMessage(null);
    try {
      let saved: AdminNewsItem;
      if (before) {
        await updateNews(before.id, { published: false });
        saved = { ...before, published: false };
        recordPersistedChange({ label: "noticia", undo: async () => { await updateNews(before.id, { published: before.published }); notifyCmsSaved("news"); }, redo: async () => { await updateNews(before.id, { published: false }); notifyCmsSaved("news"); } });
      } else {
        saved = await addNews({ ...stored, published: false });
        const snapshot = saved;
        recordPersistedChange({ label: "noticia", undo: async () => { await deleteNews(snapshot.id); notifyCmsSaved("news"); }, redo: async () => { await addNews(snapshot); notifyCmsSaved("news"); } });
      }
      const baseline = { ...JSON.parse(baselineRow.current) as AdminNewsItem, id: saved.id, published: false };
      baselineRow.current = JSON.stringify(baseline);
      captureBaseline(newsDraftPreview(baseline));
      if (hadDraft) setRow(current => ({ ...current, id: saved.id, published: false }));
      else { reset(baseline); clearPreview("news"); }
      notifyCmsSaved("news");
      setMessage("Noticia despublicada. Tus cambios pendientes siguen aquí sin publicarse.");
    } catch (err) { setError(err instanceof Error ? err.message : "No se pudo despublicar la noticia."); }
    finally { busyRef.current = false; setSaving(false); }
  };
  const save = async (published: boolean) => {
    if (!published) { await unpublish(); return; }
    if (busyRef.current || uploadBusy) return;
    if (!row.title.trim()) { setError("La noticia necesita un título."); return; }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(row.date.slice(0, 10))) { setError("Indica una fecha válida para la noticia."); return; }
    if ([row.link, row.videoUrl].some(url => url?.trim() && !safeContentUrl(url))) { setError("Los enlaces deben empezar por https://, http:// o /."); return; }
    if (row.contentBlocks?.some(block => (block.type === "image" || block.type === "document") && !safeContentUrl(block.url))) {
      setError("Completa el enlace de cada imagen y documento, o quita el bloque vacío."); return;
    }
    busyRef.current = true; setSaving(true); setError(null); setMessage(null);
    const before = adminNews.find(item => item.id === row.id || item.slug === row.slug);
    const baseSlug = slugify(row.title) || `noticia-${Date.now()}`;
    const newSlug = adminNews.some(item => item.slug === baseSlug) || noticiasData.some(item => item.slug === baseSlug) ? `${baseSlug}-${Date.now()}` : baseSlug;
    const normalized = newsVisualPayload({ ...row, title: row.title.trim(), published, slug: row.slug.startsWith("preview-news-") ? newSlug : row.slug }, legacyNewsImageOrder(row));
    try {
      let saved = normalized;
      if (before) {
        const beforeWithBlocks = before.contentBlocks === undefined
          ? { ...before, contentBlocks: editableLegacyNewsBlocks({ ...before, attachments: resolveNewsAttachments(before.slug, before.attachments) }) }
          : before;
        await updateNews(before.id, normalized);
        saved = { ...normalized, id: before.id };
        recordPersistedChange({ label: "noticia", undo: async () => { await updateNews(before.id, beforeWithBlocks); notifyCmsSaved("news"); }, redo: async () => { await updateNews(before.id, saved); notifyCmsSaved("news"); } });
      } else {
        const created = await addNews(normalized);
        saved = { ...normalized, ...created };
        recordPersistedChange({ label: "noticia", undo: async () => { await deleteNews(created.id); notifyCmsSaved("news"); }, redo: async () => { await addNews({ ...saved }); notifyCmsSaved("news"); } });
      }
      draft.clear(saved);
      reset(saved);
      baselineRow.current = JSON.stringify(saved);
      captureBaseline(newsDraftPreview(saved));
      clearPreview("news"); notifyCmsSaved("news");
      setMessage(published ? "Noticia publicada." : "Noticia despublicada. Puedes seguir editándola aquí.");
      if (row.slug !== saved.slug) navigate(`/noticias/${saved.slug}`, { replace: true });
    } catch (err) { setError(err instanceof Error ? err.message : "No se pudo guardar la noticia."); }
    finally { busyRef.current = false; setSaving(false); }
  };
  const payload = normalizeAdminNoticia(row);
  return <article className="w-full" data-inline-news-editor>
    <div className="sticky top-14 z-40 mb-7 flex flex-wrap items-center gap-3 rounded-xl border border-teal-200 bg-white/95 p-3 shadow-sm backdrop-blur">
      <span className="mr-auto text-sm font-semibold text-teal-800">{JSON.stringify(row) !== baselineRow.current ? "Cambios sin publicar" : "Esta noticia"}</span>
      <button type="button" disabled={saving || uploadBusy} aria-pressed={previewMode} onClick={() => setPreviewMode(current => !current)} className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">{previewMode ? "Editar" : "Vista previa"}</button>
      <SiteEditUndoRedo variant="drawer" />
      <button type="button" disabled={saving || uploadBusy} onClick={() => void save(true)} className="rounded-lg bg-[var(--regu-blue)] px-4 py-2 text-sm font-bold text-white disabled:opacity-50">{saving ? "Guardando…" : "Publicar"}</button>
      <button type="button" disabled={saving || uploadBusy} onClick={() => void save(false)} className="rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 disabled:opacity-50">Despublicar</button>
      {error && <p role="alert" className="w-full text-sm text-red-700">{error}</p>}
      {message && <p role="status" className="w-full text-sm text-teal-800">{message}</p>}
      <div className="w-full"><DraftRecoveryNotice draft={draft} disabled={saving || uploadBusy} /></div>
    </div>
    {previewMode ? <ArticleLayout payload={payload} isStaticCumbre /> : <>
    <ArticleBreadcrumb title={row.title} />
    <header className="mb-7 space-y-3">
      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600"><CategoryBadge label={row.category} /><span>{row.dateFormatted}</span>{!row.published && <span className="rounded bg-amber-50 px-2 py-1 text-amber-800">Sin publicar</span>}</div>
      <DraftEditableText as="h1" aria-label="Título de la noticia" disabled={saving} value={row.title} onChange={title => patch({ title })} data-placeholder="Escribe el título" className="min-h-[1.25em] rounded-sm font-bold leading-tight tracking-tight outline-none transition hover:bg-teal-50/40 focus:ring-1 focus:ring-teal-300 empty:before:text-slate-300 empty:before:content-[attr(data-placeholder)]" style={{ color: "var(--regu-navy)", fontSize: "clamp(1.5rem, 2.2vw, 2.25rem)", lineHeight: 1.25, fontFamily: "var(--token-font-heading)" }} />
      <DraftEditableText as="p" aria-label="Resumen de la noticia" disabled={saving} value={row.excerpt} onChange={excerpt => patch({ excerpt })} data-placeholder="Añadir resumen" className="min-h-[1.5em] rounded-sm text-base leading-relaxed outline-none transition hover:bg-teal-50/40 focus:ring-1 focus:ring-teal-300 empty:before:text-slate-300 empty:before:content-[attr(data-placeholder)]" style={{ color: "var(--regu-gray-600)" }} />
    </header>
    <ContentBlocksEditor blocks={row.contentBlocks ?? []} onChange={blocks => patch({ contentBlocks: blocks })} editing disabled={saving} onBusyChange={setUploadBusy} folder="news" renderText={renderNewsText} />
    <details className="my-6 text-sm"><summary className="cursor-pointer text-xs font-semibold text-slate-500">Opciones de noticia</summary><fieldset disabled={saving} className="mt-4 grid gap-4 rounded-xl border border-slate-200 p-4 sm:grid-cols-2">
      <label>Fecha<input aria-label="Fecha de la noticia" type="date" value={row.date.slice(0, 10)} onChange={event => { const date = event.target.value; patch({ date, dateFormatted: new Date(`${date}T12:00:00`).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" }) }); }} className="mt-1 w-full rounded-lg border p-2" /></label>
      <label>Autor<input value={row.author ?? ""} onChange={event => patch({ author: event.target.value })} className="mt-1 w-full rounded-lg border p-2" /></label>
      <label>Categoría<input value={row.category} onChange={event => patch({ category: event.target.value })} className="mt-1 w-full rounded-lg border p-2" /></label>
      <label>Enlace de la noticia<input value={row.link ?? ""} onChange={event => patch({ link: event.target.value })} className="mt-1 w-full rounded-lg border p-2" /></label>
      <label>Video<input value={row.videoUrl ?? ""} onChange={event => patch({ videoUrl: event.target.value })} className="mt-1 w-full rounded-lg border p-2" /></label>
    </fieldset></details>
    <ArticleBody payload={{ ...payload, content: [], contentBlocks: [], attachments: [] }} isStaticCumbre />
    <ArticleShareFooter title={row.title} />
    </>}
  </article>;
}

export default function NoticiaIndividual() {
  const { t, i18n } = useTranslation();
  const { slug } = useParams<{ slug: string }>();
  const { adminNews, contentSource, newsLoaded, contentError, recheckContentSource } = useAdminData();
  const { enabled: editing } = useSiteEdit();
  if (contentSource === "loading") return null;
  if (!newsLoaded) return <ArticleWrapper><p role="status" className="text-sm text-slate-600">{contentError ? "No se pudo cargar esta noticia. Reintenta para ver su estado actual." : "Cargando noticia…"}</p>{contentError && <button type="button" onClick={() => void recheckContentSource()} className="mt-4 rounded-lg border px-4 py-2 text-sm font-semibold">Reintentar</button>}</ArticleWrapper>;

  const routeSlug = (slug ?? "").toLowerCase();
  const adminNoticia = adminNews.find(
    (n) => (n.slug || n.id).toLowerCase() === routeSlug || n.id.toLowerCase() === routeSlug,
  );
  // A CMS draft also overrides the static article, so unpublishing stays effective.
  const noticiaStatic = adminNoticia ? undefined : noticiasData.find((n) => n.slug.toLowerCase() === routeSlug);

  if (editing && (adminNoticia || noticiaStatic)) {
    return <ArticleWrapper><InlineNewsEditor key={routeSlug} initial={adminNoticia ?? staticNewsForEditing(noticiaStatic!)} /></ArticleWrapper>;
  }
  if (editing && routeSlug === "nueva") {
    const date = new Date().toISOString().slice(0, 10);
    const initial: AdminNewsItem = { id: "", slug: "preview-news-new", title: "", date, dateFormatted: new Date().toLocaleDateString("es-ES"), category: "Noticias", excerpt: "", imageUrl: "", content: "", author: "REGULATEL", published: false, attachments: [], contentBlocks: [] };
    return <ArticleWrapper><InlineNewsEditor key="new-news" initial={initial} /></ArticleWrapper>;
  }

  if (adminNoticia?.published) {
    const payload = normalizeAdminNoticia(adminNoticia);
    return (
      <ArticleWrapper>
        <ArticleLayout payload={payload} isStaticCumbre />
      </ArticleWrapper>
    );
  }

  if (!noticiaStatic) {
    return (
      <ArticleWrapper>
        <ArticleBreadcrumb title={t("pages.noticias.notFound")} />
        <h1 className="text-xl font-bold mt-2 mb-4" style={{ color: "var(--regu-navy)" }}>
          {t("pages.noticias.notFound")}
        </h1>
        <Link
          to="/noticias"
          className="inline-flex items-center gap-2 text-sm font-semibold"
          style={{ color: "var(--regu-blue)" }}
        >
          <ArrowLeft className="h-4 w-4" />
          {t("pages.noticias.backToNews")}
        </Link>
      </ArticleWrapper>
    );
  }

  const payload = normalizeStaticNoticia(localizeNoticiaData(noticiaStatic, t, i18n.language));
  return (
    <ArticleWrapper>
      <ArticleLayout payload={payload} isStaticCumbre />
    </ArticleWrapper>
  );
}

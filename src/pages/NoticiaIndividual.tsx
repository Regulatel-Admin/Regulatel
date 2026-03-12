import { motion } from "framer-motion";
import { useParams, useLocation, Link } from "react-router-dom";
import { useCallback, useState } from "react";
import {
  ArrowLeft,
  Maximize2,
  FileText,
  Image as ImageIcon,
  Play,
  Share2,
  Tag,
  ArrowRight,
} from "lucide-react";
import ImageCarousel from "@/components/ImageCarousel";
import { noticiasData } from "./noticiasData";
import { useAdminData } from "@/contexts/AdminDataContext";
import type { NoticiaData } from "./noticiasData";

const fadeIn = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const CONTAINER_MAX = "1060px";

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
}): ArticlePayload {
  const paragraphs = admin.content ? admin.content.split(/\n\n+/).filter(Boolean) : [];
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
  };
}

function ArticleBreadcrumb({ title }: { title: string }) {
  return (
    <nav aria-label="Breadcrumb" className="text-xs sm:text-[0.8125rem] mb-6 flex flex-wrap items-center gap-1" style={{ color: "var(--regu-gray-500)" }}>
      <Link to="/" className="hover:text-[var(--regu-blue)] transition-colors">Inicio</Link>
      <span aria-hidden className="mx-0.5">/</span>
      <Link to="/noticias" className="hover:text-[var(--regu-blue)] transition-colors">Noticias</Link>
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
  );
}

function ArticleImage({ imageUrl }: { imageUrl: string }) {
  return (
    <figure
      className="mb-0 w-full overflow-hidden rounded-2xl"
      style={{
        boxShadow: "0 4px 16px rgba(22,61,89,0.08)",
      }}
    >
      <img
        src={imageUrl}
        alt=""
        className="w-full h-auto max-h-[60vh] object-cover"
        onError={(e) => { e.currentTarget.style.display = "none"; }}
      />
    </figure>
  );
}

const bodyTextStyle: React.CSSProperties = {
  color: "var(--regu-gray-800)",
  lineHeight: 1.8,
  fontSize: "1.0rem",
};

function ArticleBody({ payload, isStaticCumbre }: { payload: ArticlePayload; isStaticCumbre?: boolean }) {
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
      <div className="space-y-1">
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
      </div>

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
            Datos destacados
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
            Ver enlace oficial
          </a>
        </div>
      )}

      {/* Video */}
      {payload.videoUrl && (
        <div className="mt-4">
          <a
            href={payload.videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition-opacity hover:opacity-85"
            style={{ backgroundColor: "var(--regu-navy)", color: "#fff" }}
          >
            <Play className="h-4 w-4" />
            Ver video
          </a>
        </div>
      )}

      {/* Bloque especial Cumbre */}
      {isStaticCumbre && payload.slug === "cumbre-regulatel-asiet-comtelca" && (
        <CumbreExtraBlock />
      )}
    </div>
  );
}

function CumbreExtraBlock() {
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
            <h4 className="text-base font-bold mb-1" style={{ color: "var(--regu-navy)" }}>Revive la Cumbre</h4>
            <p className="text-sm" style={{ color: "var(--regu-gray-500)" }}>Transmisión oficial del evento</p>
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
          Ver en YouTube
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
              Ver álbum en Flickr
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>
        ))}
      </div>

      {/* Presentations */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <FileText className="h-5 w-5" style={{ color: "var(--regu-blue)" }} />
          <h3 className="text-base font-bold" style={{ color: "var(--regu-navy)" }}>Presentaciones de los Expositores</h3>
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
          Descargar PDF
        </a>
      </div>

      <p className="text-sm" style={{ color: "var(--regu-gray-500)" }}>
        📍 Complejo Barceló Bávaro – Punta Cana, República Dominicana
      </p>
    </div>
  );
}

function ArticleShareFooter({ title }: { title: string }) {
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
        Volver a noticias
      </Link>
      <button
        type="button"
        onClick={handleShare}
        className="flex items-center gap-2 text-sm font-semibold cursor-pointer border-0 bg-transparent p-0 hover:text-[var(--regu-blue)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)] focus-visible:ring-offset-2 rounded"
        style={{ color: "var(--regu-gray-500)" }}
        aria-label="Compartir esta noticia"
      >
        <Share2 className="h-4 w-4" aria-hidden />
        <span>{copied ? "Enlace copiado ✓" : "Compartir"}</span>
      </button>
    </div>
  );
}

function ArticleLayout({ payload, isStaticCumbre }: { payload: ArticlePayload; isStaticCumbre?: boolean }) {
  return (
    <motion.article initial="hidden" animate="visible" variants={fadeIn} className="w-full">
      <ArticleBreadcrumb title={payload.title} />
      <ArticleHeader payload={payload} />

      {/* Main image */}
      {(() => {
        const allImages = [payload.imageUrl, ...(payload.additionalImages ?? [])].filter(Boolean) as string[];
        if (allImages.length === 0) return null;
        if (allImages.length === 1) return (
          <div className="mb-8">
            <ArticleImage imageUrl={allImages[0]} />
          </div>
        );
        return (
          <div className="mb-8">
            <ImageCarousel
              images={allImages}
              variant="article"
              aspectRatio="auto"
              slideHeight="60vh"
              autoPlayMs={6000}
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

export default function NoticiaIndividual() {
  const { slug } = useParams<{ slug: string }>();
  const { adminNews, contentSource } = useAdminData();
  if (contentSource === "loading") return null;

  const adminNoticia = adminNews.find((n) => n.published && (n.slug === slug || n.id === slug));
  const noticiaStatic = noticiasData.find((n) => n.slug === slug);

  if (adminNoticia) {
    const payload = normalizeAdminNoticia(adminNoticia);
    return (
      <ArticleWrapper>
        <ArticleLayout payload={payload} />
      </ArticleWrapper>
    );
  }

  if (!noticiaStatic) {
    return (
      <ArticleWrapper>
        <ArticleBreadcrumb title="Noticia no encontrada" />
        <h1 className="text-xl font-bold mt-2 mb-4" style={{ color: "var(--regu-navy)" }}>
          Noticia no encontrada
        </h1>
        <Link
          to="/noticias"
          className="inline-flex items-center gap-2 text-sm font-semibold"
          style={{ color: "var(--regu-blue)" }}
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a noticias
        </Link>
      </ArticleWrapper>
    );
  }

  const payload = normalizeStaticNoticia(noticiaStatic);
  return (
    <ArticleWrapper>
      <ArticleLayout payload={payload} isStaticCumbre />
    </ArticleWrapper>
  );
}

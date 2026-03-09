import { motion } from "framer-motion";
import { useParams, useLocation, Link } from "react-router-dom";
import { useCallback, useState } from "react";
import {
  ArrowLeft,
  Building2,
  Maximize2,
  FileText,
  Image as ImageIcon,
  Play,
  Share2,
} from "lucide-react";
import ImageCarousel from "@/components/ImageCarousel";
import { noticiasData } from "./noticiasData";
import { useAdminData } from "@/contexts/AdminDataContext";
import type { NoticiaData } from "./noticiasData";

const fadeIn = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 },
  },
};

/** Réplica INDOTEL: ancho amplio; cuadro con borde muy sutil (como INDOTEL). */
const CONTAINER_MAX = "1440px";
const ARTICLE_BOX_MAX = "1200px";
const BODY_MAX = "1200px";

/** Datos normalizados para render (estático o admin). */
interface ArticlePayload {
  title: string;
  dateFormatted: string;
  category: string;
  imageUrl: string | null;
  /** Imágenes adicionales (enlaces o adjuntos). Todas se muestran en la noticia. */
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
  const paragraphs = admin.content
    ? admin.content.split(/\n\n+/).filter(Boolean)
    : [];
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

/** Breadcrumb INDOTEL: Inicio / Noticias / [título]. Último ítem en negrita azul. */
function ArticleBreadcrumb({ title }: { title: string }) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="text-xs sm:text-sm mb-4"
      style={{ color: "var(--regu-gray-500)" }}
    >
      <Link
        to="/"
        className="hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)] focus-visible:ring-offset-1 rounded"
        style={{ color: "var(--regu-gray-600)" }}
      >
        Inicio
      </Link>
      <span className="mx-1.5" aria-hidden>/</span>
      <Link
        to="/noticias"
        className="hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)] focus-visible:ring-offset-1 rounded"
        style={{ color: "var(--regu-gray-600)" }}
      >
        Noticias
      </Link>
      <span className="mx-1.5" aria-hidden>/</span>
      <span className="font-semibold" style={{ color: "var(--regu-blue)" }}>
        {title}
      </span>
    </nav>
  );
}

/** Título principal INDOTEL: grande, negro, fuera de imagen, alineado a la izquierda. */
function ArticleHeader({ payload }: { payload: ArticlePayload }) {
  return (
    <header className="mb-5 md:mb-6">
      <h1
        className="text-xl sm:text-2xl md:text-[1.875rem] font-bold leading-tight tracking-tight"
        style={{
          color: "#1a1a1a",
          fontFamily: "var(--token-font-heading)",
          lineHeight: 1.3,
        }}
      >
        {payload.title}
      </h1>
    </header>
  );
}

/** Imagen principal INDOTEL: rectangular, ancho columna, sin bordes ni sombra. */
function ArticleImage({ imageUrl }: { imageUrl: string }) {
  return (
    <figure className="mb-0 w-full">
      <img
        src={imageUrl}
        alt=""
        className="w-full h-auto max-h-[70vh] object-contain"
        onError={(e) => {
          e.currentTarget.style.display = "none";
        }}
      />
    </figure>
  );
}

/** Fecha debajo de la línea gris: discreta, solo fecha (estilo INDOTEL). */
function ArticleMetaLine({ payload }: { payload: ArticlePayload }) {
  return (
    <div
      className="mb-6 md:mb-8 text-sm"
      style={{ color: "var(--regu-gray-500)" }}
    >
      <time>{payload.dateFormatted}</time>
    </div>
  );
}

/** Estilos de cuerpo: tipografía lectura. */
const bodyTextStyle = {
  color: "var(--regu-gray-900)",
  lineHeight: 1.75,
};

function ArticleBody({
  payload,
  isStaticCumbre,
}: {
  payload: ArticlePayload;
  isStaticCumbre?: boolean;
}) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;

  const renderParagraph = (text: string, key: number) => {
    const parts = text.split(urlRegex);
    return (
      <p
        key={key}
        className="mb-6 last:mb-0"
        style={bodyTextStyle}
      >
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
    <div
      className="article-body text-base md:text-[1.0625rem]"
      style={{
        maxWidth: BODY_MAX,
        marginLeft: "auto",
        marginRight: "auto",
        paddingTop: "0.5rem",
        paddingBottom: "1rem",
        lineHeight: 1.8,
      }}
    >
      <div className="space-y-5">
        {payload.content.map((paragraph, index) => {
          if (paragraph.startsWith("**") && paragraph.endsWith("**")) {
            const title = paragraph.replace(/\*\*/g, "");
            return (
              <h2
                key={index}
                className="text-xl md:text-2xl font-bold mt-8 md:mt-10 mb-3 md:mb-4 first:mt-0"
                style={{
                  color: "var(--regu-gray-900)",
                  fontFamily: "var(--token-font-heading)",
                }}
              >
                {title}
              </h2>
            );
          }
          if (paragraph.trim().startsWith("- ")) {
            const items = paragraph
              .split("\n")
              .filter((p) => p.trim().startsWith("- "));
            return (
              <ul
                key={index}
                className="list-disc list-outside pl-6 space-y-2 mb-6"
                style={{ ...bodyTextStyle, color: "var(--regu-gray-900)" }}
              >
                {items.map((item, idx) => {
                  const text = item.replace(/^- /, "");
                  const parts = text.split(urlRegex);
                  return (
                    <li key={idx} className="leading-relaxed">
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
                    </li>
                  );
                })}
              </ul>
            );
          }
          return renderParagraph(paragraph, index);
        })}
      </div>

      {payload.quotes && payload.quotes.length > 0 && (
        <div className="mt-8 md:mt-10 space-y-5">
          {payload.quotes.map((quote, index) => (
            <div
              key={index}
              className="pl-4 py-2 border-l-2"
              style={{
                borderLeftColor: "var(--regu-blue)",
                backgroundColor: "rgba(68, 137, 198, 0.04)",
              }}
            >
              <p
                className="text-base md:text-lg leading-relaxed italic m-0"
                style={{ color: "var(--regu-gray-900)" }}
              >
                &ldquo;{quote.text}&rdquo;
              </p>
              {quote.author && (
                <p
                  className="mt-3 text-sm font-semibold m-0"
                  style={{ color: "var(--regu-gray-500)" }}
                >
                  — {quote.author}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {payload.highlights && payload.highlights.length > 0 && (
        <div className="mt-8 md:mt-10 grid sm:grid-cols-2 gap-3">
          {payload.highlights.map((h, index) => (
            <div
              key={index}
              className="p-4 border-l-2 pl-4 flex items-start gap-3"
              style={{
                borderLeftColor: "var(--regu-gray-300)",
                backgroundColor: "transparent",
              }}
            >
              <Building2
                className="h-5 w-5 flex-shrink-0 mt-0.5"
                style={{ color: "var(--regu-blue)" }}
              />
              <div>
                {h.title && (
                  <h3
                    className="font-bold mb-1 text-base"
                    style={{ color: "var(--regu-gray-900)" }}
                  >
                    {h.title}
                  </h3>
                )}
                <p
                  className="text-sm leading-relaxed m-0"
                  style={{ color: "var(--regu-gray-500)" }}
                >
                  {h.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {payload.tags && payload.tags.length > 0 && (
        <div
          className="mt-8 md:mt-10 pt-5 border-t flex flex-wrap gap-2"
          style={{ borderColor: "var(--regu-gray-100)" }}
        >
          {payload.tags.map((tag, index) => (
            <span key={index} className="text-xs text-[var(--regu-gray-500)]">
              {tag}
              {index < payload.tags!.length - 1 && <span className="mx-1.5" aria-hidden>·</span>}
            </span>
          ))}
        </div>
      )}

      {payload.link && (
        <p className="mt-6">
          <a
            href={payload.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-medium"
            style={{ color: "var(--regu-blue)" }}
          >
            Enlace externo
            <Maximize2 className="h-3.5 w-3.5" />
          </a>
        </p>
      )}
      {payload.videoUrl && (
        <p className="mt-4">
          <a
            href={payload.videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 font-medium"
            style={{ color: "var(--regu-blue)" }}
          >
            <Play className="h-4 w-4" />
            Ver video
          </a>
        </p>
      )}

      {/* Bloque especial Cumbre REGULATEL ASIET COMTELCA (solo noticia estática) */}
      {isStaticCumbre && payload.slug === "cumbre-regulatel-asiet-comtelca" && (
        <CumbreExtraBlock />
      )}
    </div>
  );
}

/** Bloque extra para la noticia de la Cumbre (YouTube, Flickr, presentaciones). */
function CumbreExtraBlock() {
  return (
    <div
      className="mt-12 pt-10 border-t space-y-10"
      style={{ borderColor: "var(--regu-gray-100)" }}
    >
      <div
        className="rounded-xl p-6 border"
        style={{
          borderColor: "var(--regu-gray-100)",
          backgroundColor: "var(--regu-offwhite)",
        }}
      >
        <div className="flex items-start gap-4 mb-4">
          <Play className="h-6 w-6 flex-shrink-0 mt-1" style={{ color: "var(--regu-blue)" }} />
          <div className="flex-1">
            <h4 className="text-lg font-bold mb-2" style={{ color: "var(--regu-gray-900)" }}>
              Revive la Cumbre
            </h4>
            <p className="text-sm mb-4" style={{ color: "var(--regu-gray-500)" }}>
              Transmisión oficial del evento
            </p>
          </div>
        </div>
        <a
          href="https://youtube.com/watch?time_continue=31795&v=2JG3kB0zMGY&embeds_referring_euri=https%3A%2F%2Findotel.gob.do%2F&source_ve_path=MjM4NTE"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-white text-sm transition-colors hover:opacity-95"
          style={{ backgroundColor: "var(--regu-blue)" }}
        >
          <Play className="w-4 h-4" />
          Ver en YouTube
        </a>
      </div>

      <div className="space-y-6">
        {[
          {
            title: "Galería de Fotos – Flickr",
            desc: "Acceda al álbum oficial con los mejores momentos de la Cumbre.",
            href: "https://www.flickr.com/photos/indotel/albums/72177720330839315",
          },
          {
            title: "Galería de Fotos – Asamblea Plenaria",
            desc: "Álbum oficial de la Asamblea Plenaria de REGULATEL.",
            href: "https://www.flickr.com/photos/indotel/albums/72177720330864280",
          },
        ].map((g, i) => (
          <div
            key={i}
            className="rounded-xl p-6 border"
            style={{
              borderColor: "var(--regu-gray-100)",
              backgroundColor: "white",
            }}
          >
            <div className="flex items-start gap-4 mb-4">
              <ImageIcon className="h-6 w-6 flex-shrink-0 mt-1" style={{ color: "var(--regu-blue)" }} />
              <div className="flex-1">
                <h4 className="text-lg font-bold mb-2" style={{ color: "var(--regu-gray-900)" }}>
                  {g.title}
                </h4>
                <p className="text-sm mb-4" style={{ color: "var(--regu-gray-500)" }}>
                  {g.desc}
                </p>
              </div>
            </div>
            <a
              href={g.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg font-semibold text-sm transition-colors hover:opacity-95 text-white"
              style={{ backgroundColor: "var(--regu-blue)" }}
            >
              Ver álbum en Flickr
            </a>
          </div>
        ))}
      </div>

      <div>
        <div className="flex items-center gap-3 mb-4">
          <FileText className="h-6 w-6" style={{ color: "var(--regu-blue)" }} />
          <h3 className="text-xl font-bold" style={{ color: "var(--regu-gray-900)" }}>
            Presentaciones de los Expositores
          </h3>
        </div>
        <ul className="space-y-3">
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
          ].map((p, idx) => (
            <li
              key={idx}
              className="flex items-center gap-4 p-3 rounded-lg"
              style={{ backgroundColor: "var(--regu-offwhite)" }}
            >
              <span className="flex-1 font-medium" style={{ color: "var(--regu-gray-900)" }}>
                {p.name}
              </span>
              <a
                href={`/documents/cumbre-regulatel-asiet-comtelca/${p.file}`}
                download
                className="px-3 py-1.5 rounded-lg font-semibold text-white text-sm"
                style={{
                  backgroundColor: p.format === "PPTX" ? "#ea580c" : "var(--regu-blue)",
                }}
              >
                {p.format}
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div
        className="rounded-xl p-4 border flex items-center gap-4"
        style={{
          borderColor: "var(--regu-gray-100)",
          backgroundColor: "rgba(68, 137, 198, 0.06)",
        }}
      >
        <FileText className="h-6 w-6 flex-shrink-0" style={{ color: "var(--regu-blue)" }} />
        <span className="flex-1 font-medium" style={{ color: "var(--regu-gray-900)" }}>
          Comunicado – Cumbre Regulatel ASIET Comtelca
        </span>
        <a
          href="/documents/cumbre-regulatel-asiet-comtelca/comunicado-cumbre-regulatel-asiet-comtelca.pdf"
          download
          className="px-4 py-2 rounded-lg font-semibold text-white text-sm"
          style={{ backgroundColor: "var(--regu-blue)" }}
        >
          Descargar PDF
        </a>
      </div>

      <p className="flex items-center gap-3 text-sm font-medium pt-4" style={{ color: "var(--regu-gray-500)" }}>
        <span aria-hidden>📍</span>
        Complejo Barceló Bávaro – Punta Cana, República Dominicana
      </p>
    </div>
  );
}

/** Compartir: usa Web Share API o copia enlace al portapapeles. */
function ArticleShareFooter({ title }: { title: string }) {
  const location = useLocation();
  const [copied, setCopied] = useState(false);

  const handleShare = useCallback(() => {
    const url = window.location.origin + location.pathname;
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator.share({
        title,
        url,
      }).catch(() => {
        copyToClipboard(url);
      });
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
    <div className="pt-6 pb-2">
      <button
        type="button"
        onClick={handleShare}
        className="flex items-center gap-2 text-sm cursor-pointer border-0 bg-transparent p-0 hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)] focus-visible:ring-offset-2 rounded"
        style={{ color: "var(--regu-gray-500)" }}
        aria-label="Compartir esta noticia"
      >
        <Share2 className="h-4 w-4" aria-hidden />
        <span>{copied ? "Enlace copiado" : "Compartir"}</span>
      </button>
    </div>
  );
}

/** Layout réplica INDOTEL: breadcrumb → título → imagen → línea gris → fecha → cuerpo → compartir → volver. */
function ArticleLayout({
  payload,
  isStaticCumbre,
}: {
  payload: ArticlePayload;
  isStaticCumbre?: boolean;
}) {
  return (
    <motion.article
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      className="w-full"
    >
      <ArticleBreadcrumb title={payload.title} />
      <ArticleHeader payload={payload} />
      {(() => {
        const allImages = [payload.imageUrl, ...(payload.additionalImages ?? [])].filter(Boolean) as string[];
        if (allImages.length === 0) return null;
        if (allImages.length === 1) return <ArticleImage imageUrl={allImages[0]} />;
        return (
          <ImageCarousel
            images={allImages}
            variant="article"
            aspectRatio="auto"
            slideHeight="70vh"
            autoPlayMs={6000}
            className="mb-0"
          />
        );
      })()}
      {/* Línea fina gris debajo de las imágenes (réplica INDOTEL) */}
      {(payload.imageUrl || (payload.additionalImages?.length ?? 0) > 0) && (
        <hr
          className="my-4 border-0 border-t w-full"
          style={{ borderColor: "var(--regu-gray-200)" }}
        />
      )}
      <ArticleMetaLine payload={payload} />
      <ArticleBody payload={payload} isStaticCumbre={isStaticCumbre} />
      <ArticleShareFooter title={payload.title} />
      <div
        className="pt-4 pb-2 border-t"
        style={{ borderColor: "var(--regu-gray-100)" }}
      >
        <Link
          to="/noticias"
          className="inline-flex items-center gap-2 text-sm text-[var(--regu-gray-600)] hover:text-[var(--regu-blue)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)] focus-visible:ring-offset-2 rounded"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a noticias
        </Link>
      </div>
    </motion.article>
  );
}

export default function NoticiaIndividual() {
  const { slug } = useParams<{ slug: string }>();
  const { adminNews, contentSource } = useAdminData();
  if (contentSource === "loading") return null;
  const adminNoticia = adminNews.find(
    (n) => n.published && (n.slug === slug || n.id === slug)
  );
  const noticiaStatic = noticiasData.find((n) => n.slug === slug);

  if (adminNoticia) {
    const payload = normalizeAdminNoticia(adminNoticia);
    return (
      <div
        className="w-full pt-4 pb-10 md:pt-6 md:pb-12"
        style={{
          backgroundColor: "var(--regu-offwhite)",
          fontFamily: "var(--token-font-body)",
        }}
      >
        <div
          className="mx-auto px-4 md:px-6 lg:px-8"
          style={{ maxWidth: CONTAINER_MAX }}
        >
          {/* Franja azul horizontal (réplica INDOTEL) */}
          <div
            className="w-full h-16 flex-shrink-0"
            style={{ backgroundColor: "var(--regu-blue)" }}
            aria-hidden
          />
          {/* Cuadro blanco del artículo: borde muy sutil y esquina superior suave (como INDOTEL) */}
          <div
            className="relative z-10 mx-auto px-6 md:px-12 py-8 md:py-10 bg-white rounded-t-lg"
            style={{
              maxWidth: ARTICLE_BOX_MAX,
              marginTop: "-2rem",
              boxShadow: "0 0 0 1px rgba(0,0,0,0.06)",
            }}
          >
            <ArticleLayout payload={payload} />
          </div>
        </div>
      </div>
    );
  }

  if (!noticiaStatic) {
    return (
      <div
        className="w-full pt-4 pb-10 md:pt-6 md:pb-12"
        style={{
          backgroundColor: "var(--regu-offwhite)",
          fontFamily: "var(--token-font-body)",
        }}
      >
        <div
          className="mx-auto px-4 md:px-6 lg:px-8"
          style={{ maxWidth: CONTAINER_MAX }}
        >
          <div
            className="w-full h-16 flex-shrink-0"
            style={{ backgroundColor: "var(--regu-blue)" }}
            aria-hidden
          />
          <div
            className="relative z-10 mx-auto px-6 md:px-12 py-8 md:py-10 bg-white text-center rounded-t-lg"
            style={{
              maxWidth: ARTICLE_BOX_MAX,
              marginTop: "-2rem",
              boxShadow: "0 0 0 1px rgba(0,0,0,0.06)",
            }}
          >
            <ArticleBreadcrumb title="Noticia no encontrada" />
            <h1 className="text-xl font-bold mt-2 mb-4" style={{ color: "#1a1a1a" }}>
              Noticia no encontrada
            </h1>
            <Link
              to="/noticias"
              className="inline-flex items-center gap-2 text-sm font-medium"
              style={{ color: "var(--regu-blue)" }}
            >
              <ArrowLeft className="h-4 w-4" />
              Volver a noticias
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const payload = normalizeStaticNoticia(noticiaStatic);
  return (
    <div
      className="w-full pt-4 pb-10 md:pt-6 md:pb-12"
      style={{
        backgroundColor: "var(--regu-offwhite)",
        fontFamily: "var(--token-font-body)",
      }}
    >
      <div
        className="mx-auto px-4 md:px-6 lg:px-8"
        style={{ maxWidth: CONTAINER_MAX }}
      >
        <div
          className="w-full h-16 flex-shrink-0"
          style={{ backgroundColor: "var(--regu-blue)" }}
          aria-hidden
        />
        <div
          className="relative z-10 mx-auto px-6 md:px-12 py-8 md:py-10 bg-white rounded-t-lg"
          style={{
            maxWidth: ARTICLE_BOX_MAX,
            marginTop: "-2rem",
            boxShadow: "0 0 0 1px rgba(0,0,0,0.06)",
          }}
        >
          <ArticleLayout payload={payload} isStaticCumbre />
        </div>
      </div>
    </div>
  );
}

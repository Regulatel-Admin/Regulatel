import { motion } from "framer-motion";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Building2,
  Maximize2,
  FileText,
  Image as ImageIcon,
  Play,
} from "lucide-react";
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

/** Container: max 1180px, padding responsivo. Article body: max 800px lectura. */
const CONTAINER_MAX = "1180px";
const BODY_MAX = "800px";

/** Datos normalizados para render (estático o admin). */
interface ArticlePayload {
  title: string;
  dateFormatted: string;
  category: string;
  imageUrl: string | null;
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
  };
}

/** Link "Volver a Noticias" dentro del container. */
function BackLink() {
  return (
    <Link
      to="/noticias"
      className="inline-flex items-center gap-2 text-sm font-medium transition-colors hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)] focus-visible:ring-offset-2 rounded"
      style={{ color: "var(--regu-blue)" }}
    >
      <ArrowLeft className="h-4 w-4" aria-hidden />
      Volver a Noticias
    </Link>
  );
}

/** Hero editorial: imagen + overlay + chip, fecha, H1. */
function ArticleHero({ payload }: { payload: ArticlePayload }) {
  const overlayStyle = {
    background:
      "linear-gradient(180deg, rgba(0,0,0,.55) 0%, rgba(0,0,0,.15) 55%, rgba(0,0,0,0) 100%)",
  };

  return (
    <div className="relative w-full overflow-hidden rounded-2xl h-[260px] sm:h-[300px] md:h-[360px] lg:h-[420px]">
      {payload.imageUrl ? (
        <img
          src={payload.imageUrl}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      ) : (
        <div
          className="absolute inset-0 w-full h-full"
          style={{
            background:
              "linear-gradient(135deg, var(--regu-gray-100) 0%, var(--regu-offwhite) 100%)",
          }}
        />
      )}
      <div
        className="absolute inset-0"
        style={overlayStyle}
      />
      <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8 text-white">
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <span
            className="text-xs font-semibold uppercase tracking-wider opacity-95"
          >
            {payload.dateFormatted}
          </span>
          <span
            className="px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider"
            style={{ backgroundColor: "var(--regu-blue)" }}
          >
            {payload.category}
          </span>
        </div>
        <h1
          className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold leading-tight max-w-3xl"
          style={{ fontFamily: "var(--token-font-heading)" }}
        >
          {payload.title}
        </h1>
      </div>
    </div>
  );
}

/** Metadata debajo del hero: autor. */
function ArticleMeta({ author }: { author?: string }) {
  if (!author) return null;
  return (
    <div
      className="flex items-center gap-2 mt-4"
      style={{ color: "var(--regu-gray-500)", fontSize: "0.9375rem" }}
    >
      <User className="h-4 w-4 flex-shrink-0" aria-hidden />
      <span className="font-medium">{author}</span>
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
        className="mb-5 last:mb-0"
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
      className="article-body text-base md:text-[1.125rem]"
      style={{
        maxWidth: BODY_MAX,
        marginLeft: "auto",
        marginRight: "auto",
        paddingTop: "1.5rem",
        paddingBottom: "2rem",
        lineHeight: 1.75,
      }}
    >
      {payload.excerpt && (
        <div
          className="mb-8 rounded-xl p-4 md:p-5 border-l-4"
          style={{
            borderLeftColor: "var(--regu-blue)",
            backgroundColor: "rgba(68, 137, 198, 0.06)",
          }}
        >
          <p
            className="text-base md:text-lg leading-relaxed italic m-0"
            style={{ color: "var(--regu-gray-900)" }}
          >
            {payload.excerpt}
          </p>
        </div>
      )}

      <div className="space-y-6">
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
        <div className="mt-8 md:mt-10 space-y-6">
          {payload.quotes.map((quote, index) => (
            <div
              key={index}
              className="rounded-xl p-4 md:p-5 border-l-4"
              style={{
                borderLeftColor: "var(--regu-blue)",
                backgroundColor: "rgba(68, 137, 198, 0.06)",
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
        <div className="mt-8 md:mt-10 grid sm:grid-cols-2 gap-4">
          {payload.highlights.map((h, index) => (
            <div
              key={index}
              className="rounded-xl p-4 border flex items-start gap-3"
              style={{
                borderColor: "var(--regu-gray-100)",
                backgroundColor: "var(--regu-offwhite)",
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
          className="mt-8 md:mt-10 pt-6 border-t flex flex-wrap gap-2"
          style={{ borderColor: "var(--regu-gray-100)" }}
        >
          {payload.tags.map((tag, index) => (
            <span
              key={index}
              className="px-3 py-1 rounded-lg text-sm font-medium"
              style={{
                backgroundColor: "rgba(68, 137, 198, 0.12)",
                color: "var(--regu-blue)",
              }}
            >
              {tag}
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

/** Layout editorial completo: container + back + hero + meta + body + CTA. */
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
      <BackLink />
      <div className="mt-6">
        <ArticleHero payload={payload} />
      </div>
      <div style={{ maxWidth: BODY_MAX, marginLeft: "auto", marginRight: "auto" }}>
        <ArticleMeta author={payload.author} />
      </div>
      <ArticleBody payload={payload} isStaticCumbre={isStaticCumbre} />
      <div
        className="pt-6 pb-4 text-center"
        style={{ maxWidth: BODY_MAX, marginLeft: "auto", marginRight: "auto" }}
      >
        <Link
          to="/noticias"
          className="inline-flex items-center gap-2 text-sm font-semibold transition-colors hover:opacity-85"
          style={{ color: "var(--regu-blue)" }}
        >
          <ArrowLeft className="h-4 w-4" />
          Ver todas las noticias
        </Link>
      </div>
    </motion.article>
  );
}

export default function NoticiaIndividual() {
  const { slug } = useParams<{ slug: string }>();
  const { adminNews } = useAdminData();
  const adminNoticia = adminNews.find(
    (n) => n.published && (n.slug === slug || n.id === slug)
  );
  const noticiaStatic = noticiasData.find((n) => n.slug === slug);

  if (adminNoticia) {
    const payload = normalizeAdminNoticia(adminNoticia);
    return (
      <div
        className="w-full py-8 md:py-10 lg:py-12"
        style={{
          backgroundColor: "var(--regu-offwhite)",
          fontFamily: "var(--token-font-body)",
        }}
      >
        <div
          className="mx-auto px-4 md:px-6 lg:px-8"
          style={{ maxWidth: CONTAINER_MAX }}
        >
          <ArticleLayout payload={payload} />
        </div>
      </div>
    );
  }

  if (!noticiaStatic) {
    return (
      <div
        className="w-full py-12 md:py-16"
        style={{
          backgroundColor: "var(--regu-offwhite)",
          fontFamily: "var(--token-font-body)",
        }}
      >
        <div
          className="mx-auto px-4 md:px-6 text-center"
          style={{ maxWidth: CONTAINER_MAX }}
        >
          <h1 className="text-2xl font-bold mb-4" style={{ color: "var(--regu-gray-900)" }}>
            Noticia no encontrada
          </h1>
          <BackLink />
        </div>
      </div>
    );
  }

  const payload = normalizeStaticNoticia(noticiaStatic);
  return (
    <div
      className="w-full py-8 md:py-10 lg:py-12"
      style={{
        backgroundColor: "var(--regu-offwhite)",
        fontFamily: "var(--token-font-body)",
      }}
    >
      <div
        className="mx-auto px-4 md:px-6 lg:px-8"
        style={{ maxWidth: CONTAINER_MAX }}
      >
        <ArticleLayout payload={payload} isStaticCumbre />
      </div>
    </div>
  );
}

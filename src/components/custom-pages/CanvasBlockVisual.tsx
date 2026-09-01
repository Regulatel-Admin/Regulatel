import { useState, type CSSProperties, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { Download, Eye, FileText, ImageIcon, Play } from "lucide-react";
import DocumentPreviewModal from "@/components/DocumentPreviewModal";
import { MediaEmbed } from "@/components/custom-pages/MediaEmbed";
import { canPreviewDocument } from "@/lib/documentPreview";
import { renderInlineMarkup } from "@/lib/inlineMarkup";
import type { CanvasBlock, CanvasBlockType, CustomPageCard } from "@/data/customPages";

export type BlockLayout = "canvas" | "flow";

function overlayCss(block: CanvasBlock): string {
  const opacity = block.content.overlayOpacity ?? 0.45;
  return block.content.overlay || `rgba(11, 38, 57, ${opacity})`;
}

function fontStack(family?: "heading" | "body") {
  return family === "heading" ? "var(--token-font-heading)" : "var(--token-font-body)";
}

function chromeStyle(block: CanvasBlock): CSSProperties {
  const c = block.content;
  const radius = c.borderRadius ?? (block.type === "button" ? 10 : 0);
  return {
    borderRadius: radius,
    boxShadow: c.shadow ? "0 16px 40px rgba(22, 61, 89, 0.16)" : undefined,
    border: c.borderWidth ? `${c.borderWidth}px solid ${c.borderColor || "rgba(22,61,89,0.18)"}` : undefined,
    opacity: c.opacity == null ? 1 : c.opacity,
  };
}

function displayFontSize(size: number | undefined, type: CanvasBlockType, layout: BlockLayout) {
  const n = size || (type === "heading" || type === "cover" ? 28 : 16);
  if (layout !== "flow") return n;
  if (type === "heading" || type === "cover") return Math.min(n, 32);
  if (type === "quote") return Math.min(n, 22);
  return Math.min(n, 18);
}

function CardLink({
  href,
  className,
  style,
  children,
}: {
  href?: string;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  const trimmed = href?.trim();
  if (!trimmed) {
    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  }
  if (trimmed.startsWith("http")) {
    return (
      <a href={trimmed} target="_blank" rel="noreferrer" className={className} style={style}>
        {children}
      </a>
    );
  }
  return (
    <Link to={trimmed} className={className} style={style}>
      {children}
    </Link>
  );
}

function GalleryGrid({ images, columns, radius }: { images: string[]; columns: 1 | 2 | 3; radius: number }) {
  const visible = images.filter(Boolean);
  if (!visible.length) {
    return (
      <div
        className="flex h-full min-h-[120px] w-full flex-col items-center justify-center gap-1 text-sm"
        style={{ backgroundColor: "#E6E7DF", color: "#7E909E", borderRadius: radius }}
      >
        <ImageIcon className="h-7 w-7 opacity-60" />
        Añade fotos a la galería
      </div>
    );
  }
  return (
    <div
      className="grid h-full w-full gap-2"
      style={{ gridTemplateColumns: `repeat(${Math.min(columns, visible.length)}, minmax(0, 1fr))` }}
    >
      {visible.map((src, index) => (
        <img
          key={`${src}-${index}`}
          src={src}
          alt=""
          className="h-full min-h-[88px] w-full object-cover"
          style={{ borderRadius: Math.max(8, radius / 2) }}
        />
      ))}
    </div>
  );
}

function CardsGrid({ cards, columns, editing }: { cards: CustomPageCard[]; columns: 1 | 2 | 3; editing?: boolean }) {
  const visible = cards.filter((card) => card.title.trim() || card.text.trim() || card.imageUrl);
  const list = visible.length ? visible : cards.slice(0, 3);
  return (
    <div className="grid h-full w-full gap-3" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
      {list.map((card) => (
        <CardLink
          key={card.id}
          href={editing ? undefined : card.href}
          className="flex min-h-0 flex-col overflow-hidden border bg-white"
          style={{ borderColor: "rgba(22,61,89,0.10)", borderRadius: 16 }}
        >
          {card.imageUrl ? (
            <img src={card.imageUrl} alt="" className="h-24 w-full object-cover" />
          ) : (
            <div className="h-2 w-full shrink-0" style={{ backgroundColor: card.color || "#163D59" }} />
          )}
          <div className="min-h-0 flex-1 p-3">
            <p className="text-sm font-bold leading-snug" style={{ color: "var(--regu-navy)", fontFamily: "var(--token-font-heading)" }}>
              {card.title || "Tarjeta"}
            </p>
            {card.text ? (
              <p className="mt-1 line-clamp-3 text-[12px] leading-relaxed" style={{ color: "var(--regu-gray-600)" }}>
                {renderInlineMarkup(card.text, editing)}
              </p>
            ) : null}
          </div>
        </CardLink>
      ))}
    </div>
  );
}

function DocumentBlock({
  documents,
  editing,
}: {
  documents: { id: string; title: string; description?: string; url: string }[];
  editing?: boolean;
}) {
  const [preview, setPreview] = useState<{ url: string; title: string } | null>(null);
  const docs = documents.filter((doc) => doc.title.trim() || doc.url.trim());
  if (!docs.length) {
    return (
      <div
        className="flex h-full min-h-[96px] w-full items-center gap-3 rounded-2xl border bg-white px-4 text-sm"
        style={{ borderColor: "rgba(22,61,89,0.10)", color: "#7E909E" }}
      >
        <FileText className="h-5 w-5" />
        Sube un PDF o pega su enlace
      </div>
    );
  }
  return (
    <>
      <div className="flex h-full min-h-[96px] w-full flex-col justify-center gap-2">
        {docs.map((doc) => (
          <div
            key={doc.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border bg-white px-3 py-2.5"
            style={{ borderColor: "rgba(22,61,89,0.10)" }}
          >
            <div className="flex min-w-0 items-center gap-2">
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                style={{ backgroundColor: "rgba(68,137,198,0.12)", color: "var(--regu-blue)" }}
              >
                <FileText className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold" style={{ color: "var(--regu-navy)" }}>
                  {doc.title || "Documento"}
                </p>
                {doc.description ? (
                  <p className="truncate text-[11px]" style={{ color: "var(--regu-gray-500)" }}>
                    {doc.description}
                  </p>
                ) : null}
              </div>
            </div>
            {!editing && doc.url ? (
              <div className="flex gap-1.5">
                {canPreviewDocument(doc.url) ? (
                  <button
                    type="button"
                    onClick={() => setPreview({ url: doc.url, title: doc.title || "Documento" })}
                    className="inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold"
                    style={{ borderColor: "rgba(22,61,89,0.14)", color: "var(--regu-navy)" }}
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Ver
                  </button>
                ) : null}
                <a
                  href={doc.url}
                  download
                  className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-white"
                  style={{ backgroundColor: "var(--regu-blue)" }}
                >
                  <Download className="h-3.5 w-3.5" />
                  Descargar
                </a>
              </div>
            ) : null}
          </div>
        ))}
      </div>
      {typeof document !== "undefined"
        ? createPortal(<DocumentPreviewModal doc={preview} onClose={() => setPreview(null)} />, document.body)
        : null}
    </>
  );
}

export function BlockVisual({
  block,
  editing,
  layout = "canvas",
}: {
  block: CanvasBlock;
  editing?: boolean;
  layout?: BlockLayout;
}) {
  const c = block.content;
  const radius = c.borderRadius ?? (block.type === "button" ? 10 : 0);
  const pad = c.padding ?? (block.type === "box" || block.type === "button" || block.type === "quote" ? 16 : 0);
  const align = c.align ?? "left";
  const color = c.textColor || "#163D59";
  const family =
    c.fontFamily === "heading" || block.type === "heading" || block.type === "cover" || block.type === "quote"
      ? "var(--token-font-heading)"
      : "var(--token-font-body)";
  const fontSize = displayFontSize(c.fontSize, block.type, layout);
  const fill = layout === "canvas";
  const common: CSSProperties = {
    width: "100%",
    height: fill ? "100%" : "auto",
    borderRadius: radius,
    padding: pad,
    color,
    textAlign: align,
    fontSize,
    fontWeight: c.fontWeight || 400,
    fontStyle: c.italic ? "italic" : undefined,
    fontFamily: family,
    lineHeight: c.lineHeight || 1.4,
    letterSpacing: c.letterSpacing ? `${c.letterSpacing}px` : undefined,
    overflow: fill ? "hidden" : "visible",
    ...chromeStyle(block),
  };

  if (block.type === "image") {
    if (c.url) {
      const img = (
        <img
          src={c.url}
          alt={c.alt || ""}
          className="h-full w-full"
          style={{ borderRadius: radius, objectFit: c.objectFit || "cover", minHeight: fill ? undefined : 180, ...chromeStyle(block) }}
        />
      );
      if (!editing && c.href) {
        return (
          <CardLink href={c.href} className="block h-full w-full">
            {img}
          </CardLink>
        );
      }
      return img;
    }
    return (
      <div
        className="flex h-full w-full flex-col items-center justify-center gap-1 text-sm"
        style={{ ...common, backgroundColor: c.backgroundColor || "#E6E7DF", color: "#7E909E", minHeight: fill ? undefined : 160 }}
      >
        <ImageIcon className="h-7 w-7 opacity-60" />
        Sube una foto
      </div>
    );
  }
  if (block.type === "video") {
    if (!c.url) {
      return (
        <div
          className="flex h-full w-full flex-col items-center justify-center gap-1 text-sm text-white/70"
          style={{ ...common, backgroundColor: "#051329", minHeight: fill ? undefined : 200 }}
        >
          <Play className="h-8 w-8" />
          Pega un enlace de YouTube
        </div>
      );
    }
    return (
      <div className="h-full w-full overflow-hidden" style={{ ...chromeStyle(block), minHeight: fill ? undefined : 200, aspectRatio: fill ? undefined : "16 / 9" }}>
        <MediaEmbed url={c.url} className="h-full w-full min-h-[200px]" />
      </div>
    );
  }
  if (block.type === "cover") {
    const vAlign = c.verticalAlign === "center" ? "center" : c.verticalAlign === "top" ? "flex-start" : "flex-end";
    return (
      <div
        className="flex h-full w-full flex-col"
        style={{
          ...common,
          justifyContent: vAlign,
          backgroundColor: c.backgroundColor || "#163D59",
          backgroundImage: c.url
            ? `linear-gradient(${overlayCss(block)}, ${overlayCss(block)}), url(${c.url})`
            : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
          padding: pad || 28,
          color: c.textColor || "#fff",
          minHeight: fill ? undefined : 200,
        }}
      >
        <p style={{ fontSize, fontWeight: c.fontWeight || 700, margin: 0, fontFamily: family }}>
          {renderInlineMarkup(c.text || "Portada", editing)}
        </p>
      </div>
    );
  }
  if (block.type === "button") {
    const href = c.href || "#";
    const style: CSSProperties = {
      ...common,
      backgroundColor: c.backgroundColor || "#4489C6",
      display: "flex",
      alignItems: "center",
      justifyContent: align === "left" ? "flex-start" : align === "right" ? "flex-end" : "center",
      minHeight: layout === "flow" ? 44 : undefined,
    };
    if (!editing && href.startsWith("http")) {
      return (
        <a href={href} target="_blank" rel="noreferrer" style={style}>
          {c.label || "Botón"}
        </a>
      );
    }
    if (!editing && href.startsWith("/")) {
      return (
        <Link to={href} style={style}>
          {c.label || "Botón"}
        </Link>
      );
    }
    return <div style={style}>{c.label || "Botón"}</div>;
  }
  if (block.type === "gallery") {
    return (
      <div className="h-full w-full" style={{ ...chromeStyle(block), padding: 4 }}>
        <GalleryGrid
          images={c.images || []}
          columns={layout === "flow" ? 2 : c.columns === 2 ? 2 : 3}
          radius={radius}
        />
      </div>
    );
  }
  if (block.type === "cards") {
    return (
      <div className="h-full w-full overflow-hidden" style={chromeStyle(block)}>
        <CardsGrid cards={c.cards || []} columns={layout === "flow" ? 1 : c.columns === 2 ? 2 : 3} editing={editing} />
      </div>
    );
  }
  if (block.type === "list") {
    const items = (c.items && c.items.length ? c.items : (c.text || "").split("\n")).map((item) => item.trim()).filter(Boolean);
    return (
      <ul
        className="h-full w-full list-disc pl-5"
        style={{ ...common, fontFamily: fontStack(c.fontFamily || "body") }}
      >
        {(items.length ? items : ["Primer punto"]).map((item, index) => (
          <li key={`${item}-${index}`} className="mb-1">
            {renderInlineMarkup(item, editing)}
          </li>
        ))}
      </ul>
    );
  }
  if (block.type === "document") {
    return <DocumentBlock documents={c.documents || []} editing={editing} />;
  }
  if (block.type === "quote") {
    return (
      <figure style={{ ...common, backgroundColor: c.backgroundColor || "#EAF2F8" }}>
        <blockquote style={{ margin: 0, fontFamily: family }}>{renderInlineMarkup(c.text || "Cita", editing)}</blockquote>
        {c.cite ? (
          <figcaption className="mt-2 text-sm not-italic" style={{ color: "var(--regu-gray-500)", fontStyle: "normal" }}>
            {c.cite}
          </figcaption>
        ) : null}
      </figure>
    );
  }
  if (block.type === "divider") {
    return (
      <div className="flex h-full w-full items-center">
        <div
          className="w-full"
          style={{
            height: Math.max(1, c.borderWidth || 1),
            backgroundColor: c.backgroundColor || c.borderColor || "rgba(22,61,89,0.18)",
            borderRadius: 99,
          }}
        />
      </div>
    );
  }
  if (block.type === "spacer") {
    return (
      <div
        style={{
          width: "100%",
          height: fill ? "100%" : Math.min(block.h, 40),
          backgroundColor: c.backgroundColor && c.backgroundColor !== "transparent" ? c.backgroundColor : "transparent",
          borderRadius: radius,
          backgroundImage:
            editing && (!c.backgroundColor || c.backgroundColor === "transparent")
              ? "repeating-linear-gradient(-45deg, rgba(22,61,89,0.08) 0 8px, transparent 8px 16px)"
              : undefined,
        }}
      />
    );
  }
  const href = c.href?.trim();
  const inner = (
    <div
      style={{
        ...common,
        backgroundColor: block.type === "box" ? c.backgroundColor || "#163D59" : c.backgroundColor || "transparent",
        fontFamily: fontStack(c.fontFamily) || family,
      }}
    >
      {renderInlineMarkup(c.text || (block.type === "heading" ? "Título" : "Texto"), editing)}
    </div>
  );
  if (!editing && href && !/\]\([^)]+\)/.test(c.text || "")) {
    return (
      <CardLink href={href} className="block h-full w-full">
        {inner}
      </CardLink>
    );
  }
  return inner;
}

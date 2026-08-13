/**
 * Avisos extra del hero: noticia, episodio o evento, más la tarjeta “+” al editar.
 */
import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { Plus, X } from "lucide-react";
import { SiteEditBadge } from "@/components/site-edit/EditableSpot";
import { useSiteEdit } from "@/contexts/SiteEditContext";
import { useHomeAnnouncements } from "@/contexts/SiteSettingsContext";
import { useMergedNews, useEvents } from "@/contexts/AdminDataContext";
import {
  HOME_AVISO_KIND_META,
  HOME_AVISO_MAX,
  homeAvisoEpisodeCatalog,
  type HomeAvisoKind,
  type HomeAvisoSlot,
} from "@/data/homeAnnouncements";
import type { HomeNewsItemLike } from "@/contexts/AdminDataContext";
import type { Event } from "@/types/event";

const ANIM_EASE = [0.16, 1, 0.3, 1] as const;

const CTA_PRIMARY_CLASS =
  "group/cta relative flex w-full items-center justify-center overflow-hidden rounded-[6px] px-3.5 py-[4px] text-center text-[10.5px] font-normal leading-tight tracking-[0.025em] text-white transition-[box-shadow,transform,filter] duration-200 ease-out hover:-translate-y-px hover:brightness-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f4f1eb]";

const CTA_PRIMARY_STYLE: CSSProperties = {
  fontFamily: "var(--token-font-body)",
  background: "linear-gradient(178deg, #5a96c9 0%, var(--regu-blue) 48%, #3d7caf 100%)",
  boxShadow:
    "inset 0 1px 0 rgba(255, 252, 248, 0.15), inset 0 -1px 0 rgba(22, 61, 89, 0.08), 0 1px 2px rgba(22,61,89,0.05), 0 4px 14px -6px rgba(68,137,198,0.28), 0 3px 10px -8px rgba(32,28,25,0.07)",
  border: "1px solid rgba(255, 252, 248, 0.14)",
};

const CARD_STYLE: CSSProperties = {
  borderRadius: "12px",
  border: "1px solid rgba(255, 250, 244, 0.58)",
  background: [
    "linear-gradient(180deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0) 55%)",
    "linear-gradient(168deg, rgba(255, 253, 248, 0.94) 0%, rgba(248, 243, 236, 0.9) 45%, rgba(240, 234, 226, 0.88) 100%)",
  ].join(", "),
  boxShadow: [
    "inset 0 1px 0 rgba(255, 255, 255, 0.72)",
    "0 12px 44px -20px rgba(34, 30, 27, 0.11)",
    "0 6px 20px -10px rgba(22, 61, 89, 0.07)",
    "var(--token-shadow-premium-warm)",
  ].join(", "),
  backdropFilter: "blur(14px)",
  WebkitBackdropFilter: "blur(14px)",
};

type ResolvedAviso = {
  kind: HomeAvisoKind;
  title: string;
  description: string;
  href: string;
  moreHref: string;
  cover: ReactNode;
  meta?: string;
};

function TypographicCover({ kicker, line, sub }: { kicker: string; line: string; sub: string }) {
  return (
    <div
      className="relative shrink-0 overflow-hidden rounded-[2px] select-none"
      style={{
        width: "3rem",
        height: "4.125rem",
        boxShadow:
          "inset 0 0 0 1px rgba(255,255,255,0.055), 0 8px 24px -8px rgba(32,28,25,0.12)",
        background: "linear-gradient(152deg, #1e3d5c 0%, var(--regu-navy) 42%, #0c1f2e 92%)",
      }}
      aria-hidden
    >
      <div
        className="absolute left-0 top-0 bottom-0 w-0.5"
        style={{ background: "linear-gradient(180deg, rgba(196,214,140,0.95) 0%, rgba(196,214,140,0.45) 100%)" }}
      />
      <div className="relative flex h-full flex-col justify-between p-[0.4rem] pl-[0.45rem]">
        <p className="text-[5px] font-bold uppercase leading-tight tracking-[0.18em] text-white/85">{kicker}</p>
        <div>
          <p className="text-[0.72rem] font-semibold leading-none tracking-tight text-white">{line}</p>
          <p className="mt-[0.15rem] text-[6px] font-medium uppercase tracking-[0.12em] text-white/45">{sub}</p>
        </div>
      </div>
    </div>
  );
}

function ImageCover({ src, alt }: { src: string; alt: string }) {
  return (
    <div
      className="relative shrink-0 overflow-hidden rounded-[2px]"
      style={{
        width: "3rem",
        height: "4.125rem",
        boxShadow: "0 8px 24px -8px rgba(32,28,25,0.12)",
      }}
    >
      <img src={src} alt={alt} className="h-full w-full object-cover" />
    </div>
  );
}

function resolveAviso(
  slot: HomeAvisoSlot,
  news: HomeNewsItemLike[],
  events: Event[],
  episodes: ReturnType<typeof homeAvisoEpisodeCatalog>
): ResolvedAviso | null {
  if (slot.kind === "noticia") {
    const item = news.find((n) => n.slug.toLowerCase() === slot.refId.toLowerCase());
    if (!item) return null;
    return {
      kind: "noticia",
      title: item.title,
      description: item.excerpt,
      href: `/noticias/${item.slug}`,
      moreHref: "/noticias",
      meta: item.dateFormatted,
      cover: item.imageUrl ? (
        <ImageCover src={item.imageUrl} alt="" />
      ) : (
        <TypographicCover kicker="Nota" line="NEWS" sub={item.date.slice(0, 4)} />
      ),
    };
  }
  if (slot.kind === "episodio") {
    const item = episodes.find((e) => e.slug === slot.refId);
    if (!item) return null;
    const epLabel = item.episode > 0 ? `Ep. ${item.episode}` : "Tráiler";
    return {
      kind: "episodio",
      title: `${item.name}`,
      description: [item.role, item.organization].filter(Boolean).join(" · "),
      href: "/habla-el-regulador",
      moreHref: "/habla-el-regulador",
      meta: epLabel,
      cover: item.poster ? (
        <ImageCover src={item.poster} alt="" />
      ) : (
        <TypographicCover kicker="Habla" line={epLabel} sub="Regulador" />
      ),
    };
  }
  const item = events.find((e) => e.id === slot.refId);
  if (!item) return null;
  const year = String(item.year);
  return {
    kind: "evento",
    title: item.title,
    description: [item.location, item.startDate].filter(Boolean).join(" · "),
    href: `/eventos/${item.id}`,
    moreHref: "/eventos",
    meta: item.startDate,
    cover: item.imageUrl ? (
      <ImageCover src={item.imageUrl} alt="" />
    ) : (
      <TypographicCover kicker="Agenda" line={year} sub={item.location || "Evento"} />
    ),
  };
}

function dismissKey(id: string) {
  return `regulatel_home_aviso_dismissed_${id}`;
}

function GlassCard({ children }: { children: ReactNode }) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.article
      className="pointer-events-auto relative w-full"
      initial={reduceMotion ? false : { opacity: 0, y: 12, scale: 0.98 }}
      animate={reduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: ANIM_EASE }}
      style={CARD_STYLE}
    >
      {children}
    </motion.article>
  );
}

function HomeAvisoCard({ slot }: { slot: HomeAvisoSlot }) {
  const { enabled: siteEditEnabled } = useSiteEdit();
  const news = useMergedNews();
  const events = useEvents();
  const resolved = resolveAviso(slot, news, events, homeAvisoEpisodeCatalog());
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (siteEditEnabled) {
      setVisible(true);
      return;
    }
    try {
      setVisible(!localStorage.getItem(dismissKey(slot.id)));
    } catch {
      setVisible(true);
    }
  }, [slot.id, siteEditEnabled]);

  if (!resolved || !visible) return null;
  const meta = HOME_AVISO_KIND_META[resolved.kind];

  return (
    <GlassCard>
      <SiteEditBadge
        target={{ kind: "home-aviso", id: slot.id }}
        label="Cambiar este aviso"
        className="left-2 top-2"
      />
      <button
        type="button"
        onClick={() => {
          try {
            localStorage.setItem(dismissKey(slot.id), new Date().toISOString());
          } catch {
            /* ignore */
          }
          if (!siteEditEnabled) setVisible(false);
        }}
        className="group absolute right-[7px] top-[7px] z-10 flex h-[18px] w-[18px] items-center justify-center rounded-full text-[rgba(58,54,50,0.32)] hover:bg-[rgba(90,82,74,0.08)]"
        aria-label="Cerrar aviso"
      >
        <X className="h-2.5 w-2.5" strokeWidth={1} aria-hidden />
      </button>
      <div className="px-3.5 pb-3 pt-3.5 pr-9 sm:px-[0.9rem] sm:pb-[0.85rem] sm:pt-[0.95rem] sm:pr-9">
        <div className="flex gap-2.5">
          {resolved.cover}
          <div className="min-w-0 flex-1 pt-[1px]">
            <p
              className="text-[8px] font-semibold uppercase leading-none tracking-[0.22em] text-[var(--regu-blue)]"
              style={{ fontFamily: "var(--token-font-body)" }}
            >
              {meta.badge}
            </p>
            <div
              className="mb-[0.35rem] mt-[0.35rem] h-px w-[1.45rem] rounded-full opacity-[0.78]"
              style={{
                background: "linear-gradient(90deg, rgba(68,137,198,0.52) 0%, rgba(90,82,74,0.12) 72%, transparent 100%)",
              }}
              aria-hidden
            />
            <h2
              className="text-[0.765rem] font-semibold leading-[1.33] tracking-[-0.012em] sm:text-[0.8rem]"
              style={{ fontFamily: "var(--token-font-heading)", color: "#122d42" }}
            >
              {resolved.title}
            </h2>
          </div>
        </div>
        <p
          className="mt-2 line-clamp-3 text-[10.5px] leading-[1.52] sm:text-[11px]"
          style={{ fontFamily: "var(--token-font-body)", color: "rgba(35, 44, 52, 0.88)" }}
        >
          {resolved.description}
        </p>
        <div className="mt-[0.72rem]">
          <Link to={resolved.href} className={CTA_PRIMARY_CLASS} style={CTA_PRIMARY_STYLE}>
            <span className="relative">{meta.cta}</span>
          </Link>
          <Link
            to={resolved.moreHref}
            className="mt-2 block text-center text-[8.5px] font-normal tracking-[0.02em] text-[rgba(22,61,89,0.58)] underline-offset-[3px] hover:text-[rgba(22,61,89,0.74)]"
            style={{ fontFamily: "var(--token-font-body)" }}
          >
            {meta.more}
          </Link>
        </div>
      </div>
    </GlassCard>
  );
}

function HomeAddAvisoCard() {
  const { open } = useSiteEdit();
  return (
    <button
      type="button"
      onClick={() => open({ kind: "home-aviso" })}
      className="pointer-events-auto relative flex min-h-[11.5rem] w-full flex-col items-center justify-center gap-2 rounded-[12px] border border-dashed px-4 py-6 text-center transition hover:bg-white/25"
      style={{
        borderColor: "rgba(255,255,255,0.55)",
        background: "linear-gradient(168deg, rgba(255,253,248,0.28) 0%, rgba(248,243,236,0.18) 100%)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.35)",
        backdropFilter: "blur(10px)",
      }}
      aria-label="Añadir un aviso en la portada"
    >
      <Plus className="h-12 w-12" strokeWidth={1.25} style={{ color: "rgba(255,255,255,0.42)" }} aria-hidden />
      <span className="text-[11px] font-semibold tracking-[0.04em] text-white/80">Añadir aviso</span>
      <span className="max-w-[12rem] text-[9px] leading-relaxed text-white/55">
        Noticia, episodio o evento. Lo ves aquí al instante.
      </span>
    </button>
  );
}

export function HomeExtraAnnouncements() {
  const slots = useHomeAnnouncements();
  const { enabled } = useSiteEdit();
  const showPlus = enabled && slots.length < HOME_AVISO_MAX;
  if (slots.length === 0 && !showPlus) return null;
  return (
    <>
      {slots.map((slot) => (
        <HomeAvisoCard key={slot.id} slot={slot} />
      ))}
      {showPlus && <HomeAddAvisoCard />}
    </>
  );
}

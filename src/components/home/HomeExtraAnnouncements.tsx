/**
 * Avisos extra del hero: noticia, episodio, evento, revista o boletín, más la tarjeta “+” al editar.
 */
import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronDown, ChevronUp, Plus, X } from "lucide-react";
import { SiteEditBadge } from "@/components/site-edit/EditableSpot";
import { useSiteEdit } from "@/contexts/SiteEditContext";
import {
  useHablaElReguladorInterviews,
  useHeroAnnounceOrder,
  useHomeAnnouncements,
  useRevistaDigitalEditions,
  useSiteSettings,
} from "@/contexts/SiteSettingsContext";
import { useMergedNews, useEvents } from "@/contexts/AdminDataContext";
import { useBoletinesGtai } from "@/hooks/useBoletinesGtai";
import { api } from "@/lib/api";
import { notifyCmsSaved, cloneJson } from "@/lib/siteEdit";
import HomeBoletinGtaiAnnouncement from "./HomeBoletinGtaiAnnouncement";
import HomeRevistaAnnouncement from "./HomeRevistaAnnouncement";
import {
  HOME_AVISO_KIND_META,
  HOME_AVISO_MAX,
  HERO_ANNOUNCE_BOLETIN_ID,
  HERO_ANNOUNCE_ORDER_SETTINGS_KEY,
  HERO_ANNOUNCE_REVISTA_ID,
  applyHeroAnnounceOrder,
  homeAvisoEpisodeCatalog,
  moveHeroAnnounce,
  type HomeAvisoKind,
  type HomeAvisoSlot,
} from "@/data/homeAnnouncements";
import { GESTION_REVISTA_ARCHIVE_PATH } from "@/data/gestion";
import { BOLETINES_GTAI_LIST_PATH, type BoletinGtaiSerialized } from "@/data/boletinesGtai";
import type { RevistaEdition } from "@/data/revistaDigital";
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
  external?: boolean;
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
  episodes: ReturnType<typeof homeAvisoEpisodeCatalog>,
  revistas: RevistaEdition[],
  boletines: BoletinGtaiSerialized[],
  allowDrafts = false,
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
  if (slot.kind === "revista") {
    const item = revistas.find((e) => e.id === slot.refId);
    if (!item || (!item.isPublished && !allowDrafts)) return null;
    const href = item.url.startsWith("http") || item.url.startsWith("/") ? item.url : GESTION_REVISTA_ARCHIVE_PATH;
    return {
      kind: "revista",
      title: item.title,
      description: item.description || item.title,
      href,
      moreHref: GESTION_REVISTA_ARCHIVE_PATH,
      meta: [item.year, item.coverEdition || item.quarter].filter(Boolean).join(" · "),
      external: href.startsWith("http"),
      cover: <TypographicCover kicker="Revista" line={item.year} sub={item.coverEdition || "REGULATEL"} />,
    };
  }
  if (slot.kind === "boletin") {
    const item = boletines.find((e) => e.slug === slot.refId);
    if (!item || (!item.isPublished && !allowDrafts)) return null;
    return {
      kind: "boletin",
      title: item.title,
      description: item.shortSummary || item.description,
      href: `${BOLETINES_GTAI_LIST_PATH}/${item.slug}`,
      moreHref: BOLETINES_GTAI_LIST_PATH,
      meta: `${item.year} · Nº ${item.issueNumber}`,
      cover: item.coverImage ? (
        <ImageCover src={item.coverImage} alt="" />
      ) : (
        <TypographicCover kicker="GTAI" line={`Nº ${item.issueNumber}`} sub={String(item.year)} />
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
  const interviews = useHablaElReguladorInterviews();
  const revistas = useRevistaDigitalEditions();
  const { entries: boletines } = useBoletinesGtai();
  const resolved = resolveAviso(
    slot,
    news,
    events,
    homeAvisoEpisodeCatalog(interviews),
    revistas,
    boletines,
    siteEditEnabled,
  );
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
      <div className="heroAnnouncePad px-3.5 pb-3 pt-3.5 pr-9 sm:px-[0.9rem] sm:pb-[0.85rem] sm:pt-[0.95rem] sm:pr-9">
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
          className="heroAnnounceDesc mt-2 line-clamp-3 text-[10.5px] leading-[1.52] sm:text-[11px]"
          style={{ fontFamily: "var(--token-font-body)", color: "rgba(35, 44, 52, 0.88)" }}
        >
          {resolved.description}
        </p>
        <div className="mt-[0.72rem]">
          {resolved.external ? (
            <a
              href={resolved.href}
              target="_blank"
              rel="noopener noreferrer"
              className={CTA_PRIMARY_CLASS}
              style={CTA_PRIMARY_STYLE}
            >
              <span className="relative">{meta.cta}</span>
            </a>
          ) : (
            <Link to={resolved.href} className={CTA_PRIMARY_CLASS} style={CTA_PRIMARY_STYLE}>
              <span className="relative">{meta.cta}</span>
            </Link>
          )}
          <Link
            to={resolved.moreHref}
            className="heroAnnounceMore mt-2 block text-center text-[8.5px] font-normal tracking-[0.02em] text-[rgba(22,61,89,0.58)] underline-offset-[3px] hover:text-[rgba(22,61,89,0.74)]"
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
        Noticia, episodio, evento, revista o boletín. Lo ves aquí al instante.
      </span>
    </button>
  );
}

export function HomeExtraAnnouncements() {
  const slots = useHomeAnnouncements();
  const savedOrder = useHeroAnnounceOrder();
  const { enabled, setPreview, recordPersistedChange, clearPreview } = useSiteEdit();
  const { heroAnnounceOrder, refetch } = useSiteSettings();
  const [savingOrder, setSavingOrder] = useState(false);
  const available = useMemo(
    () => [HERO_ANNOUNCE_BOLETIN_ID, HERO_ANNOUNCE_REVISTA_ID, ...slots.map((s) => s.id)],
    [slots],
  );
  const order = applyHeroAnnounceOrder(available, savedOrder);
  const showPlus = enabled && slots.length < HOME_AVISO_MAX;
  const slotById = useMemo(() => new Map(slots.map((s) => [s.id, s])), [slots]);

  const move = async (id: string, direction: -1 | 1) => {
    const next = moveHeroAnnounce(order, id, direction);
    if (next === order || next.join("|") === order.join("|")) return;
    setPreview({ heroAnnounceOrder: next });
    setSavingOrder(true);
    const before = cloneJson(heroAnnounceOrder ?? order);
    const res = await api.settings.set(HERO_ANNOUNCE_ORDER_SETTINGS_KEY, { order: next });
    if (!res.ok) {
      clearPreview("heroAnnounceOrder");
      setSavingOrder(false);
      return;
    }
    recordPersistedChange({
      label: "orden de avisos",
      undo: async () => {
        const r = await api.settings.set(HERO_ANNOUNCE_ORDER_SETTINGS_KEY, { order: before });
        if (!r.ok) throw new Error(r.error ?? "No se pudo deshacer.");
        notifyCmsSaved(HERO_ANNOUNCE_ORDER_SETTINGS_KEY);
      },
      redo: async () => {
        const r = await api.settings.set(HERO_ANNOUNCE_ORDER_SETTINGS_KEY, { order: next });
        if (!r.ok) throw new Error(r.error ?? "No se pudo rehacer.");
        notifyCmsSaved(HERO_ANNOUNCE_ORDER_SETTINGS_KEY);
      },
    });
    notifyCmsSaved(HERO_ANNOUNCE_ORDER_SETTINGS_KEY);
    await refetch();
    clearPreview("heroAnnounceOrder");
    setSavingOrder(false);
  };

  return (
    <>
      {order.map((id, index) => {
        const slot = slotById.get(id);
        const card =
          id === HERO_ANNOUNCE_BOLETIN_ID ? (
            <HomeBoletinGtaiAnnouncement />
          ) : id === HERO_ANNOUNCE_REVISTA_ID ? (
            <HomeRevistaAnnouncement variant="stacked" />
          ) : slot ? (
            <HomeAvisoCard slot={slot} />
          ) : null;
        if (!card) return null;
        return (
          <div key={id} className="relative">
            {card}
            {enabled && (
              <div className="absolute right-[5px] top-[26px] z-[30] flex flex-col gap-0.5">
                <button
                  type="button"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    void move(id, -1);
                  }}
                  disabled={savingOrder || index === 0}
                  className="flex h-[18px] w-[18px] items-center justify-center rounded-full text-white disabled:opacity-30"
                  style={{ backgroundColor: "#0f766e" }}
                  aria-label="Subir aviso"
                >
                  <ChevronUp className="h-3 w-3" strokeWidth={2.5} aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    void move(id, 1);
                  }}
                  disabled={savingOrder || index === order.length - 1}
                  className="flex h-[18px] w-[18px] items-center justify-center rounded-full text-white disabled:opacity-30"
                  style={{ backgroundColor: "#0f766e" }}
                  aria-label="Bajar aviso"
                >
                  <ChevronDown className="h-3 w-3" strokeWidth={2.5} aria-hidden />
                </button>
              </div>
            )}
          </div>
        );
      })}
      {showPlus && <HomeAddAvisoCard />}
    </>
  );
}

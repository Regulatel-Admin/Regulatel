/**
 * Tarjeta editorial destacada en el hero: nueva edición de la Revista REGULATEL.
 * Diseño institucional premium (no modal genérico). Cierre con localStorage + caducidad.
 */
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { GESTION_REVISTA_ARCHIVE_PATH } from "@/data/gestion";
import { getFeaturedRevistaEdition } from "@/data/revistaDigital";
import { useRevistaDigitalEditions } from "@/contexts/SiteSettingsContext";
import { useSiteEdit } from "@/contexts/SiteEditContext";
import { SiteEditBadge } from "@/components/site-edit/EditableSpot";
import CoverPreviewTrigger from "@/components/home/CoverPreviewTrigger";

/** Nueva clave al cambiar la edición destacada (vuelve a mostrarse el aviso a quien la cerró). */
const SHOW_AGAIN_AFTER_DAYS = 14;

function dismissStorageKey(editionId: string) {
  return `regulatel_home_revista_dismissed_${editionId}`;
}

const CTA_PRIMARY_CLASS =
  "group/cta relative flex w-full items-center justify-center overflow-hidden rounded-[6px] px-3.5 py-[4px] text-center text-[10.5px] font-normal leading-tight tracking-[0.025em] text-white transition-[box-shadow,transform,filter] duration-200 ease-out hover:-translate-y-px hover:brightness-[1.02] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_1px_2px_rgba(22,61,89,0.05),0_6px_18px_-10px_rgba(68,137,198,0.28),0_4px_14px_-12px_rgba(34,30,27,0.08)] active:translate-y-0 active:scale-[0.995] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f4f1eb] sm:text-[10.5px] sm:tracking-[0.022em]";

const CTA_PRIMARY_STYLE: CSSProperties = {
  fontFamily: "var(--token-font-body)",
  background: "linear-gradient(178deg, #5a96c9 0%, var(--regu-blue) 48%, #3d7caf 100%)",
  boxShadow:
    "inset 0 1px 0 rgba(255, 252, 248, 0.15), inset 0 -1px 0 rgba(22, 61, 89, 0.08), 0 1px 2px rgba(22,61,89,0.05), 0 4px 14px -6px rgba(68,137,198,0.28), 0 3px 10px -8px rgba(32,28,25,0.07)",
  border: "1px solid rgba(255, 252, 248, 0.14)",
};

const ANIM_EASE = [0.16, 1, 0.3, 1] as const;

function shouldShowAnnouncement(editionId: string): boolean {
  try {
    const raw = localStorage.getItem(dismissStorageKey(editionId));
    if (!raw) return true;
    const dismissedAt = Date.parse(raw);
    if (Number.isNaN(dismissedAt)) return true;
    const elapsed = Date.now() - dismissedAt;
    const maxMs = SHOW_AGAIN_AFTER_DAYS * 24 * 60 * 60 * 1000;
    return elapsed >= maxMs;
  } catch {
    return true;
  }
}

/** Mini portada: primera página del PDF si existe, si no el recuadro tipográfico. */
function EditorialCoverMini({
  coverLabel,
  coverEdition,
  year,
  coverImage,
}: {
  coverLabel: string;
  coverEdition: string;
  year: string;
  coverImage?: string;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const showPhoto = Boolean(coverImage) && !imageFailed;

  return (
    <div
      className="relative shrink-0 overflow-hidden rounded-[2px] select-none"
      style={{
        width: "3rem",
        height: "4.125rem",
        boxShadow:
          "inset 0 0 0 1px rgba(255,255,255,0.055), inset 0 1px 0 rgba(255,255,255,0.035), 0 8px 24px -8px rgba(32,28,25,0.12), 0 2px 8px -4px rgba(22,61,89,0.08)",
        background:
          "linear-gradient(152deg, #1e3d5c 0%, var(--regu-navy) 42%, #0c1f2e 92%)",
      }}
      aria-hidden
    >
      {showPhoto ? (
        <>
          <img
            src={coverImage}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            onError={() => setImageFailed(true)}
          />
          <span
            className="pointer-events-none absolute inset-y-0 left-0 w-[3px]"
            style={{
              background:
                "linear-gradient(90deg, rgba(8,18,28,0.28) 0%, rgba(8,18,28,0.04) 100%)",
            }}
          />
        </>
      ) : (
        <>
          <div
            className="absolute left-0 top-0 bottom-0 w-0.5"
            style={{
              background:
                "linear-gradient(180deg, rgba(196,214,140,0.95) 0%, rgba(196,214,140,0.45) 100%)",
            }}
          />
          <div
            className="absolute -right-4 -top-6 h-16 w-16 rounded-full opacity-[0.07]"
            style={{ background: "var(--regu-blue)" }}
          />
          <div className="relative flex h-full flex-col justify-between p-[0.4rem] pl-[0.45rem] pt-[0.4rem]">
            <p
              className="text-[5px] font-bold uppercase leading-tight tracking-[0.2em] text-white/85"
              style={{ fontFamily: "var(--token-font-body)" }}
            >
              {coverLabel}
            </p>
            <div>
              <p
                className="text-[1.05rem] font-semibold leading-none tracking-tight text-white"
                style={{ fontFamily: "var(--token-font-heading)" }}
              >
                {year}
              </p>
              <p
                className="mt-[0.15rem] text-[6px] font-medium uppercase tracking-[0.16em] text-white/45"
                style={{ fontFamily: "var(--token-font-body)" }}
              >
                {coverEdition}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export interface HomeRevistaAnnouncementProps {
  /** `stacked`: dentro de columna absoluta (p. ej. debajo del aviso Boletín GTAI). `floating`: posición absoluta propia (legacy). */
  variant?: "floating" | "stacked";
}

export default function HomeRevistaAnnouncement({ variant = "floating" }: HomeRevistaAnnouncementProps) {
  const { t } = useTranslation();
  const reduceMotion = useReducedMotion();
  const { enabled: siteEditEnabled } = useSiteEdit();
  const [visible, setVisible] = useState(false);
  const editions = useRevistaDigitalEditions();
  const featured = getFeaturedRevistaEdition(editions);

  useEffect(() => {
    if (!featured) {
      setVisible(false);
      return;
    }
    if (siteEditEnabled) {
      setVisible(true);
      return;
    }
    setVisible(shouldShowAnnouncement(featured.id));
  }, [featured?.id, siteEditEnabled]);

  const editionId = featured?.id ?? "";
  const editionPrefix = `homeSections.revistaEditions.${editionId}`;

  const editionCopy = useMemo(() => {
    const title = featured?.title ?? "Revista REGULATEL";
    const description =
      featured?.description ?? featured?.title ?? "Ya está disponible una nueva edición de la Revista REGULATEL.";
    const coverEdition = featured?.coverEdition ?? featured?.year ?? "";
    if (siteEditEnabled) {
      return { title, description, coverEdition };
    }
    return {
      title: t(`${editionPrefix}.title`, { defaultValue: title }),
      description: t(`${editionPrefix}.description`, { defaultValue: description }),
      coverEdition: t(`${editionPrefix}.coverEdition`, { defaultValue: coverEdition }),
    };
  }, [
    siteEditEnabled,
    t,
    editionPrefix,
    featured?.title,
    featured?.description,
    featured?.coverEdition,
    featured?.year,
  ]);

  const dismiss = () => {
    if (!featured) return;
    try {
      localStorage.setItem(dismissStorageKey(featured.id), new Date().toISOString());
    } catch {
      /* ignore */
    }
    setVisible(false);
  };

  if (!visible || !featured) return null;

  const editionUrl = featured.url;
  const motionFrom = reduceMotion
    ? false
    : { opacity: 0, y: 12, scale: 0.98 };
  const motionTo = reduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 };

  const positionClassName =
    variant === "stacked"
      ? "pointer-events-auto relative z-30 w-full"
      : "pointer-events-auto absolute z-30 w-[min(100%-1.25rem,15.875rem)] max-md:left-1/2 max-md:right-auto max-md:-translate-x-1/2 max-md:top-4 sm:w-[min(100%-2rem,16.25rem)] sm:max-md:top-5 md:right-8 md:top-7 md:w-[15.875rem] lg:right-10 lg:top-8";

  return (
    <motion.article
      role="region"
      aria-labelledby="home-revista-announce-title"
      className={positionClassName}
      initial={motionFrom}
      animate={motionTo}
      transition={{ duration: 0.58, ease: ANIM_EASE }}
      whileHover={
        reduceMotion
          ? undefined
          : {
              y: -1,
              transition: { duration: 0.28, ease: ANIM_EASE },
            }
      }
      style={{
        borderRadius: "12px",
        border: "1px solid rgba(255, 250, 244, 0.58)",
        background: [
          "linear-gradient(180deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0) 55%)",
          "linear-gradient(168deg, rgba(255, 253, 248, 0.94) 0%, rgba(248, 243, 236, 0.9) 45%, rgba(240, 234, 226, 0.88) 100%)",
          "linear-gradient(135deg, rgba(74, 69, 64, 0.03) 0%, transparent 48%)",
        ].join(", "),
        boxShadow: [
          "inset 0 1px 0 rgba(255, 255, 255, 0.72)",
          "inset 0 0 0 1px rgba(74, 69, 64, 0.045)",
          "0 12px 44px -20px rgba(34, 30, 27, 0.11)",
          "0 6px 20px -10px rgba(22, 61, 89, 0.07)",
          "0 2px 8px -4px rgba(28, 25, 22, 0.06)",
          "var(--token-shadow-premium-warm)",
        ].join(", "),
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
      }}
    >
      <SiteEditBadge target={{ kind: "revista", id: featured.id }} label="Editar esta edición" className="left-2 top-2" />
      <button
        type="button"
        onClick={dismiss}
        className="group absolute right-[7px] top-[7px] z-10 flex h-[18px] w-[18px] items-center justify-center rounded-full text-[rgba(58,54,50,0.32)] transition-[color,background-color,opacity] duration-300 ease-out hover:bg-[rgba(90,82,74,0.08)] hover:text-[rgba(46,42,38,0.56)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)] focus-visible:ring-offset-1 focus-visible:ring-offset-[#f6f2eb]"
        aria-label={t("homeSections.dismissRevistaAnnouncement")}
      >
        <X
          className="h-2.5 w-2.5 transition-[transform,opacity] duration-300 ease-out group-hover:opacity-[0.9] group-hover:scale-[0.97]"
          strokeWidth={1}
          aria-hidden
        />
      </button>

      <div className="heroAnnouncePad px-3.5 pb-3 pt-3.5 pr-9 sm:px-[0.9rem] sm:pb-[0.85rem] sm:pt-[0.95rem] sm:pr-9">
        <div className="flex gap-2.5">
          <CoverPreviewTrigger url={editionUrl} title={editionCopy.title}>
            <EditorialCoverMini
              coverLabel={t("homeSections.revistaCoverLabel")}
              coverEdition={editionCopy.coverEdition}
              year={featured.year}
              coverImage={featured.coverImage}
            />
          </CoverPreviewTrigger>

          <div className="min-w-0 flex-1 pt-[1px]">
            <p
              className="text-[8px] font-semibold uppercase leading-none tracking-[0.22em] text-[var(--regu-blue)]"
              style={{
                fontFamily: "var(--token-font-body)",
                textShadow: "0 1px 0 rgba(255, 252, 248, 0.45)",
              }}
            >
              {t("homeSections.revistaBadge")}
            </p>
            <div
              className="mb-[0.35rem] mt-[0.35rem] h-px w-[1.45rem] max-w-[46%] rounded-full opacity-[0.78]"
              style={{
                background:
                  "linear-gradient(90deg, rgba(68,137,198,0.52) 0%, rgba(90,82,74,0.12) 72%, transparent 100%)",
              }}
              aria-hidden
            />
            <h2
              id="home-revista-announce-title"
              className="text-[0.765rem] font-semibold leading-[1.33] tracking-[-0.012em] sm:text-[0.8rem]"
              style={{
                fontFamily: "var(--token-font-heading)",
                color: "#122d42",
              }}
            >
              {editionCopy.title}
            </h2>
          </div>
        </div>

        <p
          className="heroAnnounceDesc mt-2 line-clamp-3 text-[10.5px] leading-[1.52] sm:text-[11px] sm:leading-[1.58]"
          style={{
            fontFamily: "var(--token-font-body)",
            color: "rgba(35, 44, 52, 0.88)",
          }}
        >
          {editionCopy.description}
        </p>

        <div className="mt-[0.72rem] sm:mt-[0.78rem]">
          {editionUrl ? (
            <a
              href={editionUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={CTA_PRIMARY_CLASS}
              style={CTA_PRIMARY_STYLE}
              aria-label={t("homeSections.revistaReadEditionAria")}
            >
              <span
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 ease-out group-hover/cta:opacity-100"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.06) 0%, transparent 44%)",
                }}
                aria-hidden
              />
              <span className="relative">{t("homeSections.revistaReadEdition")}</span>
            </a>
          ) : (
            <Link
              to={GESTION_REVISTA_ARCHIVE_PATH}
              className={CTA_PRIMARY_CLASS}
              style={CTA_PRIMARY_STYLE}
            >
              <span
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 ease-out group-hover/cta:opacity-100"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.06) 0%, transparent 44%)",
                }}
                aria-hidden
              />
              <span className="relative">{t("homeSections.revistaViewEditions")}</span>
            </Link>
          )}
          {editionUrl && (
            <Link
              to={GESTION_REVISTA_ARCHIVE_PATH}
              className="heroAnnounceMore mt-2 block text-center text-[8.5px] font-normal leading-snug tracking-[0.02em] text-[rgba(22,61,89,0.58)] underline-offset-[3px] decoration-[rgba(22,61,89,0.3)] decoration-1 transition-colors duration-200 hover:text-[rgba(22,61,89,0.74)] hover:decoration-[rgba(22,61,89,0.42)] focus-visible:outline-none focus-visible:underline"
              style={{ fontFamily: "var(--token-font-body)" }}
            >
              {t("homeSections.revistaAllEditions")}
            </Link>
          )}
        </div>
      </div>
    </motion.article>
  );
}

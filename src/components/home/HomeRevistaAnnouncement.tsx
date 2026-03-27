/**
 * Tarjeta editorial destacada en el hero: nueva edición de la Revista REGULATEL.
 * Diseño institucional premium (no modal genérico). Cierre con localStorage + caducidad.
 */
import { useEffect, useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import {
  GESTION_REVISTA_ARCHIVE_PATH,
  getLatestRevistaEdition,
} from "@/data/gestion";

const STORAGE_KEY = "regulatel_home_revista_2026q1_dismissed_at";
const SHOW_AGAIN_AFTER_DAYS = 14;

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

function shouldShowAnnouncement(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
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

/** Mini “portada” tipográfica — escala acorde a la tarjeta compacta. */
function EditorialCoverMini() {
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
          Revista
        </p>
        <div>
          <p
            className="text-[1.2rem] font-semibold leading-none tracking-tight text-white"
            style={{ fontFamily: "var(--token-font-heading)" }}
          >
            01
          </p>
          <p
            className="mt-[0.15rem] text-[6px] font-medium uppercase tracking-[0.16em] text-white/45"
            style={{ fontFamily: "var(--token-font-body)" }}
          >
            Abril · 2026
          </p>
        </div>
      </div>
    </div>
  );
}

export default function HomeRevistaAnnouncement() {
  const reduceMotion = useReducedMotion();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(shouldShowAnnouncement());
  }, []);

  const dismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, new Date().toISOString());
    } catch {
      /* ignore */
    }
    setVisible(false);
  };

  if (!visible) return null;

  const featured = getLatestRevistaEdition();
  const detailPath = featured?.publicDetailPath;
  const editionUrl = featured?.url;
  const motionFrom = reduceMotion
    ? false
    : { opacity: 0, y: 12, scale: 0.98 };
  const motionTo = reduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 };

  return (
    <motion.article
      role="region"
      aria-labelledby="home-revista-announce-title"
      className="pointer-events-auto absolute z-30 w-[min(100%-1.25rem,15.875rem)] max-md:left-1/2 max-md:right-auto max-md:-translate-x-1/2 max-md:top-4 sm:w-[min(100%-2rem,16.25rem)] sm:max-md:top-5 md:right-8 md:top-7 md:w-[15.875rem] lg:right-10 lg:top-8"
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
      <button
        type="button"
        onClick={dismiss}
        className="group absolute right-[6px] top-[6px] z-10 flex h-4 w-4 items-center justify-center rounded-full text-[rgba(58,54,50,0.19)] transition-[color,background-color,opacity] duration-[380ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-[rgba(90,82,74,0.035)] hover:text-[rgba(46,42,38,0.4)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)] focus-visible:ring-offset-1 focus-visible:ring-offset-[#f6f2eb]"
        aria-label="Cerrar aviso de publicación"
      >
        <X
          className="h-2 w-2 transition-[transform,opacity] duration-[380ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:opacity-[0.92] group-hover:scale-[0.98]"
          strokeWidth={0.88}
          aria-hidden
        />
      </button>

      <div className="px-3.5 pb-3 pt-3.5 pr-9 sm:px-[0.9rem] sm:pb-[0.85rem] sm:pt-[0.95rem] sm:pr-9">
        <div className="flex gap-2.5">
          <EditorialCoverMini />

          <div className="min-w-0 flex-1 pt-[1px]">
            <p
              className="text-[8px] font-semibold uppercase leading-none tracking-[0.22em] text-[var(--regu-blue)]"
              style={{
                fontFamily: "var(--token-font-body)",
                textShadow: "0 1px 0 rgba(255, 252, 248, 0.45)",
              }}
            >
              Publicación oficial
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
              Revista REGULATEL 01 – Abril 2026
            </h2>
          </div>
        </div>

        <p
          className="mt-2 text-[10.5px] leading-[1.52] sm:text-[11px] sm:leading-[1.58]"
          style={{
            fontFamily: "var(--token-font-body)",
            color: "rgba(35, 44, 52, 0.88)",
          }}
        >
          Ya está disponible la primera edición 2026 de la Revista REGULATEL.
        </p>

        <div className="mt-[0.72rem] sm:mt-[0.78rem]">
          {detailPath ? (
            <Link to={detailPath} className={CTA_PRIMARY_CLASS} style={CTA_PRIMARY_STYLE}>
              <span
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 ease-out group-hover/cta:opacity-100"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.06) 0%, transparent 44%)",
                }}
                aria-hidden
              />
              <span className="relative">Leer edición</span>
            </Link>
          ) : editionUrl ? (
            <a
              href={editionUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={CTA_PRIMARY_CLASS}
              style={CTA_PRIMARY_STYLE}
              aria-label="Leer edición de la Revista REGULATEL (PDF en nueva pestaña)"
            >
              <span
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 ease-out group-hover/cta:opacity-100"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.06) 0%, transparent 44%)",
                }}
                aria-hidden
              />
              <span className="relative">Leer edición</span>
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
              <span className="relative">Ver ediciones</span>
            </Link>
          )}
          {(detailPath || editionUrl) && (
            <Link
              to={GESTION_REVISTA_ARCHIVE_PATH}
              className="mt-2 block text-center text-[8.5px] font-normal leading-snug tracking-[0.02em] text-[rgba(22,61,89,0.58)] underline-offset-[3px] decoration-[rgba(22,61,89,0.3)] decoration-1 transition-colors duration-200 hover:text-[rgba(22,61,89,0.74)] hover:decoration-[rgba(22,61,89,0.42)] focus-visible:outline-none focus-visible:underline"
              style={{ fontFamily: "var(--token-font-body)" }}
            >
              Ver todas las ediciones
            </Link>
          )}
        </div>
      </div>
    </motion.article>
  );
}

/**
 * Tarjeta editorial destacada en el hero: nueva edición de la Revista REGULATEL.
 * Diseño institucional premium (no modal genérico). Cierre con localStorage + caducidad.
 */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";

const STORAGE_KEY = "regulatel_home_revista_2026q1_dismissed_at";
const SHOW_AGAIN_AFTER_DAYS = 14;
const REVISTA_GESTION_URL = "/gestion?tipo=revista";

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
          "inset 0 0 0 1px rgba(255,255,255,0.055), inset 0 1px 0 rgba(255,255,255,0.035), 0 8px 22px -8px rgba(22,61,89,0.18), 0 2px 8px -4px rgba(22,61,89,0.08)",
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
        border: "1px solid rgba(22,61,89,0.07)",
        background:
          "linear-gradient(165deg, rgba(255,255,255,0.93) 0%, rgba(250,249,246,0.96) 52%, rgba(248,250,252,0.95) 100%)",
        boxShadow:
          "0 0 0 1px rgba(255,255,255,0.55) inset, 0 1px 2px rgba(22,61,89,0.015), 0 10px 36px -18px rgba(22,61,89,0.11), 0 3px 12px -6px rgba(22,61,89,0.05)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
    >
      <button
        type="button"
        onClick={dismiss}
        className="group absolute right-1.5 top-1.5 z-10 flex h-5 w-5 items-center justify-center rounded-full text-[rgba(22,61,89,0.38)] transition-all duration-300 ease-out hover:bg-[rgba(22,61,89,0.045)] hover:text-[rgba(22,61,89,0.62)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)] focus-visible:ring-offset-1 focus-visible:ring-offset-[#faf9f6]"
        aria-label="Cerrar aviso de publicación"
      >
        <X
          className="h-3 w-3 transition-[transform,opacity] duration-300 ease-out group-hover:opacity-90 group-hover:scale-[0.92]"
          strokeWidth={1.15}
          aria-hidden
        />
      </button>

      <div className="px-3.5 pb-3 pt-3.5 pr-9 sm:px-[0.9rem] sm:pb-[0.85rem] sm:pt-[0.95rem] sm:pr-9">
        <div className="flex gap-2.5">
          <EditorialCoverMini />

          <div className="min-w-0 flex-1 pt-[1px]">
            <p
              className="text-[8px] font-semibold uppercase leading-none tracking-[0.22em] text-[var(--regu-blue)]"
              style={{ fontFamily: "var(--token-font-body)" }}
            >
              Publicación oficial
            </p>
            <div
              className="mb-[0.35rem] mt-[0.35rem] h-px w-[1.65rem] rounded-full"
              style={{
                background:
                  "linear-gradient(90deg, var(--regu-blue) 0%, rgba(68,137,198,0.12) 100%)",
              }}
              aria-hidden
            />
            <h2
              id="home-revista-announce-title"
              className="text-[0.765rem] font-semibold leading-[1.33] tracking-[-0.012em] text-[var(--regu-navy)] sm:text-[0.8rem]"
              style={{ fontFamily: "var(--token-font-heading)" }}
            >
              Revista REGULATEL 01 – Abril 2026
            </h2>
          </div>
        </div>

        <p
          className="mt-2.5 text-[10.5px] leading-[1.52] text-[var(--regu-gray-600)] sm:text-[11px] sm:leading-[1.58]"
          style={{ fontFamily: "var(--token-font-body)" }}
        >
          Ya está disponible la primera edición 2026 de la Revista REGULATEL.
        </p>

        <div className="mt-3 sm:mt-[0.7rem]">
          <Link
            to={REVISTA_GESTION_URL}
            className="group/cta relative flex w-full items-center justify-center overflow-hidden rounded-[6px] px-3.5 py-1.5 text-center text-[10.5px] font-medium tracking-[0.028em] text-white transition-[box-shadow,transform,filter] duration-200 ease-out hover:-translate-y-px hover:brightness-[1.02] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_1px_2px_rgba(22,61,89,0.05),0_6px_18px_-10px_rgba(68,137,198,0.32)] active:translate-y-0 active:scale-[0.995] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#faf9f6] sm:text-[11px] sm:tracking-[0.025em]"
            style={{
              fontFamily: "var(--token-font-body)",
              background:
                "linear-gradient(178deg, #5595c4 0%, var(--regu-blue) 52%, #4178a5 100%)",
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.1), 0 1px 1px rgba(22,61,89,0.04), 0 5px 14px -8px rgba(68,137,198,0.28)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <span
              className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 ease-out group-hover/cta:opacity-100"
              style={{
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.09) 0%, transparent 42%)",
              }}
              aria-hidden
            />
            <span className="relative">Consultar edición</span>
          </Link>
        </div>
      </div>
    </motion.article>
  );
}

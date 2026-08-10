import {
  useEffect,
  useId,
  useRef,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { createPortal } from "react-dom";
import { Clock3, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { HablaElReguladorInterview } from "@/data/hablaElRegulador";
import { countryFlagSrc } from "@/data/hablaElRegulador";

interface InterviewPlayerDialogProps {
  interview: HablaElReguladorInterview;
  onClose: () => void;
}

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), a[href], iframe, video, [tabindex]:not([tabindex="-1"])';

export default function InterviewPlayerDialog({
  interview,
  onClose,
}: InterviewPlayerDialogProps) {
  const { t } = useTranslation();
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    returnFocusRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
      returnFocusRef.current?.focus();
    };
  }, [onClose]);

  const keepFocusInside = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Tab" || !dialogRef.current) return;
    const focusable = Array.from(
      dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
    ).filter((element) => element.offsetParent !== null);
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const isTeaser = interview.episode === 0;
  const playerTitle = isTeaser
    ? interview.name
    : t("pages.hablaRegulador.modalTitle", {
        name: interview.name,
      });

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#071622]/90 p-3 backdrop-blur-md md:p-8"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onKeyDown={keepFocusInside}
        className="relative flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-white/15 bg-[#0e2b40] shadow-2xl md:rounded-[24px]"
      >
        <div className="flex items-start justify-between gap-4 border-b border-white/10 px-4 py-4 md:px-6 md:py-5">
          <div className="min-w-0">
            <p className="m-0 text-[0.66rem] font-bold uppercase tracking-[0.18em] text-[#c5dc0b]">
              {t("pages.hablaRegulador.modalEyebrow")}
            </p>
            <h2
              id={titleId}
              className="mt-1 text-lg font-bold leading-tight text-white md:text-2xl"
              style={{ fontFamily: "var(--token-font-heading)" }}
            >
              {playerTitle}
            </h2>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8fc7f0] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0e2b40]"
            aria-label={t("pages.hablaRegulador.closePlayer")}
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        <div className="min-h-0 overflow-y-auto">
          <div className="aspect-video w-full bg-black">
            {interview.youtubeId ? (
              <iframe
                className="h-full w-full"
                src={`https://www.youtube-nocookie.com/embed/${interview.youtubeId}?autoplay=1&rel=0&modestbranding=1`}
                title={playerTitle}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            ) : (
              <video
                className="h-full w-full object-contain"
                src={interview.videoSrc}
                poster={interview.poster}
                controls
                autoPlay
                playsInline
                preload="metadata"
                lang="es"
                aria-label={playerTitle}
              />
            )}
          </div>

          <div className="grid gap-4 px-5 py-5 text-white md:grid-cols-[1fr_auto] md:items-center md:px-7 md:py-6">
            <div>
              <div className="mb-2 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.09em] text-white/60">
                <span>
                  {isTeaser
                    ? t("pages.hablaRegulador.teaserLabel")
                    : t("pages.hablaRegulador.episodeLabel", {
                        number: interview.episode,
                      })}
                </span>
                {!isTeaser && (
                  <>
                    <span aria-hidden>•</span>
                    <span className="inline-flex items-center gap-1.5">
                      <img
                        src={countryFlagSrc(interview.countryCode)}
                        alt=""
                        width={16}
                        height={12}
                        className="h-3 w-4 object-cover"
                      />
                      {interview.country}
                    </span>
                  </>
                )}
              </div>
              <p className="m-0 text-base font-semibold leading-relaxed text-white/85">
                {interview.role} · {interview.organization}
              </p>
            </div>
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-xs font-semibold text-white/75">
              <Clock3 className="h-3.5 w-3.5" aria-hidden />
              {interview.duration}
            </span>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

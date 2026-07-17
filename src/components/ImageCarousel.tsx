import { useState, useEffect, useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";

export type CarouselMediaItem = {
  type: "image" | "video";
  src: string;
};

interface ImageCarouselProps {
  images?: string[];
  /** Videos that appear after the images in the carousel. */
  videos?: string[];
  /** Explicit media list (overrides images/videos when provided). */
  items?: CarouselMediaItem[];
  /** Clase del contenedor. */
  className?: string;
  /** Proporción del slide (ej. "16/9", "1"). */
  aspectRatio?: string;
  /** Altura fija opcional (ej. "320px", "70vh"). */
  slideHeight?: string;
  /** Auto-avanzar cada N ms. 0 = desactivado. */
  autoPlayMs?: number;
  /** Variante: "article" (grande, flechas fuera) | "card" (compacto, flechas sobre imagen). */
  variant?: "article" | "card";
  /** Si true, el carrusel ocupa 100% del contenedor (el padre debe tener altura definida). */
  fillContainer?: boolean;
}

function buildItems(
  images: string[] | undefined,
  videos: string[] | undefined,
  items: CarouselMediaItem[] | undefined
): CarouselMediaItem[] {
  if (items && items.length > 0) return items;
  return [
    ...(images ?? []).map((src) => ({ type: "image" as const, src })),
    ...(videos ?? []).map((src) => ({ type: "video" as const, src })),
  ];
}

export default function ImageCarousel({
  images = [],
  videos = [],
  items,
  className = "",
  aspectRatio = "16/9",
  slideHeight,
  autoPlayMs = 0,
  variant = "article",
  fillContainer = false,
}: ImageCarouselProps) {
  const media = buildItems(images, videos, items);
  const [index, setIndex] = useState(0);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const total = media.length;
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const touchStartX = useRef<number | null>(null);

  const go = useCallback(
    (delta: number) => {
      setIndex((i) => (i + delta + total) % total);
    },
    [total]
  );

  useEffect(() => {
    videoRefs.current.forEach((video, i) => {
      if (!video) return;
      if (i !== index) {
        video.pause();
      }
    });
    setVideoPlaying(false);
  }, [index]);

  useEffect(() => {
    if (autoPlayMs <= 0 || total <= 1) return;
    if (media[index]?.type === "video") return;
    const t = setInterval(() => go(1), autoPlayMs);
    return () => clearInterval(t);
  }, [autoPlayMs, go, total, index, media]);

  const toggleCurrentVideo = useCallback(() => {
    const video = videoRefs.current[index];
    if (!video) return;
    if (video.paused) {
      void video.play().then(() => setVideoPlaying(true)).catch(() => setVideoPlaying(false));
    } else {
      video.pause();
      setVideoPlaying(false);
    }
  }, [index]);

  if (total === 0) return null;

  const isCard = variant === "card";

  const renderSlide = (item: CarouselMediaItem, i: number, single: boolean) => {
    if (item.type === "video") {
      return (
        <div className={`relative ${single ? "w-full" : "h-full w-full"} bg-black`}>
          <video
            ref={(el) => {
              videoRefs.current[i] = el;
            }}
            src={item.src}
            controls
            playsInline
            className={
              single
                ? "h-full w-full max-h-[70vh] object-contain bg-black"
                : "h-full w-full object-contain bg-black"
            }
            onPlay={() => {
              if (i === index) setVideoPlaying(true);
            }}
            onPause={() => {
              if (i === index) setVideoPlaying(false);
            }}
            onEnded={() => {
              if (i === index) setVideoPlaying(false);
            }}
          />
          {i === index && !videoPlaying && (
            <button
              type="button"
              onClick={toggleCurrentVideo}
              className="absolute inset-0 z-[2] flex items-center justify-center border-0 cursor-pointer bg-black/20"
              aria-label="Reproducir video"
            >
              <span
                className="inline-flex h-14 w-14 items-center justify-center rounded-full shadow-lg"
                style={{ backgroundColor: "var(--regu-blue)", color: "#fff" }}
              >
                <Play className="h-6 w-6 fill-current ml-0.5" />
              </span>
            </button>
          )}
          {i === index && videoPlaying && (
            <button
              type="button"
              onClick={toggleCurrentVideo}
              className="absolute right-3 top-3 z-[2] inline-flex h-10 w-10 items-center justify-center rounded-full border-0 cursor-pointer bg-black/45 text-white hover:bg-black/60"
              aria-label="Pausar video"
            >
              <Pause className="h-5 w-5 fill-current" />
            </button>
          )}
        </div>
      );
    }

    return (
      <img
        src={item.src}
        alt=""
        className={
          single
            ? "h-full w-full max-h-[70vh] object-cover"
            : "h-full w-full object-cover"
        }
        onError={(e) => {
          e.currentTarget.style.display = "none";
        }}
      />
    );
  };

  if (total === 1) {
    const only = media[0];
    return (
      <figure className={`mb-0 w-full overflow-hidden ${className}`}>
        <div
          className="relative w-full flex items-center justify-center bg-black"
          style={{
            ...(aspectRatio !== "auto" ? { aspectRatio } : {}),
            ...(slideHeight ? { minHeight: slideHeight, maxHeight: slideHeight } : {}),
          }}
        >
          {renderSlide(only, 0, true)}
        </div>
      </figure>
    );
  }

  return (
    <figure className={`relative w-full ${fillContainer ? "h-full" : ""} ${className}`}>
      <div
        className={`relative w-full overflow-hidden bg-black ${fillContainer ? "h-full min-h-0" : ""}`}
        style={{
          ...(fillContainer
            ? {}
            : { aspectRatio: isCard ? "16/9" : aspectRatio === "auto" ? undefined : aspectRatio }),
          ...(slideHeight && !isCard && !fillContainer
            ? { minHeight: slideHeight, maxHeight: slideHeight }
            : {}),
        }}
        onTouchStart={(e) => {
          touchStartX.current = e.changedTouches[0]?.clientX ?? null;
        }}
        onTouchEnd={(e) => {
          if (touchStartX.current == null) return;
          const delta = (e.changedTouches[0]?.clientX ?? 0) - touchStartX.current;
          touchStartX.current = null;
          if (Math.abs(delta) < 40) return;
          go(delta < 0 ? 1 : -1);
        }}
      >
        {media.map((item, i) => (
          <div
            key={`${item.type}-${item.src}-${i}`}
            className="absolute inset-0 flex items-center justify-center transition-opacity duration-300 ease-out"
            style={{
              opacity: i === index ? 1 : 0,
              pointerEvents: i === index ? "auto" : "none",
            }}
          >
            {renderSlide(item, i, false)}
          </div>
        ))}

        <button
          type="button"
          onClick={() => go(-1)}
          className="absolute left-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white shadow transition hover:bg-black/60 focus:outline-none focus:ring-2 focus:ring-[var(--regu-blue)] focus:ring-offset-2"
          aria-label="Anterior"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          type="button"
          onClick={() => go(1)}
          className="absolute right-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white shadow transition hover:bg-black/60 focus:outline-none focus:ring-2 focus:ring-[var(--regu-blue)] focus:ring-offset-2"
          aria-label="Siguiente"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>

      {/* Dots below media so they don't sit as white marks on the photo */}
      <div className="mt-3 flex justify-center gap-2">
        {media.map((item, i) => (
          <button
            key={`dot-${i}`}
            type="button"
            onClick={() => setIndex(i)}
            className="h-2.5 rounded-full transition-all border-0 cursor-pointer"
            style={{
              width: i === index ? 22 : 10,
              backgroundColor: i === index ? "var(--regu-blue)" : "rgba(22,61,89,0.25)",
            }}
            aria-label={item.type === "video" ? `Ir al video ${i + 1}` : `Ir a imagen ${i + 1}`}
          />
        ))}
      </div>
    </figure>
  );
}

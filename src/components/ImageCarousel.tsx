import { useState, useEffect, useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
  }, [index]);

  useEffect(() => {
    if (autoPlayMs <= 0 || total <= 1) return;
    if (media[index]?.type === "video") return;
    const t = setInterval(() => go(1), autoPlayMs);
    return () => clearInterval(t);
  }, [autoPlayMs, go, total, index, media]);

  if (total === 0) return null;

  if (total === 1) {
    const only = media[0];
    return (
      <figure className={`mb-0 w-full overflow-hidden ${className}`}>
        <div
          className="relative w-full flex items-center justify-center bg-[var(--regu-gray-100)]"
          style={{
            ...(aspectRatio !== "auto" ? { aspectRatio } : {}),
            ...(slideHeight ? { minHeight: slideHeight, maxHeight: slideHeight } : {}),
          }}
        >
          {only.type === "video" ? (
            <video
              src={only.src}
              controls
              playsInline
              className="h-full w-full max-h-[70vh] object-contain bg-black"
            />
          ) : (
            <img
              src={only.src}
              alt=""
              className="h-full w-full max-h-[70vh] object-contain"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          )}
        </div>
      </figure>
    );
  }

  const isCard = variant === "card";

  return (
    <figure className={`relative w-full overflow-hidden ${fillContainer ? "h-full" : ""} ${className}`}>
      <div
        className={`relative w-full bg-[var(--regu-gray-100)] ${fillContainer ? "h-full min-h-0" : ""}`}
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
            {item.type === "video" ? (
              <video
                ref={(el) => {
                  videoRefs.current[i] = el;
                }}
                src={item.src}
                controls
                playsInline
                className="h-full w-full object-contain bg-black"
              />
            ) : (
              <img
                src={item.src}
                alt=""
                className="h-full w-full object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            )}
          </div>
        ))}

        <button
          type="button"
          onClick={() => go(-1)}
          className="absolute left-0 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white shadow transition hover:bg-black/55 focus:outline-none focus:ring-2 focus:ring-[var(--regu-blue)] focus:ring-offset-2"
          aria-label="Anterior"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          type="button"
          onClick={() => go(1)}
          className="absolute right-0 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white shadow transition hover:bg-black/55 focus:outline-none focus:ring-2 focus:ring-[var(--regu-blue)] focus:ring-offset-2"
          aria-label="Siguiente"
        >
          <ChevronRight className="h-6 w-6" />
        </button>

        <div className="absolute bottom-3 left-0 right-0 z-10 flex justify-center gap-1.5">
          {media.map((item, i) => (
            <button
              key={`dot-${i}`}
              type="button"
              onClick={() => setIndex(i)}
              className="h-2 w-2 rounded-full transition-all"
              style={{
                backgroundColor: i === index ? "white" : "rgba(255,255,255,0.5)",
                boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
              }}
              aria-label={item.type === "video" ? `Ir al video ${i + 1}` : `Ir a imagen ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </figure>
  );
}

import { useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Download } from "lucide-react";

interface LightboxProps {
  imageUrls: string[];
  currentIndex: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

export default function Lightbox({ imageUrls, currentIndex, onClose, onPrev, onNext }: LightboxProps) {
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < imageUrls.length - 1;

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") hasPrev && onPrev();
      if (e.key === "ArrowRight") hasNext && onNext();
    },
    [onClose, onPrev, onNext, hasPrev, hasNext]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [handleKeyDown]);

  if (imageUrls.length === 0) return null;

  const currentUrl = imageUrls[currentIndex];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm"
        onClick={onClose}
      >
        {/* Close + Download */}
        <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
          <a
            href={currentUrl}
            download
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            aria-label="Descargar foto"
          >
            <Download className="h-5 w-5" />
          </a>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            aria-label="Cerrar"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Counter */}
        <div
          className="absolute top-4 left-4 z-10 rounded-full px-3 py-1.5 text-sm font-medium text-white"
          style={{ backgroundColor: "rgba(22,61,89,0.8)" }}
        >
          {currentIndex + 1} / {imageUrls.length}
        </div>

        {/* Prev */}
        {hasPrev && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onPrev(); }}
            className="absolute left-2 top-1/2 z-10 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white md:left-4"
            aria-label="Anterior"
          >
            <ChevronLeft className="h-8 w-8" />
          </button>
        )}

        {/* Image container - click doesn't close so user can click image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.2 }}
          className="relative max-h-[90vh] max-w-[95vw] px-14 md:px-20"
          onClick={(e) => e.stopPropagation()}
        >
          <img
            src={currentUrl}
            alt=""
            className="max-h-[90vh] w-auto max-w-full object-contain rounded-lg shadow-2xl"
          />
        </motion.div>

        {/* Next */}
        {hasNext && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onNext(); }}
            className="absolute right-2 top-1/2 z-10 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white md:right-4"
            aria-label="Siguiente"
          >
            <ChevronRight className="h-8 w-8" />
          </button>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

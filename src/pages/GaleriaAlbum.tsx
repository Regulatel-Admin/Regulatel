import { useState, useCallback } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { ArrowLeft, Home, Images } from "lucide-react";
import PageHero from "@/components/PageHero";
import GalleryGrid from "@/components/galeria/GalleryGrid";
import Lightbox from "@/components/galeria/Lightbox";
import { getAlbumBySlug, getAlbumImageUrls } from "@/data/galeria";

export default function GaleriaAlbum() {
  const { slug } = useParams<{ slug: string }>();
  const album = slug ? getAlbumBySlug(slug) : undefined;
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const openLightbox = useCallback((index: number) => setLightboxIndex(index), []);
  const closeLightbox = useCallback(() => setLightboxIndex(null), []);

  if (!album) {
    return <Navigate to="/galeria" replace />;
  }

  const imageUrls = getAlbumImageUrls(album);

  return (
    <>
      <PageHero
        title={album.title}
        subtitle="GALERÍA"
        breadcrumb={[
          { label: "Galería", path: "/galeria" },
          { label: album.title },
        ]}
        description={album.date}
      />

      <div
        className="w-full py-12 md:py-16 lg:py-20"
        style={{
          backgroundColor: "#FAFBFC",
          borderTop: "1px solid rgba(22,61,89,0.07)",
          fontFamily: "var(--token-font-body)",
        }}
      >
        <div className="mx-auto px-4 md:px-6 lg:px-8" style={{ maxWidth: "1180px" }}>
          <Link
            to="/galeria"
            className="inline-flex items-center gap-2 rounded-xl border-2 px-5 py-3 text-sm font-semibold transition-colors hover:bg-[rgba(68,137,198,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)] focus-visible:ring-offset-2 mb-8"
            style={{
              color: "var(--regu-blue)",
              borderColor: "var(--regu-blue)",
              backgroundColor: "rgba(68,137,198,0.06)",
            }}
          >
            <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
            Volver a galería
          </Link>

          <GalleryGrid imageUrls={imageUrls} onImageClick={openLightbox} />

          <nav
            className="mt-12 flex flex-wrap items-center gap-4 border-t pt-8"
            style={{ borderColor: "rgba(22,61,89,0.08)" }}
            aria-label="Navegación"
          >
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-xl border-2 px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-[rgba(68,137,198,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)] focus-visible:ring-offset-2"
              style={{
                color: "var(--regu-blue)",
                borderColor: "var(--regu-blue)",
                backgroundColor: "rgba(68,137,198,0.04)",
              }}
            >
              <Home className="h-4 w-4 shrink-0" aria-hidden />
              Volver al home
            </Link>
            <Link
              to="/galeria"
              className="inline-flex items-center gap-2 rounded-xl border-2 px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-[rgba(68,137,198,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)] focus-visible:ring-offset-2"
              style={{
                color: "var(--regu-blue)",
                borderColor: "var(--regu-blue)",
                backgroundColor: "rgba(68,137,198,0.04)",
              }}
            >
              <Images className="h-4 w-4 shrink-0" aria-hidden />
              Galería
            </Link>
          </nav>
        </div>
      </div>

      <AnimatePresence>
        {lightboxIndex !== null && (
          <Lightbox
            key="lightbox"
            imageUrls={imageUrls}
            currentIndex={lightboxIndex}
            onClose={closeLightbox}
            onPrev={() => setLightboxIndex((i) => (i !== null && i > 0 ? i - 1 : i))}
            onNext={() =>
              setLightboxIndex((i) => (i !== null && i < imageUrls.length - 1 ? i + 1 : i))
            }
          />
        )}
      </AnimatePresence>
    </>
  );
}

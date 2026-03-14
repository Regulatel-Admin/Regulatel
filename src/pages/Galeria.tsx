import { Link } from "react-router-dom";
import { Home } from "lucide-react";
import PageHero from "@/components/PageHero";
import AlbumCard from "@/components/galeria/AlbumCard";
import { useGalleryAlbums } from "@/contexts/SiteSettingsContext";

export default function Galeria() {
  const albumesGaleria = useGalleryAlbums();
  return (
    <>
      <PageHero
        title="Galería"
        subtitle="CONOCIMIENTO"
        breadcrumb={[{ label: "Galería" }]}
        description="Cumbres, asambleas y momentos destacados de REGULATEL."
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
          <div className="mb-10 flex items-start gap-4 md:mb-12">
            <div
              className="mt-1 h-8 w-[3px] flex-shrink-0 rounded-full"
              style={{ backgroundColor: "var(--regu-blue)" }}
              aria-hidden
            />
            <div>
              <h2
                className="text-xl font-bold md:text-2xl"
                style={{ color: "var(--regu-navy)", fontFamily: "var(--token-font-heading)" }}
              >
                Álbumes
              </h2>
              <p className="mt-1 text-sm" style={{ color: "var(--regu-gray-500)" }}>
                {albumesGaleria.length} álbumes
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 md:gap-8">
            {albumesGaleria.map((album, index) => (
              <AlbumCard key={album.slug} album={album} index={index} />
            ))}
          </div>

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
          </nav>
        </div>
      </div>
    </>
  );
}

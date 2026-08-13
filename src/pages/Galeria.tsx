import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Home, Plus } from "lucide-react";
import PageHero from "@/components/PageHero";
import AlbumCard from "@/components/galeria/AlbumCard";
import { useGalleryAlbums } from "@/contexts/SiteSettingsContext";
import { useSiteEdit } from "@/contexts/SiteEditContext";

export default function Galeria() {
  const { t } = useTranslation();
  const albumesGaleria = useGalleryAlbums();
  const { enabled: siteEditEnabled, open: openSiteEdit, preview: siteEditPreview, target: siteEditTarget } =
    useSiteEdit();
  const draftingNew = Boolean(
    siteEditEnabled &&
      ((siteEditTarget?.kind === "album" && !siteEditTarget.slug) ||
        siteEditPreview.galleryAlbums?.some((a) => a.slug.startsWith("nuevo-album-") && !a.title.trim()))
  );
  const showAdd = siteEditEnabled && !draftingNew;
  return (
    <>
      <PageHero
        title={t("pages.galeria.breadcrumb")}
        subtitle={t("pages.galeria.subtitle")}
        breadcrumb={[{ label: t("pages.galeria.breadcrumb") }]}
        description={t("pages.galeria.pageDescription")}
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
                {t("pages.galeria.albums")}
              </h2>
              <p className="mt-1 text-sm" style={{ color: "var(--regu-gray-500)" }}>
                {t("pages.galeria.albumsCount", { count: albumesGaleria.length })}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 md:gap-8">
            {showAdd && (
              <button
                type="button"
                onClick={() => openSiteEdit({ kind: "album" })}
                className="flex min-h-[280px] flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-10 transition hover:bg-[rgba(15,118,110,0.06)]"
                style={{
                  borderColor: "rgba(15,118,110,0.45)",
                  backgroundColor: "rgba(15,118,110,0.03)",
                }}
                aria-label="Añadir un álbum"
              >
                <span
                  className="flex h-20 w-20 items-center justify-center rounded-full"
                  style={{ backgroundColor: "rgba(15,118,110,0.10)", color: "#0f766e" }}
                >
                  <Plus className="h-12 w-12" strokeWidth={1.5} aria-hidden />
                </span>
                <span className="text-center">
                  <span className="block text-base font-bold" style={{ color: "#0f766e", fontFamily: "var(--token-font-heading)" }}>
                    Añadir álbum
                  </span>
                  <span className="mt-1 block text-sm leading-relaxed" style={{ color: "var(--regu-gray-500)" }}>
                    Título, fecha y fotos. Se ve aquí al instante.
                  </span>
                </span>
              </button>
            )}
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
              {t("pages.galeria.backToHome")}
            </Link>
          </nav>
        </div>
      </div>
    </>
  );
}

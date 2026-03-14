import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, Images } from "lucide-react";
import type { AlbumGaleria } from "@/data/galeria";
import { getAlbumCoverUrl } from "@/data/galeria";

interface AlbumCardProps {
  album: AlbumGaleria;
  index: number;
}

export default function AlbumCard({ album, index }: AlbumCardProps) {
  const coverUrl = getAlbumCoverUrl(album);
  const count = album.images.length;

  return (
    <Link to={`/galeria/${album.slug}`} className="block group">
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.08 }}
        className="relative overflow-hidden rounded-2xl border bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
        style={{
          borderColor: "rgba(22,61,89,0.10)",
          boxShadow: "0 4px 12px rgba(22,61,89,0.06), 0 8px 24px rgba(22,61,89,0.04)",
        }}
      >
        {/* Accent bar */}
        <div
          className="absolute inset-x-0 top-0 h-[3px] z-10 transition-colors duration-300 group-hover:opacity-100"
          style={{ backgroundColor: "var(--regu-blue)" }}
          aria-hidden
        />

        {/* Cover image: primera foto del álbum o placeholder neutro */}
        <div className="relative aspect-[4/3] overflow-hidden bg-[#e8eaed]">
          {coverUrl ? (
            <img
              src={coverUrl}
              alt=""
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center" style={{ backgroundColor: "#e8eaed" }}>
              <Images className="h-16 w-16 opacity-30" style={{ color: "var(--regu-navy)" }} aria-hidden />
            </div>
          )}
          <div
            className="absolute inset-0 transition-opacity duration-300 group-hover:opacity-90"
            style={{
              background: "linear-gradient(to top, rgba(22,61,89,0.75) 0%, transparent 50%)",
            }}
          />
          {/* Overlay info on hover */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white"
              style={{ backgroundColor: "var(--regu-blue)" }}
            >
              <Images className="h-4 w-4" />
              Ver álbum
            </span>
          </div>
        </div>

        {/* Card body */}
        <div className="p-5 md:p-6">
          <h3
            className="text-lg font-bold leading-snug line-clamp-2 mb-2 group-hover:text-[var(--regu-blue)] transition-colors"
            style={{ color: "var(--regu-navy)", fontFamily: "var(--token-font-heading)" }}
          >
            {album.title}
          </h3>
          <div className="flex flex-wrap items-center gap-4 text-sm" style={{ color: "var(--regu-gray-500)" }}>
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-4 w-4 shrink-0" />
              {album.date}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Images className="h-4 w-4 shrink-0" />
              {count} {count === 1 ? "foto" : "fotos"}
            </span>
          </div>
        </div>
      </motion.article>
    </Link>
  );
}

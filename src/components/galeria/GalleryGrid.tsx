import { motion } from "framer-motion";

interface GalleryGridProps {
  imageUrls: string[];
  onImageClick: (index: number) => void;
}

export default function GalleryGrid({ imageUrls, onImageClick }: GalleryGridProps) {
  if (imageUrls.length === 0) {
    return (
      <div
        className="rounded-2xl border border-dashed py-16 text-center"
        style={{ borderColor: "rgba(22,61,89,0.15)", backgroundColor: "rgba(22,61,89,0.02)" }}
      >
        <p className="text-base" style={{ color: "var(--regu-gray-500)" }}>
          No hay fotos en este álbum aún.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
      {imageUrls.map((url, index) => (
        <motion.button
          key={`${url}-${index}`}
          type="button"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: index * 0.02 }}
          onClick={() => onImageClick(index)}
          className="relative aspect-square rounded-xl overflow-hidden bg-[#f0f2f4] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)] focus-visible:ring-offset-2"
        >
          <img
            src={url}
            alt=""
            className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
          />
        </motion.button>
      ))}
    </div>
  );
}

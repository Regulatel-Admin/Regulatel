import { extractYoutubeId } from "@/lib/youtube";

export function MediaEmbed({
  url,
  title,
  className = "",
}: {
  url: string;
  title?: string;
  className?: string;
}) {
  const trimmed = url.trim();
  if (!trimmed) {
    return (
      <div
        className={`flex items-center justify-center bg-[#051329] text-sm text-white/70 ${className}`}
      >
        Sin video todavía
      </div>
    );
  }
  const youtubeId = extractYoutubeId(trimmed);
  if (youtubeId) {
    return (
      <iframe
        src={`https://www.youtube.com/embed/${youtubeId}`}
        title={title || "Video"}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className={`border-0 ${className}`}
      />
    );
  }
  if (/\.(mp4|webm|ogg)(\?|$)/i.test(trimmed)) {
    return <video src={trimmed} controls className={className} title={title} />;
  }
  return (
    <a href={trimmed} target="_blank" rel="noreferrer" className={`block ${className}`}>
      Abrir video
    </a>
  );
}

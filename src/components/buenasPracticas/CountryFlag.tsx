interface CountryFlagProps {
  flag: string;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  xs: "text-lg",
  sm: "text-2xl",
  md: "text-4xl",
  lg: "text-5xl",
};

export default function CountryFlag({
  flag,
  size = "md",
  className = "",
}: CountryFlagProps) {
  const value = flag?.trim() || "";
  const isFullUrl = value.startsWith("http://") || value.startsWith("https://");
  const isLocalImage =
    value && !isFullUrl && (value.endsWith(".png") || value.endsWith(".jpg") || value.endsWith(".jpeg") || value.endsWith(".svg"));
  const useImage = isFullUrl || isLocalImage;

  const pixelSize = size === "xs" ? 20 : size === "sm" ? 24 : size === "md" ? 36 : 48;
  const imgSrc = isFullUrl ? value : isLocalImage ? `/flags/${value}` : "";

  if (useImage && imgSrc) {
    return (
      <span className={`inline-block shrink-0 ${className}`}>
        <img
          src={imgSrc}
          alt="Bandera del país"
          width={pixelSize}
          height={pixelSize}
          style={{
            width: pixelSize,
            height: pixelSize,
            borderRadius: 4,
            objectFit: "cover",
            boxShadow: "0 0 0 1px rgba(148, 163, 184, 0.3)",
          }}
        />
      </span>
    );
  }

  return (
    <span
      className={`${sizeClasses[size]} ${className} inline-block leading-none shrink-0`}
      role="img"
      aria-label="bandera"
      style={{
        fontFamily:
          '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif',
        lineHeight: "1",
        display: "inline-block",
        fontSize:
          size === "xs" ? "1.125rem" : size === "sm" ? "1.5rem" : size === "md" ? "2.5rem" : "3rem",
      }}
    >
      {value || "🌐"}
    </span>
  );
}

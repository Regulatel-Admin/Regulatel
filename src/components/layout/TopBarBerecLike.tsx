import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  FileText,
  Youtube,
  User,
  Menu,
  X,
  Linkedin,
  Facebook,
  Instagram,
} from "lucide-react";
import { resolveSiteSearch, resolveDocumentSearch } from "@/data/searchMaps";

/** Logo oficial X (Twitter) — SVG para que se vea nítido y correcto. */
function XLogo({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" fill="currentColor" />
    </svg>
  );
}
import SiteSearchAutocomplete from "@/components/SiteSearchAutocomplete";

const FONT_SIZE_KEY = "regulatel-font-size";
export type FontSizeMode = "sm" | "md" | "lg";

function getStoredFontSize(): FontSizeMode {
  if (typeof window === "undefined") return "md";
  const stored = localStorage.getItem(FONT_SIZE_KEY);
  if (stored === "sm" || stored === "md" || stored === "lg") return stored;
  const legacy = localStorage.getItem("regulatel-font-scale");
  if (legacy !== null) {
    const n = parseInt(legacy, 10);
    if (n === -1) return "sm";
    if (n === 1) return "lg";
  }
  return "md";
}

interface TopBarBerecLikeProps {
  mobileMenuOpen?: boolean;
  onMobileMenuToggle?: () => void;
}

/** Topbar BEREC: tamaños en px para que a-/a/a+ NO afecte esta franja. Escalado solo en #contentRoot. */
export default function TopBarBerecLike({
  mobileMenuOpen = false,
  onMobileMenuToggle,
}: TopBarBerecLikeProps) {
  const navigate = useNavigate();
  const [fontMode, setFontMode] = useState<FontSizeMode>(getStoredFontSize);
  const [searchWebsite, setSearchWebsite] = useState("");
  const [searchDocuments, setSearchDocuments] = useState("");
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute("data-font", fontMode);
    localStorage.setItem(FONT_SIZE_KEY, fontMode);
  }, [fontMode]);

  useEffect(() => {
    setFontMode(getStoredFontSize());
  }, []);

  const handleSearchWebsite = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchWebsite.trim();
    if (!q) return;
    const resolved = resolveSiteSearch(q);
    if (resolved) {
      if (resolved.path.startsWith("http")) {
        window.open(resolved.path, "_blank", "noopener,noreferrer");
      } else {
        navigate(resolved.path);
      }
    } else {
      navigate(`/search?q=${encodeURIComponent(q)}`);
    }
    setMobileSearchOpen(false);
  };

  const handleSearchDocuments = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchDocuments.trim();
    if (!q) return;
    const results = resolveDocumentSearch(q);
    if (results.length === 1) {
      if (results[0].path.startsWith("http")) {
        window.open(results[0].path, "_blank", "noopener,noreferrer");
      } else {
        navigate(results[0].path);
      }
    } else {
      navigate(`/buscar-documentos?q=${encodeURIComponent(q)}`);
    }
    setMobileSearchOpen(false);
  };

  const topbarHeight = 72;
  const searchHeight = 44;
  const a11yBtnSize = 34;
  const subscribeHeight = 42;
  const accentColor = "var(--regu-blue)";
  /* Borde visible tipo BEREC (gris medio), fondo blanco sólido — no transparente */
  const searchBorder = "1px solid #9CA3AF";
  const searchBg = "#FFFFFF";
  const borderColor = "#9CA3AF";

  return (
    <div
      className="topbar border-b bg-white relative overflow-visible"
      style={{
        borderBottom: "1px solid #E5E7EB",
        height: `${topbarHeight}px`,
        minHeight: `${topbarHeight}px`,
        display: "flex",
        alignItems: "center",
      }}
    >
      <div
        className="topbarInner mx-auto flex w-full items-center px-4 md:px-6 overflow-visible"
        style={{
          maxWidth: "1280px",
          paddingLeft: "24px",
          paddingRight: "24px",
          height: "100%",
          gap: "24px",
          justifyContent: "space-between",
          flexWrap: "nowrap",
          minWidth: 0,
        }}
      >
        {/* (1) Izquierda: logo — nunca se corta */}
        <div className="topbarLeft flex shrink-0 items-center" style={{ marginRight: "16px" }}>
          <Link
            to="/"
            className="shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)] focus-visible:ring-offset-2 rounded"
            aria-label="REGULATEL inicio"
            style={{ display: "block", minWidth: "140px" }}
          >
            <img
              src="/images/regulatel-logo.png"
              alt="REGULATEL"
              width={140}
              height={40}
              style={{ height: "40px", width: "auto", maxWidth: "none", display: "block", objectFit: "contain" }}
              loading="eager"
            />
          </Link>
        </div>

        {/* (2) Centro: 2 search inputs — puede encogerse para dejar sitio a la derecha */}
        <div className="topbarCenter hidden md:flex items-center" style={{ gap: "16px", flex: "1 1 0", minWidth: 0, justifyContent: "center", maxWidth: "720px" }}>
          <form onSubmit={handleSearchWebsite} role="search" aria-label="Buscar en el sitio" className="searchField flex items-center rounded-xl shrink-0" style={{ width: "280px", minWidth: "200px", height: `${searchHeight}px`, border: searchBorder, borderRadius: "12px", background: searchBg, paddingLeft: "14px", paddingRight: "14px", boxShadow: "none" }}>
            <Search className="searchIcon shrink-0" style={{ width: "18px", height: "18px", color: "#4B5563", marginRight: "10px" }} aria-hidden />
            <SiteSearchAutocomplete
              value={searchWebsite}
              onChange={setSearchWebsite}
              placeholder="BUSCAR EN EL SITIO"
            />
          </form>
          <form onSubmit={handleSearchDocuments} role="search" aria-label="Buscar documentos" className="searchField flex items-center rounded-xl shrink-0" style={{ width: "280px", minWidth: "200px", height: `${searchHeight}px`, border: searchBorder, borderRadius: "12px", background: searchBg, paddingLeft: "14px", paddingRight: "14px", boxShadow: "none" }}>
            <FileText className="searchIcon shrink-0" style={{ width: "18px", height: "18px", color: "#4B5563", marginRight: "10px" }} aria-hidden />
            <input
              type="search"
              placeholder="BUSCAR DOCUMENTO"
              value={searchDocuments}
              onChange={(e) => setSearchDocuments(e.target.value)}
              className="flex-1 min-w-0 border-0 p-0 outline-none bg-transparent"
              style={{ fontSize: "13px", fontWeight: 600, letterSpacing: "0.05em", color: "#1C1C1C" }}
            />
          </form>
        </div>

        {/* (3) Derecha: SIEMPRE visible — a-/a/a+ + iconos sociales + usuario + Suscribirse */}
        <div className="topbarRight flex items-center shrink-0" style={{ gap: "12px" }}>
          <div className="a11yControls hidden md:flex items-center" role="group" aria-label="Tamaño de fuente" style={{ gap: "4px" }}>
            {(["sm", "md", "lg"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                aria-label={mode === "sm" ? "Tamaño de fuente pequeño" : mode === "md" ? "Tamaño de fuente mediano" : "Tamaño de fuente grande"}
                aria-pressed={fontMode === mode}
                onClick={() => setFontMode(mode)}
                className="rounded-md border transition-colors hover:text-[var(--regu-blue)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)] focus-visible:ring-offset-1"
                style={{
                  width: `${a11yBtnSize}px`,
                  height: `${a11yBtnSize}px`,
                  fontSize: "14px",
                  fontWeight: 600,
                  color: fontMode === mode ? accentColor : "#1C1C1C",
                  borderColor: fontMode === mode ? accentColor : "rgba(0,0,0,0.12)",
                  background: fontMode === mode ? "rgba(68, 137, 198, 0.12)" : "transparent",
                }}
              >
                {mode === "sm" ? "a-" : mode === "md" ? "a" : "a+"}
              </button>
            ))}
          </div>

          {/* Iconos sociales: colores de marca, mismo tamaño visual, espaciado uniforme */}
          <div className="topbarSocial hidden md:flex items-center shrink-0" style={{ gap: "8px" }}>
            <a href="https://www.youtube.com/@INDOTELRD" target="_blank" rel="noreferrer noopener" aria-label="YouTube" className="rounded p-1 transition-colors hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)] focus-visible:ring-offset-1 inline-flex items-center justify-center" style={{ color: "#E53935" }}>
              <Youtube style={{ width: "18px", height: "18px" }} />
            </a>
            <a href="https://x.com/regulatel" target="_blank" rel="noreferrer noopener" aria-label="X (Twitter)" className="rounded p-1 transition-colors hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)] focus-visible:ring-offset-1 inline-flex items-center justify-center" style={{ color: "#14171A" }}>
              <XLogo size={18} />
            </a>
            <a href="https://www.instagram.com/foro.regulatel/" target="_blank" rel="noreferrer noopener" aria-label="Instagram" className="rounded p-1 transition-colors hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)] focus-visible:ring-offset-1 inline-flex items-center justify-center" style={{ color: "#E4405F" }}>
              <Instagram style={{ width: "18px", height: "18px" }} />
            </a>
            <a href="https://www.linkedin.com/company/regulatel" target="_blank" rel="noreferrer noopener" aria-label="LinkedIn" className="rounded p-1 transition-colors hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)] focus-visible:ring-offset-1 inline-flex items-center justify-center" style={{ color: "#0A66C2" }}>
              <Linkedin style={{ width: "18px", height: "18px" }} />
            </a>
            <a href="https://www.facebook.com/foro.regulatel" target="_blank" rel="noreferrer noopener" aria-label="Facebook" className="rounded p-1 transition-colors hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)] focus-visible:ring-offset-1 inline-flex items-center justify-center" style={{ color: "#1877F2" }}>
              <Facebook style={{ width: "18px", height: "18px" }} />
            </a>
            <Link to="/login" aria-label="Iniciar sesión" className="rounded p-1 transition-colors hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)] focus-visible:ring-offset-1 inline-flex items-center justify-center" style={{ color: accentColor }}>
              <User style={{ width: "18px", height: "18px" }} />
            </Link>
          </div>

          <Link
            to="/subscribe"
            className="subscribeBtn hidden shrink-0 items-center justify-center rounded-xl border-2 font-extrabold uppercase transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)] focus-visible:ring-offset-2 md:inline-flex hover:bg-[var(--regu-blue)] hover:text-white"
            style={{
              height: `${subscribeHeight}px`,
              paddingLeft: "18px",
              paddingRight: "18px",
              borderColor: accentColor,
              color: accentColor,
              background: "transparent",
              borderRadius: "12px",
              letterSpacing: "0.10em",
              fontSize: "12px",
            }}
          >
            Suscribirse
          </Link>

          {/* Mobile: botón búsqueda (abre panel) + menú hamburger */}
          <button
            type="button"
            aria-label={mobileSearchOpen ? "Cerrar búsqueda" : "Buscar"}
            aria-expanded={mobileSearchOpen}
            onClick={() => setMobileSearchOpen((v) => !v)}
            className="inline-flex rounded-md p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)] md:hidden"
            style={{ color: "#1C1C1C" }}
          >
            <Search style={{ width: "22px", height: "22px" }} />
          </button>
          {onMobileMenuToggle ? (
            <button
              type="button"
              aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={mobileMenuOpen}
              onClick={onMobileMenuToggle}
              className="inline-flex rounded-md p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)] md:hidden"
              style={{ color: "#1C1C1C" }}
            >
              {mobileMenuOpen ? <X style={{ width: "24px", height: "24px" }} /> : <Menu style={{ width: "24px", height: "24px" }} />}
            </button>
          ) : null}
        </div>
      </div>

      {/* Mobile: panel búsqueda colapsable (un solo input o dos apilados) */}
      {mobileSearchOpen && (
        <div className="md:hidden absolute left-0 right-0 top-full z-50 border-b bg-white p-4 shadow-md" style={{ borderColor: borderColor }}>
          <form onSubmit={handleSearchWebsite} className="mb-3">
            <div className="flex rounded-xl border bg-white overflow-hidden items-center px-3" style={{ height: "44px", borderColor: borderColor }}>
              <Search style={{ width: "20px", height: "20px", color: "#64748B", marginRight: "8px", flexShrink: 0 }} aria-hidden />
              <SiteSearchAutocomplete
                value={searchWebsite}
                onChange={setSearchWebsite}
                onResultSelect={() => setMobileSearchOpen(false)}
                placeholder="BUSCAR EN EL SITIO"
                compact
              />
            </div>
          </form>
          <form onSubmit={handleSearchDocuments}>
            <div className="flex rounded-xl border bg-white overflow-hidden" style={{ height: "44px", borderColor: borderColor }}>
              <FileText style={{ width: "20px", height: "20px", color: "#64748B", marginLeft: "12px", alignSelf: "center" }} aria-hidden />
              <input
                type="search"
                placeholder="BUSCAR DOCUMENTO"
                value={searchDocuments}
                onChange={(e) => setSearchDocuments(e.target.value)}
                className="flex-1 min-w-0 border-0 px-3 py-2 outline-none"
                style={{ fontSize: "14px" }}
              />
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

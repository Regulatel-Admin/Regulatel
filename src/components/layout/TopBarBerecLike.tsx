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
  Bell,
} from "lucide-react";
import { resolveSiteSearch, resolveDocumentSearch } from "@/data/searchMaps";

function XLogo({ size = 16 }: { size?: number }) {
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

  const topbarHeight = 68;
  const iconColor = "#5C6B7A";
  const iconHoverColor = "var(--regu-blue)";

  return (
    <div
      className="topbar relative overflow-visible bg-white"
      style={{
        borderBottom: "1px solid #E8ECF0",
        height: `${topbarHeight}px`,
        minHeight: `${topbarHeight}px`,
        display: "flex",
        alignItems: "center",
      }}
    >
      <div
        className="topbarInner mx-auto flex w-full items-center overflow-visible"
        style={{
          maxWidth: "var(--topbar-wrap-max, 1240px)",
          paddingLeft: "var(--topbar-wrap-padding-x, 24px)",
          paddingRight: "var(--topbar-wrap-padding-x, 24px)",
          height: "100%",
          gap: "20px",
          justifyContent: "space-between",
          flexWrap: "nowrap",
          minWidth: 0,
        }}
      >
        {/* ── (1) Logo ── */}
        <div className="topbarBrandBlock flex shrink-0 items-center gap-4">
          <Link
            to="/"
            className="topbarLogoLink shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)] focus-visible:ring-offset-2 rounded"
            aria-label="REGULATEL inicio"
          >
              <img
                src="/images/regulatel-logo.png"
                alt="REGULATEL"
                width={220}
                height={64}
                className="topbarLogoImg"
                style={{ height: "62px", width: "auto", maxWidth: "none", display: "block", objectFit: "contain" }}
                loading="eager"
              />
          </Link>
          {/* Divider */}
          <div
            className="hidden md:block shrink-0"
            style={{ width: "1px", height: "28px", backgroundColor: "rgba(22,61,89,0.10)" }}
            aria-hidden
          />
        </div>

        {/* ── (2) Search ── */}
        <div
          className="topbarCenter hidden md:flex items-center min-w-0 flex-1"
          style={{ gap: "10px", flexBasis: 0, minWidth: "460px", justifyContent: "center" }}
        >
          {/* Site search */}
          <form
            onSubmit={handleSearchWebsite}
            role="search"
            aria-label="Buscar en el sitio"
            className="flex items-center flex-1 rounded-xl bg-[#F4F6F8] transition-all focus-within:bg-white focus-within:ring-2 focus-within:ring-[var(--regu-blue)]/30"
            style={{
              minWidth: "210px",
              flexShrink: 0,
              height: "40px",
              border: "1px solid transparent",
              paddingLeft: "12px",
              paddingRight: "12px",
            }}
          >
            <Search
              className="shrink-0 mr-2.5"
              style={{ width: "15px", height: "15px", color: "#8A97A3" }}
              aria-hidden
            />
            <SiteSearchAutocomplete
              value={searchWebsite}
              onChange={setSearchWebsite}
              placeholder="Buscar en el sitio"
            />
          </form>

          {/* Document search */}
          <form
            onSubmit={handleSearchDocuments}
            role="search"
            aria-label="Buscar documentos"
            className="flex items-center flex-1 rounded-xl bg-[#F4F6F8] transition-all focus-within:bg-white focus-within:ring-2 focus-within:ring-[var(--regu-blue)]/30"
            style={{
              minWidth: "210px",
              flexShrink: 0,
              height: "40px",
              border: "1px solid transparent",
              paddingLeft: "12px",
              paddingRight: "12px",
            }}
          >
            <FileText
              className="shrink-0 mr-2.5"
              style={{ width: "15px", height: "15px", color: "#8A97A3" }}
              aria-hidden
            />
            <input
              type="search"
              placeholder="Buscar documento"
              value={searchDocuments}
              onChange={(e) => setSearchDocuments(e.target.value)}
              className="flex-1 min-w-0 border-0 p-0 outline-none bg-transparent"
              style={{ fontSize: "13px", fontWeight: 500, color: "#1C2B38" }}
            />
          </form>
        </div>

        {/* ── (3) Right: a11y + socials + login + subscribe ── */}
        <div className="topbarRight flex items-center shrink-0" style={{ gap: "10px" }}>

          {/* Font size controls */}
          <div
            className="a11yControls hidden md:flex items-center rounded-lg overflow-hidden"
            role="group"
            aria-label="Tamaño de fuente"
            style={{ border: "1px solid rgba(22,61,89,0.12)", backgroundColor: "#F4F6F8", gap: 0 }}
          >
            {(["sm", "md", "lg"] as const).map((mode, idx) => (
              <button
                key={mode}
                type="button"
                aria-label={mode === "sm" ? "Fuente pequeña" : mode === "md" ? "Fuente mediana" : "Fuente grande"}
                aria-pressed={fontMode === mode}
                onClick={() => setFontMode(mode)}
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)] focus-visible:ring-offset-1 transition-colors"
                style={{
                  width: "30px",
                  height: "30px",
                  fontSize: mode === "sm" ? "11px" : mode === "md" ? "13px" : "15px",
                  fontWeight: 700,
                  color: fontMode === mode ? "var(--regu-blue)" : "#7A8A97",
                  backgroundColor: fontMode === mode ? "rgba(68,137,198,0.14)" : "transparent",
                  borderRight: idx < 2 ? "1px solid rgba(22,61,89,0.10)" : "none",
                  lineHeight: 1,
                }}
              >
                A
              </button>
            ))}
          </div>

          {/* Divider */}
          <div
            className="hidden md:block shrink-0"
            style={{ width: "1px", height: "22px", backgroundColor: "rgba(22,61,89,0.09)" }}
            aria-hidden
          />

          {/* Social icons */}
          <div className="hidden md:flex items-center shrink-0" style={{ gap: "2px" }}>
            <a
              href="https://www.youtube.com/@ForoRegulatel"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
              className="topbarIconLink topbarIconLink--youtube inline-flex items-center justify-center rounded-md p-1.5 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)] focus-visible:ring-offset-1"
              style={{ color: iconColor }}
            >
              <Youtube style={{ width: "17px", height: "17px" }} />
            </a>
            <a
              href="https://x.com/regulatel"
              target="_blank"
              rel="noreferrer noopener"
              aria-label="X (Twitter)"
              className="topbarIconLink topbarIconLink--x inline-flex items-center justify-center rounded-md p-1.5 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)] focus-visible:ring-offset-1"
              style={{ color: iconColor }}
            >
              <XLogo size={16} />
            </a>
            <a
              href="https://www.instagram.com/foro.regulatel/"
              target="_blank"
              rel="noreferrer noopener"
              aria-label="Instagram"
              className="topbarIconLink topbarIconLink--instagram inline-flex items-center justify-center rounded-md p-1.5 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)] focus-visible:ring-offset-1"
              style={{ color: iconColor }}
            >
              <Instagram style={{ width: "17px", height: "17px" }} />
            </a>
            <a
              href="https://www.linkedin.com/company/regulatel"
              target="_blank"
              rel="noreferrer noopener"
              aria-label="LinkedIn"
              className="topbarIconLink topbarIconLink--linkedin inline-flex items-center justify-center rounded-md p-1.5 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)] focus-visible:ring-offset-1"
              style={{ color: iconColor }}
            >
              <Linkedin style={{ width: "17px", height: "17px" }} />
            </a>
            <a
              href="https://www.facebook.com/foro.regulatel"
              target="_blank"
              rel="noreferrer noopener"
              aria-label="Facebook"
              className="topbarIconLink topbarIconLink--facebook inline-flex items-center justify-center rounded-md p-1.5 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)] focus-visible:ring-offset-1"
              style={{ color: iconColor }}
            >
              <Facebook style={{ width: "17px", height: "17px" }} />
            </a>
          </div>

          {/* Divider */}
          <div
            className="hidden md:block shrink-0"
            style={{ width: "1px", height: "22px", backgroundColor: "rgba(22,61,89,0.09)" }}
            aria-hidden
          />

          {/* Login icon */}
          <Link
            to="/login"
            aria-label="Iniciar sesión"
            className="hidden md:inline-flex items-center justify-center rounded-md p-1.5 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)] focus-visible:ring-offset-1 shrink-0"
            style={{ color: iconColor }}
          >
            <User style={{ width: "17px", height: "17px" }} />
          </Link>

          {/* Subscribe CTA */}
          <Link
            to="/subscribe"
            className="subscribeBtn hidden md:inline-flex shrink-0 items-center justify-center rounded-xl font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)] focus-visible:ring-offset-2 hover:brightness-110"
            style={{
              height: "38px",
              paddingLeft: "18px",
              paddingRight: "18px",
              backgroundColor: "var(--regu-blue)",
              color: "#fff",
              borderRadius: "10px",
              fontSize: "12px",
              letterSpacing: "0.06em",
              gap: "6px",
            }}
          >
            <Bell style={{ width: "13px", height: "13px" }} aria-hidden />
            Suscribirse
          </Link>

          {/* Mobile: search toggle */}
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

          {/* Mobile: hamburger */}
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

      {/* Mobile: collapsible search panel */}
      {mobileSearchOpen && (
        <div
          className="md:hidden absolute left-0 right-0 top-full z-50 border-b bg-white p-4 shadow-md"
          style={{ borderColor: "#E8ECF0" }}
        >
          <form onSubmit={handleSearchWebsite} className="mb-3">
            <div
              className="flex items-center rounded-xl bg-[#F4F6F8] px-3"
              style={{ height: "44px" }}
            >
              <Search style={{ width: "18px", height: "18px", color: "#8A97A3", marginRight: "8px", flexShrink: 0 }} aria-hidden />
              <SiteSearchAutocomplete
                value={searchWebsite}
                onChange={setSearchWebsite}
                onResultSelect={() => setMobileSearchOpen(false)}
                placeholder="Buscar en el sitio"
                compact
              />
            </div>
          </form>
          <form onSubmit={handleSearchDocuments}>
            <div
              className="flex items-center rounded-xl bg-[#F4F6F8] px-3"
              style={{ height: "44px" }}
            >
              <FileText style={{ width: "18px", height: "18px", color: "#8A97A3", marginRight: "8px", flexShrink: 0 }} aria-hidden />
              <input
                type="search"
                placeholder="Buscar documento"
                value={searchDocuments}
                onChange={(e) => setSearchDocuments(e.target.value)}
                className="flex-1 min-w-0 border-0 p-0 outline-none bg-transparent"
                style={{ fontSize: "14px", color: "#1C2B38" }}
              />
            </div>
          </form>
        </div>
      )}

      <style>{`
        .topbarIconLink { color: #5C6B7A !important; }
        .topbarIconLink:hover { color: ${iconHoverColor} !important; }
        .topbarIconLink:active { color: var(--regu-navy) !important; }
      `}</style>
    </div>
  );
}

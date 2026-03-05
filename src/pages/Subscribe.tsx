import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronUp, Mail, Linkedin, Twitter, Rss } from "lucide-react";

const PAGE_BG = "#F6F7FB";
const BORDER = "#E3E6EE";
const INPUT_BORDER = "#D8DDE6";
const BODY_BG = "#F3F4F8";
const TEXT_GRAY = "#6B7280";
const ACCENT = "var(--news-accent)";

function SubscribeAccordion({
  title,
  open,
  onToggle,
  children,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="subscribe-accordion rounded-xl border overflow-hidden"
      style={{
        borderColor: BORDER,
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
      }}
    >
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 text-left px-5 py-4 transition-colors hover:bg-gray-50/80"
        style={{
          background: "#FFFFFF",
          borderBottom: open ? `1px solid ${BORDER}` : "none",
          fontSize: "1rem",
          fontWeight: 500,
          color: "#1C1C1C",
        }}
        aria-expanded={open}
      >
        <span className="flex items-center gap-3">
          {open ? (
            <ChevronUp style={{ width: 20, height: 20, color: TEXT_GRAY }} aria-hidden />
          ) : (
            <ChevronDown style={{ width: 20, height: 20, color: TEXT_GRAY }} aria-hidden />
          )}
          {title}
        </span>
      </button>
      {open && (
        <div
          className="px-6 py-6"
          style={{
            background: BODY_BG,
            borderColor: BORDER,
            fontSize: "0.875rem",
            lineHeight: 1.6,
            color: TEXT_GRAY,
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}

export default function Subscribe() {
  const [accordion1, setAccordion1] = useState(true);
  const [accordion2, setAccordion2] = useState(true);

  const [email, setEmail] = useState("");
  const [agree1, setAgree1] = useState(false);
  const [mediaName, setMediaName] = useState("");
  const [mediaSurname, setMediaSurname] = useState("");
  const [mediaOutlet, setMediaOutlet] = useState("");
  const [mediaCountry, setMediaCountry] = useState("");
  const [mediaEmail, setMediaEmail] = useState("");
  const [agree2, setAgree2] = useState(false);

  const handleWebsiteSubmit = (e: FormEvent) => {
    e.preventDefault();
    // TODO: conectar con API de suscripción
  };

  const handleMediaSubmit = (e: FormEvent) => {
    e.preventDefault();
    // TODO: conectar con API de lista de medios
  };

  const inputClass =
    "w-full border rounded-lg px-4 outline-none transition-colors focus:ring-2 focus:ring-offset-0 focus-visible:ring-[var(--news-accent)]";
  const inputStyle = {
    height: "2.75rem",
    borderColor: INPUT_BORDER,
    fontSize: "0.875rem",
    color: "#1C1C1C",
  };
  const labelStyle = { fontSize: "0.8125rem", fontWeight: 600, color: "#374151", marginBottom: "0.375rem" };

  return (
    <div className="min-h-screen" style={{ background: PAGE_BG }}>
      <div
        className="mx-auto px-4 md:px-6 pt-8 pb-16"
        style={{ maxWidth: "980px", paddingTop: "36px", paddingBottom: "60px" }}
      >
        {/* Breadcrumbs */}
        <nav
          className="mb-6"
          aria-label="Breadcrumb"
          style={{ fontSize: "0.8125rem", color: TEXT_GRAY }}
        >
          <Link to="/" className="hover:underline" style={{ color: TEXT_GRAY }}>
            Inicio
          </Link>
          <span className="mx-2" aria-hidden>›</span>
          <span style={{ color: "#374151" }}>Suscribirse</span>
        </nav>

        {/* H1 */}
        <h1
          className="mb-10"
          style={{
            fontSize: "clamp(2rem, 4vw, 3rem)",
            fontWeight: 400,
            color: "#1C1C1C",
            letterSpacing: "-0.02em",
            lineHeight: 1.15,
          }}
        >
          Suscribirse
        </h1>

        {/* Accordion 1: Actualizaciones del sitio */}
        <SubscribeAccordion
          title="Suscribirse a las actualizaciones del sitio"
          open={accordion1}
          onToggle={() => setAccordion1((v) => !v)}
        >
          <p className="mb-4" style={{ color: TEXT_GRAY }}>
            Manténgase informado sobre las últimas noticias, publicaciones y eventos de REGULATEL.
            Introduzca su correo electrónico para recibir nuestras actualizaciones.
          </p>
          <p className="mb-6" style={{ color: TEXT_GRAY }}>
            Puede darse de baja en cualquier momento haciendo clic en el enlace del pie de nuestros
            correos.
          </p>
          <form onSubmit={handleWebsiteSubmit} className="space-y-5">
            <div>
              <label htmlFor="subscribe-email" className="block" style={labelStyle}>
                Correo electrónico <span style={{ color: "#DC2626" }}>*</span>
              </label>
              <input
                id="subscribe-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                style={inputStyle}
                placeholder="su@correo.com"
              />
            </div>
            <div className="flex items-start gap-3">
              <input
                id="agree-website"
                type="checkbox"
                required
                checked={agree1}
                onChange={(e) => setAgree1(e.target.checked)}
                className="mt-1 rounded border-gray-300"
                style={{ accentColor: ACCENT }}
              />
              <label htmlFor="agree-website" className="text-sm" style={{ color: TEXT_GRAY }}>
                He leído y acepto el tratamiento de mis datos personales conforme a la política de
                privacidad de REGULATEL. <span style={{ color: "#DC2626" }}>*</span>
              </label>
            </div>
            <p className="text-sm">
              <Link
                to="/pendiente/privacidad"
                className="underline hover:no-underline"
                style={{ color: ACCENT }}
              >
                Declaración de privacidad
              </Link>
            </p>
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-lg font-semibold uppercase tracking-wide text-white transition hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              style={{
                height: "2.75rem",
                paddingLeft: "1.375rem",
                paddingRight: "1.375rem",
                background: ACCENT,
                fontSize: "0.8125rem",
                letterSpacing: "0.06em",
              }}
            >
              Suscribirse
            </button>
          </form>
        </SubscribeAccordion>

        {/* Spacer between accordions */}
        <div style={{ height: "24px" }} />

        {/* Accordion 2: Lista de medios */}
        <SubscribeAccordion
          title="Suscribirse a nuestra lista de medios"
          open={accordion2}
          onToggle={() => setAccordion2((v) => !v)}
        >
          <p className="mb-4" style={{ color: TEXT_GRAY }}>
            Si es periodista o representante de medios, suscríbase a nuestra lista para recibir
            comunicados de prensa y comunicaciones oficiales.
          </p>
          <p className="mb-6" style={{ color: TEXT_GRAY }}>
            Todos los campos marcados con asterisco (*) son obligatorios.
          </p>
          <form onSubmit={handleMediaSubmit} className="space-y-5">
            <div>
              <label htmlFor="media-name" className="block" style={labelStyle}>
                Nombre <span style={{ color: "#DC2626" }}>*</span>
              </label>
              <input
                id="media-name"
                type="text"
                required
                value={mediaName}
                onChange={(e) => setMediaName(e.target.value)}
                className={inputClass}
                style={inputStyle}
              />
            </div>
            <div>
              <label htmlFor="media-surname" className="block" style={labelStyle}>
                Apellido <span style={{ color: "#DC2626" }}>*</span>
              </label>
              <input
                id="media-surname"
                type="text"
                required
                value={mediaSurname}
                onChange={(e) => setMediaSurname(e.target.value)}
                className={inputClass}
                style={inputStyle}
              />
            </div>
            <div>
              <label htmlFor="media-outlet" className="block" style={labelStyle}>
                Medio de comunicación <span style={{ color: "#DC2626" }}>*</span>
              </label>
              <input
                id="media-outlet"
                type="text"
                required
                value={mediaOutlet}
                onChange={(e) => setMediaOutlet(e.target.value)}
                className={inputClass}
                style={inputStyle}
                placeholder="ej. Periódico, canal de TV"
              />
            </div>
            <div>
              <label htmlFor="media-country" className="block" style={labelStyle}>
                País <span style={{ color: "#DC2626" }}>*</span>
              </label>
              <input
                id="media-country"
                type="text"
                required
                value={mediaCountry}
                onChange={(e) => setMediaCountry(e.target.value)}
                className={inputClass}
                style={inputStyle}
              />
            </div>
            <div>
              <label htmlFor="media-email" className="block" style={labelStyle}>
                Correo electrónico (laboral o personal) <span style={{ color: "#DC2626" }}>*</span>
              </label>
              <input
                id="media-email"
                type="email"
                required
                value={mediaEmail}
                onChange={(e) => setMediaEmail(e.target.value)}
                className={inputClass}
                style={inputStyle}
              />
            </div>
            <div className="flex items-start gap-3">
              <input
                id="agree-media"
                type="checkbox"
                required
                checked={agree2}
                onChange={(e) => setAgree2(e.target.checked)}
                className="mt-1 rounded border-gray-300"
                style={{ accentColor: ACCENT }}
              />
              <label htmlFor="agree-media" className="text-sm" style={{ color: TEXT_GRAY }}>
                He leído y acepto el tratamiento de mis datos personales conforme a la política de
                privacidad de REGULATEL. <span style={{ color: "#DC2626" }}>*</span>
              </label>
            </div>
            <p className="text-sm">
              <Link
                to="/pendiente/privacidad"
                className="underline hover:no-underline"
                style={{ color: ACCENT }}
              >
                Declaración de privacidad
              </Link>
            </p>
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-lg font-semibold uppercase tracking-wide text-white transition hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              style={{
                height: "2.75rem",
                paddingLeft: "1.375rem",
                paddingRight: "1.375rem",
                background: ACCENT,
                fontSize: "0.8125rem",
                letterSpacing: "0.06em",
              }}
            >
              Suscribirse
            </button>
          </form>
        </SubscribeAccordion>

        {/* SHARE */}
        <div
          className="flex flex-col items-center text-center mt-12"
          style={{ marginTop: "48px", paddingBottom: "24px" }}
        >
          <p
            className="mb-4 uppercase tracking-widest text-xs"
            style={{ fontWeight: 600, color: TEXT_GRAY }}
          >
            Compartir
          </p>
          <div className="flex items-center gap-6 share-icons" style={{ color: TEXT_GRAY }}>
            <a
              href="mailto:?subject=REGULATEL Suscribirse"
              aria-label="Compartir por correo"
              className="transition-colors"
              style={{ color: "inherit" }}
            >
              <Mail style={{ width: 22, height: 22 }} />
            </a>
            <a
              href="https://www.linkedin.com/company/regulatel"
              target="_blank"
              rel="noreferrer noopener"
              aria-label="LinkedIn"
              className="transition-colors"
              style={{ color: "inherit" }}
            >
              <Linkedin style={{ width: 22, height: 22 }} />
            </a>
            <a
              href="https://x.com/regulatel"
              target="_blank"
              rel="noreferrer noopener"
              aria-label="X (Twitter)"
              className="transition-colors"
              style={{ color: "inherit" }}
            >
              <Twitter style={{ width: 22, height: 22 }} />
            </a>
            <a
              href="/feed"
              aria-label="RSS"
              className="transition-colors"
              style={{ color: "inherit" }}
            >
              <Rss style={{ width: 22, height: 22 }} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

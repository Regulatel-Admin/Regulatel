import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronUp, Mail, Linkedin, Twitter, Rss, Send, Bell } from "lucide-react";

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
      className="overflow-hidden rounded-2xl border bg-white"
      style={{
        borderColor: "rgba(22,61,89,0.10)",
        boxShadow: "0 2px 8px rgba(22,61,89,0.06)",
        borderTop: "3px solid var(--regu-blue)",
      }}
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left transition hover:bg-[rgba(68,137,198,0.03)]"
        style={{
          fontSize: "1rem",
          fontWeight: 600,
          color: "var(--regu-navy)",
          fontFamily: "var(--token-font-heading)",
        }}
        aria-expanded={open}
      >
        <span className="flex items-center gap-3">
          {open ? (
            <ChevronUp size={20} style={{ color: "var(--regu-blue)" }} aria-hidden />
          ) : (
            <ChevronDown size={20} style={{ color: "var(--regu-gray-400)" }} aria-hidden />
          )}
          {title}
        </span>
      </button>
      {open && (
        <div
          className="border-t px-6 py-6"
          style={{
            borderColor: "rgba(22,61,89,0.08)",
            backgroundColor: "#FAFBFC",
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}

export default function Subscribe() {
  const [accordionOpen, setAccordionOpen] = useState(true);
  const [email, setEmail] = useState("");
  const [agree, setAgree] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch("/api/route/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setStatus("success");
        setMessage("Gracias por suscribirte. Recibirás noticias, eventos y publicaciones de REGULATEL por correo.");
        setEmail("");
        setAgree(false);
      } else {
        setStatus("error");
        setMessage(typeof data.error === "string" ? data.error : "No se pudo completar la suscripción. Intente de nuevo.");
      }
    } catch {
      setStatus("error");
      setMessage("Error de conexión. Intente más tarde.");
    }
  };

  const inputClass =
    "w-full rounded-xl border py-3 px-4 text-base transition focus:outline-none focus:ring-2 focus:ring-[rgba(68,137,198,0.30)] focus:bg-white disabled:opacity-70";
  const inputStyle = {
    borderColor: "rgba(22,61,89,0.12)",
    backgroundColor: "#F4F6F8",
    color: "var(--regu-navy)",
  } as const;
  const labelStyle = {
    fontSize: "0.625rem",
    fontWeight: 700,
    letterSpacing: "0.10em",
    textTransform: "uppercase" as const,
    color: "var(--regu-gray-500)",
    marginBottom: "0.5rem",
  };

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: "#FAFBFC",
        borderTop: "1px solid rgba(22,61,89,0.07)",
        fontFamily: "var(--token-font-body)",
      }}
    >
      <div style={{ height: 4, background: "var(--regu-blue)", width: "100%" }} aria-hidden />

      <div className="mx-auto px-4 pb-16 pt-10 md:pt-14" style={{ maxWidth: 820 }}>
        <nav
          className="mb-6 flex items-center gap-2 text-sm"
          aria-label="Breadcrumb"
          style={{ color: "var(--regu-gray-400)" }}
        >
          <Link to="/" className="hover:underline" style={{ color: "var(--regu-gray-500)" }}>
            Inicio
          </Link>
          <span aria-hidden>/</span>
          <span style={{ color: "var(--regu-blue)", fontWeight: 600 }}>Suscribirse</span>
        </nav>

        <header className="mb-10">
          <p
            style={{
              fontSize: "0.625rem",
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--regu-gray-400)",
              marginBottom: 10,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <Bell size={12} style={{ color: "var(--regu-blue)" }} />
            Actualizaciones REGULATEL
          </p>
          <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
            <div
              style={{
                width: 4,
                minHeight: 36,
                borderRadius: 2,
                background: "var(--regu-blue)",
                flexShrink: 0,
                marginTop: 4,
              }}
            />
            <div>
              <h1
                style={{
                  fontSize: "clamp(1.5rem, 3.5vw, 2rem)",
                  fontWeight: 700,
                  color: "var(--regu-navy)",
                  lineHeight: 1.2,
                  margin: 0,
                  fontFamily: "var(--token-font-heading)",
                }}
              >
                Suscribirse a actualizaciones
              </h1>
              <p
                style={{
                  marginTop: 8,
                  fontSize: "0.9375rem",
                  lineHeight: 1.6,
                  color: "var(--regu-gray-500)",
                  maxWidth: 520,
                }}
              >
                Reciba noticias, eventos y comunicados de REGULATEL por correo electrónico. Puede darse de baja en cualquier momento.
              </p>
            </div>
          </div>
        </header>

        <div className="space-y-6">
          <SubscribeAccordion
            title="Actualizaciones del sitio"
            open={accordionOpen}
            onToggle={() => setAccordionOpen((v) => !v)}
          >
            <p className="mb-4 text-sm leading-relaxed" style={{ color: "var(--regu-gray-600)" }}>
              Manténgase informado sobre las últimas noticias, publicaciones y eventos de REGULATEL. Todos los campos marcados con * son obligatorios.
            </p>
            {status === "success" && (
              <div
                className="mb-4 rounded-xl border border-[var(--regu-blue)] px-4 py-3 text-sm"
                style={{ backgroundColor: "rgba(68,137,198,0.08)", color: "var(--regu-navy)" }}
              >
                {message}
              </div>
            )}
            {status === "error" && (
              <div
                className="mb-4 rounded-xl border border-red-300 px-4 py-3 text-sm text-red-800"
                style={{ backgroundColor: "#fef2f2" }}
              >
                {message}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="subscribe-email" className="block" style={labelStyle}>
                  Correo electrónico <span style={{ color: "var(--regu-blue)" }}>*</span>
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
                  disabled={status === "loading"}
                />
              </div>
              <div className="flex items-start gap-3">
                <input
                  id="agree-privacy"
                  type="checkbox"
                  required
                  checked={agree}
                  onChange={(e) => setAgree(e.target.checked)}
                  className="mt-1 rounded border-gray-300"
                  style={{ accentColor: "var(--regu-blue)" }}
                  disabled={status === "loading"}
                />
                <label htmlFor="agree-privacy" className="text-sm" style={{ color: "var(--regu-gray-600)" }}>
                  He leído y acepto el tratamiento de mis datos personales conforme a la{" "}
                  <Link to="/declaracion-de-privacidad" className="font-semibold underline" style={{ color: "var(--regu-blue)" }}>
                    declaración de privacidad
                  </Link>{" "}
                  de REGULATEL. <span style={{ color: "var(--regu-blue)" }}>*</span>
                </label>
              </div>
              <button
                type="submit"
                disabled={status === "loading"}
                className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-bold text-white transition hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-[rgba(68,137,198,0.40)] focus:ring-offset-2 disabled:opacity-70"
                style={{ backgroundColor: "var(--regu-blue)" }}
              >
                <Send size={16} />
                {status === "loading" ? "Enviando…" : "Suscribirse a actualizaciones"}
              </button>
            </form>
          </SubscribeAccordion>
        </div>

        <div
          className="mt-12 overflow-hidden rounded-2xl border px-6 py-6 text-center"
          style={{
            borderColor: "rgba(22,61,89,0.10)",
            backgroundColor: "#fff",
            boxShadow: "0 2px 8px rgba(22,61,89,0.04)",
            borderTop: "3px solid var(--regu-blue)",
          }}
        >
          <p
            className="mb-4 text-[10px] font-bold uppercase tracking-wider"
            style={{ color: "var(--regu-gray-500)" }}
          >
            Compartir
          </p>
          <div className="flex items-center justify-center gap-6" style={{ color: "var(--regu-gray-500)" }}>
            <a
              href="mailto:?subject=REGULATEL Suscribirse"
              aria-label="Compartir por correo"
              className="transition-colors hover:text-[var(--regu-blue)]"
            >
              <Mail size={22} />
            </a>
            <a
              href="https://www.linkedin.com/company/regulatel"
              target="_blank"
              rel="noreferrer noopener"
              aria-label="LinkedIn"
              className="transition-colors hover:text-[var(--regu-blue)]"
            >
              <Linkedin size={22} />
            </a>
            <a
              href="https://x.com/regulatel"
              target="_blank"
              rel="noreferrer noopener"
              aria-label="X (Twitter)"
              className="transition-colors hover:text-[var(--regu-blue)]"
            >
              <Twitter size={22} />
            </a>
            <a
              href="/feed"
              aria-label="RSS"
              className="transition-colors hover:text-[var(--regu-blue)]"
            >
              <Rss size={22} />
            </a>
          </div>
        </div>

        <div
          className="mt-10 flex flex-wrap gap-4 border-t pt-8"
          style={{ borderColor: "rgba(22,61,89,0.08)" }}
        >
          <Link
            to="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 16px",
              borderRadius: 8,
              border: "1px solid rgba(22,61,89,0.12)",
              background: "#fff",
              fontSize: "0.8125rem",
              fontWeight: 600,
              color: "var(--regu-gray-700)",
              textDecoration: "none",
            }}
            className="hover:border-[var(--regu-blue)] hover:text-[var(--regu-blue)]"
          >
            ← Volver a inicio
          </Link>
          <Link
            to="/contacto"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 16px",
              borderRadius: 8,
              background: "var(--regu-blue)",
              fontSize: "0.8125rem",
              fontWeight: 600,
              color: "#fff",
              textDecoration: "none",
            }}
          >
            Contacto →
          </Link>
        </div>
      </div>
    </div>
  );
}

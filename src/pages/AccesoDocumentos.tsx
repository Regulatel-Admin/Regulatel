import { useState, FormEvent, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Lock, ArrowLeft, Mail, KeyRound } from "lucide-react";
import { getRestrictedDocument, markRestrictedUnlocked } from "@/config/restrictedDocuments";
import { api } from "@/lib/api";

export default function AccesoDocumentos() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const docId = searchParams.get("doc");
  const document = getRestrictedDocument(docId);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const docRes = await api.documentAccess.session();
      if (cancelled) return;
      if (docRes.ok && docRes.data?.ok) {
        setCheckingSession(false);
        if (document) {
          markRestrictedUnlocked(document.id);
          navigate(document.redirectUrl, { replace: true });
        } else {
          navigate("/gestion?tipo=planes-actas", { replace: true });
        }
        return;
      }
      const adminRes = await api.admin.session();
      if (cancelled) return;
      setCheckingSession(false);
      if (adminRes.ok && adminRes.data?.authenticated && adminRes.data?.user) {
        if (document) {
          markRestrictedUnlocked(document.id);
          navigate(document.redirectUrl, { replace: true });
        } else {
          navigate("/gestion?tipo=planes-actas", { replace: true });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [document?.id, navigate, document?.redirectUrl]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim()) {
      setError(t("pages.accesoDocumentos.enterEmail"));
      return;
    }
    if (!password) {
      setError(t("pages.accesoDocumentos.enterPassword"));
      return;
    }
    setSubmitting(true);
    const res = await api.documentAccess.login({ email: email.trim(), password });
    setSubmitting(false);
    if (res.ok && res.data?.ok) {
      if (document) {
        markRestrictedUnlocked(document.id);
        navigate(document.redirectUrl);
      } else {
        navigate("/gestion?tipo=planes-actas");
      }
    } else {
      setError(res.ok ? t("pages.accesoDocumentos.unexpectedError") : (res.error ?? t("pages.accesoDocumentos.invalidCredentials")));
    }
  };

  if (checkingSession) {
    return (
      <div
        className="flex min-h-screen w-full items-center justify-center py-16"
        style={{ fontFamily: "var(--token-font-body)", backgroundColor: "#FAFBFC" }}
      >
        <p className="text-sm font-medium" style={{ color: "var(--regu-gray-500)" }}>
          {t("pages.accesoDocumentos.checkingSession")}
        </p>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen w-full"
      style={{
        fontFamily: "var(--token-font-body)",
        backgroundColor: "#FAFBFC",
        borderTop: "1px solid rgba(22,61,89,0.07)",
      }}
    >
      <div style={{ height: 4, background: "var(--regu-blue)", width: "100%" }} aria-hidden />

      <div className="mx-auto px-4 py-12 md:py-16" style={{ maxWidth: 440 }}>
        <div className="mb-8 text-center">
          <div
            className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
            style={{ backgroundColor: "rgba(68,137,198,0.12)" }}
          >
            <Lock className="h-7 w-7" style={{ color: "var(--regu-blue)" }} aria-hidden />
          </div>
          <h1
            className="text-xl font-bold md:text-2xl"
            style={{ color: "var(--regu-navy)", fontFamily: "var(--token-font-heading)" }}
          >
            {t("pages.accesoDocumentos.restrictedTitle")}
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--regu-gray-500)" }}>
            {t("pages.accesoDocumentos.subtitle")}
          </p>
          {document && (
            <p className="mt-2 text-sm font-medium" style={{ color: "var(--regu-blue)" }}>
              {document.title}
            </p>
          )}
        </div>

        <div
          className="overflow-hidden rounded-2xl border bg-white shadow-[0_4px_20px_rgba(22,61,89,0.08)]"
          style={{ borderColor: "rgba(22,61,89,0.10)", borderTop: "3px solid var(--regu-blue)" }}
        >
          <div className="p-6 md:p-8">
            <p className="mb-6 text-sm leading-relaxed" style={{ color: "var(--regu-gray-600)" }}>
              {t("pages.accesoDocumentos.intro")}
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="acceso-email"
                  className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider"
                  style={{ color: "var(--regu-gray-500)" }}
                >
                  {t("pages.accesoDocumentos.emailLabel")} <span style={{ color: "var(--regu-blue)" }}>*</span>
                </label>
                <div className="relative">
                  <Mail
                    className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2"
                    style={{ color: "var(--regu-gray-400)" }}
                    aria-hidden
                  />
                  <input
                    id="acceso-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    placeholder={t("pages.accesoDocumentos.emailPlaceholder")}
                    className="w-full rounded-xl border py-3 pl-10 pr-4 text-base transition focus:outline-none focus:ring-2 focus:ring-[rgba(68,137,198,0.30)] disabled:opacity-70"
                    style={{
                      borderColor: "rgba(22,61,89,0.12)",
                      backgroundColor: "#F4F6F8",
                      color: "var(--regu-navy)",
                    }}
                    disabled={submitting}
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="acceso-password"
                  className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider"
                  style={{ color: "var(--regu-gray-500)" }}
                >
                  {t("pages.accesoDocumentos.passwordLabel")} <span style={{ color: "var(--regu-blue)" }}>*</span>
                </label>
                <div className="relative">
                  <KeyRound
                    className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2"
                    style={{ color: "var(--regu-gray-400)" }}
                    aria-hidden
                  />
                  <input
                    id="acceso-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    placeholder={t("pages.accesoDocumentos.passwordLabel")}
                    className="w-full rounded-xl border py-3 pl-10 pr-4 text-base transition focus:outline-none focus:ring-2 focus:ring-[rgba(68,137,198,0.30)] disabled:opacity-70"
                    style={{
                      borderColor: "rgba(22,61,89,0.12)",
                      backgroundColor: "#F4F6F8",
                      color: "var(--regu-navy)",
                    }}
                    disabled={submitting}
                  />
                </div>
              </div>

              {error && (
                <div
                  className="rounded-xl px-4 py-3 text-sm font-medium"
                  style={{ backgroundColor: "rgba(185,28,28,0.08)", color: "#B91C1C" }}
                >
                  {error}
                </div>
              )}

              <div className="flex flex-col gap-3 pt-1 sm:flex-row">
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-bold text-white transition hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-[rgba(68,137,198,0.40)] focus:ring-offset-2 disabled:opacity-70"
                  style={{ backgroundColor: "var(--regu-blue)" }}
                >
                  {submitting ? t("pages.accesoDocumentos.verifying") : t("pages.accesoDocumentos.enter")}
                </button>
                <Link
                  to="/gestion?tipo=planes-actas"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border-2 px-5 py-3.5 text-sm font-bold transition focus:outline-none focus:ring-2 focus:ring-[var(--regu-blue)] focus:ring-offset-2"
                  style={{
                    borderColor: "rgba(22,61,89,0.15)",
                    color: "var(--regu-gray-700)",
                  }}
                >
                  <ArrowLeft className="h-4 w-4" aria-hidden />
                  {t("pages.accesoDocumentos.backToGestion")}
                </Link>
              </div>
            </form>
          </div>
        </div>

        <p className="mt-6 text-center text-xs" style={{ color: "var(--regu-gray-400)" }}>
          <Link to="/contacto" className="underline hover:no-underline" style={{ color: "var(--regu-blue)" }}>
            {t("pages.accesoDocumentos.contactAdmin")}
          </Link>
        </p>
      </div>
    </div>
  );
}

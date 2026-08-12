import { useState, FormEvent, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Lock, ArrowLeft, Mail, KeyRound, UserPlus, Building2, User } from "lucide-react";
import {
  getRestrictedCollection,
  getRestrictedDocument,
  markAllRestrictedUnlocked,
  markRestrictedUnlocked,
} from "@/config/restrictedDocuments";
import { api } from "@/lib/api";

export default function AccesoDocumentos() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const docId = searchParams.get("doc");
  const tipo = searchParams.get("tipo");
  const startInRequest = searchParams.get("solicitar") === "1";
  const document = getRestrictedDocument(docId);
  const collection = getRestrictedCollection(tipo);
  const fallbackUrl = collection?.redirectUrl ?? "/gestion?tipo=planes-actas";

  const goAfterUnlock = () => {
    markAllRestrictedUnlocked();
    if (document) {
      markRestrictedUnlocked(document.id);
      navigate(document.redirectUrl, { replace: true });
    } else {
      navigate(fallbackUrl, { replace: true });
    }
  };

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [reqName, setReqName] = useState("");
  const [reqEmail, setReqEmail] = useState("");
  const [reqInstitution, setReqInstitution] = useState("");
  const [reqPosition, setReqPosition] = useState("");
  const [reqCountry, setReqCountry] = useState("");
  const [reqError, setReqError] = useState("");
  const [reqSuccess, setReqSuccess] = useState("");
  const [reqSubmitting, setReqSubmitting] = useState(false);
  const [mode, setMode] = useState<"login" | "request">(startInRequest ? "request" : "login");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const docRes = await api.documentAccess.session();
      if (cancelled) return;
      if (docRes.ok && docRes.data?.ok) {
        setCheckingSession(false);
        goAfterUnlock();
        return;
      }
      const adminRes = await api.admin.session();
      if (cancelled) return;
      setCheckingSession(false);
      if (adminRes.ok && adminRes.data?.authenticated && adminRes.data?.user) {
        goAfterUnlock();
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [document?.id, document?.redirectUrl, fallbackUrl, navigate]);

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
      goAfterUnlock();
    } else {
      setError(res.ok ? t("pages.accesoDocumentos.unexpectedError") : (res.error ?? t("pages.accesoDocumentos.invalidCredentials")));
    }
  };

  const handleRequestAccess = async (e: FormEvent) => {
    e.preventDefault();
    setReqError("");
    setReqSuccess("");
    if (!reqName.trim()) {
      setReqError(t("pages.accesoDocumentos.requestNameRequired"));
      return;
    }
    if (!reqEmail.trim()) {
      setReqError(t("pages.accesoDocumentos.enterEmail"));
      return;
    }
    if (!reqInstitution.trim()) {
      setReqError(t("pages.accesoDocumentos.requestInstitutionRequired"));
      return;
    }
    if (!reqPosition.trim()) {
      setReqError(t("pages.accesoDocumentos.requestPositionRequired"));
      return;
    }
    if (!reqCountry.trim()) {
      setReqError(t("pages.accesoDocumentos.requestCountryRequired"));
      return;
    }
    setReqSubmitting(true);
    const res = await api.documentAccess.requestAccess({
      name: reqName.trim(),
      email: reqEmail.trim(),
      institution: reqInstitution.trim() || undefined,
      position: reqPosition.trim() || undefined,
      country: reqCountry.trim() || undefined,
      documentId: document?.id ?? undefined,
      documentTitle: document?.title ?? collection?.title ?? undefined,
      collectionTipo: tipo ?? undefined,
    });
    setReqSubmitting(false);
    if (res.ok) {
      setReqSuccess(res.data.message ?? t("pages.accesoDocumentos.requestSent"));
      setReqName("");
      setReqEmail("");
      setReqInstitution("");
      setReqPosition("");
      setReqCountry("");
    } else {
      const raw = res.error ?? t("pages.accesoDocumentos.unexpectedError");
      const isLocalHost =
        typeof window !== "undefined" &&
        (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
      const isMissingApi =
        isLocalHost &&
        (raw === "Not Found" ||
          raw.toLowerCase().includes("not found") ||
          raw.toLowerCase().includes("página en lugar de datos"));
      setReqError(isMissingApi ? t("pages.accesoDocumentos.requestApiUnavailable") : raw);
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
          {(document || collection) && (
            <p className="mt-2 text-sm font-medium" style={{ color: "var(--regu-blue)" }}>
              {document?.title ?? collection?.title}
            </p>
          )}
        </div>

        <div
          className="overflow-hidden rounded-2xl border bg-white shadow-[0_4px_20px_rgba(22,61,89,0.08)]"
          style={{ borderColor: "rgba(22,61,89,0.10)", borderTop: "3px solid var(--regu-blue)" }}
        >
          <div className="p-6 md:p-8">
            {mode === "login" ? (
              <>
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
                  to={fallbackUrl}
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
            <button
              type="button"
              onClick={() => { setMode("request"); setError(""); }}
              className="mt-5 w-full text-center text-sm font-semibold underline hover:no-underline"
              style={{ color: "var(--regu-blue)" }}
            >
              {t("pages.accesoDocumentos.switchToRequest")}
            </button>
              </>
            ) : (
              <>
            <h2
              className="mb-2 flex items-center gap-2 text-base font-bold"
              style={{ color: "var(--regu-navy)", fontFamily: "var(--token-font-heading)" }}
            >
              <UserPlus className="h-5 w-5" style={{ color: "var(--regu-blue)" }} />
              {t("pages.accesoDocumentos.requestTitle")}
            </h2>
            <p className="mb-5 text-sm leading-relaxed" style={{ color: "var(--regu-gray-600)" }}>
              {t("pages.accesoDocumentos.requestIntro")}
            </p>
            <form onSubmit={handleRequestAccess} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--regu-gray-500)" }}>
                  {t("pages.accesoDocumentos.nameLabel")} <span style={{ color: "var(--regu-blue)" }}>*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2" style={{ color: "var(--regu-gray-400)" }} aria-hidden />
                  <input
                    type="text"
                    value={reqName}
                    onChange={(e) => setReqName(e.target.value)}
                    className="w-full rounded-xl border py-3 pl-10 pr-4 text-base"
                    style={{ borderColor: "rgba(22,61,89,0.12)", backgroundColor: "#F4F6F8", color: "var(--regu-navy)" }}
                    disabled={reqSubmitting}
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--regu-gray-500)" }}>
                  {t("pages.accesoDocumentos.emailLabel")} <span style={{ color: "var(--regu-blue)" }}>*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2" style={{ color: "var(--regu-gray-400)" }} aria-hidden />
                  <input
                    type="email"
                    value={reqEmail}
                    onChange={(e) => setReqEmail(e.target.value)}
                    placeholder={t("pages.accesoDocumentos.emailPlaceholder")}
                    className="w-full rounded-xl border py-3 pl-10 pr-4 text-base"
                    style={{ borderColor: "rgba(22,61,89,0.12)", backgroundColor: "#F4F6F8", color: "var(--regu-navy)" }}
                    disabled={reqSubmitting}
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--regu-gray-500)" }}>
                  {t("pages.accesoDocumentos.institutionLabel")} <span style={{ color: "var(--regu-blue)" }}>*</span>
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2" style={{ color: "var(--regu-gray-400)" }} aria-hidden />
                  <input
                    type="text"
                    value={reqInstitution}
                    onChange={(e) => setReqInstitution(e.target.value)}
                    className="w-full rounded-xl border py-3 pl-10 pr-4 text-base"
                    style={{ borderColor: "rgba(22,61,89,0.12)", backgroundColor: "#F4F6F8", color: "var(--regu-navy)" }}
                    disabled={reqSubmitting}
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--regu-gray-500)" }}>
                    {t("pages.accesoDocumentos.positionLabel")} <span style={{ color: "var(--regu-blue)" }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={reqPosition}
                    onChange={(e) => setReqPosition(e.target.value)}
                    className="w-full rounded-xl border px-4 py-3 text-base"
                    style={{ borderColor: "rgba(22,61,89,0.12)", backgroundColor: "#F4F6F8", color: "var(--regu-navy)" }}
                    disabled={reqSubmitting}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--regu-gray-500)" }}>
                    {t("pages.accesoDocumentos.countryLabel")} <span style={{ color: "var(--regu-blue)" }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={reqCountry}
                    onChange={(e) => setReqCountry(e.target.value)}
                    className="w-full rounded-xl border px-4 py-3 text-base"
                    style={{ borderColor: "rgba(22,61,89,0.12)", backgroundColor: "#F4F6F8", color: "var(--regu-navy)" }}
                    disabled={reqSubmitting}
                  />
                </div>
              </div>
              {reqError && (
                <div className="rounded-xl px-4 py-3 text-sm font-medium" style={{ backgroundColor: "rgba(185,28,28,0.08)", color: "#B91C1C" }}>
                  {reqError}
                </div>
              )}
              {reqSuccess && (
                <div className="rounded-xl px-4 py-3 text-sm font-medium" style={{ backgroundColor: "rgba(15,118,110,0.10)", color: "#0f766e" }}>
                  {reqSuccess}
                </div>
              )}
              <button
                type="submit"
                disabled={reqSubmitting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-bold text-white disabled:opacity-70"
                style={{ backgroundColor: "var(--regu-blue)" }}
              >
                {reqSubmitting ? t("pages.accesoDocumentos.requestSending") : t("pages.accesoDocumentos.requestSubmit")}
              </button>
            </form>
            <button
              type="button"
              onClick={() => { setMode("login"); setReqError(""); }}
              className="mt-5 w-full text-center text-sm font-semibold underline hover:no-underline"
              style={{ color: "var(--regu-blue)" }}
            >
              {t("pages.accesoDocumentos.switchToLogin")}
            </button>
              </>
            )}
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

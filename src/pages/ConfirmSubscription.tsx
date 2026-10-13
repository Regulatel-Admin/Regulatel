import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Bell, CheckCircle2 } from "lucide-react";
import { api } from "@/lib/api";
import { formSecurityMessages } from "@/lib/formSecurityMessages";

export default function ConfirmSubscription() {
  const { t, i18n } = useTranslation();
  const copy = formSecurityMessages(i18n.language);
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token")?.trim() ?? "";
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  // Merely visiting an emailed URL must not activate a subscription: mail scanners follow links.
  useEffect(() => {
    setStatus("idle");
    setMessage("");
  }, [token]);

  const handleConfirm = async () => {
    if (!token || status === "loading" || status === "success") return;
    setStatus("loading");
    setMessage("");
    const response = await api.confirmSubscription.confirm(token);
    if (response.ok && response.data.ok) {
      setStatus("success");
      setMessage(copy.confirmSuccess);
    } else {
      setStatus("error");
      setMessage(response.ok ? copy.confirmError : response.error || copy.confirmError);
    }
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
        <nav className="mb-6 flex items-center gap-2 text-sm" aria-label={t("common.finalNavigation")} style={{ color: "var(--regu-gray-400)" }}>
          <Link to="/" className="hover:underline" style={{ color: "var(--regu-gray-500)" }}>
            {t("common.home")}
          </Link>
          <span aria-hidden>/</span>
          <span style={{ color: "var(--regu-blue)", fontWeight: 600 }}>{copy.confirmTitle}</span>
        </nav>

        <header className="mb-10">
          <p className="mb-2.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: "var(--regu-gray-400)" }}>
            <Bell size={12} style={{ color: "var(--regu-blue)" }} aria-hidden />
            {t("pages.subscribe.eyebrow")}
          </p>
          <h1 className="text-2xl font-bold md:text-[2rem]" style={{ color: "var(--regu-navy)", fontFamily: "var(--token-font-heading)" }}>
            {copy.confirmTitle}
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed" style={{ color: "var(--regu-gray-500)" }}>
            {copy.confirmDescription}
          </p>
        </header>

        <div
          className="rounded-2xl border bg-white px-6 py-8"
          style={{ borderColor: "rgba(22,61,89,0.10)", boxShadow: "0 2px 8px rgba(22,61,89,0.06)", borderTop: "3px solid var(--regu-blue)" }}
        >
          {status === "success" ? (
            <p className="flex items-start gap-3 text-sm" role="status" style={{ color: "var(--regu-navy)" }}>
              <CheckCircle2 size={22} className="shrink-0" style={{ color: "var(--regu-blue)" }} aria-hidden />
              {message}
            </p>
          ) : (
            <>
              {(!token || status === "error") && (
                <div className="mb-4 rounded-xl border border-red-300 px-4 py-3 text-sm text-red-800" role="alert" style={{ backgroundColor: "#fef2f2" }}>
                  {!token ? copy.confirmMissing : message}
                </div>
              )}
              {token && (
                <button
                  type="button"
                  onClick={() => void handleConfirm()}
                  disabled={status === "loading"}
                  className="inline-flex items-center justify-center rounded-xl px-5 py-3.5 text-sm font-bold text-white transition hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)] focus-visible:ring-offset-2 disabled:opacity-70"
                  style={{ backgroundColor: "var(--regu-blue)" }}
                >
                  {status === "loading" ? copy.confirming : copy.confirmButton}
                </button>
              )}
            </>
          )}
        </div>

        <Link to="/subscribe" className="mt-8 inline-flex text-sm font-semibold hover:opacity-80" style={{ color: "var(--regu-blue)" }}>
          {copy.confirmBack}
        </Link>
      </div>
    </div>
  );
}

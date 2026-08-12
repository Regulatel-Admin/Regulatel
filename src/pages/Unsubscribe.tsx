import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Bell } from "lucide-react";
import { api } from "@/lib/api";

export default function Unsubscribe() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const token = useMemo(() => searchParams.get("token")?.trim() ?? "", [searchParams]);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(token ? "idle" : "error");
  const [message, setMessage] = useState(token ? "" : t("pages.unsubscribe.missingToken"));

  const handleConfirm = async () => {
    if (!token) return;
    setStatus("loading");
    setMessage("");
    const res = await api.unsubscribe.confirm(token);
    if (res.ok) {
      setStatus("success");
      setMessage(t("pages.unsubscribe.success"));
    } else {
      setStatus("error");
      setMessage(res.error || t("pages.unsubscribe.error"));
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
        <nav className="mb-6 flex items-center gap-2 text-sm" aria-label="Breadcrumb" style={{ color: "var(--regu-gray-400)" }}>
          <Link to="/" className="hover:underline" style={{ color: "var(--regu-gray-500)" }}>
            {t("common.home")}
          </Link>
          <span aria-hidden>/</span>
          <span style={{ color: "var(--regu-blue)", fontWeight: 600 }}>{t("pages.unsubscribe.breadcrumb")}</span>
        </nav>

        <header className="mb-10">
          <p
            className="mb-2.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em]"
            style={{ color: "var(--regu-gray-400)" }}
          >
            <Bell size={12} style={{ color: "var(--regu-blue)" }} />
            {t("pages.subscribe.eyebrow")}
          </p>
          <h1
            className="text-2xl font-bold md:text-[2rem]"
            style={{ color: "var(--regu-navy)", fontFamily: "var(--token-font-heading)" }}
          >
            {t("pages.unsubscribe.title")}
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed" style={{ color: "var(--regu-gray-500)" }}>
            {t("pages.unsubscribe.description")}
          </p>
        </header>

        <div
          className="rounded-2xl border bg-white px-6 py-8"
          style={{
            borderColor: "rgba(22,61,89,0.10)",
            boxShadow: "0 2px 8px rgba(22,61,89,0.06)",
            borderTop: "3px solid var(--regu-blue)",
          }}
        >
          {status === "success" ? (
            <p className="text-sm" style={{ color: "var(--regu-navy)" }}>
              {message}
            </p>
          ) : (
            <>
              {status === "error" && message && (
                <div className="mb-4 rounded-xl border border-red-300 px-4 py-3 text-sm text-red-800" style={{ backgroundColor: "#fef2f2" }}>
                  {message}
                </div>
              )}
              {token && (
                <button
                  type="button"
                  onClick={() => void handleConfirm()}
                  disabled={status === "loading"}
                  className="inline-flex items-center justify-center rounded-xl px-5 py-3.5 text-sm font-bold text-white transition hover:opacity-95 disabled:opacity-70"
                  style={{ backgroundColor: "var(--regu-blue)" }}
                >
                  {status === "loading" ? t("pages.unsubscribe.submitting") : t("pages.unsubscribe.confirm")}
                </button>
              )}
            </>
          )}
        </div>

        <Link
          to="/subscribe"
          className="mt-8 inline-flex text-sm font-semibold hover:opacity-80"
          style={{ color: "var(--regu-blue)" }}
        >
          {t("pages.unsubscribe.backToSubscribe")}
        </Link>
      </div>
    </div>
  );
}

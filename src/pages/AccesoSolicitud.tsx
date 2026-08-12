import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, XCircle, Lock, Loader2 } from "lucide-react";
import { api } from "@/lib/api";

type RequestInfo = {
  name: string;
  email: string;
  institution: string | null;
  position: string | null;
  country: string | null;
  documentTitle: string | null;
  status: "pending" | "approved" | "denied";
};

export default function AccesoSolicitud() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token")?.trim() ?? "";
  const actionParam = searchParams.get("action") === "deny" ? "deny" : "approve";

  const [loading, setLoading] = useState(true);
  const [request, setRequest] = useState<RequestInfo | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string; approved?: boolean } | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!token) {
        setLoadError("El enlace no incluye un token válido.");
        setLoading(false);
        return;
      }
      const res = await api.documentAccess.getAccessRequest(token);
      if (cancelled) return;
      if (!res.ok) {
        setLoadError(res.error ?? "No se pudo cargar la solicitud.");
        setLoading(false);
        return;
      }
      setRequest({
        name: res.data.name,
        email: res.data.email,
        institution: res.data.institution,
        position: res.data.position,
        country: res.data.country,
        documentTitle: res.data.documentTitle,
        status: res.data.status,
      });
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const handleDecide = async (action: "approve" | "deny") => {
    if (!token || submitting) return;
    setSubmitting(true);
    const res = await api.documentAccess.decideAccessRequest({ token, action });
    setSubmitting(false);
    if (!res.ok) {
      setResult({ ok: false, message: res.error ?? "No se pudo registrar la decisión." });
      return;
    }
    setResult({
      ok: true,
      approved: res.data.status === "approved",
      message:
        res.data.status === "approved"
          ? `Acceso autorizado. Se envió un correo a ${res.data.email} con usuario y contraseña. Esa persona entra a www.regulatel.org/acceso-documentos, inicia sesión y ya puede ver las actas.`
          : `Solicitud denegada. Se avisó a ${res.data.email}.`,
    });
  };

  return (
    <div
      className="min-h-screen w-full"
      style={{ fontFamily: "var(--token-font-body)", backgroundColor: "#FAFBFC" }}
    >
      <div style={{ height: 4, background: "var(--regu-blue)", width: "100%" }} aria-hidden />
      <div className="mx-auto px-4 py-12 md:py-16" style={{ maxWidth: 520 }}>
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
            Decisión de acceso a actas
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--regu-gray-500)" }}>
            Autorice o deniegue la solicitud desde este enlace.
          </p>
        </div>

        <div
          className="overflow-hidden rounded-2xl border bg-white p-6 shadow-[0_4px_20px_rgba(22,61,89,0.08)] md:p-8"
          style={{ borderColor: "rgba(22,61,89,0.10)", borderTop: "3px solid var(--regu-blue)" }}
        >
          {loading ? (
            <p className="flex items-center justify-center gap-2 text-sm" style={{ color: "var(--regu-gray-500)" }}>
              <Loader2 className="h-4 w-4 animate-spin" /> Cargando solicitud…
            </p>
          ) : loadError ? (
            <p className="text-sm font-medium" style={{ color: "#B91C1C" }}>
              {loadError}
            </p>
          ) : result ? (
            <div className="text-center">
              {result.ok ? (
                result.approved ? (
                  <CheckCircle2 className="mx-auto mb-3 h-10 w-10" style={{ color: "var(--regu-teal, #0f766e)" }} />
                ) : (
                  <XCircle className="mx-auto mb-3 h-10 w-10" style={{ color: "#B91C1C" }} />
                )
              ) : (
                <XCircle className="mx-auto mb-3 h-10 w-10" style={{ color: "#B91C1C" }} />
              )}
              <p className="text-sm font-medium" style={{ color: result.ok ? "var(--regu-navy)" : "#B91C1C" }}>
                {result.message}
              </p>
            </div>
          ) : request?.status !== "pending" ? (
            <p className="text-sm font-medium" style={{ color: "var(--regu-navy)" }}>
              {request?.status === "approved"
                ? "Esta solicitud ya fue autorizada."
                : "Esta solicitud ya fue denegada."}
            </p>
          ) : (
            <>
              <p className="mb-4 text-sm" style={{ color: "var(--regu-gray-600)" }}>
                {actionParam === "approve"
                  ? "Va a autorizar el acceso a las actas restringidas."
                  : "Va a denegar esta solicitud de acceso."}
              </p>
              <div
                className="mb-6 space-y-1.5 rounded-xl px-4 py-3 text-sm"
                style={{ backgroundColor: "#F4F6F8", color: "var(--regu-navy)" }}
              >
                <p><strong>Nombre:</strong> {request?.name || "No indicado"}</p>
                <p><strong>Correo:</strong> {request?.email || "No indicado"}</p>
                <p><strong>País:</strong> {request?.country || "No indicado"}</p>
                <p><strong>Cargo:</strong> {request?.position || "No indicado"}</p>
                <p><strong>Institución:</strong> {request?.institution || "No indicado"}</p>
                <p><strong>Documento:</strong> {request?.documentTitle || "No indicado"}</p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => void handleDecide("approve")}
                  className="inline-flex flex-1 items-center justify-center rounded-xl px-5 py-3.5 text-sm font-bold text-white disabled:opacity-70"
                  style={{ backgroundColor: "var(--regu-blue)" }}
                >
                  {submitting && actionParam === "approve" ? "Procesando…" : "Confirmar autorización"}
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => void handleDecide("deny")}
                  className="inline-flex flex-1 items-center justify-center rounded-xl border-2 px-5 py-3.5 text-sm font-bold disabled:opacity-70"
                  style={{ borderColor: "#B91C1C", color: "#B91C1C" }}
                >
                  {submitting && actionParam === "deny" ? "Procesando…" : "Denegar acceso"}
                </button>
              </div>
            </>
          )}
        </div>

        <p className="mt-6 text-center text-xs">
          <Link to="/" className="underline hover:no-underline" style={{ color: "var(--regu-blue)" }}>
            Volver al inicio
          </Link>
        </p>
      </div>
    </div>
  );
}

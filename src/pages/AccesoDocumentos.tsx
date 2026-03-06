import { useState, FormEvent } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Lock, ArrowLeft } from "lucide-react";
import {
  getRestrictedDocument,
  checkRestrictedPassword,
} from "@/config/restrictedDocuments";

export default function AccesoDocumentos() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const docId = searchParams.get("doc");
  const document = getRestrictedDocument(docId);

  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!password.trim()) {
      setError("Ingrese la contraseña.");
      return;
    }
    setSubmitting(true);
    if (!checkRestrictedPassword(password.trim())) {
      setError("Contraseña incorrecta. Intente de nuevo.");
      setSubmitting(false);
      return;
    }
    if (document) {
      navigate(document.redirectUrl);
    } else {
      navigate("/gestion?tipo=planes-actas");
    }
    setSubmitting(false);
  };

  return (
    <div
      className="min-h-screen w-full py-16 md:py-24"
      style={{
        fontFamily: "var(--token-font-body)",
        background: "linear-gradient(180deg, var(--regu-offwhite) 0%, var(--regu-gray-100) 100%)",
      }}
    >
      <div className="mx-auto max-w-md px-4 md:px-6">
        <div
          className="rounded-2xl border bg-white p-8 shadow-[0_10px_40px_rgba(22,61,89,0.08)]"
          style={{ borderColor: "var(--token-border)" }}
        >
          <div className="mb-6 flex items-center gap-3">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
              style={{ backgroundColor: "rgba(22, 61, 89, 0.08)" }}
            >
              <Lock className="h-6 w-6" style={{ color: "var(--regu-blue)" }} aria-hidden />
            </div>
            <div>
              <h1
                className="text-xl font-bold"
                style={{ color: "var(--regu-gray-900)", fontFamily: "var(--token-font-heading)" }}
              >
                Acceso restringido
              </h1>
              {document && (
                <p className="mt-0.5 text-sm" style={{ color: "var(--regu-gray-500)" }}>
                  {document.title}
                </p>
              )}
            </div>
          </div>

          <p
            className="mb-6 text-sm leading-relaxed"
            style={{ color: "var(--regu-gray-700)" }}
          >
            Este documento está disponible únicamente para usuarios autorizados.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="acceso-password"
                className="mb-1.5 block text-sm font-semibold"
                style={{ color: "var(--regu-gray-900)" }}
              >
                Contraseña
              </label>
              <input
                id="acceso-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                placeholder="Ingrese la contraseña"
                className="w-full rounded-lg border px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-offset-0"
                style={{
                  borderColor: "var(--regu-gray-100)",
                  color: "var(--regu-gray-900)",
                }}
                disabled={submitting}
              />
            </div>

            {error && (
              <p className="text-sm font-medium" style={{ color: "var(--news-accent)" }}>
                {error}
              </p>
            )}

            <div className="flex flex-col gap-3 pt-2 sm:flex-row">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center rounded-lg px-5 py-3 text-sm font-semibold text-white transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-70"
                style={{
                  backgroundColor: "var(--regu-blue)",
                  fontFamily: "var(--token-font-body)",
                }}
              >
                {submitting ? "Verificando…" : "Ingresar"}
              </button>
              <Link
                to="/gestion?tipo=planes-actas"
                className="inline-flex items-center justify-center gap-2 rounded-lg border-2 px-5 py-3 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2"
                style={{
                  borderColor: "var(--regu-gray-100)",
                  color: "var(--regu-gray-700)",
                  fontFamily: "var(--token-font-body)",
                }}
              >
                <ArrowLeft className="h-4 w-4" aria-hidden />
                Volver
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

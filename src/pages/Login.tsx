import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Lock, User, KeyRound, ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login, isAdmin, isChecking, isConfigured, bootstrapRequired } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isChecking && isAdmin) {
      navigate("/admin", { replace: true });
    }
  }, [isChecking, isAdmin, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    const ok = await login(username, password);
    setIsSubmitting(false);
    if (ok) {
      navigate("/admin", { replace: true });
    } else {
      setError("Usuario o contraseña incorrectos.");
    }
  };

  if (isChecking || isAdmin) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ backgroundColor: "#FAFBFC", fontFamily: "var(--token-font-body)" }}
      >
        <p className="text-sm font-medium" style={{ color: "var(--regu-gray-500)" }}>
          Redirigiendo al panel…
        </p>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: "#FAFBFC",
        borderTop: "1px solid rgba(22,61,89,0.07)",
        fontFamily: "var(--token-font-body)",
      }}
    >
      {/* Blue accent bar */}
      <div style={{ backgroundColor: "var(--regu-blue)", height: "4px" }} aria-hidden />

      <div className="mx-auto px-4 py-12 md:py-16" style={{ maxWidth: "440px" }}>
        {/* Header */}
        <div className="mb-8 text-center">
          <div
            className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
            style={{ backgroundColor: "rgba(68,137,198,0.12)" }}
          >
            <Lock className="h-7 w-7" style={{ color: "var(--regu-blue)" }} />
          </div>
          <h1
            className="text-xl font-bold md:text-2xl"
            style={{ color: "var(--regu-navy)", fontFamily: "var(--token-font-heading)" }}
          >
            Iniciar sesión
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--regu-gray-500)" }}>
            Área de miembros · Portal de administración REGULATEL
          </p>
        </div>

        {/* Login card */}
        <div
          className="overflow-hidden rounded-2xl border bg-white"
          style={{
            borderColor: "rgba(22,61,89,0.10)",
            boxShadow: "0 4px 24px rgba(22,61,89,0.06)",
            borderTop: "3px solid var(--regu-blue)",
          }}
        >
          <div className="p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Config / bootstrap alerts */}
              {!isConfigured && (
                <div
                  className="rounded-xl border px-4 py-3 text-sm"
                  style={{
                    borderColor: "rgba(220,38,38,0.25)",
                    backgroundColor: "rgba(254,226,226,0.6)",
                    color: "var(--regu-gray-800)",
                  }}
                >
                  El acceso de administración aún no está configurado correctamente en el servidor.
                </div>
              )}
              {bootstrapRequired && (
                <div
                  className="rounded-xl border px-4 py-3 text-sm space-y-2"
                  style={{
                    borderColor: "rgba(68,137,198,0.3)",
                    backgroundColor: "rgba(68,137,198,0.06)",
                    color: "var(--regu-gray-800)",
                  }}
                >
                  <p className="font-semibold" style={{ color: "var(--regu-navy)" }}>
                    Configuración requerida
                  </p>
                  <p>
                    No se detectan usuarios administrador en la base de datos. Verifica la variable{" "}
                    <strong>DATABASE_URL</strong> en Vercel y redeploya, o crea un usuario con{" "}
                    <code className="rounded bg-black/5 px-1 text-xs">npm run admin:create</code>.
                  </p>
                </div>
              )}

              {/* Error message */}
              {error && (
                <div
                  className="rounded-xl border px-4 py-3 text-sm font-medium"
                  style={{
                    borderColor: "rgba(220,38,38,0.2)",
                    backgroundColor: "rgba(254,226,226,0.5)",
                    color: "#991b1b",
                  }}
                >
                  {error}
                </div>
              )}

              {/* Usuario */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="username"
                  className="text-xs font-bold uppercase tracking-[0.08em]"
                  style={{ color: "var(--regu-gray-600)" }}
                >
                  Usuario
                </label>
                <div className="relative">
                  <User
                    className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
                    style={{ color: "var(--regu-gray-400)" }}
                    aria-hidden
                  />
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="username"
                    required
                    className="w-full rounded-xl border bg-[#F4F6F8] py-3 pl-10 pr-4 text-sm outline-none transition-all placeholder:text-[var(--regu-gray-400)] focus:bg-white focus:ring-2 focus:ring-[rgba(68,137,198,0.3)]"
                    style={{ borderColor: "rgba(22,61,89,0.12)", color: "var(--regu-navy)" }}
                    placeholder="Nombre de usuario"
                  />
                </div>
              </div>

              {/* Contraseña */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="password"
                  className="text-xs font-bold uppercase tracking-[0.08em]"
                  style={{ color: "var(--regu-gray-600)" }}
                >
                  Contraseña
                </label>
                <div className="relative">
                  <KeyRound
                    className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
                    style={{ color: "var(--regu-gray-400)" }}
                    aria-hidden
                  />
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                    className="w-full rounded-xl border bg-[#F4F6F8] py-3 pl-10 pr-4 text-sm outline-none transition-all placeholder:text-[var(--regu-gray-400)] focus:bg-white focus:ring-2 focus:ring-[rgba(68,137,198,0.3)]"
                    style={{ borderColor: "rgba(22,61,89,0.12)", color: "var(--regu-navy)" }}
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting || !isConfigured}
                className="w-full rounded-xl py-3 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)] focus-visible:ring-offset-2"
                style={{ backgroundColor: "var(--regu-blue)" }}
              >
                {isSubmitting ? "Entrando…" : "Entrar"}
              </button>
            </form>

            {/* Back link */}
            <p className="mt-6 pt-5 text-center border-t" style={{ borderColor: "rgba(22,61,89,0.08)" }}>
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 text-sm font-semibold transition-colors hover:opacity-75"
                style={{ color: "var(--regu-blue)" }}
              >
                <ArrowLeft className="h-4 w-4" />
                Volver al inicio
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (login(username, password)) {
      navigate("/admin", { replace: true });
    } else {
      setError("Usuario o contraseña incorrectos.");
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--regu-offwhite)" }}>
      <div className="mx-auto max-w-[900px] px-4 py-10 md:py-14">
        <h1
          className="text-center text-2xl font-bold md:text-3xl"
          style={{
            fontFamily: "var(--token-font-heading)",
            color: "var(--regu-gray-900)",
          }}
        >
          Área de miembros — Iniciar sesión
        </h1>

        {/* Banner estilo BEREC (gradiente + placeholder para imagen) */}
        <div
          className="relative mt-6 overflow-hidden rounded-2xl border"
          style={{
            minHeight: "200px",
            background:
              "linear-gradient(135deg, rgba(22,61,89,0.92) 0%, rgba(68,137,198,0.85) 50%, rgba(51,164,180,0.9) 100%)",
            borderColor: "var(--regu-gray-100)",
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center p-6">
            <p
              className="text-center text-lg font-semibold text-white/95"
              style={{ fontFamily: "var(--token-font-body)" }}
            >
              Acceso al portal de administración de REGULATEL
            </p>
          </div>
        </div>

        {/* Formulario de login */}
        <div
          className="mx-auto mt-8 max-w-md rounded-2xl border bg-white p-6 shadow-sm md:p-8"
          style={{ borderColor: "var(--regu-gray-100)" }}
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div
                className="rounded-lg border px-4 py-3 text-sm"
                style={{
                  borderColor: "var(--regu-salmon)",
                  backgroundColor: "rgba(252,145,135,0.15)",
                  color: "var(--regu-gray-900)",
                }}
              >
                {error}
              </div>
            )}
            <div>
              <label
                htmlFor="username"
                className="mb-1 block text-sm font-semibold"
                style={{ color: "var(--regu-gray-900)" }}
              >
                Usuario
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-xl border px-4 py-3 text-[var(--regu-gray-900)] focus:outline-none focus:ring-2"
                style={{
                  borderColor: "var(--regu-gray-100)",
                }}
                autoComplete="username"
                required
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="mb-1 block text-sm font-semibold"
                style={{ color: "var(--regu-gray-900)" }}
              >
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border px-4 py-3 text-[var(--regu-gray-900)] focus:outline-none focus:ring-2"
                style={{
                  borderColor: "var(--regu-gray-100)",
                }}
                autoComplete="current-password"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-xl px-4 py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:opacity-95"
              style={{ backgroundColor: "var(--regu-blue)" }}
            >
              Entrar
            </button>
          </form>
          <p className="mt-4 text-center text-sm" style={{ color: "var(--regu-gray-500)" }}>
            <Link to="/" className="underline hover:opacity-90">
              Volver al inicio
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";

/**
 * Acceso con clave para las páginas del Observatorio mientras están en revisión.
 * Nota: es una protección de cortesía en el navegador (evita visitas casuales y la indexación),
 * no un control de seguridad del servidor. La clave no se guarda en texto plano: se compara su SHA-256.
 */
const HASH_CLAVE = "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3";
const LLAVE_SESION = "regulatel-observatorio-acceso";

async function sha256(texto: string): Promise<string> {
  const datos = new TextEncoder().encode(texto);
  const hash = await crypto.subtle.digest("SHA-256", datos);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function leerSesion(): boolean {
  try {
    return sessionStorage.getItem(LLAVE_SESION) === HASH_CLAVE;
  } catch {
    return false;
  }
}

/** Pide a los buscadores no indexar estas páginas mientras están en revisión */
function useNoIndex() {
  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex, nofollow";
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);
}

export default function AccesoObservatorio({ children }: { children: ReactNode }) {
  useNoIndex();
  const [ok, setOk] = useState(leerSesion);
  const [clave, setClave] = useState("");
  const [ver, setVer] = useState(false);
  const [error, setError] = useState(false);
  const [verificando, setVerificando] = useState(false);

  useEffect(() => {
    if (!ok) document.title = "Acceso restringido · Observatorio Regulatorio · REGULATEL";
  }, [ok]);

  if (ok) return <>{children}</>;

  const entrar = async (e: FormEvent) => {
    e.preventDefault();
    setVerificando(true);
    try {
      const h = await sha256(clave.trim());
      if (h === HASH_CLAVE) {
        try {
          sessionStorage.setItem(LLAVE_SESION, HASH_CLAVE);
        } catch {
          /* sin almacenamiento: el acceso dura mientras la página esté abierta */
        }
        setOk(true);
        window.scrollTo(0, 0);
      } else {
        setError(true);
      }
    } finally {
      setVerificando(false);
    }
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-16" style={{ background: "linear-gradient(180deg,#F4F7F8 0%,#FFFFFF 100%)" }}>
      <form
        onSubmit={entrar}
        className="w-full max-w-[440px] rounded-[22px] border bg-white p-7 sm:p-9"
        style={{ borderColor: "rgba(22,61,89,0.12)", boxShadow: "0 24px 60px -28px rgba(22,61,89,0.35)" }}
      >
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: "rgba(68,137,198,0.12)" }}>
          <Lock className="h-6 w-6" style={{ color: "var(--regu-blue, #4489C6)" }} />
        </span>
        <h1 className="mt-5 font-bold" style={{ color: "var(--regu-navy, #163D59)", fontFamily: "var(--token-font-heading)", fontSize: "1.5rem", lineHeight: 1.2 }}>
          Observatorio Regulatorio
        </h1>
        <p className="mt-2 text-[0.9375rem] leading-relaxed" style={{ color: "#4A5568" }}>
          Esta sección está en revisión. Ingrese la clave de acceso para continuar.
        </p>
        <label htmlFor="obs-clave" className="mt-6 block text-[0.8125rem] font-semibold" style={{ color: "#163D59" }}>
          Clave de acceso
        </label>
        <div className="mt-2 flex items-center rounded-xl border-2 bg-white focus-within:border-[#4489C6]" style={{ borderColor: error ? "#DC2626" : "rgba(22,61,89,0.16)" }}>
          <input
            id="obs-clave"
            type={ver ? "text" : "password"}
            value={clave}
            onChange={(e) => {
              setClave(e.target.value);
              setError(false);
            }}
            autoFocus
            autoComplete="off"
            className="w-full rounded-xl bg-transparent px-4 py-3 text-[1rem] outline-none"
            aria-invalid={error}
            aria-describedby={error ? "obs-clave-error" : undefined}
          />
          <button type="button" onClick={() => setVer((v) => !v)} className="mr-2 rounded-lg p-2 transition hover:bg-slate-100" aria-label={ver ? "Ocultar clave" : "Mostrar clave"}>
            {ver ? <EyeOff className="h-5 w-5" style={{ color: "#4A5568" }} /> : <Eye className="h-5 w-5" style={{ color: "#4A5568" }} />}
          </button>
        </div>
        {error && (
          <p id="obs-clave-error" role="alert" className="mt-2 text-[0.8125rem] font-semibold" style={{ color: "#B91C1C" }}>
            Clave incorrecta. Inténtelo de nuevo.
          </p>
        )}
        <button
          type="submit"
          disabled={!clave.trim() || verificando}
          className="mt-6 w-full rounded-xl px-4 py-3 text-[0.9375rem] font-bold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
          style={{ background: "var(--regu-navy, #163D59)" }}
        >
          {verificando ? "Verificando…" : "Entrar"}
        </button>
      </form>
    </div>
  );
}

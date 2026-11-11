import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Eyebrow, P2 } from "./ui2";

/**
 * Ilustración vectorial: torre de telecomunicaciones sobre montañas y costa,
 * con ondas de señal en colores REGULATEL. Si existe una foto en
 * /images/observatorio/hero-panel2.jpg, se usa la foto en su lugar.
 */
function IlustracionTorre() {
  return (
    <svg viewBox="0 0 900 440" preserveAspectRatio="xMaxYMid slice" className="h-full w-full" aria-hidden>
      <defs>
        <linearGradient id="o2-cielo" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#DCEBF2" />
          <stop offset="62%" stopColor="#EEF5F6" />
          <stop offset="100%" stopColor="#F4F7F6" />
        </linearGradient>
        <radialGradient id="o2-sol" cx="72%" cy="22%" r="40%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="o2-mar" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#BFD9E4" />
          <stop offset="100%" stopColor="#D8E8EE" />
        </linearGradient>
        <pattern id="o2-puntos" width="14" height="14" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1.6" fill="#4489C6" opacity="0.18" />
        </pattern>
      </defs>

      <rect width="900" height="440" fill="url(#o2-cielo)" />
      <rect width="900" height="440" fill="url(#o2-sol)" />
      <rect x="430" y="20" width="470" height="150" fill="url(#o2-puntos)" />

      {/* Mar y costa */}
      <path d="M0 270 L900 250 L900 330 L0 340 Z" fill="url(#o2-mar)" />
      {/* Montañas lejanas */}
      <path d="M180 262 C260 210 320 205 380 228 C430 246 470 200 540 186 C610 172 660 214 720 206 C790 196 840 176 900 182 L900 270 L180 276 Z" fill="#C3D8E0" />
      {/* Montañas medias */}
      <path d="M300 300 C380 248 450 250 520 268 C590 286 640 236 720 232 C790 228 850 250 900 244 L900 330 L300 330 Z" fill="#8FB7BF" opacity="0.9" />
      {/* Colinas cercanas */}
      <path d="M380 360 C470 300 560 300 640 318 C720 336 800 282 900 290 L900 440 L360 440 Z" fill="#5B9A97" />
      <path d="M520 440 C600 360 700 340 780 352 C840 360 880 340 900 336 L900 440 Z" fill="#2F6F73" />

      {/* Ondas de señal */}
      <g className="o2-ondas" fill="none" strokeLinecap="round">
        <path d="M712 118 a46 46 0 0 1 0 64" stroke="#C5DC0B" strokeWidth="3" opacity="0.9" />
        <path d="M728 100 a70 70 0 0 1 0 100" stroke="#4489C6" strokeWidth="2.5" opacity="0.6" />
        <path d="M744 82 a96 96 0 0 1 0 136" stroke="#4489C6" strokeWidth="2" opacity="0.35" />
        <path d="M648 118 a46 46 0 0 0 0 64" stroke="#C5DC0B" strokeWidth="3" opacity="0.9" />
        <path d="M632 100 a70 70 0 0 0 0 100" stroke="#4489C6" strokeWidth="2.5" opacity="0.6" />
        <path d="M616 82 a96 96 0 0 0 0 136" stroke="#4489C6" strokeWidth="2" opacity="0.35" />
      </g>

      {/* Torre reticulada */}
      <g stroke="#1E3A4C" strokeWidth="2.2" fill="none" strokeLinejoin="round">
        <path d="M640 360 L672 120 M720 360 L688 120" />
        <path d="M672 120 L688 120" />
        {[160, 200, 240, 280, 320, 360].map((y, i) => {
          const t = (y - 120) / 240;
          const xl = 672 - 32 * t;
          const xr = 688 + 32 * t;
          const yp = y - 40;
          const tp = (yp - 120) / 240;
          const xlp = 672 - 32 * tp;
          const xrp = 688 + 32 * tp;
          return (
            <g key={i}>
              <path d={`M${xl} ${y} L${xr} ${y}`} />
              <path d={`M${xlp} ${yp} L${xr} ${y} M${xrp} ${yp} L${xl} ${y}`} strokeWidth="1.4" opacity="0.85" />
            </g>
          );
        })}
        {/* Mástil y antenas */}
        <path d="M680 120 L680 72" strokeWidth="2.6" />
        <rect x="660" y="128" width="8" height="26" rx="2" fill="#E8EEF2" />
        <rect x="692" y="128" width="8" height="26" rx="2" fill="#E8EEF2" />
        <rect x="676" y="96" width="8" height="22" rx="2" fill="#E8EEF2" />
        <circle cx="664" cy="176" r="8" fill="#E8EEF2" />
        <circle cx="680" cy="68" r="3.5" fill="#C5DC0B" stroke="none" />
      </g>
      {/* Caseta */}
      <rect x="724" y="346" width="34" height="18" rx="2" fill="#E6ECEF" stroke="#1E3A4C" strokeWidth="1.5" />
    </svg>
  );
}

export default function Hero2({ kpis }: { kpis: [string, string][] }) {
  const [fotoOk, setFotoOk] = useState(true);
  return (
    <>
      <section className="relative overflow-hidden" style={{ background: "linear-gradient(180deg,#F5F7F6 0%,#F1F5F5 100%)" }}>
        {/* Imagen a la derecha (foto si existe; si no, ilustración) */}
        <div
          className="pointer-events-none absolute inset-y-0 right-0 hidden w-[58%] md:block"
          style={{ WebkitMaskImage: "linear-gradient(90deg, transparent 0%, #000 34%)", maskImage: "linear-gradient(90deg, transparent 0%, #000 34%)" }}
        >
          {fotoOk ? (
            <img src="/images/observatorio/hero-panel2.jpg" alt="" className="h-full w-full object-cover" onError={() => setFotoOk(false)} />
          ) : (
            <IlustracionTorre />
          )}
        </div>

        <div className="relative mx-auto w-full max-w-[1480px] px-5 pb-14 pt-8 md:px-10 md:pb-16 md:pt-10">
          <nav className="mb-6 text-[0.875rem]" style={{ color: P2.muted }} aria-label="Ruta de navegación">
            <Link to="/" className="hover:underline">Inicio</Link> / <Link to="/gestion" className="hover:underline">Recursos</Link>
          </nav>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="max-w-[760px]">
            <Eyebrow>Regulación comparada</Eyebrow>
            <h1 className="mt-4 font-semibold tracking-[-0.01em]" style={{ fontFamily: P2.serif, color: P2.navy, fontSize: "clamp(2.4rem, 3.6vw + 1rem, 4.25rem)", lineHeight: 1.05 }}>
              Observatorio Regulatorio
            </h1>
            <p className="mt-5 max-w-[640px] text-[1.125rem] leading-relaxed md:text-[1.35rem]" style={{ color: "#4A5A66" }}>
              Compare cómo regulan las telecomunicaciones los países miembros de REGULATEL y consulte las fuentes de cada indicador.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Franja de cifras */}
      <section style={{ background: P2.navyBand }}>
        <div className="mx-auto grid w-full max-w-[1480px] grid-cols-2 px-5 md:grid-cols-4 md:px-10">
          {kpis.map(([n, l], i) => (
            <div key={l} className={`flex items-baseline gap-3 py-5 md:py-6 ${i > 0 ? "md:border-l md:pl-10" : ""}`} style={{ borderColor: "rgba(255,255,255,0.18)" }}>
              <span className="font-bold tabular-nums text-white" style={{ fontSize: "clamp(1.8rem, 1.4vw + 1.2rem, 2.6rem)", lineHeight: 1 }}>{n}</span>
              <span className="text-[1rem] text-white/85 md:text-[1.125rem]">{l}</span>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

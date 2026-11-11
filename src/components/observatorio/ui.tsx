import type { ReactNode } from "react";
import {
  AlertTriangle,
  ArrowRightLeft,
  BadgeCheck,
  BellRing,
  BrainCircuit,
  Building2,
  Cable,
  Check,
  CheckCheck,
  Cpu,
  Crown,
  Equal,
  FlaskConical,
  Gauge,
  Gavel,
  Globe,
  Handshake,
  Landmark,
  Laptop,
  LifeBuoy,
  ListChecks,
  Lock,
  Map as MapIco,
  MessageSquareWarning,
  Minus,
  Network,
  PhoneCall,
  PhoneForwarded,
  PhoneOff,
  PiggyBank,
  RadioTower,
  Route,
  Router,
  Satellite,
  Scale,
  ScrollText,
  Share2,
  ShieldAlert,
  ShieldCheck,
  Signal,
  Siren,
  Smartphone,
  Stamp,
  Target,
  Users,
  Waves,
  Wifi,
  X,
  Zap,
} from "lucide-react";
import type { Estado, TemaDef } from "@/data/observatorio/schema";
import type { Veredicto } from "@/lib/observatorio";
import { flagUrl } from "@/lib/observatorio";

/* Colores de identidad de cada país (marca REGULATEL) */
export const COLOR_A = "#163D59"; // azul petróleo
export const COLOR_B = "#1F7F8C"; // turquesa REGULATEL oscurecido (contraste AA 4.7:1 sobre blanco)
export const COLOR_A_SOFT = "rgba(22,61,89,0.08)";
export const COLOR_B_SOFT = "rgba(31,127,140,0.10)";

export const ESTADO_COLOR: Record<Estado, { fg: string; bg: string; ring: string }> = {
  si: { fg: "#FFFFFF", bg: "#15803D", ring: "rgba(21,128,61,0.18)" },
  parcial: { fg: "#FFFFFF", bg: "#D97706", ring: "rgba(217,119,6,0.18)" },
  no: { fg: "#FFFFFF", bg: "#C2410C", ring: "rgba(194,65,12,0.16)" },
  sin_dato: { fg: "#64748B", bg: "#FFFFFF", ring: "rgba(100,116,139,0.0)" },
};

export const ESTADO_TEXTO: Record<Estado, string> = {
  si: "Sí",
  parcial: "En proceso",
  no: "No",
  sin_dato: "Sin dato",
};

export function StatusIcon({ estado, size = 26 }: { estado: Estado; size?: number }) {
  const c = ESTADO_COLOR[estado];
  const icon = Math.round(size * 0.58);
  if (estado === "sin_dato") {
    return (
      <span
        aria-label={ESTADO_TEXTO[estado]}
        role="img"
        className="inline-flex shrink-0 items-center justify-center rounded-full"
        style={{ width: size, height: size, border: "2px dashed #CBD5E1", color: "#94A3B8", background: "#fff" }}
      >
        <Minus size={icon} strokeWidth={3} />
      </span>
    );
  }
  if (estado === "parcial") {
    return (
      <span aria-label={ESTADO_TEXTO[estado]} role="img" className="inline-flex shrink-0" style={{ width: size, height: size }}>
        <svg viewBox="0 0 26 26" width={size} height={size} aria-hidden>
          <circle cx="13" cy="13" r="11.5" fill="#fff" stroke={c.bg} strokeWidth="3" />
          <path d="M13 3.5 A9.5 9.5 0 0 1 13 22.5 Z" fill={c.bg} />
        </svg>
      </span>
    );
  }
  return (
    <span
      aria-label={ESTADO_TEXTO[estado]}
      role="img"
      className="inline-flex shrink-0 items-center justify-center rounded-full"
      style={{ width: size, height: size, background: c.bg, color: c.fg, boxShadow: `0 0 0 4px ${c.ring}` }}
    >
      {estado === "si" ? <Check size={icon} strokeWidth={3.2} /> : <X size={icon} strokeWidth={3.2} />}
    </span>
  );
}

export function VerdictChip({ v, nameA, nameB, compact = false }: { v: Veredicto; nameA: string; nameB: string; compact?: boolean }) {
  const map: Record<Veredicto, { text: string; bg: string; fg: string; border?: string }> = {
    ambos: { text: "En ambos", bg: "#DCFCE7", fg: "#166534" },
    soloA: { text: `Solo ${nameA}`, bg: COLOR_A, fg: "#fff" },
    soloB: { text: `Solo ${nameB}`, bg: COLOR_B, fg: "#fff" },
    ambosParcial: { text: "Ambos en proceso", bg: "#FEF3C7", fg: "#92400E" },
    ninguno: { text: "En ninguno", bg: "#F1F5F9", fg: "#475569" },
    sinDatos: { text: "Sin datos", bg: "#fff", fg: "#94A3B8", border: "#E2E8F0" },
  };
  const m = map[v];
  return (
    <span
      className="inline-flex max-w-full items-center rounded-full font-semibold"
      style={{
        background: m.bg,
        color: m.fg,
        border: `1px solid ${m.border ?? m.bg}`,
        fontSize: compact ? "0.6875rem" : "0.75rem",
        padding: compact ? "2px 8px" : "4px 10px",
        lineHeight: 1.3,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}
      title={m.text}
    >
      {m.text}
    </span>
  );
}

export function Flag({ iso, size = 28, className = "" }: { iso: string; size?: number; className?: string }) {
  const h = Math.round(size * 0.72);
  return (
    <img
      src={flagUrl(iso, size > 40 ? 160 : 80)}
      alt=""
      width={size}
      height={h}
      loading="lazy"
      className={`inline-block shrink-0 ${className}`}
      style={{ width: size, height: h, objectFit: "cover", borderRadius: Math.max(3, Math.round(size / 9)), boxShadow: "0 0 0 1px rgba(15,23,42,0.12)" }}
    />
  );
}

const TEMA_ICON: Record<TemaDef["icono"], typeof Waves> = {
  radio: Waves,
  scale: Scale,
  shield: ShieldCheck,
  users: Users,
  cpu: Cpu,
  tower: RadioTower,
  siren: Siren,
  badge: BadgeCheck,
};

export function TemaIcon({ icono, size = 20, color = "currentColor" }: { icono: TemaDef["icono"]; size?: number; color?: string }) {
  const I = TEMA_ICON[icono];
  return <I size={size} color={color} strokeWidth={2} aria-hidden />;
}

/** Ícono y nombre corto de cada indicador, para lectura instantánea */
export const IND_META: Record<string, { icon: typeof Waves; corto: string }> = {
  esp_cuadro: { icon: MapIco, corto: "Plan de frecuencias" },
  esp_5g: { icon: Signal, corto: "Espectro 5G" },
  esp_licitacion: { icon: Gavel, corto: "Subastas recientes" },
  esp_6ghz: { icon: Wifi, corto: "Wi-Fi 6 GHz" },
  esp_secundario: { icon: Share2, corto: "Ceder espectro" },
  comp_psm: { icon: Crown, corto: "Reglas a dominantes" },
  comp_omv: { icon: Smartphone, corto: "Móviles virtuales" },
  comp_interconexion: { icon: Network, corto: "Interconexión" },
  comp_fondo: { icon: PiggyBank, corto: "Fondo universal" },
  comp_neutralidad: { icon: Equal, corto: "Neutralidad de red" },
  ciber_estrategia: { icon: Target, corto: "Estrategia ciber" },
  ciber_ley: { icon: Landmark, corto: "Ley de ciberseguridad" },
  ciber_csirt: { icon: ShieldAlert, corto: "CSIRT nacional" },
  ciber_reporte: { icon: BellRing, corto: "Reporte de incidentes" },
  ciber_budapest: { icon: Handshake, corto: "Conv. de Budapest" },
  usu_reglamento: { icon: ScrollText, corto: "Derechos del usuario" },
  usu_reclamos: { icon: MessageSquareWarning, corto: "Reclamos" },
  usu_portabilidad: { icon: ArrowRightLeft, corto: "Portabilidad" },
  usu_calidad: { icon: Gauge, corto: "Calidad medida" },
  usu_nomolestar: { icon: PhoneOff, corto: "No Molestar" },
  tec_sandbox: { icon: FlaskConical, corto: "Sandbox" },
  tec_5g: { icon: RadioTower, corto: "5G comercial" },
  tec_iot: { icon: Router, corto: "Internet de las Cosas" },
  tec_satelital: { icon: Satellite, corto: "Satélite órbita baja" },
  tec_ia: { icon: BrainCircuit, corto: "Estrategia de IA" },
  inf_pasiva: { icon: Cable, corto: "Compartir torres y ductos" },
  inf_electrica: { icon: Zap, corto: "Redes eléctricas" },
  inf_permisos: { icon: Stamp, corto: "Permisos ágiles" },
  inf_roaming: { icon: Route, corto: "Roaming nacional" },
  inf_edificios: { icon: Building2, corto: "Telecom en edificios" },
  eme_alerta: { icon: AlertTriangle, corto: "Alertas al celular" },
  eme_numero: { icon: PhoneCall, corto: "Número único" },
  eme_plan: { icon: LifeBuoy, corto: "Plan de continuidad" },
  eme_prioridad: { icon: PhoneForwarded, corto: "Llamadas prioritarias" },
  eme_tampere: { icon: Globe, corto: "Conv. de Tampere" },
  hom_obligatoria: { icon: BadgeCheck, corto: "Homologación" },
  hom_reconocimiento: { icon: CheckCheck, corto: "Certificados extranjeros" },
  hom_imei: { icon: Lock, corto: "Bloqueo de robados" },
  hom_enlinea: { icon: Laptop, corto: "Trámite en línea" },
  hom_lista: { icon: ListChecks, corto: "Lista pública" },
};

export function IndIcon({ id, size = 16, color = "currentColor" }: { id: string; size?: number; color?: string }) {
  const I = IND_META[id]?.icon ?? Waves;
  return <I size={size} color={color} strokeWidth={2} aria-hidden />;
}

/** Puntos 0–5 (✓ = punto lleno, ◐ = medio punto) */
export function DotMeter({ si, parcial, total = 5, color, size = 9 }: { si: number; parcial: number; total?: number; color: string; size?: number }) {
  return (
    <span className="inline-flex items-center" style={{ gap: Math.max(2, size / 3) }} aria-label={`${si} de ${total}${parcial ? ` y ${parcial} en proceso` : ""}`}>
      {Array.from({ length: total }, (_, i) => {
        const full = i < si;
        const half = !full && i < si + parcial;
        return (
          <span
            key={i}
            className="inline-block rounded-full"
            style={{
              width: size,
              height: size,
              background: full ? color : half ? `linear-gradient(90deg, ${color} 50%, #E2E8F0 50%)` : "#E2E8F0",
            }}
          />
        );
      })}
    </span>
  );
}

export function SectionTitle({ eyebrow, title, children }: { eyebrow?: string; title: string; children?: ReactNode }) {
  return (
    <div className="mb-6">
      {eyebrow && (
        <p className="mb-2 text-[0.6875rem] font-bold uppercase tracking-[0.14em]" style={{ color: "var(--regu-blue)" }}>
          {eyebrow}
        </p>
      )}
      <h2 className="font-bold" style={{ color: "var(--regu-navy)", fontFamily: "var(--token-font-heading)", fontSize: "clamp(1.35rem, 1.2vw + 1rem, 1.75rem)", lineHeight: 1.2 }}>
        {title}
      </h2>
      {children && <div className="mt-2 max-w-3xl text-[0.95rem] leading-relaxed" style={{ color: "var(--regu-gray-700)" }}>{children}</div>}
    </div>
  );
}

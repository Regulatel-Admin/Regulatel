/**
 * Observatorio Regulatorio REGULATEL — definición de temas e indicadores.
 * 8 temas × 5 indicadores = 40 indicadores comparables entre los 23 miembros.
 * Los perfiles por país viven en ./paises/<iso>.json (verificados con fuentes oficiales).
 */

export type Estado = "si" | "parcial" | "no" | "sin_dato";

export type TemaId =
  | "espectro"
  | "competencia"
  | "ciberseguridad"
  | "usuario"
  | "emergentes"
  | "infraestructura"
  | "emergencia"
  | "homologacion";

export interface IndicadorValor {
  estado: Estado;
  nota?: string;
  fuente?: string;
  anio?: number;
}

export interface Instrumento {
  nombre: string;
  anio?: number;
  tipo: "ley" | "decreto" | "reglamento" | "resolucion" | "plan" | "estrategia" | "norma" | "otro";
  url?: string;
}

export interface PerfilTema {
  resumen: string;
  instrumentos: Instrumento[];
  novedad?: { fecha: string; texto: string } | null;
  indicadores: Record<string, IndicadorValor>;
}

export interface PerfilPais {
  iso: string;
  pais: string;
  regulador: { sigla: string; nombre: string; url: string; naturaleza?: string };
  otrasAutoridades: { sigla?: string; nombre: string; rol?: string; url?: string }[];
  marcoLegal: { nombre: string; anio?: number; url?: string };
  resumenPais: string;
  categorias: Record<TemaId, PerfilTema>;
  cambiosDetectados: string[];
  verificadoEn: string;
  confianza: "alta" | "media" | "baja";
}

export interface IndicadorDef {
  id: string;
  /** Etiqueta corta, legible para cualquier persona */
  label: string;
  /** Explicación sencilla (tooltip) */
  ayuda: string;
}

export interface TemaDef {
  id: TemaId;
  nombre: string;
  corto: string;
  /** Pregunta guía en lenguaje sencillo */
  pregunta: string;
  icono: "radio" | "scale" | "shield" | "users" | "cpu" | "tower" | "siren" | "badge";
  indicadores: IndicadorDef[];
}

export const TEMAS: TemaDef[] = [
  {
    id: "espectro",
    nombre: "Espectro radioeléctrico",
    corto: "Espectro",
    pregunta: "¿Cómo se gestionan las frecuencias que usan los celulares, la radio y el Wi-Fi?",
    icono: "radio",
    indicadores: [
      { id: "esp_cuadro", label: "Plan nacional de frecuencias publicado", ayuda: "Cuadro o plan oficial que define para qué se usa cada banda de frecuencias (PNAF, CNAF, CABFRA…)." },
      { id: "esp_5g", label: "Espectro asignado para 5G", ayuda: "Los operadores ya recibieron bandas de frecuencia para desplegar redes 5G." },
      { id: "esp_licitacion", label: "Subasta o licitación de espectro desde 2020", ayuda: "Proceso competitivo concluido para asignar espectro móvil (IMT) en los últimos años." },
      { id: "esp_6ghz", label: "Banda de 6 GHz libre para Wi-Fi", ayuda: "La banda de 6 GHz puede usarse sin licencia para Wi-Fi 6E/7 (más velocidad y capacidad)." },
      { id: "esp_secundario", label: "Espectro que se puede ceder o compartir", ayuda: "La norma permite ceder, arrendar o compartir frecuencias entre operadores (mercado secundario)." },
    ],
  },
  {
    id: "competencia",
    nombre: "Competencia económica",
    corto: "Competencia",
    pregunta: "¿Qué reglas existen para que haya más opciones y mejores precios?",
    icono: "scale",
    indicadores: [
      { id: "comp_psm", label: "Reglas para operadores dominantes", ayuda: "Obligaciones especiales para empresas con poder significativo de mercado (dominantes o preponderantes)." },
      { id: "comp_omv", label: "Operadores móviles virtuales (OMV)", ayuda: "Empresas que ofrecen telefonía móvil usando la red de otro operador están permitidas." },
      { id: "comp_interconexion", label: "Interconexión regulada", ayuda: "El regulador fija o aprueba cargos u ofertas de referencia para conectar redes entre operadores." },
      { id: "comp_fondo", label: "Fondo de servicio universal", ayuda: "Fondo que financia la conectividad en zonas rurales o de bajos ingresos." },
      { id: "comp_neutralidad", label: "Neutralidad de red", ayuda: "La ley o un reglamento prohíbe discriminar o bloquear contenidos en Internet." },
    ],
  },
  {
    id: "ciberseguridad",
    nombre: "Ciberseguridad",
    corto: "Ciberseguridad",
    pregunta: "¿Cómo se protegen las redes y los datos frente a ataques?",
    icono: "shield",
    indicadores: [
      { id: "ciber_estrategia", label: "Estrategia nacional de ciberseguridad", ayuda: "Política o estrategia nacional vigente que orienta la ciberseguridad del país." },
      { id: "ciber_ley", label: "Ley marco de ciberseguridad", ayuda: "Ley específica de ciberseguridad (no solo de delitos informáticos)." },
      { id: "ciber_csirt", label: "Equipo nacional de respuesta (CSIRT)", ayuda: "Equipo nacional que responde a incidentes de ciberseguridad (CSIRT/CERT)." },
      { id: "ciber_reporte", label: "Operadores deben reportar incidentes", ayuda: "Las empresas de telecomunicaciones están obligadas a informar ciberataques o incidentes." },
      { id: "ciber_budapest", label: "Convenio de Budapest", ayuda: "Tratado internacional sobre ciberdelincuencia del Consejo de Europa (ratificado = ✓)." },
    ],
  },
  {
    id: "usuario",
    nombre: "Protección del usuario",
    corto: "Usuarios",
    pregunta: "¿Qué derechos tienen las personas que usan los servicios?",
    icono: "users",
    indicadores: [
      { id: "usu_reglamento", label: "Reglamento de derechos del usuario", ayuda: "Norma vigente que detalla los derechos y obligaciones de los usuarios de telecomunicaciones." },
      { id: "usu_reclamos", label: "El regulador atiende reclamos", ayuda: "Las personas pueden reclamar ante el regulador (segunda instancia o canal oficial propio)." },
      { id: "usu_portabilidad", label: "Portabilidad numérica móvil", ayuda: "Se puede cambiar de compañía y conservar el mismo número de celular." },
      { id: "usu_calidad", label: "Calidad del servicio medida y publicada", ayuda: "El regulador mide y publica indicadores o rankings de calidad de los servicios." },
      { id: "usu_nomolestar", label: "Registro \"No Molestar\"", ayuda: "Registro para no recibir llamadas o mensajes comerciales no deseados." },
    ],
  },
  {
    id: "emergentes",
    nombre: "Tecnologías emergentes",
    corto: "Innovación",
    pregunta: "¿Qué tan preparado está el país para las nuevas tecnologías?",
    icono: "cpu",
    indicadores: [
      { id: "tec_sandbox", label: "Sandbox regulatorio", ayuda: "Espacio controlado para probar servicios innovadores con reglas flexibles." },
      { id: "tec_5g", label: "Redes 5G comerciales funcionando", ayuda: "Los usuarios ya pueden contratar servicios comerciales 5G en el país." },
      { id: "tec_iot", label: "Reglas o plan para Internet de las Cosas", ayuda: "Marco, plan o reglas específicas para IoT / comunicaciones máquina a máquina." },
      { id: "tec_satelital", label: "Internet satelital de órbita baja", ayuda: "Autorización de constelaciones satelitales de órbita baja (por ejemplo Starlink)." },
      { id: "tec_ia", label: "Estrategia nacional de IA", ayuda: "Estrategia, política o ley nacional de Inteligencia Artificial vigente." },
    ],
  },
  {
    id: "infraestructura",
    nombre: "Compartición de la infraestructura",
    corto: "Infraestructura",
    pregunta: "¿Cómo se facilita que las redes lleguen a más lugares?",
    icono: "tower",
    indicadores: [
      { id: "inf_pasiva", label: "Compartición de torres, ductos y postes", ayuda: "Reglas para compartir infraestructura pasiva entre operadores." },
      { id: "inf_electrica", label: "Uso de redes eléctricas y de otros sectores", ayuda: "Se pueden usar postes, ductos o vías de otros sectores (energía, vialidad) para desplegar redes." },
      { id: "inf_permisos", label: "Permisos de despliegue más ágiles", ayuda: "Reglas nacionales para simplificar permisos (ventanilla única, silencio positivo, guías municipales)." },
      { id: "inf_roaming", label: "Roaming nacional regulado", ayuda: "Un operador puede usar la red de otro donde no tiene cobertura propia." },
      { id: "inf_edificios", label: "Normas de telecom en edificios", ayuda: "Reglas de infraestructura de telecomunicaciones en edificaciones nuevas (ICT, ITED, RITEL…)." },
    ],
  },
  {
    id: "emergencia",
    nombre: "Telecomunicaciones de emergencia",
    corto: "Emergencias",
    pregunta: "¿Cómo ayudan las telecomunicaciones cuando hay un desastre?",
    icono: "siren",
    indicadores: [
      { id: "eme_alerta", label: "Alertas de emergencia al celular", ayuda: "Sistema que envía alertas públicas a los celulares (Cell Broadcast o SMS masivo)." },
      { id: "eme_numero", label: "Número único de emergencias", ayuda: "Un solo número nacional para emergencias (911, 112…)." },
      { id: "eme_plan", label: "Plan de continuidad de redes ante desastres", ayuda: "Plan o reglamento para mantener las redes funcionando durante emergencias." },
      { id: "eme_prioridad", label: "Llamadas de emergencia gratuitas o prioritarias", ayuda: "La norma garantiza gratuidad y/o prioridad a las comunicaciones de emergencia." },
      { id: "eme_tampere", label: "Convenio de Tampere", ayuda: "Tratado de la ONU para usar telecomunicaciones en la respuesta a desastres (parte = ✓)." },
    ],
  },
  {
    id: "homologacion",
    nombre: "Homologación de productos y dispositivos",
    corto: "Homologación",
    pregunta: "¿Cómo se asegura que los equipos que se venden sean seguros y compatibles?",
    icono: "badge",
    indicadores: [
      { id: "hom_obligatoria", label: "Homologación obligatoria de equipos", ayuda: "Los equipos deben certificarse antes de venderse o conectarse a la red." },
      { id: "hom_reconocimiento", label: "Acepta certificados de otros países", ayuda: "Se reconocen certificados o ensayos extranjeros (FCC, CE, acuerdos de reconocimiento mutuo)." },
      { id: "hom_imei", label: "Bloqueo de celulares robados (IMEI)", ayuda: "Los celulares reportados como robados se bloquean mediante su IMEI." },
      { id: "hom_enlinea", label: "Trámite de homologación en línea", ayuda: "La solicitud de homologación puede hacerse por Internet." },
      { id: "hom_lista", label: "Lista pública de equipos homologados", ayuda: "Cualquier persona puede consultar qué equipos están homologados." },
    ],
  },
];

export const TEMA_BY_ID: Record<TemaId, TemaDef> = Object.fromEntries(TEMAS.map((t) => [t.id, t])) as Record<TemaId, TemaDef>;
export const TOTAL_INDICADORES = TEMAS.reduce((n, t) => n + t.indicadores.length, 0);

export const ESTADO_LABEL: Record<Estado, string> = {
  si: "Sí",
  parcial: "Parcial / en proceso",
  no: "No",
  sin_dato: "Sin dato público",
};

/** Región para agrupar el selector de países */
export const REGION_BY_ISO: Record<string, "Sudamérica" | "Centroamérica, México y el Caribe" | "Europa"> = {
  ar: "Sudamérica", bo: "Sudamérica", br: "Sudamérica", cl: "Sudamérica", co: "Sudamérica", ec: "Sudamérica",
  py: "Sudamérica", pe: "Sudamérica", uy: "Sudamérica", ve: "Sudamérica",
  cr: "Centroamérica, México y el Caribe", cu: "Centroamérica, México y el Caribe", sv: "Centroamérica, México y el Caribe",
  gt: "Centroamérica, México y el Caribe", hn: "Centroamérica, México y el Caribe", mx: "Centroamérica, México y el Caribe",
  ni: "Centroamérica, México y el Caribe", pa: "Centroamérica, México y el Caribe", pr: "Centroamérica, México y el Caribe",
  do: "Centroamérica, México y el Caribe",
  es: "Europa", it: "Europa", pt: "Europa",
};

/** Ficha oficial del miembro en el portal histórico de REGULATEL (cuando existe). */
export const FICHA_REGULATEL: Record<string, string> = {
  ar: "https://regulatel.indotel.gob.do/pagina/detalle?id=174",
  bo: "https://regulatel.indotel.gob.do/pagina/detalle?id=180",
  br: "https://regulatel.indotel.gob.do/pagina/detalle?id=183",
  cl: "https://regulatel.indotel.gob.do/pagina/detalle?id=176",
  co: "https://regulatel.indotel.gob.do/pagina/detalle?id=184",
  cr: "https://regulatel.indotel.gob.do/pagina/detalle?id=185",
  cu: "https://regulatel.indotel.gob.do/pagina/detalle?id=186",
  ec: "https://regulatel.indotel.gob.do/pagina/detalle?id=187",
  sv: "https://regulatel.indotel.gob.do/pagina/detalle?id=188",
  es: "https://regulatel.indotel.gob.do/pagina/detalle?id=189",
  gt: "https://regulatel.indotel.gob.do/pagina/detalle?id=190",
  hn: "https://regulatel.indotel.gob.do/pagina/detalle?id=191",
  it: "https://regulatel.indotel.gob.do/pagina/detalle?id=192",
  mx: "https://regulatel.indotel.gob.do/pagina/detalle?id=193",
  pa: "https://regulatel.indotel.gob.do/pagina/detalle?id=194",
  py: "https://regulatel.indotel.gob.do/pagina/detalle?id=195",
  pe: "https://regulatel.indotel.gob.do/pagina/detalle?id=196",
  pt: "https://regulatel.indotel.gob.do/pagina/detalle?id=197",
  pr: "https://regulatel.indotel.gob.do/pagina/detalle?id=198",
  do: "https://regulatel.indotel.gob.do/pagina/detalle?id=199",
  ve: "https://regulatel.indotel.gob.do/pagina/detalle?id=200",
};

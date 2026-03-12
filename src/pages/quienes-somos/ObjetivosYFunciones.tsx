import { motion } from "framer-motion";
import { CheckCircle2, Target, FileText, Eye, Download } from "lucide-react";
import InstitutionalLayout, {
  InstitutionalSection,
  InstitutionalCard,
  InstitutionalLead,
} from "@/components/institutional/InstitutionalLayout";

/** Fuente oficial: Acta Constitutiva de REGULATEL, octubre de 2013 */
const FUENTE_ACTA = "Acta Constitutiva de REGULATEL, octubre de 2013";
const ACTA_PDF_URL = "/documents/ACTA-CONSTITUTIVA-REGULATEL-octubre-2013.pdf";
const ACTA_PDF_NAME = "ACTA CONSTITUTIVA DE REGULATEL octubre 2013.pdf";

const fadeIn = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const OBJETIVOS = [
  "Generar, facilitar, intercambiar y discutir información y experiencias sobre el marco regulatorio en un ambiente de convergencia y la gestión reguladora entre los países miembros del FORO REGULATEL, en materia de redes y servicios, y de mercados de las telecomunicaciones.",
  "Promover la armonización de la regulación de las telecomunicaciones para contribuir a la integración de la región.",
  "Identificar y defender los intereses regionales llevando posiciones comunes a foros internacionales.",
];

/** Artículo Cuarto del Acta Constitutiva: funciones a) a j) literalmente */
const FUNCIONES = [
  "Intercambiar información sobre el marco y la gestión reguladora, los servicios y el mercado de telecomunicaciones de los países miembros según lo dispuesto en la normatividad aplicable a cada uno de éstos.",
  "Impulsar la cooperación y el intercambio de funcionarios y personal técnico así como la realización de visitas institucionales entre sus miembros.",
  "Promover la armonización y la aproximación a las mejores prácticas regulatorias sobre las telecomunicaciones en la región.",
  "Analizar, evaluar y colaborar críticamente en los procesos de integración en los cuales intervienen los países de los reguladores miembros.",
  "Promover el conocimiento a nivel de sus miembros acerca de las diferentes experiencias y avances regulatorios y de competencia en el sector de las telecomunicaciones en América Latina y en otras regiones.",
  "Abordar el tratamiento de temas estratégicos que contribuyen al desarrollo y universalización de las telecomunicaciones y a su gestión regulatoria, en el marco de un contexto internacional globalizado y competitivo.",
  "Constituir un repositorio de información sobre la actividad regulatoria de sus miembros.",
  "Identificar y defender los intereses de la región buscando posiciones comunes en los distintos foros internacionales.",
  "Disponer en su página web de información actualizada en relación con la actividad del FORO.",
  "Realizar o promover la realización de estudios de regulación comparada y de mejores prácticas del sector.",
  "Las demás funciones que acuerde la Asamblea Plenaria.",
];

export default function ObjetivosYFunciones() {
  return (
    <InstitutionalLayout
      title="Objetivos y Funciones del Foro REGULATEL"
      subtitle="QUIÉNES SOMOS"
      breadcrumb={[{ label: "Objetivos y Funciones" }]}
    >
      {/* Lead editorial con componente compartido */}
      <InstitutionalLead source={FUENTE_ACTA}>
        A continuación se presentan los objetivos y las funciones que orientan la actuación del Foro REGULATEL en la región.
      </InstitutionalLead>

      {/* Objetivos */}
      <InstitutionalSection>
        <div className="mb-8 flex items-start gap-4">
          <div className="mt-1 h-8 w-[3px] flex-shrink-0 rounded-full" style={{ backgroundColor: "var(--regu-blue)" }} aria-hidden />
          <h2 className="text-xl font-bold md:text-2xl" style={{ color: "var(--regu-navy)", fontFamily: "var(--token-font-heading)" }}>Objetivos</h2>
        </div>
        <ul className="space-y-6 md:space-y-7 list-none p-0 m-0">
          {OBJETIVOS.map((text, index) => (
            <motion.li key={text.slice(0, 50)} initial="hidden" animate="visible" variants={fadeIn}>
              <InstitutionalCard className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-5 p-6 md:p-8 min-h-[13rem] md:min-h-[14rem]">
                <div
                  className="flex items-center justify-center w-12 h-12 rounded-xl flex-shrink-0 sm:self-start"
                  style={{ backgroundColor: "var(--regu-blue)", color: "white" }}
                  aria-hidden
                >
                  <Target className="w-6 h-6" />
                </div>
                <div className="min-w-0 flex-1 flex flex-col">
                  <span
                    className="text-sm font-semibold uppercase tracking-wider block mb-2 flex-shrink-0"
                    style={{ color: "var(--regu-blue)" }}
                  >
                    Objetivo {index + 1}
                  </span>
                  <p
                    className="text-base md:text-lg leading-relaxed md:text-justify flex-1"
                    style={{ color: "var(--regu-gray-900)" }}
                  >
                    {text}
                  </p>
                </div>
              </InstitutionalCard>
            </motion.li>
          ))}
        </ul>
      </InstitutionalSection>

      {/* Funciones */}
      <InstitutionalSection>
        <div className="mb-8 flex items-start gap-4">
          <div className="mt-1 h-8 w-[3px] flex-shrink-0 rounded-full" style={{ backgroundColor: "var(--regu-blue)" }} aria-hidden />
          <div>
            <h2 className="text-xl font-bold md:text-2xl" style={{ color: "var(--regu-navy)", fontFamily: "var(--token-font-heading)" }}>Funciones</h2>
            <p className="mt-1 text-sm" style={{ color: "var(--regu-gray-500)" }}>Art. 4° del Acta Constitutiva</p>
          </div>
        </div>
        <div
          className="rounded-2xl border p-8 md:p-10 lg:p-12"
          style={{
            backgroundColor: "var(--regu-white)",
            borderColor: "var(--regu-gray-100)",
            boxShadow: "0 1px 8px rgba(22, 61, 89, 0.05)",
          }}
        >
          <motion.ul
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="grid grid-cols-1 lg:grid-cols-2 gap-x-14 lg:gap-x-20 gap-y-7 md:gap-y-9"
          >
            {FUNCIONES.map((text, index) => (
              <motion.li
                key={`funcion-${index}`}
                variants={fadeIn}
                className="flex items-start gap-4 text-base md:text-lg leading-[1.75]"
                style={{ color: "var(--regu-gray-700)" }}
              >
                <CheckCircle2
                  className="w-5 h-5 flex-shrink-0 mt-1.5 opacity-90"
                  style={{ color: "var(--regu-blue)" }}
                />
                <span>{text}</span>
              </motion.li>
            ))}
          </motion.ul>
        </div>
      </InstitutionalSection>

      {/* Acta Constitutiva */}
      <InstitutionalSection>
        <motion.div initial="hidden" animate="visible" variants={fadeIn}>
          <div
            className="rounded-2xl border border-l-4 p-8 md:p-10 lg:p-14 flex flex-col sm:flex-row items-start sm:items-center gap-8 sm:gap-10"
            style={{
              backgroundColor: "var(--regu-white)",
              borderColor: "var(--regu-gray-200)",
              borderLeftColor: "var(--regu-blue)",
              borderLeftWidth: "5px",
              boxShadow: "0 6px 24px rgba(22, 61, 89, 0.08), 0 2px 8px rgba(22, 61, 89, 0.04)",
            }}
          >
            <div
              className="rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                width: "4.5rem",
                height: "4.5rem",
                backgroundColor: "rgba(68, 137, 198, 0.12)",
                color: "var(--regu-blue)",
              }}
            >
              <FileText className="w-9 h-9" />
            </div>
            <div className="flex-1 min-w-0">
              <p
                className="text-xs md:text-sm font-semibold uppercase tracking-wider mb-1.5"
                style={{ color: "var(--regu-blue)" }}
              >
                Documento oficial
              </p>
              <h3
                className="text-2xl md:text-3xl font-bold mb-2 tracking-tight"
                style={{ color: "var(--regu-gray-900)" }}
              >
                Acta Constitutiva
              </h3>
              <p
                className="text-sm md:text-base"
                style={{ color: "var(--regu-gray-600)" }}
              >
                {FUENTE_ACTA}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4 sm:shrink-0">
              <a
                href={ACTA_PDF_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl px-5 py-3.5 text-sm font-semibold transition-all hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)] focus-visible:ring-offset-2 border-2"
                style={{
                  borderColor: "var(--regu-blue)",
                  color: "var(--regu-blue)",
                  backgroundColor: "transparent",
                }}
              >
                <Eye className="w-4 h-4" />
                Vista previa
              </a>
              <a
                href={ACTA_PDF_URL}
                download={ACTA_PDF_NAME}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl px-5 py-3.5 text-sm font-semibold text-white transition-all hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)] focus-visible:ring-offset-2"
                style={{ backgroundColor: "var(--regu-blue)" }}
              >
                <Download className="w-4 h-4" />
                Descargar
              </a>
            </div>
          </div>
        </motion.div>
      </InstitutionalSection>
    </InstitutionalLayout>
  );
}

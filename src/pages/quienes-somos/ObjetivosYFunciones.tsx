import { motion } from "framer-motion";
import { CheckCircle2, Target } from "lucide-react";
import InstitutionalLayout, {
  InstitutionalSection,
  InstitutionalH2,
  InstitutionalCard,
} from "@/components/institutional/InstitutionalLayout";

const fadeIn = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const OBJETIVOS = [
  "Generar, facilitar, intercambiar y discutir información y experiencias sobre el marco regulatorio en un ambiente de convergencia y la gestión reguladora entre los países miembros del FORO REGULATEL, en materia de redes y servicios, y de mercados de las telecomunicaciones.",
  "Promover la armonización de la regulación de las telecomunicaciones para contribuir a la integración de la región.",
  "Identificar y defender los intereses regionales llevando posiciones comunes a foros internacionales.",
];

const FUNCIONES = [
  "Intercambiar información sobre el marco y la gestión reguladora, los servicios y el mercado de telecomunicaciones de los países miembros, según lo dispuesto en la normatividad aplicable a cada uno de estos.",
  "Impulsar la cooperación y el intercambio de funcionarios y personal técnico, así como la realización de visitas institucionales entre sus miembros.",
  "Promover la armonización y la aproximación a las mejores prácticas regulatorias sobre las telecomunicaciones en la región.",
  "Analizar, evaluar y colaborar críticamente en los procesos de integración en los cuales intervienen los países de los reguladores miembros.",
  "Promover el conocimiento a nivel de sus miembros acerca de las diferentes experiencias y avances regulatorios y de competencia en el sector de las telecomunicaciones en América Latina y en otras regiones.",
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
      {/* Bloque introductorio: conecta hero con contenido */}
      <motion.p
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="mb-14 md:mb-16 lg:mb-20 text-lg md:text-xl leading-relaxed max-w-3xl"
        style={{ color: "var(--regu-gray-700)" }}
      >
        A continuación se presentan los objetivos y las funciones que orientan la actuación del Foro REGULATEL en la región.
      </motion.p>

      {/* Objetivos: cards para mayor presencia visual */}
      <InstitutionalSection className="mb-16 md:mb-20 lg:mb-24">
        <div className="mb-8 md:mb-10">
          <h2
            className="text-2xl md:text-3xl font-bold mb-2"
            style={{ color: "var(--regu-gray-900)" }}
          >
            Objetivos
          </h2>
          <div
            className="h-1 w-16 rounded-full"
            style={{ backgroundColor: "var(--regu-blue)" }}
            aria-hidden
          />
        </div>
        <ul className="space-y-5 md:space-y-6">
          {OBJETIVOS.map((text, index) => (
            <motion.li
              key={text.slice(0, 50)}
              initial="hidden"
              animate="visible"
              variants={fadeIn}
            >
              <InstitutionalCard className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-5 p-6 md:p-8">
                <div
                  className="flex items-center justify-center w-12 h-12 rounded-xl flex-shrink-0"
                  style={{ backgroundColor: "var(--regu-blue)", color: "white" }}
                  aria-hidden
                >
                  <Target className="w-6 h-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <span
                    className="text-sm font-semibold uppercase tracking-wider block mb-2"
                    style={{ color: "var(--regu-blue)" }}
                  >
                    Objetivo {index + 1}
                  </span>
                  <p
                    className="text-base md:text-lg leading-relaxed md:text-justify"
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

      {/* Funciones: sección diferenciada, 2 columnas en desktop */}
      <InstitutionalSection>
        <div className="mb-8 md:mb-10">
          <h2
            className="text-2xl md:text-3xl font-bold mb-2"
            style={{ color: "var(--regu-gray-900)" }}
          >
            Funciones
          </h2>
          <div
            className="h-1 w-16 rounded-full"
            style={{ backgroundColor: "var(--regu-blue)" }}
            aria-hidden
          />
        </div>
        <div
          className="rounded-2xl border p-6 md:p-8 lg:p-10"
          style={{
            backgroundColor: "var(--regu-white)",
            borderColor: "var(--regu-gray-100)",
            boxShadow: "var(--token-shadow-card)",
          }}
        >
          <motion.ul
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="grid grid-cols-1 lg:grid-cols-2 gap-x-10 lg:gap-x-14 gap-y-5 md:gap-y-6"
          >
            {FUNCIONES.map((text) => (
              <motion.li
                key={text.slice(0, 50)}
                variants={fadeIn}
                className="flex items-start gap-3 text-base md:text-lg leading-relaxed"
                style={{ color: "var(--regu-gray-900)" }}
              >
                <CheckCircle2
                  className="w-6 h-6 flex-shrink-0 mt-0.5"
                  style={{ color: "var(--regu-blue)" }}
                />
                <span>{text}</span>
              </motion.li>
            ))}
          </motion.ul>
        </div>
      </InstitutionalSection>
    </InstitutionalLayout>
  );
}

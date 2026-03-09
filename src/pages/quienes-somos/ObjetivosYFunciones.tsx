import { motion } from "framer-motion";
import { CheckCircle2, Target } from "lucide-react";
import InstitutionalLayout, {
  InstitutionalSection,
  InstitutionalH2,
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
      <InstitutionalSection>
        <InstitutionalH2>Objetivos</InstitutionalH2>
        <motion.ul
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="space-y-4"
        >
          {OBJETIVOS.map((text) => (
            <motion.li
              key={text.slice(0, 50)}
              variants={fadeIn}
              className="flex items-start gap-3 text-base md:text-lg leading-relaxed md:text-justify"
              style={{ color: "var(--regu-gray-900)" }}
            >
              <Target
                className="w-6 h-6 flex-shrink-0 mt-0.5"
                style={{ color: "var(--regu-blue)" }}
              />
              <span>{text}</span>
            </motion.li>
          ))}
        </motion.ul>
      </InstitutionalSection>

      <InstitutionalSection>
        <InstitutionalH2>Funciones</InstitutionalH2>
        <motion.ul
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="space-y-4"
        >
          {FUNCIONES.map((text) => (
            <motion.li
              key={text.slice(0, 50)}
              variants={fadeIn}
              className="flex items-start gap-3 text-base md:text-lg leading-relaxed md:text-justify"
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
      </InstitutionalSection>
    </InstitutionalLayout>
  );
}

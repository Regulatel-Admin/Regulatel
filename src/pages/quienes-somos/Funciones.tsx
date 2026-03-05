import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import InstitutionalLayout, {
  InstitutionalSection,
  InstitutionalH2,
} from "@/components/institutional/InstitutionalLayout";

const fadeIn = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const FUNCIONES = [
  "Facilitar el intercambio de información entre autoridades regulatorias.",
  "Promover el análisis conjunto de tendencias del sector telecomunicaciones.",
  "Identificar desafíos regulatorios comunes en la región.",
  "Desarrollar estudios e iniciativas de cooperación técnica.",
  "Impulsar la armonización de políticas regulatorias.",
  "Representar intereses regionales en espacios internacionales.",
];

const GRUPOS_TEMAS = [
  "regulación de mercados",
  "infraestructura digital",
  "conectividad",
  "innovación tecnológica",
  "economía digital",
];

export default function Funciones() {
  return (
    <InstitutionalLayout
      title="Funciones del Foro REGULATEL"
      subtitle="QUIÉNES SOMOS"
      breadcrumb={[{ label: "Funciones" }]}
    >
      <InstitutionalSection>
        <InstitutionalH2>Las principales funciones del Foro incluyen:</InstitutionalH2>
        <motion.ul
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="space-y-4"
        >
          {FUNCIONES.map((text) => (
            <motion.li
              key={text}
              variants={fadeIn}
              className="flex items-start gap-3 text-base md:text-lg"
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

      <InstitutionalSection>
        <InstitutionalH2>Grupos de trabajo</InstitutionalH2>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="space-y-4"
        >
          <p
            className="text-base md:text-lg leading-relaxed"
            style={{ color: "var(--regu-gray-900)" }}
          >
            REGULATEL desarrolla su labor a través de grupos técnicos especializados que analizan
            temas como:
          </p>
          <ul
            className="list-disc list-inside space-y-2 text-base md:text-lg ml-2"
            style={{ color: "var(--regu-gray-900)" }}
          >
            {GRUPOS_TEMAS.map((tema) => (
              <li key={tema}>{tema}</li>
            ))}
          </ul>
        </motion.div>
      </InstitutionalSection>
    </InstitutionalLayout>
  );
}

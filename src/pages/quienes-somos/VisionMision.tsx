import { motion } from "framer-motion";
import { Handshake, Eye, Lightbulb, FileText, Download } from "lucide-react";
import InstitutionalLayout, {
  InstitutionalSection,
  InstitutionalH2,
  InstitutionalCard,
} from "@/components/institutional/InstitutionalLayout";

const ACTA_PDF_URL = "/documents/Protocolos-de-REGULATEL-10julio-2014-final.pdf";
const ACTA_PDF_NAME = "Protocolos de REGULATEL _10julio_2014_final.pdf";

const fadeIn = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const PRINCIPLES = [
  {
    title: "Cooperación regional",
    text: "Promover el trabajo conjunto entre reguladores de la región.",
    icon: Handshake,
  },
  {
    title: "Transparencia",
    text: "Compartir información relevante para fortalecer las decisiones regulatorias.",
    icon: Eye,
  },
  {
    title: "Innovación regulatoria",
    text: "Adaptar los marcos regulatorios a la evolución tecnológica.",
    icon: Lightbulb,
  },
] as const;

export default function VisionMision() {
  return (
    <InstitutionalLayout
      title="Visión y misión de REGULATEL"
      subtitle="QUIÉNES SOMOS"
      breadcrumb={[{ label: "Visión y misión" }]}
    >
      <InstitutionalSection>
        <InstitutionalH2>Misión</InstitutionalH2>
        <motion.p
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="text-base md:text-lg leading-relaxed max-w-3xl md:text-justify"
          style={{ color: "var(--regu-gray-900)" }}
        >
          Fortalecer la cooperación entre las autoridades reguladoras de telecomunicaciones de
          América Latina, España, Portugal e Italia mediante el intercambio de experiencias, la
          coordinación de iniciativas regionales y el desarrollo de posiciones comunes que
          contribuyan al crecimiento sostenible del ecosistema digital.
        </motion.p>
      </InstitutionalSection>

      <InstitutionalSection>
        <InstitutionalH2>Visión</InstitutionalH2>
        <motion.p
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="text-base md:text-lg leading-relaxed max-w-3xl md:text-justify"
          style={{ color: "var(--regu-gray-900)" }}
        >
          Consolidarse como el principal foro regional de referencia para el análisis, cooperación e
          intercambio de buenas prácticas regulatorias en telecomunicaciones y economía digital.
        </motion.p>
      </InstitutionalSection>

      <InstitutionalSection>
        <InstitutionalH2>Principios institucionales</InstitutionalH2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {PRINCIPLES.map((item, i) => (
            <motion.div
              key={item.title}
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              transition={{ delay: i * 0.08 }}
            >
              <InstitutionalCard className="h-full flex flex-col">
                <div
                  className="mb-6 flex h-14 w-14 shrink-0 items-center justify-center rounded-xl p-3"
                  style={{ backgroundColor: "rgba(68, 137, 198, 0.12)", color: "var(--regu-blue)" }}
                >
                  <item.icon className="h-6 w-6 shrink-0" strokeWidth={1.75} aria-hidden />
                </div>
                <h3
                  className="mb-3 text-lg font-bold"
                  style={{ color: "var(--regu-gray-900)" }}
                >
                  {item.title}
                </h3>
                <p
                  className="flex-1 text-base leading-relaxed"
                  style={{ color: "var(--regu-gray-500)" }}
                >
                  {item.text}
                </p>
              </InstitutionalCard>
            </motion.div>
          ))}
        </div>
      </InstitutionalSection>

      <InstitutionalSection>
        <InstitutionalH2>Acta constitutiva</InstitutionalH2>
        <motion.div initial="hidden" animate="visible" variants={fadeIn}>
          <InstitutionalCard className="flex flex-col items-start gap-8 sm:flex-row sm:items-center">
            <div
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl p-3.5"
              style={{ backgroundColor: "rgba(68, 137, 198, 0.12)", color: "var(--regu-blue)" }}
            >
              <FileText className="h-7 w-7 shrink-0" strokeWidth={1.75} aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <h3
                className="mb-2 text-lg font-bold"
                style={{ color: "var(--regu-gray-900)" }}
              >
                Documento institucional
              </h3>
              <p
                className="text-sm"
                style={{ color: "var(--regu-gray-500)" }}
              >
                Protocolos y procedimientos del foro (2014)
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <a
                href={ACTA_PDF_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-all hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)] focus-visible:ring-offset-2 border-2"
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
                className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white transition-all hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)] focus-visible:ring-offset-2"
                style={{ backgroundColor: "var(--regu-blue)" }}
              >
                <Download className="w-4 h-4" />
                Descargar
              </a>
            </div>
          </InstitutionalCard>
        </motion.div>
      </InstitutionalSection>
    </InstitutionalLayout>
  );
}

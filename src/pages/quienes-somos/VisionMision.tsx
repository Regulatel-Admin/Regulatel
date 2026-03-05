import { motion } from "framer-motion";
import { Handshake, Eye, Lightbulb } from "lucide-react";
import InstitutionalLayout, {
  InstitutionalSection,
  InstitutionalH2,
  InstitutionalCard,
} from "@/components/institutional/InstitutionalLayout";

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
          className="text-base md:text-lg leading-relaxed max-w-3xl"
          style={{ color: "var(--regu-gray-900)" }}
        >
          Fortalecer la cooperación entre las autoridades reguladoras de telecomunicaciones de
          América Latina mediante el intercambio de experiencias, la coordinación de iniciativas
          regionales y el desarrollo de posiciones comunes que contribuyan al crecimiento sostenible
          del ecosistema digital.
        </motion.p>
      </InstitutionalSection>

      <InstitutionalSection>
        <InstitutionalH2>Visión</InstitutionalH2>
        <motion.p
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="text-base md:text-lg leading-relaxed max-w-3xl"
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
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: "rgba(68, 137, 198, 0.12)", color: "var(--regu-blue)" }}
                >
                  <item.icon className="w-6 h-6" />
                </div>
                <h3
                  className="text-lg font-bold mb-2"
                  style={{ color: "var(--regu-gray-900)" }}
                >
                  {item.title}
                </h3>
                <p
                  className="text-base leading-relaxed flex-1"
                  style={{ color: "var(--regu-gray-500)" }}
                >
                  {item.text}
                </p>
              </InstitutionalCard>
            </motion.div>
          ))}
        </div>
      </InstitutionalSection>
    </InstitutionalLayout>
  );
}

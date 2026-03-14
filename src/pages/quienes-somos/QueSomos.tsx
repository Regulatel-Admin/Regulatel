import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Users, Globe, BookOpen } from "lucide-react";
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
  {
    icon: BookOpen,
    label: "Objetivo 1",
    text: "Generar, facilitar e intercambiar información y experiencias sobre marcos regulatorios y gestión regulatoria en un entorno de convergencia tecnológica.",
  },
  {
    icon: Globe,
    label: "Objetivo 2",
    text: "Promover la armonización de la regulación de las telecomunicaciones para contribuir a la integración regional.",
  },
  {
    icon: Users,
    label: "Objetivo 3",
    text: "Identificar y defender intereses regionales mediante posiciones comunes en foros internacionales.",
  },
];

export default function QueSomos() {
  return (
    <InstitutionalLayout
      title="¿Qué es REGULATEL?"
      subtitle="QUIÉNES SOMOS"
      breadcrumb={[{ label: "Qué somos" }]}
    >
      {/* Descripción institucional */}
      <InstitutionalSection>
        <InstitutionalH2>Quiénes somos</InstitutionalH2>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="space-y-5 text-base md:text-lg leading-relaxed"
          style={{ color: "var(--regu-gray-700)" }}
        >
          <p>
            El Foro Latinoamericano de Entes Reguladores en Telecomunicaciones (REGULATEL) funciona
            como un espacio multilateral de cooperación entre autoridades reguladoras de
            telecomunicaciones de América Latina, España, Portugal e Italia.
          </p>
          <p>
            Constituye como un mecanismo flexible y eficiente de colaboración basado en las
            infraestructuras institucionales existentes en cada país miembro. REGULATEL facilita el
            intercambio de información, experiencias y buenas prácticas regulatorias entre sus
            miembros.
          </p>
          <p>
            A través de este foro se promueve el análisis conjunto de políticas públicas, estrategias
            regulatorias, evolución de los mercados y desarrollo de los servicios de
            telecomunicaciones en la región.
          </p>
          <p>
            REGULATEL permite que los reguladores de la región dispongan de un marco permanente de
            diálogo técnico que fortalece la cooperación regional y el desarrollo del ecosistema
            digital.
          </p>
        </motion.div>
      </InstitutionalSection>

      {/* Objetivos — cards visuales */}
      <InstitutionalSection>
        <InstitutionalH2
          subtitle="Extraídos del Acta Constitutiva de REGULATEL, octubre de 2013"
        >
          Objetivos
        </InstitutionalH2>
        <ul className="space-y-4 list-none p-0 m-0">
          {OBJETIVOS.map((obj, index) => {
            const Icon = obj.icon;
            return (
              <motion.li
                key={obj.label}
                initial="hidden"
                animate="visible"
                variants={{ ...fadeIn, visible: { ...fadeIn.visible, transition: { duration: 0.4, delay: index * 0.08 } } }}
              >
                <InstitutionalCard className="flex flex-col gap-4 p-6 md:p-8 sm:flex-row sm:items-start sm:gap-6">
                  <div
                    className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl"
                    style={{ backgroundColor: "var(--regu-blue)", color: "#ffffff" }}
                    aria-hidden
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span
                      className="mb-2 block text-xs font-bold uppercase tracking-[0.10em]"
                      style={{ color: "var(--regu-blue)" }}
                    >
                      {obj.label}
                    </span>
                    <p
                      className="text-base leading-relaxed md:text-[1.0625rem]"
                      style={{ color: "var(--regu-gray-800)" }}
                    >
                      {obj.text}
                    </p>
                  </div>
                </InstitutionalCard>
              </motion.li>
            );
          })}
        </ul>
        <div className="mt-6 flex items-center gap-2">
          <Link
            to="/objetivos-y-funciones"
            className="inline-flex items-center gap-1.5 text-sm font-semibold transition-all hover:gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)] focus-visible:ring-offset-2"
            style={{ color: "var(--regu-blue)" }}
          >
            Ver objetivos y funciones completos
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </InstitutionalSection>

      {/* Links a otras secciones */}
      <InstitutionalSection>
        <InstitutionalH2>Conoce más sobre REGULATEL</InstitutionalH2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[
            { to: "/vision-mision", label: "Visión y Misión", desc: "Los valores y principios que guían al Foro" },
            { to: "/autoridades", label: "Autoridades actuales", desc: "Presidente y Vicepresidentes del período" },
            { to: "/miembros", label: "Miembros", desc: "Los entes reguladores que conforman REGULATEL" },
            { to: "/objetivos-y-funciones", label: "Objetivos y Funciones", desc: "El mandato institucional completo" },
          ].map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="group flex items-start gap-4 rounded-2xl border bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(22,61,89,0.10)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)] focus-visible:ring-offset-2"
              style={{ borderColor: "rgba(22,61,89,0.10)" }}
            >
              <div
                className="mt-0.5 h-2 w-2 flex-shrink-0 rounded-full"
                style={{ backgroundColor: "var(--regu-blue)" }}
                aria-hidden
              />
              <div className="min-w-0 flex-1">
                <p
                  className="font-bold leading-snug transition-colors group-hover:text-[var(--regu-blue)]"
                  style={{ color: "var(--regu-navy)", fontFamily: "var(--token-font-heading)" }}
                >
                  {item.label}
                </p>
                <p className="mt-0.5 text-sm" style={{ color: "var(--regu-gray-500)" }}>
                  {item.desc}
                </p>
              </div>
              <ArrowRight
                className="h-4 w-4 flex-shrink-0 self-center opacity-30 transition-all group-hover:opacity-100"
                style={{ color: "var(--regu-blue)" }}
                aria-hidden
              />
            </Link>
          ))}
        </div>
      </InstitutionalSection>
    </InstitutionalLayout>
  );
}

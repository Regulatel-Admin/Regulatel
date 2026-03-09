import { motion } from "framer-motion";
import InstitutionalLayout, {
  InstitutionalSection,
  InstitutionalH2,
} from "@/components/institutional/InstitutionalLayout";

const fadeIn = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function QueSomos() {
  return (
    <InstitutionalLayout
      title="¿Qué es REGULATEL?"
      subtitle="QUIÉNES SOMOS"
      breadcrumb={[{ label: "Qué somos" }]}
    >
      <InstitutionalSection>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="mb-10 md:mb-12"
        >
          <InstitutionalH2>Conoce REGULATEL</InstitutionalH2>
          <div
            className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed py-16 px-6 md:py-20 md:px-8"
            style={{
              maxWidth: "900px",
              borderColor: "var(--regu-gray-200)",
              backgroundColor: "var(--regu-gray-50)",
            }}
          >
            <p
              className="text-center text-lg md:text-xl font-semibold mb-2"
              style={{ color: "var(--regu-gray-800)" }}
            >
              Contenido en elaboración
            </p>
            <p
              className="text-center text-sm md:text-base max-w-md"
              style={{ color: "var(--regu-gray-600)" }}
            >
              Esta sección audiovisual estará disponible próximamente.
            </p>
          </div>
        </motion.div>
      </InstitutionalSection>

      <InstitutionalSection>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="space-y-5 text-base md:text-lg leading-relaxed md:text-justify"
          style={{ color: "var(--regu-gray-900)" }}
        >
          <p>
            El Foro Latinoamericano de Entes Reguladores en Telecomunicaciones (REGULATEL) es una
            organización sin fines de lucro que funciona como un espacio multilateral de cooperación
            entre autoridades reguladoras de telecomunicaciones de América Latina.
          </p>
          <p>
            El Foro se constituye como un mecanismo flexible y eficiente de colaboración basado en
            las infraestructuras institucionales existentes en cada país miembro. REGULATEL facilita
            el intercambio de información, experiencias y buenas prácticas regulatorias entre sus
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

      <InstitutionalSection>
        <InstitutionalH2>Objetivos de REGULATEL</InstitutionalH2>
        <motion.ol
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="space-y-4 list-decimal list-inside text-base md:text-lg md:text-justify"
          style={{ color: "var(--regu-gray-900)" }}
        >
          <li>
            Generar, facilitar e intercambiar información y experiencias sobre marcos regulatorios y
            gestión regulatoria en un entorno de convergencia tecnológica.
          </li>
          <li>
            Promover la armonización de la regulación de las telecomunicaciones para contribuir a la
            integración regional.
          </li>
          <li>
            Identificar y defender intereses regionales mediante posiciones comunes en foros
            internacionales.
          </li>
        </motion.ol>
      </InstitutionalSection>
    </InstitutionalLayout>
  );
}

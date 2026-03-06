import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import InstitutionalLayout, {
  InstitutionalSection,
  InstitutionalH2,
} from "@/components/institutional/InstitutionalLayout";

const VIDEO_URL = "/videos/Video-pagina-web-REGULATEL.mp4";

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
          <p
            className="mb-6 text-base md:text-lg leading-relaxed"
            style={{ color: "var(--regu-gray-700)" }}
          >
            Te invitamos a ver este video institucional sobre el foro y su labor en la región.
          </p>
          <div
            className="overflow-hidden rounded-2xl bg-[var(--regu-gray-900)] shadow-[0_20px_50px_rgba(22,61,89,0.15)]"
            style={{
              aspectRatio: "16/9",
              maxWidth: "900px",
            }}
          >
            <video
              className="h-full w-full object-cover"
              src={VIDEO_URL}
              controls
              playsInline
              preload="metadata"
              title="Video institucional REGULATEL"
            >
              <track kind="captions" />
              Tu navegador no soporta la reproducción de video.
            </video>
          </div>
        </motion.div>
      </InstitutionalSection>

      <InstitutionalSection>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="space-y-5 text-base md:text-lg leading-relaxed"
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
          className="space-y-4 list-decimal list-inside text-base md:text-lg"
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

      <InstitutionalSection>
        <InstitutionalH2>BIT-REGULATEL</InstitutionalH2>
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
            BIT-REGULATEL es la herramienta de análisis e información estadística desarrollada por
            el foro que reúne indicadores relevantes del sector de telecomunicaciones en los países
            miembros.
          </p>
          <p
            className="text-base md:text-lg leading-relaxed"
            style={{ color: "var(--regu-gray-900)" }}
          >
            Esta plataforma permite consultar tableros interactivos con indicadores como:
          </p>
          <ul
            className="list-disc list-inside space-y-2 text-base md:text-lg ml-2"
            style={{ color: "var(--regu-gray-900)" }}
          >
            <li>uso de Internet</li>
            <li>penetración de servicios</li>
            <li>teledensidad fija y móvil</li>
            <li>evolución de los mercados</li>
          </ul>
          <p
            className="text-base md:text-lg leading-relaxed"
            style={{ color: "var(--regu-gray-900)" }}
          >
            La información se actualiza periódicamente y sirve como base para estudios comparativos,
            análisis regulatorios y toma de decisiones en la región.
          </p>
          <div className="pt-4">
            <a
              href="https://www.regulatel.org/bit-regulatel"
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-2 rounded-xl border-2 px-5 py-3 text-sm font-semibold uppercase tracking-wide transition-all hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)] focus-visible:ring-offset-2"
              style={{
                borderColor: "var(--regu-blue)",
                color: "var(--regu-blue)",
              }}
            >
              Explorar BIT-REGULATEL
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </motion.div>
      </InstitutionalSection>
    </InstitutionalLayout>
  );
}

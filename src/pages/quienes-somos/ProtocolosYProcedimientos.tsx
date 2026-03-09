import { motion } from "framer-motion";
import { FileText, Download, CheckCircle2, Eye } from "lucide-react";
import InstitutionalLayout, {
  InstitutionalSection,
  InstitutionalH2,
  InstitutionalCard,
} from "@/components/institutional/InstitutionalLayout";

const fadeIn = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const PROTOCOLOS_PDF_URL = "/documents/Protocolos-de-REGULATEL-10julio-2014-final.pdf";
const PROTOCOLOS_PDF_NAME = "Protocolos de REGULATEL _10julio_2014_final.pdf";

/** Resumen de los principales bloques del documento institucional (PDF 2014) */
const PROTOCOLOS_TEMAS = [
  "Elección del Presidente, Vicepresidentes y Comité Ejecutivo",
  "Organismo de gestión del foro",
  "Miembros observadores",
  "Finanzas",
  "Calendario",
  "Convocatoria de reuniones",
  "Votación presencial y votación electrónica",
  "Corresponsalías, plan de trabajo anual y grupos de trabajo",
  "Página web y uso de herramientas electrónicas",
  "Cooperación internacional",
];

export default function ProtocolosYProcedimientos() {
  return (
    <InstitutionalLayout
      title="Protocolos y procedimientos del foro de REGULATEL"
      subtitle="QUIÉNES SOMOS"
      breadcrumb={[{ label: "Protocolos y procedimientos" }]}
    >
      <InstitutionalSection>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="space-y-12"
        >
          {/* Sección 1: Estatutos: pendiente */}
          <div>
            <InstitutionalH2>Estatutos: pendiente</InstitutionalH2>
            <div
              className="rounded-xl border-2 border-dashed py-8 px-6 text-center"
              style={{
                borderColor: "var(--regu-gray-200)",
                backgroundColor: "var(--regu-gray-50)",
              }}
            >
              <p
                className="text-base md:text-lg font-medium"
                style={{ color: "var(--regu-gray-700)" }}
              >
                Contenido en elaboración.
              </p>
              <p
                className="text-sm mt-1"
                style={{ color: "var(--regu-gray-500)" }}
              >
                Esta sección estará disponible próximamente.
              </p>
            </div>
          </div>

          {/* Sección 2: Reglamento: pendiente */}
          <div>
            <InstitutionalH2>Reglamento: pendiente</InstitutionalH2>
            <div
              className="rounded-xl border-2 border-dashed py-8 px-6 text-center"
              style={{
                borderColor: "var(--regu-gray-200)",
                backgroundColor: "var(--regu-gray-50)",
              }}
            >
              <p
                className="text-base md:text-lg font-medium"
                style={{ color: "var(--regu-gray-700)" }}
              >
                Contenido en elaboración.
              </p>
              <p
                className="text-sm mt-1"
                style={{ color: "var(--regu-gray-500)" }}
              >
                Esta sección estará disponible próximamente.
              </p>
            </div>
          </div>

          {/* Sección 3: Protocolos */}
          <div>
            <InstitutionalH2>Protocolos</InstitutionalH2>
            <div
              className="space-y-6 text-base md:text-lg leading-relaxed md:text-justify"
              style={{ color: "var(--regu-gray-900)" }}
            >
              <p>
                El funcionamiento del Foro REGULATEL se rige actualmente por un conjunto de
                protocolos y procedimientos, actualizados al 2014, que establecen su estructura
                organizativa, mecanismos de coordinación y procesos de toma de decisiones.
              </p>
              <p>
                Estas disposiciones garantizan el correcto funcionamiento del foro, la participación
                de sus miembros y la transparencia en sus actividades.
              </p>
            </div>

            <p
              className="mt-6 text-base font-semibold"
              style={{ color: "var(--regu-gray-800)" }}
            >
              Los protocolos principales del FORO abordan, entre otros, los siguientes temas:
            </p>
            <ul className="mt-4 space-y-3">
              {PROTOCOLOS_TEMAS.map((tema, i) => (
                <motion.li
                  key={tema}
                  initial="hidden"
                  animate="visible"
                  variants={fadeIn}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-start gap-3 text-base md:text-lg"
                  style={{ color: "var(--regu-gray-900)" }}
                >
                  <CheckCircle2
                    className="w-5 h-5 flex-shrink-0 mt-0.5"
                    style={{ color: "var(--regu-blue)" }}
                  />
                  <span>{tema}</span>
                </motion.li>
              ))}
            </ul>

            <InstitutionalCard className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: "rgba(68, 137, 198, 0.12)", color: "var(--regu-blue)" }}
              >
                <FileText className="w-7 h-7" />
              </div>
              <div className="flex-1 min-w-0">
                <h3
                  className="text-lg font-bold mb-1"
                  style={{ color: "var(--regu-gray-900)" }}
                >
                  Protocolos y seguimientos del foro de Regulatel (julio 2014)
                </h3>
                <p
                  className="text-sm"
                  style={{ color: "var(--regu-gray-500)" }}
                >
                  Documento institucional completo
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <a
                  href={PROTOCOLOS_PDF_URL}
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
                  href={PROTOCOLOS_PDF_URL}
                  download={PROTOCOLOS_PDF_NAME}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white transition-all hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)] focus-visible:ring-offset-2"
                  style={{ backgroundColor: "var(--regu-blue)" }}
                >
                  <Download className="w-4 h-4" />
                  Descargar PDF
                </a>
              </div>
            </InstitutionalCard>
          </div>
        </motion.div>
      </InstitutionalSection>
    </InstitutionalLayout>
  );
}

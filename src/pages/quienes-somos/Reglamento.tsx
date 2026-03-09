import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FileText, Download } from "lucide-react";
import InstitutionalLayout, {
  InstitutionalSection,
  InstitutionalCard,
} from "@/components/institutional/InstitutionalLayout";

const fadeIn = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

/** URL del reglamento cuando exista documento oficial; mientras tanto enlace a gestión o placeholder */
const REGLAMENTO_DOWNLOAD_URL = "/gestion?tipo=documentos";

export default function Reglamento() {
  return (
    <InstitutionalLayout
      title="Reglamento institucional"
      subtitle="QUIÉNES SOMOS"
      breadcrumb={[{ label: "Reglamento" }]}
    >
      <InstitutionalSection>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="space-y-5 text-base md:text-lg leading-relaxed md:text-justify"
          style={{ color: "var(--regu-gray-900)" }}
        >
          <p>
            El funcionamiento del Foro REGULATEL se rige por un conjunto de principios y normas que
            establecen su estructura organizativa, mecanismos de coordinación y procesos de toma de
            decisiones.
          </p>
          <p>
            Estas disposiciones garantizan el correcto funcionamiento del foro, la participación de
            sus miembros y la transparencia en sus actividades.
          </p>
        </motion.div>
      </InstitutionalSection>

      <InstitutionalSection>
        <motion.div initial="hidden" animate="visible" variants={fadeIn}>
          <InstitutionalCard className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: "rgba(68, 137, 198, 0.12)", color: "var(--regu-blue)" }}
            >
              <FileText className="w-7 h-7" />
            </div>
            <div className="flex-1 min-w-0">
              <h2
                className="text-xl font-bold mb-1"
                style={{ color: "var(--regu-gray-900)" }}
              >
                Reglamento de REGULATEL
              </h2>
              <p
                className="text-sm"
                style={{ color: "var(--regu-gray-500)" }}
              >
                Documento institucional
              </p>
            </div>
            <Link
              to={REGLAMENTO_DOWNLOAD_URL}
              className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white transition-all hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)] focus-visible:ring-offset-2"
              style={{ backgroundColor: "var(--regu-blue)" }}
            >
              <Download className="w-4 h-4" />
              Descargar reglamento
            </Link>
          </InstitutionalCard>
        </motion.div>
      </InstitutionalSection>
    </InstitutionalLayout>
  );
}

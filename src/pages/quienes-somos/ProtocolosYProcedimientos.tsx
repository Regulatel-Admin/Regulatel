import { motion } from "framer-motion";
import { FileText, Download, CheckCircle2, Eye } from "lucide-react";
import { useTranslation } from "react-i18next";
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
const ACTA_CONSTITUTIVA_PDF_URL = "/documents/ACTA-CONSTITUTIVA-REGULATEL-octubre-2013.pdf";
const ACTA_CONSTITUTIVA_PDF_NAME = "ACTA CONSTITUTIVA DE REGULATEL, octubre de 2013. (1).pdf";

export default function ProtocolosYProcedimientos() {
  const { t } = useTranslation();
  const intro = t("pages.protocolos.intro", { returnObjects: true }) as string[];
  const topics = t("pages.protocolos.topics", { returnObjects: true }) as string[];

  return (
    <InstitutionalLayout
      title={t("pages.protocolos.title")}
      subtitle={t("pages.protocolos.subtitle")}
      breadcrumb={[{ label: t("pages.protocolos.breadcrumb") }]}
    >
      <InstitutionalSection>
        <motion.div initial="hidden" animate="visible" variants={fadeIn} className="space-y-12">
          <div>
            <InstitutionalH2>{t("pages.protocolos.sectionTitle")}</InstitutionalH2>
            <div className="space-y-6 text-base md:text-lg leading-relaxed md:text-justify" style={{ color: "var(--regu-gray-900)" }}>
              {intro.map((p) => (
                <p key={p.slice(0, 40)}>{p}</p>
              ))}
            </div>

            <p className="mt-6 text-base font-semibold" style={{ color: "var(--regu-gray-800)" }}>
              {t("pages.protocolos.topicsIntro")}
            </p>
            <ul className="mt-4 space-y-3">
              {topics.map((tema, i) => (
                <motion.li
                  key={tema}
                  initial="hidden"
                  animate="visible"
                  variants={fadeIn}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-start gap-3 text-base md:text-lg"
                  style={{ color: "var(--regu-gray-900)" }}
                >
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "var(--regu-blue)" }} />
                  <span>{tema}</span>
                </motion.li>
              ))}
            </ul>

            <InstitutionalCard className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "rgba(68, 137, 198, 0.12)", color: "var(--regu-blue)" }}>
                <FileText className="w-7 h-7" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold mb-1" style={{ color: "var(--regu-gray-900)" }}>
                  {t("pages.protocolos.protocolsDocTitle")}
                </h3>
                <p className="text-sm" style={{ color: "var(--regu-gray-500)" }}>
                  {t("pages.protocolos.fullInstitutionalDocument")}
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <a href={PROTOCOLOS_PDF_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-all hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)] focus-visible:ring-offset-2 border-2" style={{ borderColor: "var(--regu-blue)", color: "var(--regu-blue)", backgroundColor: "transparent" }}>
                  <Eye className="w-4 h-4" />
                  {t("common.preview")}
                </a>
                <a href={PROTOCOLOS_PDF_URL} download={PROTOCOLOS_PDF_NAME} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white transition-all hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)] focus-visible:ring-offset-2" style={{ backgroundColor: "var(--regu-blue)" }}>
                  <Download className="w-4 h-4" />
                  {t("common.downloadPdf")}
                </a>
              </div>
            </InstitutionalCard>

            <InstitutionalCard className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "rgba(68, 137, 198, 0.12)", color: "var(--regu-blue)" }}>
                <FileText className="w-7 h-7" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold mb-1" style={{ color: "var(--regu-gray-900)" }}>
                  {t("pages.protocolos.foundingActDocTitle")}
                </h3>
                <p className="text-sm" style={{ color: "var(--regu-gray-500)" }}>
                  {t("pages.protocolos.fullInstitutionalDocument")}
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <a href={ACTA_CONSTITUTIVA_PDF_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-all hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)] focus-visible:ring-offset-2 border-2" style={{ borderColor: "var(--regu-blue)", color: "var(--regu-blue)", backgroundColor: "transparent" }}>
                  <Eye className="w-4 h-4" />
                  {t("common.preview")}
                </a>
                <a href={ACTA_CONSTITUTIVA_PDF_URL} download={ACTA_CONSTITUTIVA_PDF_NAME} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white transition-all hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)] focus-visible:ring-offset-2" style={{ backgroundColor: "var(--regu-blue)" }}>
                  <Download className="w-4 h-4" />
                  {t("common.downloadPdf")}
                </a>
              </div>
            </InstitutionalCard>
          </div>
        </motion.div>
      </InstitutionalSection>
    </InstitutionalLayout>
  );
}

import { motion } from "framer-motion";
import { CheckCircle2, Target, FileText, Eye, Download } from "lucide-react";
import { useTranslation } from "react-i18next";
import InstitutionalLayout, {
  InstitutionalSection,
  InstitutionalCard,
  InstitutionalLead,
} from "@/components/institutional/InstitutionalLayout";

const ACTA_PDF_URL = "/documents/ACTA-CONSTITUTIVA-REGULATEL-octubre-2013.pdf";
const ACTA_PDF_NAME = "ACTA CONSTITUTIVA DE REGULATEL octubre 2013.pdf";

const fadeIn = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function ObjetivosYFunciones() {
  const { t } = useTranslation();
  const objectives = t("pages.objetivosYFunciones.objectives", { returnObjects: true }) as string[];
  const functions = t("pages.objetivosYFunciones.functions", { returnObjects: true }) as string[];

  return (
    <InstitutionalLayout
      title={t("pages.objetivosYFunciones.title")}
      subtitle={t("pages.objetivosYFunciones.subtitle")}
      breadcrumb={[{ label: t("pages.objetivosYFunciones.breadcrumb") }]}
    >
      <InstitutionalLead source={t("pages.objetivosYFunciones.source")}>
        {t("pages.objetivosYFunciones.lead")}
      </InstitutionalLead>

      <InstitutionalSection>
        <div className="mb-8 flex items-start gap-4">
          <div className="mt-1 h-8 w-[3px] flex-shrink-0 rounded-full" style={{ backgroundColor: "var(--regu-blue)" }} aria-hidden />
          <h2 className="text-xl font-bold md:text-2xl" style={{ color: "var(--regu-navy)", fontFamily: "var(--token-font-heading)" }}>
            {t("pages.objetivosYFunciones.objectivesTitle")}
          </h2>
        </div>
        <ul className="space-y-6 md:space-y-7 list-none p-0 m-0">
          {objectives.map((text, index) => (
            <motion.li key={text.slice(0, 50)} initial="hidden" animate="visible" variants={fadeIn}>
              <InstitutionalCard className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-5 min-h-[13rem] md:min-h-[14rem]">
                <div
                  className="flex items-center justify-center w-12 h-12 rounded-xl flex-shrink-0 sm:self-start"
                  style={{ backgroundColor: "var(--regu-blue)", color: "white" }}
                  aria-hidden
                >
                  <Target className="w-6 h-6" />
                </div>
                <div className="min-w-0 flex-1 flex flex-col">
                  <span className="text-sm font-semibold uppercase tracking-wider block mb-2 flex-shrink-0" style={{ color: "var(--regu-blue)" }}>
                    {t("pages.objetivosYFunciones.objectiveLabel", { number: index + 1 })}
                  </span>
                  <p className="text-base md:text-lg leading-relaxed md:text-justify flex-1" style={{ color: "var(--regu-gray-900)" }}>
                    {text}
                  </p>
                </div>
              </InstitutionalCard>
            </motion.li>
          ))}
        </ul>
      </InstitutionalSection>

      <InstitutionalSection>
        <div className="mb-8 flex items-start gap-4">
          <div className="mt-1 h-8 w-[3px] flex-shrink-0 rounded-full" style={{ backgroundColor: "var(--regu-blue)" }} aria-hidden />
          <div>
            <h2 className="text-xl font-bold md:text-2xl" style={{ color: "var(--regu-navy)", fontFamily: "var(--token-font-heading)" }}>
              {t("pages.objetivosYFunciones.functionsTitle")}
            </h2>
            <p className="mt-1 text-sm" style={{ color: "var(--regu-gray-500)" }}>
              {t("pages.objetivosYFunciones.functionsSubtitle")}
            </p>
          </div>
        </div>
        <div
          className="rounded-2xl border p-8 md:p-10 lg:p-12"
          style={{
            backgroundColor: "var(--regu-white)",
            borderColor: "var(--regu-gray-100)",
            boxShadow: "0 1px 8px rgba(22, 61, 89, 0.05)",
          }}
        >
          <motion.ul initial="hidden" animate="visible" variants={fadeIn} className="grid grid-cols-1 lg:grid-cols-2 gap-x-14 lg:gap-x-20 gap-y-7 md:gap-y-9">
            {functions.map((text, index) => (
              <motion.li key={`funcion-${index}`} variants={fadeIn} className="flex items-start gap-4 text-base md:text-lg leading-[1.75]" style={{ color: "var(--regu-gray-700)" }}>
                <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-1.5 opacity-90" style={{ color: "var(--regu-blue)" }} />
                <span>{text}</span>
              </motion.li>
            ))}
          </motion.ul>
        </div>
      </InstitutionalSection>

      <InstitutionalSection>
        <motion.div initial="hidden" animate="visible" variants={fadeIn}>
          <div
            className="rounded-2xl border border-l-4 p-8 md:p-10 lg:p-14 flex flex-col sm:flex-row items-start sm:items-center gap-8 sm:gap-10"
            style={{
              backgroundColor: "var(--regu-white)",
              borderColor: "var(--regu-gray-200)",
              borderLeftColor: "var(--regu-blue)",
              borderLeftWidth: "5px",
              boxShadow: "0 6px 24px rgba(22, 61, 89, 0.08), 0 2px 8px rgba(22, 61, 89, 0.04)",
            }}
          >
            <div className="rounded-xl flex items-center justify-center flex-shrink-0" style={{ width: "4.5rem", height: "4.5rem", backgroundColor: "rgba(68, 137, 198, 0.12)", color: "var(--regu-blue)" }}>
              <FileText className="w-9 h-9" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs md:text-sm font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--regu-blue)" }}>
                {t("pages.objetivosYFunciones.foundingActDocSubtitle")}
              </p>
              <h3 className="text-2xl md:text-3xl font-bold mb-2 tracking-tight" style={{ color: "var(--regu-gray-900)" }}>
                {t("pages.objetivosYFunciones.foundingActTitle")}
              </h3>
              <p className="text-sm md:text-base" style={{ color: "var(--regu-gray-600)" }}>
                {t("pages.objetivosYFunciones.source")}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4 sm:shrink-0">
              <a
                href={ACTA_PDF_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl px-5 py-3.5 text-sm font-semibold transition-all hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)] focus-visible:ring-offset-2 border-2"
                style={{ borderColor: "var(--regu-blue)", color: "var(--regu-blue)", backgroundColor: "transparent" }}
              >
                <Eye className="w-4 h-4" />
                {t("common.preview")}
              </a>
              <a
                href={ACTA_PDF_URL}
                download={ACTA_PDF_NAME}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl px-5 py-3.5 text-sm font-semibold text-white transition-all hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)] focus-visible:ring-offset-2"
                style={{ backgroundColor: "var(--regu-blue)" }}
              >
                <Download className="w-4 h-4" />
                {t("common.download")}
              </a>
            </div>
          </div>
        </motion.div>
      </InstitutionalSection>
    </InstitutionalLayout>
  );
}

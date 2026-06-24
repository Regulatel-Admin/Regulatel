import { motion } from "framer-motion";
import { Handshake, Eye, Lightbulb, FileText, Download } from "lucide-react";
import { useTranslation } from "react-i18next";
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

const PRINCIPLE_ICONS = [Handshake, Eye, Lightbulb] as const;

export default function VisionMision() {
  const { t } = useTranslation();
  const principles = t("pages.visionMision.principles", { returnObjects: true }) as Array<{ title: string; text: string }>;

  return (
    <InstitutionalLayout
      title={t("pages.visionMision.title")}
      subtitle={t("pages.visionMision.subtitle")}
      breadcrumb={[{ label: t("pages.visionMision.breadcrumb") }]}
    >
      <InstitutionalSection>
        <InstitutionalH2>{t("pages.visionMision.missionTitle")}</InstitutionalH2>
        <motion.p
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="text-base md:text-lg leading-relaxed max-w-3xl md:text-justify"
          style={{ color: "var(--regu-gray-900)" }}
        >
          {t("pages.visionMision.missionText")}
        </motion.p>
      </InstitutionalSection>

      <InstitutionalSection>
        <InstitutionalH2>{t("pages.visionMision.visionTitle")}</InstitutionalH2>
        <motion.p
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="text-base md:text-lg leading-relaxed max-w-3xl md:text-justify"
          style={{ color: "var(--regu-gray-900)" }}
        >
          {t("pages.visionMision.visionText")}
        </motion.p>
      </InstitutionalSection>

      <InstitutionalSection>
        <InstitutionalH2>{t("pages.visionMision.principlesTitle")}</InstitutionalH2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {principles.map((item, i) => {
            const Icon = PRINCIPLE_ICONS[i] ?? Handshake;
            return (
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
                    <Icon className="h-6 w-6 shrink-0" strokeWidth={1.75} aria-hidden />
                  </div>
                  <h3 className="mb-3 text-lg font-bold" style={{ color: "var(--regu-gray-900)" }}>
                    {item.title}
                  </h3>
                  <p className="flex-1 text-base leading-relaxed" style={{ color: "var(--regu-gray-500)" }}>
                    {item.text}
                  </p>
                </InstitutionalCard>
              </motion.div>
            );
          })}
        </div>
      </InstitutionalSection>

      <InstitutionalSection>
        <InstitutionalH2>{t("pages.visionMision.foundingActTitle")}</InstitutionalH2>
        <motion.div initial="hidden" animate="visible" variants={fadeIn}>
          <InstitutionalCard className="flex flex-col items-start gap-8 sm:flex-row sm:items-center">
            <div
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl p-3.5"
              style={{ backgroundColor: "rgba(68, 137, 198, 0.12)", color: "var(--regu-blue)" }}
            >
              <FileText className="h-7 w-7 shrink-0" strokeWidth={1.75} aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="mb-2 text-lg font-bold" style={{ color: "var(--regu-gray-900)" }}>
                {t("pages.visionMision.foundingActDocTitle")}
              </h3>
              <p className="text-sm" style={{ color: "var(--regu-gray-500)" }}>
                {t("pages.visionMision.foundingActDocSubtitle")}
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
                {t("common.preview")}
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
                {t("common.download")}
              </a>
            </div>
          </InstitutionalCard>
        </motion.div>
      </InstitutionalSection>
    </InstitutionalLayout>
  );
}

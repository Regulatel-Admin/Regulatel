import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Users, Globe, BookOpen } from "lucide-react";
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

const OBJECTIVE_ICONS = [BookOpen, Globe, Users] as const;

export default function QueSomos() {
  const { t } = useTranslation();
  const objectives = t("pages.queSomos.objectives", { returnObjects: true }) as Array<{ label: string; text: string }>;
  const paragraphs = t("pages.queSomos.paragraphs", { returnObjects: true }) as string[];

  const learnMoreLinks = [
    { to: "/vision-mision", label: t("pages.queSomos.learnMore.visionMission.label"), desc: t("pages.queSomos.learnMore.visionMission.desc") },
    { to: "/autoridades", label: t("pages.queSomos.learnMore.authorities.label"), desc: t("pages.queSomos.learnMore.authorities.desc") },
    { to: "/miembros", label: t("pages.queSomos.learnMore.members.label"), desc: t("pages.queSomos.learnMore.members.desc") },
    { to: "/objetivos-y-funciones", label: t("pages.queSomos.learnMore.objectives.label"), desc: t("pages.queSomos.learnMore.objectives.desc") },
  ];

  return (
    <InstitutionalLayout
      title={t("pages.queSomos.title")}
      subtitle={t("pages.queSomos.subtitle")}
      breadcrumb={[{ label: t("pages.queSomos.breadcrumb") }]}
    >
      <InstitutionalSection>
        <InstitutionalH2>{t("pages.queSomos.sectionTitle")}</InstitutionalH2>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="space-y-5 text-base md:text-lg leading-relaxed"
          style={{ color: "var(--regu-gray-700)" }}
        >
          {paragraphs.map((p) => (
            <p key={p.slice(0, 40)}>{p}</p>
          ))}
        </motion.div>
      </InstitutionalSection>

      <InstitutionalSection>
        <InstitutionalH2 subtitle={t("pages.queSomos.objectivesSubtitle")}>
          {t("pages.queSomos.objectivesTitle")}
        </InstitutionalH2>
        <ul className="space-y-4 list-none p-0 m-0">
          {objectives.map((obj, index) => {
            const Icon = OBJECTIVE_ICONS[index] ?? BookOpen;
            return (
              <motion.li
                key={obj.label}
                initial="hidden"
                animate="visible"
                variants={{ ...fadeIn, visible: { ...fadeIn.visible, transition: { duration: 0.4, delay: index * 0.08 } } }}
              >
                <InstitutionalCard className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
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
            {t("pages.queSomos.viewFullObjectives")}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </InstitutionalSection>

      <InstitutionalSection>
        <InstitutionalH2>{t("pages.queSomos.learnMoreTitle")}</InstitutionalH2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {learnMoreLinks.map((item) => (
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

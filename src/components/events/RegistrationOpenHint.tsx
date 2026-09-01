import { useTranslation } from "react-i18next";

type RegistrationOpenHintProps = {
  variant?: "light" | "dark";
};

export default function RegistrationOpenHint({ variant = "light" }: RegistrationOpenHintProps) {
  const { t } = useTranslation();
  const dark = variant === "dark";

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-[0.28rem]"
      style={{
        backgroundColor: dark ? "rgba(232, 168, 168, 0.12)" : "rgba(155, 44, 44, 0.06)",
        border: dark ? "1px solid rgba(232, 168, 168, 0.28)" : "1px solid rgba(155, 44, 44, 0.14)",
        color: dark ? "#f0c8c8" : "#9b2c2c",
        fontFamily: "var(--token-font-body)",
      }}
    >
      <span
        className="h-1.5 w-1.5 shrink-0 rounded-full"
        style={{ backgroundColor: dark ? "#e8a8a8" : "#b42318" }}
        aria-hidden
      />
      <span className="whitespace-nowrap text-[0.58rem] font-semibold uppercase tracking-[0.16em]">
        {t("pages.eventos.registrationOpen")}
      </span>
    </span>
  );
}

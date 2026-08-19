import { ArrowUpRight, Clock3, Play } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { countryFlagSrc } from "@/data/hablaElRegulador";
import { useHablaElReguladorInterviews } from "@/contexts/SiteSettingsContext";

export default function HablaElReguladorHome() {
  const { t } = useTranslation();
  const interviews = useHablaElReguladorInterviews();
  const featured = interviews[0];
  const supporting = interviews.slice(1, 4);

  if (!featured) return null;

  return (
    <section
      aria-labelledby="habla-regulador-home-title"
      className="relative overflow-hidden py-14 md:py-20"
      style={{
        background:
          "radial-gradient(circle at 88% 10%, rgba(68,137,198,0.28), transparent 32%), linear-gradient(135deg, var(--regu-navy-deep) 0%, var(--regu-navy) 62%, #1c4d6f 100%)",
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.09]"
        aria-hidden
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.28) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.28) 1px, transparent 1px)",
          backgroundSize: "34px 34px",
          maskImage: "linear-gradient(to left, black, transparent 74%)",
        }}
      />

      <div className="relative mx-auto w-full max-w-[1280px] px-4 md:px-6">
        <div className="mb-8 flex flex-col gap-5 md:mb-10 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <div className="mb-4 flex items-center gap-3">
              <span className="h-[3px] w-10 rounded-full bg-[#c5dc0b]" />
              <p className="m-0 text-[0.68rem] font-bold uppercase tracking-[0.2em] text-[#bcdcf4]">
                {t("pages.hablaRegulador.homeEyebrow")}
              </p>
            </div>
            <h2
              id="habla-regulador-home-title"
              className="text-3xl font-bold tracking-tight text-white md:text-4xl lg:text-[2.75rem]"
              style={{ fontFamily: "var(--token-font-heading)" }}
            >
              {t("pages.hablaRegulador.homeTitle")}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/68 md:text-base">
              {t("pages.hablaRegulador.homeDescription")}
            </p>
          </div>

          <Link
            to="/habla-el-regulador"
            className="inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-white hover:text-[var(--regu-navy)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8fc7f0] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--regu-navy)]"
          >
            {t("pages.hablaRegulador.viewAll")}
            <ArrowUpRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.45fr_1fr]">
          <Link
            to={`/habla-el-regulador#${featured.slug}`}
            className="group relative min-h-[360px] overflow-hidden rounded-[22px] border border-white/12 bg-[#0b2639] shadow-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8fc7f0] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--regu-navy)] md:min-h-[440px]"
            aria-label={t("pages.hablaRegulador.watchInterviewAria", {
              name: featured.name,
            })}
          >
            <img
              src={featured.poster}
              alt=""
              className="absolute inset-0 h-full w-full object-contain transition-transform duration-500 group-hover:scale-[1.025] motion-reduce:transition-none"
            />
            <span className="absolute inset-0 bg-gradient-to-t from-[#071622] via-[#071622]/24 to-transparent" />
            <span className="absolute left-5 top-5 rounded-full border border-white/25 bg-[#071622]/70 px-3 py-1.5 text-[0.65rem] font-bold uppercase tracking-[0.14em] text-white backdrop-blur-sm md:left-6 md:top-6">
              {t("pages.hablaRegulador.featuredLabel")}
            </span>
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full border border-white/30 bg-white/95 text-[var(--regu-blue)] shadow-xl transition-transform group-hover:scale-105 motion-reduce:transition-none md:h-[74px] md:w-[74px]">
                <Play className="ml-1 h-7 w-7 fill-current" aria-hidden />
              </span>
            </span>
            <span className="absolute inset-x-0 bottom-0 p-5 md:p-7">
              <span className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-white/70">
                <span className="inline-flex items-center gap-1.5">
                  <img
                    src={countryFlagSrc(featured.countryCode)}
                    alt=""
                    width={16}
                    height={12}
                    className="h-3 w-4 object-cover"
                  />
                  {featured.country}
                </span>
                <span aria-hidden>•</span>
                <span>{featured.duration}</span>
              </span>
              <span
                className="block text-2xl font-bold leading-tight text-white md:text-3xl"
                style={{ fontFamily: "var(--token-font-heading)" }}
              >
                {featured.name}
              </span>
              <span className="mt-1.5 block text-sm font-medium text-white/72 md:text-base">
                {featured.role} · {featured.organization}
              </span>
            </span>
          </Link>

          <div className="grid gap-4">
            {supporting.map((interview) => (
              <Link
                key={interview.slug}
                to={`/habla-el-regulador#${interview.slug}`}
                className="group grid min-h-[126px] grid-cols-[132px_1fr] overflow-hidden rounded-2xl border border-white/12 bg-white/[0.07] transition-colors hover:bg-white/[0.12] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8fc7f0] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--regu-navy)] sm:grid-cols-[178px_1fr]"
                aria-label={t("pages.hablaRegulador.watchInterviewAria", {
                  name: interview.name,
                })}
              >
                <span className="relative overflow-hidden bg-[#0b2639]">
                  <img
                    src={interview.poster}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none"
                  />
                  <span className="absolute inset-0 bg-[#071622]/18" />
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-[var(--regu-blue)] shadow-lg">
                      <Play className="ml-0.5 h-4 w-4 fill-current" aria-hidden />
                    </span>
                  </span>
                </span>
                <span className="flex min-w-0 flex-col justify-center px-4 py-4 sm:px-5">
                  <span className="mb-1.5 text-[0.62rem] font-bold uppercase tracking-[0.12em] text-[#c5dc0b]">
                    {t("pages.hablaRegulador.episodeLabel", {
                      number: interview.episode,
                    })}
                  </span>
                  <span className="text-base font-bold leading-tight text-white sm:text-lg">
                    {interview.name}
                  </span>
                  <span className="mt-1 text-xs leading-snug text-white/62 sm:text-sm">
                    {interview.organization} · {interview.country}
                  </span>
                  <span className="mt-2 inline-flex items-center gap-1.5 text-[0.68rem] font-semibold text-white/48">
                    <Clock3 className="h-3 w-3" aria-hidden />
                    {interview.duration}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

import { useCallback, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowDown,
  ArrowRight,
  CalendarDays,
  Clock3,
  Home,
  Mic2,
  Play,
  Sparkles,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import InterviewPlayerDialog from "@/components/hablaElRegulador/InterviewPlayerDialog";
import {
  countryFlagSrc,
  hablaElReguladorInterviews,
  hablaElReguladorTeaser,
  type HablaElReguladorInterview,
} from "@/data/hablaElRegulador";

type PlayerSelection =
  | { kind: "interview"; interview: HablaElReguladorInterview }
  | { kind: "teaser" }
  | null;

function formatDate(date: string, language: string): string {
  const locale =
    language === "pt"
      ? "pt-PT"
      : language === "it"
        ? "it-IT"
        : language === "en"
          ? "en-US"
          : "es-ES";
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}

export default function HablaElRegulador() {
  const { t, i18n } = useTranslation();
  const [player, setPlayer] = useState<PlayerSelection>(null);

  const closePlayer = useCallback(() => setPlayer(null), []);

  const teaserAsInterview = useMemo<HablaElReguladorInterview>(
    () => ({
      slug: "teaser-habla-el-regulador",
      episode: 0,
      name: t("pages.hablaRegulador.teaserTitle"),
      role: t("pages.hablaRegulador.featuredDescription"),
      organization: "REGULATEL",
      country: "",
      countryCode: "",
      duration: hablaElReguladorTeaser.duration,
      poster: hablaElReguladorTeaser.poster,
      videoSrc: hablaElReguladorTeaser.videoSrc,
    }),
    [t],
  );

  return (
    <>
      <section
        className="relative isolate overflow-hidden text-white"
        style={{
          background:
            "radial-gradient(circle at 78% 22%, rgba(68,137,198,0.42), transparent 31%), radial-gradient(circle at 15% 88%, rgba(197,220,11,0.12), transparent 26%), linear-gradient(135deg, #0b2639 0%, #163d59 54%, #1d567d 100%)",
        }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.11]"
          aria-hidden
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.24) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.24) 1px, transparent 1px)",
            backgroundSize: "38px 38px",
            maskImage: "linear-gradient(100deg, transparent 8%, black 65%, transparent)",
          }}
        />
        <div
          className="pointer-events-none absolute -right-20 top-12 h-72 w-72 rounded-full border border-white/10 md:h-[440px] md:w-[440px]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -right-8 top-24 h-52 w-52 rounded-full border border-[#c5dc0b]/20 md:h-[340px] md:w-[340px]"
          aria-hidden
        />

        <div className="relative mx-auto w-full max-w-[1280px] px-4 pb-14 pt-7 md:px-6 md:pb-20 md:pt-10 lg:pb-24">
          <nav
            aria-label={t("pages.hablaRegulador.breadcrumb")}
            className="mb-10 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.11em] text-white/62 md:mb-14"
          >
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8fc7f0]"
            >
              <Home className="h-3.5 w-3.5" aria-hidden />
              {t("pages.shared.breadcrumbHome")}
            </Link>
            <span aria-hidden>/</span>
            <Link
              to="/recursos"
              className="transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8fc7f0]"
            >
              {t("nav.resources")}
            </Link>
            <span aria-hidden>/</span>
            <span className="text-white">
              {t("pages.hablaRegulador.breadcrumb")}
            </span>
          </nav>

          <div className="grid items-center gap-11 lg:grid-cols-[0.96fr_1.04fr] lg:gap-16">
            <div className="max-w-2xl">
              <div className="mb-5 flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-[#c5dc0b]">
                  <Mic2 className="h-5 w-5" aria-hidden />
                </span>
                <p className="m-0 text-[0.68rem] font-bold uppercase tracking-[0.2em] text-[#bcdcf4]">
                  {t("pages.hablaRegulador.eyebrow")}
                </p>
              </div>
              <h1
                className="text-[clamp(2.75rem,7vw,5.8rem)] font-extrabold leading-[0.93] tracking-[-0.045em]"
                style={{ fontFamily: "var(--token-font-heading)" }}
              >
                <span className="block">Habla</span>
                <span className="block text-[#c5dc0b]">El Regulador</span>
              </h1>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-white/74 md:text-lg md:leading-relaxed">
                {t("pages.hablaRegulador.heroDescription")}
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="#entrevistas"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-[var(--regu-navy)] shadow-lg transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8fc7f0] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--regu-navy)] motion-reduce:transition-none"
                >
                  {t("pages.hablaRegulador.browseInterviews")}
                  <ArrowDown className="h-4 w-4" aria-hidden />
                </a>
                <button
                  type="button"
                  onClick={() => setPlayer({ kind: "teaser" })}
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-white/18 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8fc7f0] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--regu-navy)]"
                >
                  <Play className="h-4 w-4 fill-current" aria-hidden />
                  {t("pages.hablaRegulador.watchTeaser")}
                </button>
              </div>

              <dl className="mt-9 grid max-w-xl grid-cols-3 gap-3 border-t border-white/12 pt-6">
                <div>
                  <dt className="text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-white/45">
                    {t("pages.hablaRegulador.statsInterviews")}
                  </dt>
                  <dd className="mt-1 text-2xl font-bold text-white">07</dd>
                </div>
                <div>
                  <dt className="text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-white/45">
                    {t("pages.hablaRegulador.statsCountries")}
                  </dt>
                  <dd className="mt-1 text-2xl font-bold text-white">07</dd>
                </div>
                <div>
                  <dt className="text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-white/45">
                    {t("pages.hablaRegulador.statsConversation")}
                  </dt>
                  <dd className="mt-1 text-2xl font-bold text-[#c5dc0b]">01</dd>
                </div>
              </dl>
            </div>

            <button
              type="button"
              onClick={() => setPlayer({ kind: "teaser" })}
              className="group relative mx-auto w-full max-w-[680px] overflow-hidden rounded-[24px] border border-white/15 bg-white/5 text-left shadow-[0_30px_80px_rgba(2,16,28,0.38)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8fc7f0] focus-visible:ring-offset-2 focus-visible:ring-offset-[#163d59] md:rounded-[30px]"
              aria-label={t("pages.hablaRegulador.watchTeaser")}
            >
              <span className="relative block aspect-video overflow-hidden">
                <img
                  src={hablaElReguladorTeaser.poster}
                  alt=""
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.025] motion-reduce:transition-none"
                />
                <span className="absolute inset-0 bg-gradient-to-t from-[#071622]/80 via-transparent to-[#071622]/10" />
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="flex h-[72px] w-[72px] items-center justify-center rounded-full border border-white/35 bg-white/95 text-[var(--regu-blue)] shadow-2xl transition-transform group-hover:scale-105 motion-reduce:transition-none md:h-20 md:w-20">
                    <Play className="ml-1 h-8 w-8 fill-current" aria-hidden />
                  </span>
                </span>
              </span>
              <span className="flex items-center justify-between gap-4 px-5 py-4 md:px-6 md:py-5">
                <span>
                  <span className="block text-base font-bold text-white md:text-lg">
                    {t("pages.hablaRegulador.teaserTitle")}
                  </span>
                  <span className="mt-1 block text-xs text-white/55 md:text-sm">
                    {t("pages.hablaRegulador.featuredDescription")}
                  </span>
                </span>
                <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white/10 px-3 py-2 text-xs font-semibold text-white/70">
                  <Clock3 className="h-3.5 w-3.5" aria-hidden />
                  {hablaElReguladorTeaser.duration}
                </span>
              </span>
            </button>
          </div>
        </div>
      </section>

      <section className="bg-white py-14 md:py-20">
        <div className="mx-auto grid w-full max-w-[1120px] gap-8 px-4 md:grid-cols-[0.7fr_1.3fr] md:items-start md:px-6">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <span className="h-[3px] w-9 rounded-full bg-[var(--regu-blue)]" />
              <p className="m-0 text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[var(--regu-blue)]">
                {t("pages.hablaRegulador.introEyebrow")}
              </p>
            </div>
            <h2
              className="text-2xl font-bold leading-tight text-[var(--regu-navy)] md:text-3xl"
              style={{ fontFamily: "var(--token-font-heading)" }}
            >
              {t("pages.hablaRegulador.introTitle")}
            </h2>
          </div>
          <div className="rounded-2xl border border-[rgba(22,61,89,0.08)] bg-[var(--regu-offwhite)] p-6 md:p-8">
            <Sparkles
              className="mb-4 h-6 w-6 text-[var(--regu-blue)]"
              aria-hidden
            />
            <p className="m-0 text-base leading-[1.8] text-[var(--regu-gray-700)] md:text-lg">
              {t("pages.hablaRegulador.introDescription")}
            </p>
          </div>
        </div>
      </section>

      <section
        id="entrevistas"
        aria-labelledby="interviews-title"
        className="scroll-mt-36 border-t border-[rgba(22,61,89,0.07)] bg-[#F5F7FA] py-14 md:py-20"
      >
        <div className="mx-auto w-full max-w-[1280px] px-4 md:px-6">
          <div className="mb-9 max-w-3xl md:mb-12">
            <p className="m-0 text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[var(--regu-blue)]">
              {t("pages.hablaRegulador.collectionEyebrow")}
            </p>
            <h2
              id="interviews-title"
              className="mt-3 text-3xl font-bold tracking-tight text-[var(--regu-navy)] md:text-4xl"
              style={{ fontFamily: "var(--token-font-heading)" }}
            >
              {t("pages.hablaRegulador.collectionTitle")}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[var(--regu-gray-600)] md:text-base">
              {t("pages.hablaRegulador.collectionDescription")}
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {hablaElReguladorInterviews.map((interview, index) => (
              <article
                key={interview.slug}
                id={interview.slug}
                className="flex h-full flex-col border border-[rgba(22,61,89,0.12)] bg-white"
              >
                <button
                  type="button"
                  onClick={() => setPlayer({ kind: "interview", interview })}
                  className="flex h-full w-full flex-col text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--regu-blue)]"
                  aria-label={t("pages.hablaRegulador.watchInterviewAria", {
                    name: interview.name,
                  })}
                >
                  <span className="relative block aspect-[16/10] overflow-hidden bg-[var(--regu-navy)]">
                    <img
                      src={interview.poster}
                      alt=""
                      loading={index < 3 ? "eager" : "lazy"}
                      className="h-full w-full object-cover"
                    />
                    <span className="absolute inset-0 flex items-center justify-center bg-black/15 transition-colors hover:bg-black/25">
                      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--regu-blue)] text-white">
                        <Play
                          className="ml-0.5 h-4 w-4 fill-current"
                          aria-hidden
                        />
                      </span>
                    </span>
                  </span>

                  <span className="flex flex-1 flex-col px-4 py-4 md:px-5 md:py-5">
                    <span className="inline-flex items-center gap-1.5 text-[0.72rem] font-bold uppercase tracking-[0.1em] text-[var(--regu-navy)]">
                      <span className="text-[var(--regu-blue)]">
                        {t("pages.hablaRegulador.episodeLabel", {
                          number: interview.episode,
                        })}
                      </span>
                      <span className="text-[rgba(22,61,89,0.35)]" aria-hidden>
                        -
                      </span>
                      <img
                        src={countryFlagSrc(interview.countryCode)}
                        alt=""
                        width={14}
                        height={10}
                        className="h-2.5 w-3.5 object-cover"
                        loading="lazy"
                      />
                      <span className="text-[var(--regu-gray-700)]">
                        {interview.country}
                      </span>
                    </span>

                    <span
                      className="mt-2 block text-lg font-bold leading-snug text-[var(--regu-navy)]"
                      style={{ fontFamily: "var(--token-font-heading)" }}
                    >
                      {interview.name}
                    </span>
                    <span className="mt-1.5 block text-sm leading-relaxed text-[var(--regu-gray-600)]">
                      {interview.role}
                    </span>
                    <span className="mt-0.5 block text-sm font-semibold text-[var(--regu-blue)]">
                      {interview.organization}
                    </span>

                    <span className="mt-auto mt-4 flex items-center justify-between gap-3 border-t border-[rgba(22,61,89,0.1)] pt-3.5">
                      <span className="inline-flex items-center gap-1.5 text-xs text-[var(--regu-gray-500)]">
                        {interview.date ? (
                          <>
                            <CalendarDays className="h-3.5 w-3.5" aria-hidden />
                            {formatDate(interview.date, i18n.language)}
                          </>
                        ) : (
                          <>
                            <Clock3 className="h-3.5 w-3.5" aria-hidden />
                            {interview.duration}
                          </>
                        )}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--regu-blue)]">
                        {t("pages.hablaRegulador.watchInterview")}
                        <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                      </span>
                    </span>
                  </span>
                </button>
              </article>
            ))}
          </div>

          <div className="mt-10 flex flex-col items-start justify-between gap-5 rounded-2xl border border-[rgba(22,61,89,0.09)] bg-white px-6 py-6 md:flex-row md:items-center md:px-8">
            <div className="flex items-start gap-4">
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[rgba(68,137,198,0.1)] text-[var(--regu-blue)]">
                <Mic2 className="h-5 w-5" aria-hidden />
              </span>
              <div>
                <p className="m-0 font-bold text-[var(--regu-navy)]">
                  {t("pages.hablaRegulador.title")}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-[var(--regu-gray-500)]">
                  {t("pages.hablaRegulador.footerNote")}
                </p>
              </div>
            </div>
            <Link
              to="/noticias/habla-el-regulador-nota-de-prensa"
              className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[rgba(68,137,198,0.1)] px-4 py-2.5 text-sm font-bold text-[var(--regu-blue)] transition-colors hover:bg-[rgba(68,137,198,0.16)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)] focus-visible:ring-offset-2"
            >
              {t("homeSections.viewPressReleases")}
              <ArrowDown className="h-4 w-4 -rotate-90" aria-hidden />
            </Link>
          </div>
        </div>
      </section>

      {player?.kind === "interview" && (
        <InterviewPlayerDialog
          interview={player.interview}
          onClose={closePlayer}
        />
      )}
      {player?.kind === "teaser" && (
        <InterviewPlayerDialog
          interview={teaserAsInterview}
          onClose={closePlayer}
        />
      )}
    </>
  );
}

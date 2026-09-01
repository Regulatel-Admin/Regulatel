import { useRef, useState, type ReactNode } from "react";
import { ArrowUpRight, Clock3, Play, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion, useInView, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { countryFlagSrc } from "@/data/hablaElRegulador";
import { useHablaElReguladorInterviews } from "@/contexts/SiteSettingsContext";
import { extractYoutubeId } from "@/lib/youtube";

const EASE = [0.16, 1, 0.3, 1] as const;

function Reveal({
  children,
  className,
  delay = 0,
  x = 0,
  y = 18,
  scale = 1,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  x?: number;
  y?: number;
  scale?: number;
}) {
  const reduceMotion = useReducedMotion();
  if (reduceMotion) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, x, y, scale }}
      whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.28, margin: "0px 0px -40px 0px" }}
      transition={{ duration: 0.82, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

export default function HablaElReguladorHome() {
  const { t } = useTranslation();
  const interviews = useHablaElReguladorInterviews();
  const featured = interviews[0];
  const supporting = interviews.slice(1, 4);
  const [featuredPlaying, setFeaturedPlaying] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const extrasOn = useInView(sectionRef, { once: true, amount: 0.2, margin: "0px 0px -64px 0px" });
  const showExtras = Boolean(!reduceMotion && extrasOn);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const gridY = useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : [28, -42]);
  const glowOpacity = useTransform(
    scrollYProgress,
    [0.05, 0.42, 0.88],
    reduceMotion ? [0.28, 0.28, 0.28] : [0.1, 0.4, 0.16]
  );
  const spineScale = useTransform(scrollYProgress, [0.18, 0.48], reduceMotion ? [1, 1] : [0, 1]);

  if (!featured) return null;

  const featuredYoutubeId = extractYoutubeId(featured.youtubeId ?? "");
  const canPlayFeatured = Boolean(featuredYoutubeId || featured.videoSrc);
  const featuredCardClassName =
    "group relative block h-full min-h-[360px] overflow-hidden rounded-[22px] border border-white/12 bg-[#0b2639] shadow-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8fc7f0] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--regu-navy)] md:min-h-[440px]";

  const featuredPoster = (
    <>
      <img
        src={featured.poster}
        alt=""
        className="absolute inset-0 h-full w-full object-contain transition-transform duration-500 group-hover:scale-[1.025] motion-reduce:transition-none"
      />
      {showExtras && (
        <span
          aria-hidden
          className="habla-card-sheen pointer-events-none absolute inset-y-0 left-0 z-[2] w-[42%] bg-gradient-to-r from-transparent via-white/16 to-transparent"
        />
      )}
      <span className="absolute inset-0 bg-gradient-to-t from-[#071622] via-[#071622]/24 to-transparent" />
      <span className="absolute left-5 top-5 rounded-full border border-white/25 bg-[#071622]/70 px-3 py-1.5 text-[0.65rem] font-bold uppercase tracking-[0.14em] text-white backdrop-blur-sm md:left-6 md:top-6">
        {t("pages.hablaRegulador.featuredLabel")}
      </span>
      <span className="absolute inset-0 flex items-center justify-center">
        <span className="relative flex h-16 w-16 items-center justify-center rounded-full border border-white/30 bg-white/95 text-[var(--regu-blue)] shadow-xl transition-transform group-hover:scale-105 motion-reduce:transition-none md:h-[74px] md:w-[74px]">
          {showExtras && (
            <>
              <span className="habla-play-ring" aria-hidden />
              <span className="habla-play-ring habla-play-ring--delay" aria-hidden />
            </>
          )}
          <Play className="relative ml-1 h-7 w-7 fill-current" aria-hidden />
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
    </>
  );

  return (
    <section
      ref={sectionRef}
      aria-labelledby="habla-regulador-home-title"
      className="relative overflow-hidden pb-16 pt-14 md:pb-24 md:pt-20"
      style={{
        background:
          "radial-gradient(circle at 88% 10%, rgba(68,137,198,0.28), transparent 32%), linear-gradient(135deg, var(--regu-navy-deep) 0%, var(--regu-navy) 62%, #1c4d6f 100%)",
      }}
    >
      <motion.div
        className="pointer-events-none absolute inset-0 opacity-[0.09]"
        aria-hidden
        style={{
          y: gridY,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.28) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.28) 1px, transparent 1px)",
          backgroundSize: "34px 34px",
          maskImage: "linear-gradient(to left, black, transparent 74%)",
        }}
      />
      <motion.div
        className="pointer-events-none absolute -right-16 top-0 h-[28rem] w-[28rem] rounded-full blur-3xl"
        aria-hidden
        style={{
          opacity: glowOpacity,
          background: "radial-gradient(circle, rgba(68,137,198,0.42) 0%, transparent 68%)",
        }}
      />

      <div className="relative mx-auto w-full max-w-[1280px] px-4 md:px-6">
        <motion.span
          aria-hidden
          className="pointer-events-none absolute -left-1 top-2 hidden h-[calc(100%-1rem)] w-px origin-top bg-gradient-to-b from-[#c5dc0b] via-[#c5dc0b]/45 to-transparent md:block lg:-left-2"
          style={{ scaleY: spineScale }}
        />

        <div className="mb-8 flex flex-col gap-5 md:mb-10 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <div className="mb-4 flex items-center gap-3">
              <motion.span
                className="h-[3px] w-10 origin-left rounded-full bg-[#c5dc0b]"
                initial={reduceMotion ? false : { scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true, amount: 0.8 }}
                transition={{ duration: 0.7, ease: EASE }}
              />
              <Reveal delay={0.05} y={10}>
                <p className="m-0 text-[0.68rem] font-bold uppercase tracking-[0.2em] text-[#bcdcf4]">
                  {t("pages.hablaRegulador.homeEyebrow")}
                </p>
              </Reveal>
            </div>
            <Reveal delay={0.08} y={22}>
              <h2
                id="habla-regulador-home-title"
                className="text-3xl font-bold tracking-tight text-white md:text-4xl lg:text-[2.75rem]"
                style={{ fontFamily: "var(--token-font-heading)" }}
              >
                {t("pages.hablaRegulador.homeTitle")}
              </h2>
            </Reveal>
            <Reveal delay={0.16} y={14}>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/68 md:text-base">
                {t("pages.hablaRegulador.homeDescription")}
              </p>
            </Reveal>
          </div>

          <Reveal delay={0.18} x={18} y={0}>
            <Link
              to="/habla-el-regulador"
              className="inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-white hover:text-[var(--regu-navy)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8fc7f0] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--regu-navy)]"
            >
              {t("pages.hablaRegulador.viewAll")}
              <ArrowUpRight className="h-4 w-4" aria-hidden />
            </Link>
          </Reveal>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.45fr_1fr]">
          <Reveal delay={0.12} y={28} scale={1.025} className="min-h-[360px] md:min-h-[440px]">
            {featuredPlaying && canPlayFeatured ? (
              <div className="relative isolate h-full min-h-[360px] overflow-hidden rounded-[22px] border border-white/12 bg-black shadow-2xl md:min-h-[440px]">
                <div className="absolute inset-0 z-0 bg-black">
                  {featuredYoutubeId ? (
                    <iframe
                      className="h-full w-full"
                      src={`https://www.youtube-nocookie.com/embed/${featuredYoutubeId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
                      title={t("pages.hablaRegulador.watchInterviewAria", {
                        name: featured.name,
                      })}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allowFullScreen
                    />
                  ) : (
                    <video
                      className="h-full w-full object-contain"
                      src={featured.videoSrc}
                      poster={featured.poster}
                      controls
                      autoPlay
                      playsInline
                      preload="metadata"
                      lang="es"
                      aria-label={t("pages.hablaRegulador.watchInterviewAria", {
                        name: featured.name,
                      })}
                    />
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setFeaturedPlaying(false)}
                  className="absolute right-4 top-4 z-20 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-[#071622]/80 text-white backdrop-blur-sm transition-colors hover:bg-[#071622] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8fc7f0]"
                  aria-label={t("pages.hablaRegulador.closePlayer")}
                >
                  <X className="h-5 w-5" aria-hidden />
                </button>
              </div>
            ) : canPlayFeatured ? (
              <button
                type="button"
                onClick={() => setFeaturedPlaying(true)}
                className={`${featuredCardClassName} w-full cursor-pointer text-left`}
                aria-label={t("pages.hablaRegulador.watchInterviewAria", {
                  name: featured.name,
                })}
              >
                {featuredPoster}
              </button>
            ) : (
              <Link
                to={`/habla-el-regulador#${featured.slug}`}
                className={featuredCardClassName}
                aria-label={t("pages.hablaRegulador.watchInterviewAria", {
                  name: featured.name,
                })}
              >
                {featuredPoster}
              </Link>
            )}
          </Reveal>

          <div className="grid gap-4">
            {supporting.map((interview, index) => (
              <Reveal key={interview.slug} delay={0.2 + index * 0.1} x={26} y={8}>
                <Link
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
              </Reveal>
            ))}
          </div>
        </div>
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-28 md:h-32"
        style={{
          background:
            "linear-gradient(to bottom, rgba(5,19,41,0) 0%, rgba(5,19,41,0.55) 52%, var(--regu-navy-deep) 100%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[3] h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent 6%, rgba(197,220,11,0.22) 34%, rgba(68,137,198,0.38) 50%, rgba(197,220,11,0.18) 66%, transparent 94%)",
        }}
      />
    </section>
  );
}

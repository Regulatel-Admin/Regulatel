import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CalendarDays,
  Clapperboard,
  Clock3,
  Download,
  Eye,
  FileText,
  Home,
  Landmark,
  MessageSquareWarning,
  Play,
  Scale,
  Shield,
  Timer,
  Users,
} from "lucide-react";
import DocumentPreviewModal from "@/components/DocumentPreviewModal";
import {
  violenciaDigitalAgenda,
  violenciaDigitalMedia,
  violenciaDigitalSpeakerMarkSrc,
  violenciaDigitalSpeakers,
  type ViolenciaDigitalSpeaker,
} from "@/data/violenciaDigital";

const TOPIC_ICONS = [MessageSquareWarning, Clapperboard, Scale, Landmark, Shield, Building2] as const;

function SpeakerMark({
  speaker,
  className,
}: {
  speaker: ViolenciaDigitalSpeaker;
  className: string;
}) {
  const src = violenciaDigitalSpeakerMarkSrc(speaker);
  if (!src) {
    return <span className={`${className} bg-[rgba(68,137,198,0.18)]`} aria-hidden />;
  }
  return (
    <img
      src={src}
      alt=""
      className={`${className} ${speaker.organizationLogo ? "object-contain bg-[#111]" : "object-cover"}`}
    />
  );
}

function OrganizationLink({
  speaker,
  className,
}: {
  speaker: ViolenciaDigitalSpeaker;
  className?: string;
}) {
  if (!speaker.organizationUrl) {
    return <span className={className}>{speaker.organization}</span>;
  }
  return (
    <a
      href={speaker.organizationUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`${className ?? ""} rounded-sm underline-offset-2 transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8fc7f0]`.trim()}
    >
      {speaker.organization}
    </a>
  );
}

export default function ViolenciaDigital() {
  const { t } = useTranslation();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playerRef = useRef<HTMLDivElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [previewAgenda, setPreviewAgenda] = useState(false);
  const topicsRaw = t("pages.violenciaDigital.topics", { returnObjects: true });
  const factsRaw = t("pages.violenciaDigital.facts", { returnObjects: true });
  const topics = Array.isArray(topicsRaw) ? (topicsRaw as string[]) : [];
  const facts = Array.isArray(factsRaw)
    ? (factsRaw as Array<{ title: string; text: string }>)
    : [];

  const startPlayback = useCallback((scrollToPlayer = false) => {
    setPlaying(true);
    if (scrollToPlayer) {
      playerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, []);

  useEffect(() => {
    if (!playing) return;
    void videoRef.current?.play();
  }, [playing]);

  const speakerLookup = useMemo(
    () => Object.fromEntries(violenciaDigitalSpeakers.map((speaker) => [speaker.id, speaker])),
    [],
  );

  return (
    <>
      <section
        className="relative isolate overflow-hidden text-white"
        style={{
          background:
            "radial-gradient(circle at 82% 18%, rgba(68,137,198,0.38), transparent 32%), radial-gradient(circle at 12% 88%, rgba(197,220,11,0.14), transparent 28%), linear-gradient(135deg, #0b2639 0%, #163d59 54%, #1d567d 100%)",
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
          className="pointer-events-none absolute -right-16 top-10 h-72 w-72 rounded-full border border-white/10 md:h-[420px] md:w-[420px]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -right-4 top-24 h-52 w-52 rounded-full border border-[#c5dc0b]/20 md:h-[320px] md:w-[320px]"
          aria-hidden
        />

        <div className="relative mx-auto w-full max-w-[1280px] px-4 pb-12 pt-6 md:px-6 md:pb-16 md:pt-9">
          <nav
            aria-label={t("pages.violenciaDigital.breadcrumb")}
            className="mb-8 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.11em] text-white/62 md:mb-10"
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
            <span className="text-white">{t("pages.violenciaDigital.breadcrumb")}</span>
          </nav>

          <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,0.86fr)_minmax(0,1.14fr)] lg:gap-10">
            <div className="max-w-xl">
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-full border border-[#c5dc0b]/35 bg-[#c5dc0b]/12 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.16em] text-[#c5dc0b]">
                  {t("pages.violenciaDigital.sessionBadge")}
                </span>
                <span className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-white/55">
                  {t("pages.violenciaDigital.heroKicker")}
                </span>
              </div>
              <p className="m-0 text-[0.68rem] font-bold uppercase tracking-[0.2em] text-[#bcdcf4]">
                {t("pages.violenciaDigital.eyebrow")}
              </p>
              <h1
                className="mt-2 text-[clamp(2.1rem,4.2vw,3.55rem)] font-extrabold leading-[1.02] tracking-[-0.035em]"
                style={{ fontFamily: "var(--token-font-heading)" }}
              >
                <span className="block">{t("pages.violenciaDigital.heroTitle")}</span>
                <span className="mt-2 block text-[clamp(1.15rem,2.2vw,1.7rem)] font-bold leading-snug tracking-[-0.02em] text-[#c5dc0b]">
                  {t("pages.violenciaDigital.heroHighlight")}
                </span>
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-white/85 md:text-[1.05rem]">
                {t("pages.violenciaDigital.heroDescription")}
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-white/8 px-3 py-1.5 text-xs font-semibold text-white/85">
                  <CalendarDays className="h-3.5 w-3.5" aria-hidden />
                  {t("pages.violenciaDigital.dateLabel")}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-white/8 px-3 py-1.5 text-xs font-semibold text-white/85">
                  <Clock3 className="h-3.5 w-3.5" aria-hidden />
                  {t("pages.violenciaDigital.timeLabel")}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-white/8 px-3 py-1.5 text-xs font-semibold text-white/85">
                  <Timer className="h-3.5 w-3.5" aria-hidden />
                  {t("pages.violenciaDigital.durationLabel")}
                </span>
              </div>

              <div className="mt-7 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => startPlayback(true)}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-[var(--regu-navy)] shadow-lg transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8fc7f0] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--regu-navy)] motion-reduce:transition-none"
                >
                  <Play className="h-4 w-4 fill-current" aria-hidden />
                  {t("pages.violenciaDigital.watchWebinar")}
                </button>
                <a
                  href="#agenda"
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-white/18 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8fc7f0]"
                >
                  {t("pages.violenciaDigital.scrollToAgenda")}
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </a>
              </div>
            </div>

            <div ref={playerRef} id="webinar-player" className="relative w-full min-w-0">
              <div className="overflow-hidden rounded-[22px] border border-white/15 bg-[#071622] shadow-[0_30px_80px_rgba(2,16,28,0.38)] md:rounded-[28px]">
                {playing ? (
                  <video
                    ref={videoRef}
                    className="aspect-video w-full bg-black object-contain"
                    src={violenciaDigitalMedia.videoSrc}
                    poster={violenciaDigitalMedia.poster}
                    controls
                    autoPlay
                    playsInline
                    preload="metadata"
                    controlsList="nodownload"
                    lang="es"
                    aria-label={t("pages.violenciaDigital.playerTitle")}
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => startPlayback()}
                    className="group relative block w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8fc7f0] focus-visible:ring-offset-2 focus-visible:ring-offset-[#163d59]"
                    aria-label={t("pages.violenciaDigital.watchWebinar")}
                  >
                    <span className="relative block aspect-video overflow-hidden">
                      <img
                        src={violenciaDigitalMedia.poster}
                        alt=""
                        width={3840}
                        height={2160}
                        decoding="async"
                        fetchPriority="high"
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.015] motion-reduce:transition-none"
                      />
                      <span className="absolute inset-0 bg-black/10" />
                      <span className="absolute inset-0 flex items-center justify-center">
                        <span className="flex h-[72px] w-[72px] items-center justify-center rounded-full border border-white/35 bg-white/95 text-[var(--regu-blue)] shadow-2xl transition-transform group-hover:scale-105 motion-reduce:transition-none md:h-20 md:w-20">
                          <Play className="ml-1 h-8 w-8 fill-current" aria-hidden />
                        </span>
                      </span>
                    </span>
                    <span className="flex items-center justify-between gap-4 px-5 py-4 md:px-6">
                      <span>
                        <span className="block text-[0.66rem] font-bold uppercase tracking-[0.16em] text-[#c5dc0b]">
                          {t("pages.violenciaDigital.sessionBadge")}
                        </span>
                        <span className="mt-1 block text-base font-bold text-white md:text-lg">
                          {t("pages.violenciaDigital.playerTitle")}
                        </span>
                      </span>
                      <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white/10 px-3 py-2 text-xs font-semibold text-white/70">
                        <Clock3 className="h-3.5 w-3.5" aria-hidden />
                        {t("pages.violenciaDigital.durationLabel")}
                      </span>
                    </span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-14 md:py-20">
        <div className="mx-auto grid w-full max-w-[1180px] gap-8 px-4 md:grid-cols-[1.05fr_0.95fr] md:items-start md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
          >
            <div className="mb-4 flex items-center gap-3">
              <span className="h-[3px] w-9 rounded-full bg-[var(--regu-blue)]" />
              <p className="m-0 text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[var(--regu-blue)]">
                {t("pages.violenciaDigital.aboutEyebrow")}
              </p>
            </div>
            <h2
              className="text-2xl font-bold leading-tight text-[var(--regu-navy)] md:text-3xl"
              style={{ fontFamily: "var(--token-font-heading)" }}
            >
              {t("pages.violenciaDigital.aboutTitle")}
            </h2>
            <p className="mt-5 text-base leading-[1.75] text-[var(--regu-gray-700)]">
              {t("pages.violenciaDigital.aboutP1")}
            </p>
            <p className="mt-3 text-base leading-[1.75] text-[var(--regu-gray-700)]">
              {t("pages.violenciaDigital.aboutP2")}
            </p>
            <ul className="mt-7 grid gap-2.5 sm:grid-cols-2">
              {topics.map((topic, index) => {
                const TopicIcon = TOPIC_ICONS[index] ?? Shield;
                return (
                  <li
                    key={topic}
                    className="flex items-start gap-2.5 rounded-xl border bg-[#FAFBFC] px-3.5 py-3 text-sm font-semibold text-[var(--regu-navy)]"
                    style={{ borderColor: "rgba(22,61,89,0.10)" }}
                  >
                    <TopicIcon className="mt-0.5 h-4 w-4 shrink-0 text-[var(--regu-blue)]" aria-hidden />
                    <span>{topic}</span>
                  </li>
                );
              })}
            </ul>
          </motion.div>

          <motion.aside
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.08 }}
            className="overflow-hidden rounded-2xl border bg-white shadow-[0_8px_28px_rgba(22,61,89,0.08)] md:sticky md:top-40"
            style={{ borderColor: "rgba(22,61,89,0.10)" }}
          >
            <div className="h-[3px] bg-[var(--regu-blue)]" aria-hidden />
            <div className="p-6 md:p-7">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[rgba(68,137,198,0.10)] text-[var(--regu-blue)]">
                  <FileText className="h-5 w-5" aria-hidden />
                </div>
                <div>
                  <p className="m-0 text-[0.65rem] font-bold uppercase tracking-[0.16em] text-[var(--regu-blue)]">
                    {t("pages.violenciaDigital.agendaEyebrow")}
                  </p>
                  <h3
                    className="m-0 text-lg font-bold text-[var(--regu-navy)]"
                    style={{ fontFamily: "var(--token-font-heading)" }}
                  >
                    {t("pages.violenciaDigital.agendaPdfTitle")}
                  </h3>
                </div>
              </div>

              <ol className="mt-4 divide-y border-y" style={{ borderColor: "rgba(22,61,89,0.08)" }}>
                {violenciaDigitalAgenda.map((item) => (
                  <li key={`mini-${item.id}`}>
                    <a
                      href={`#agenda-${item.id}`}
                      className="grid grid-cols-[4.75rem_1fr] items-start gap-3 py-2.5 text-left transition-colors hover:bg-[rgba(68,137,198,0.05)] focus-visible:outline-none focus-visible:bg-[rgba(68,137,198,0.08)]"
                    >
                      <span className="text-[0.72rem] font-bold tabular-nums text-[var(--regu-blue)]">
                        {item.time.split("–")[0]?.trim()}
                      </span>
                      <span className="line-clamp-2 text-sm font-semibold leading-snug text-[var(--regu-navy)]">
                        {t(`pages.violenciaDigital.agendaItems.${item.id}.title`)}
                      </span>
                    </a>
                  </li>
                ))}
              </ol>

              <div className="mt-5 flex flex-wrap gap-2.5">
                <button
                  type="button"
                  onClick={() => setPreviewAgenda(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-xs font-bold uppercase tracking-[0.07em] text-white transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)] focus-visible:ring-offset-2"
                  style={{ backgroundColor: "var(--regu-blue)" }}
                >
                  <Eye className="h-3.5 w-3.5" aria-hidden />
                  {t("pages.violenciaDigital.previewAgenda")}
                </button>
                <a
                  href={violenciaDigitalMedia.agendaPdf}
                  download
                  className="inline-flex items-center gap-1.5 rounded-lg border-2 px-4 py-2.5 text-xs font-bold uppercase tracking-[0.07em] transition hover:bg-[rgba(68,137,198,0.07)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)] focus-visible:ring-offset-2"
                  style={{ borderColor: "var(--regu-blue)", color: "var(--regu-blue)" }}
                >
                  <Download className="h-3.5 w-3.5" aria-hidden />
                  {t("pages.violenciaDigital.downloadAgenda")}
                </a>
              </div>
            </div>
          </motion.aside>
        </div>
      </section>

      <section
        id="agenda"
        aria-labelledby="agenda-title"
        className="scroll-mt-40 border-t border-[rgba(22,61,89,0.07)] bg-[#F5F7FA] py-14 md:py-20"
      >
        <div className="mx-auto w-full max-w-[1180px] px-4 md:px-6">
          <div className="mb-10 max-w-3xl">
            <p className="m-0 text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[var(--regu-blue)]">
              {t("pages.violenciaDigital.agendaEyebrow")}
            </p>
            <h2
              id="agenda-title"
              className="mt-2 text-2xl font-bold text-[var(--regu-navy)] md:text-3xl"
              style={{ fontFamily: "var(--token-font-heading)" }}
            >
              {t("pages.violenciaDigital.agendaTitle")}
            </h2>
          </div>

          <ol className="space-y-4">
            {violenciaDigitalAgenda.map((item, index) => (
              <motion.li
                id={`agenda-${item.id}`}
                key={item.id}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: index * 0.04 }}
                className="grid scroll-mt-40 gap-4 rounded-2xl border bg-white p-5 md:grid-cols-[140px_1fr] md:items-start md:p-6"
                style={{
                  borderColor: "rgba(22,61,89,0.10)",
                  boxShadow: "0 2px 6px rgba(22,61,89,0.04), 0 6px 20px rgba(22,61,89,0.05)",
                }}
              >
                <p className="m-0 text-sm font-bold text-[var(--regu-blue)]">{item.time}</p>
                <div>
                  <h3
                    className="text-base font-bold text-[var(--regu-navy)] md:text-lg"
                    style={{ fontFamily: "var(--token-font-heading)" }}
                  >
                    {t(`pages.violenciaDigital.agendaItems.${item.id}.title`)}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-[var(--regu-gray-600)]">
                    {t(`pages.violenciaDigital.agendaItems.${item.id}.detail`)}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {item.speakerIds.map((id) => {
                      const speaker = speakerLookup[id];
                      if (!speaker) return null;
                      return (
                        <span
                          key={`${item.id}-${id}`}
                          className="inline-flex max-w-full items-start gap-2 rounded-xl bg-[rgba(22,61,89,0.05)] px-3 py-2"
                        >
                          <SpeakerMark
                            speaker={speaker}
                            className="mt-0.5 h-4 w-5 shrink-0 rounded-[2px]"
                          />
                          <span className="min-w-0">
                            <span className="block text-xs font-semibold leading-snug text-[var(--regu-navy)]">
                              {speaker.name}
                              <span className="font-bold text-[var(--regu-blue)]">
                                {" "}
                                · <OrganizationLink speaker={speaker} />
                              </span>
                            </span>
                            <span className="mt-0.5 block text-[0.7rem] font-medium leading-snug text-[var(--regu-gray-600)]">
                              {t(`pages.violenciaDigital.speakerRoles.${speaker.id}`)}
                            </span>
                          </span>
                        </span>
                      );
                    })}
                  </div>
                </div>
              </motion.li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-white py-14 md:py-20" aria-labelledby="speakers-title">
        <div className="mx-auto w-full max-w-[1180px] px-4 md:px-6">
          <div className="mb-10 flex items-end justify-between gap-4">
            <div>
              <p className="m-0 text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[var(--regu-blue)]">
                {t("pages.violenciaDigital.speakersEyebrow")}
              </p>
              <h2
                id="speakers-title"
                className="mt-2 text-2xl font-bold text-[var(--regu-navy)] md:text-3xl"
                style={{ fontFamily: "var(--token-font-heading)" }}
              >
                {t("pages.violenciaDigital.speakersTitle")}
              </h2>
            </div>
            <Users className="hidden h-8 w-8 text-[var(--regu-blue)] md:block" aria-hidden />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {violenciaDigitalSpeakers.map((speaker, index) => (
              <motion.article
                key={speaker.id}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: index * 0.04 }}
                className="rounded-2xl border bg-[#FAFBFC] p-5"
                style={{ borderColor: "rgba(22,61,89,0.10)" }}
              >
                <div className="mb-3 flex items-center gap-2">
                  <SpeakerMark speaker={speaker} className="h-4 w-5 rounded-[2px]" />
                  <p className="m-0 text-[0.65rem] font-bold uppercase tracking-[0.12em] text-[var(--regu-gray-500)]">
                    <OrganizationLink
                      speaker={speaker}
                      className="text-[var(--regu-gray-500)] hover:text-[var(--regu-blue)]"
                    />
                  </p>
                </div>
                <h3
                  className="text-base font-bold leading-snug text-[var(--regu-navy)]"
                  style={{ fontFamily: "var(--token-font-heading)" }}
                >
                  {speaker.name}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-[var(--regu-gray-600)]">
                  {t(`pages.violenciaDigital.speakers.${speaker.id}`)}
                </p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-[rgba(22,61,89,0.07)] bg-[#FAFBFC] py-14 md:py-20">
        <div className="mx-auto w-full max-w-[1180px] px-4 md:px-6">
          <p className="m-0 text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[var(--regu-blue)]">
            {t("pages.violenciaDigital.factsEyebrow")}
          </p>
          <h2
            className="mt-2 mb-8 text-2xl font-bold text-[var(--regu-navy)] md:text-3xl"
            style={{ fontFamily: "var(--token-font-heading)" }}
          >
            {t("pages.violenciaDigital.factsTitle")}
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            {facts.map((fact) => (
              <article
                key={fact.title}
                className="rounded-2xl border bg-white p-6"
                style={{ borderColor: "rgba(22,61,89,0.10)" }}
              >
                <h3
                  className="text-base font-bold text-[var(--regu-navy)]"
                  style={{ fontFamily: "var(--token-font-heading)" }}
                >
                  {fact.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--regu-gray-600)]">{fact.text}</p>
              </article>
            ))}
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-2">
            <Link
              to={violenciaDigitalMedia.newsPath}
              className="group rounded-2xl border bg-white p-6 transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)]"
              style={{ borderColor: "rgba(22,61,89,0.10)" }}
            >
              <p className="m-0 text-[0.68rem] font-bold uppercase tracking-[0.16em] text-[var(--regu-blue)]">
                {t("pages.violenciaDigital.relatedEyebrow")}
              </p>
              <p className="mt-2 text-lg font-bold text-[var(--regu-navy)]">
                {t("pages.violenciaDigital.relatedNews")}
              </p>
              <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--regu-blue)]">
                {t("common.readMore")}
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
              </span>
            </Link>
            <Link
              to={violenciaDigitalMedia.groupPath}
              className="group rounded-2xl border bg-white p-6 transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)]"
              style={{ borderColor: "rgba(22,61,89,0.10)" }}
            >
              <p className="m-0 text-[0.68rem] font-bold uppercase tracking-[0.16em] text-[var(--regu-blue)]">
                {t("pages.violenciaDigital.relatedEyebrow")}
              </p>
              <p className="mt-2 text-lg font-bold text-[var(--regu-navy)]">
                {t("pages.violenciaDigital.relatedGroup")}
              </p>
              <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--regu-blue)]">
                {t("common.seeMore")}
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
              </span>
            </Link>
          </div>

          <nav
            className="mt-12 flex flex-wrap items-center gap-4 border-t pt-8"
            style={{ borderColor: "rgba(22,61,89,0.08)" }}
            aria-label={t("common.finalNavigation")}
          >
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-xl border-2 px-5 py-3 text-sm font-semibold transition-colors hover:bg-[rgba(68,137,198,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)] focus-visible:ring-offset-2"
              style={{
                color: "var(--regu-blue)",
                borderColor: "var(--regu-blue)",
                backgroundColor: "rgba(68,137,198,0.06)",
              }}
            >
              <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
              {t("common.home")}
            </Link>
            <Link
              to="/estudios-e-investigacion"
              className="inline-flex items-center gap-1.5 text-sm font-semibold transition-all hover:gap-2.5"
              style={{ color: "var(--regu-gray-500)" }}
            >
              {t("nav.links.studiesResearch")} <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </nav>
        </div>
      </section>

      <DocumentPreviewModal
        doc={
          previewAgenda
            ? {
                url: violenciaDigitalMedia.agendaPdf,
                title: t("pages.violenciaDigital.agendaPdfTitle"),
              }
            : null
        }
        onClose={() => setPreviewAgenda(false)}
      />
    </>
  );
}

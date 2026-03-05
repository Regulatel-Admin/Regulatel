interface FeaturedSummitProps {
  title: string;
  description: string;
  href: string;
  buttonLabel: string;
}

export default function FeaturedSummit({
  title,
  description,
  href,
  buttonLabel,
}: FeaturedSummitProps) {
  return (
    <section className="mx-auto w-full px-4 py-14 md:px-6" style={{ maxWidth: "var(--token-container-max)" }}>
      <div
        className="overflow-hidden border border-white/20 p-8 text-white shadow-lg md:p-10"
        style={{
          background: "var(--token-accent-hover)",
          borderRadius: "var(--token-radius-card)",
          boxShadow: "var(--token-shadow-card)",
          fontFamily: "var(--token-font-body)",
        }}
      >
        <p className="mb-2 text-xs font-bold uppercase tracking-widest opacity-90">Destacado</p>
        <h2 className="font-bold md:text-2xl" style={{ fontFamily: "var(--token-font-heading)", fontSize: "var(--token-heading-h2-size)" }}>
          {title}
        </h2>
        <p className="mt-3 max-w-2xl text-sm opacity-95 md:text-base">{description}</p>
        <div className="mt-6">
          <a
            href={href}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex border-2 border-white bg-white px-4 py-2 text-sm font-bold uppercase tracking-wide transition hover:bg-transparent hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white motion-reduce:transition-none"
            style={{
              color: "var(--token-accent)",
              fontFamily: "var(--token-font-body)",
              borderRadius: "var(--token-radius-button)",
            }}
          >
            {buttonLabel}
          </a>
        </div>
      </div>
    </section>
  );
}

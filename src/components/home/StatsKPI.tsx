import type { KPIItem } from "@/data/home";

interface StatsKPIProps {
  title: string;
  items: KPIItem[];
}

export default function StatsKPI({ title, items }: StatsKPIProps) {
  return (
    <section
      className="mx-auto w-full px-4 py-14 md:px-6"
      style={{ fontFamily: "var(--token-font-body)", maxWidth: "var(--token-container-max)" }}
    >
      <div className="mb-6 flex items-end justify-between">
        <h2
          className="font-bold uppercase tracking-wide"
          style={{ color: "var(--token-text-primary)", fontSize: "var(--token-heading-h2-size)" }}
        >
          {title}
        </h2>
        <span className="text-sm font-bold uppercase tracking-wide" style={{ color: "var(--token-text-secondary)" }}>
          2025
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <article
            key={item.label}
            className="border bg-white transition-shadow duration-200 hover:shadow-[var(--token-shadow-hover)] motion-reduce:transition-none"
            style={{
              borderRadius: "var(--token-radius-card)",
              borderColor: "var(--token-border)",
              padding: "var(--token-mega-padding)",
              boxShadow: "var(--token-shadow-card)",
            }}
          >
            <p className="text-4xl font-bold" style={{ color: "var(--token-accent)" }}>
              {item.value}
            </p>
            <h3 className="mt-2 font-bold uppercase" style={{ color: "var(--token-text-primary)", fontSize: "var(--token-heading-h3-size)" }}>
              {item.label}
            </h3>
            <p className="mt-1 text-sm" style={{ color: "var(--token-text-secondary)" }}>
              {item.description}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

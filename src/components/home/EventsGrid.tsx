import type { HomeEventItem } from "@/data/events";

interface EventsGridProps {
  events: HomeEventItem[];
}

export default function EventsGrid({ events }: EventsGridProps) {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-14 md:px-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h2 className="text-2xl font-semibold text-slate-900 md:text-3xl">Eventos</h2>
        <a
          href="/eventos"
          className="text-sm font-medium text-indigo-700 hover:text-indigo-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          Ver todos
        </a>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {events.map((event) => {
          const isUpcoming = event.status === "proxima";
          return (
            <article
              key={event.title}
              className={[
                "rounded-2xl border bg-white p-5 shadow-sm",
                isUpcoming ? "border-indigo-300 ring-1 ring-indigo-200" : "border-slate-200",
              ].join(" ")}
            >
              <div className="mb-3 flex items-center justify-between">
                <span
                  className={[
                    "rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide",
                    isUpcoming
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-100 text-slate-700",
                  ].join(" ")}
                >
                  {isUpcoming ? "Próxima" : "Pasada"}
                </span>
                <span className="text-xs font-medium text-slate-500">{event.year}</span>
              </div>
              <h3 className="text-base font-semibold text-slate-900">{event.title}</h3>
              <p className="mt-1 text-sm text-slate-600">{event.city}</p>
              <p className="mt-2 text-sm text-slate-600">{event.description}</p>
              {event.mediaLabel ? (
                <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-indigo-700">
                  {event.mediaLabel}
                </p>
              ) : null}
              <a
                href={event.href}
                target={event.href.startsWith("http") ? "_blank" : undefined}
                rel={event.href.startsWith("http") ? "noreferrer noopener" : undefined}
                className="mt-4 inline-flex rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 motion-reduce:transition-none"
              >
                Ver evento
              </a>
            </article>
          );
        })}
      </div>
    </section>
  );
}

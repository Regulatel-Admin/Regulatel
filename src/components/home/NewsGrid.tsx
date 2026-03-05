import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import type { HomeNewsItem } from "@/data/news";

interface NewsGridProps {
  news: HomeNewsItem[];
}

export default function NewsGrid({ news }: NewsGridProps) {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-14 md:px-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h2 className="text-2xl font-semibold text-slate-900 md:text-3xl">Noticias</h2>
        <Link
          to="/noticias"
          className="text-sm font-medium text-indigo-700 hover:text-indigo-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          Ver todas
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {news.slice(0, 3).map((item) => (
          <article
            key={item.slug}
            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              {item.dateFormatted}
            </p>
            <h3 className="mt-2 text-lg font-semibold text-slate-900">{item.title}</h3>
            <p className="mt-2 line-clamp-3 text-sm text-slate-600">{item.excerpt}</p>
            <Link
              to={`/noticias/${item.slug}`}
              className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-indigo-700 hover:text-indigo-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              Leer más
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 motion-reduce:transition-none" />
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}

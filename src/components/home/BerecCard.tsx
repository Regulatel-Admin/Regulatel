import { Link } from "react-router-dom";
import { ChevronRight, ExternalLink } from "lucide-react";
import type { BerecFeatureCard } from "@/data/home";

interface BerecCardProps {
  card: BerecFeatureCard;
  /** Card min-height (default 230px for hero, 260px for standalone) */
  minHeight?: string;
  /** Hero: primary = 4 cards fila 1 (padding 24px); secondary = 2 cards fila 2 (padding 20px, más compacta) */
  size?: "primary" | "secondary";
}

/**
 * Una card estilo BEREC: radius 16px, sombra, padding 22–26px, botón magenta, "Ver más" abajo derecha.
 * Reutilizable en hero (primary/secondary) y en grid standalone.
 */
export default function BerecCard({ card, minHeight = "240px", size }: BerecCardProps) {
  const padding = size === "secondary" ? "20px" : "24px";
  return (
    <article
      className="flex flex-col bg-white transition-shadow duration-200 hover:shadow-[var(--token-shadow-hover)] motion-reduce:transition-none"
      style={{
        minHeight,
        borderRadius: "var(--token-radius-card)",
        border: "1px solid rgba(15,23,42,0.10)",
        padding,
        boxShadow: "0 10px 30px rgba(15,23,42,0.12), 0 2px 6px rgba(15,23,42,0.06)",
      }}
    >
      <h3
        className="font-bold leading-tight"
        style={{ color: "var(--token-text-primary)", fontSize: "var(--token-heading-h3-size)" }}
      >
        {card.title}
      </h3>

      {card.variant === "documents" && card.buttons?.length ? (
        <div className="mt-3 flex flex-col gap-2">
          {card.buttons.map((btn) =>
            btn.external ? (
              <a
                key={btn.label}
                href={btn.href}
                target="_blank"
                rel="noreferrer noopener"
                className="flex h-11 items-center justify-center rounded-lg text-sm font-extrabold uppercase leading-none text-white transition-colors hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--token-accent)]"
                style={{ backgroundColor: "var(--token-accent)" }}
              >
                {btn.label}
              </a>
            ) : (
              <Link
                key={btn.label}
                to={btn.href}
                className="flex h-11 items-center justify-center rounded-lg text-sm font-extrabold uppercase leading-none text-white transition-colors hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--token-accent)]"
                style={{ backgroundColor: "var(--token-accent)" }}
              >
                {btn.label}
              </Link>
            )
          )}
        </div>
      ) : null}

      {card.variant === "tools" && (card.links?.length || card.buttons?.length) ? (
        <div className="mt-3 flex flex-1 flex-col gap-2">
          {card.links?.map((link) =>
            link.external ? (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1.5 text-sm font-bold uppercase leading-tight transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--token-accent)]"
                style={{ color: "var(--token-accent)" }}
              >
                <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" />
                {link.label}
              </a>
            ) : (
              <Link
                key={link.label}
                to={link.href}
                className="inline-flex items-center gap-1.5 text-sm font-bold uppercase leading-tight transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--token-accent)]"
                style={{ color: "var(--token-accent)" }}
              >
                <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" />
                {link.label}
              </Link>
            )
          )}
          {card.buttons?.map((btn) =>
            btn.external ? (
              <a
                key={btn.label}
                href={btn.href}
                target="_blank"
                rel="noreferrer noopener"
                className="mt-1 flex h-11 items-center justify-center rounded-lg text-sm font-extrabold uppercase leading-none text-white transition opacity-90 hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--token-accent)]"
                style={{ backgroundColor: "var(--token-accent)" }}
              >
                {btn.label}
              </a>
            ) : (
              <Link
                key={btn.label}
                to={btn.href}
                className="mt-1 flex h-11 items-center justify-center rounded-lg text-sm font-extrabold uppercase leading-none text-white transition opacity-90 hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--token-accent)]"
                style={{ backgroundColor: "var(--token-accent)" }}
              >
                {btn.label}
              </Link>
            )
          )}
        </div>
      ) : null}

      {card.variant === "paragraph" && card.description ? (
        <p
          className="mt-3 flex-1 text-sm leading-snug"
          style={{ color: "var(--token-text-secondary)" }}
        >
          {card.description}
        </p>
      ) : null}

      <div className="mt-4 flex justify-end">
        {card.seeMoreHref.startsWith("http") ? (
          <a
            href={card.seeMoreHref}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-0.5 text-sm font-bold transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--token-accent)] focus-visible:ring-offset-2"
            style={{ color: "var(--token-accent)" }}
          >
            Ver más
            <ChevronRight className="h-4 w-4" aria-hidden />
          </a>
        ) : (
          <Link
            to={card.seeMoreHref}
            className="inline-flex items-center gap-0.5 text-sm font-bold transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--token-accent)] focus-visible:ring-offset-2"
            style={{ color: "var(--token-accent)" }}
          >
            Ver más
            <ChevronRight className="h-4 w-4" aria-hidden />
          </Link>
        )}
      </div>
    </article>
  );
}

/**
 * Portal REGULATEL – Layout principal (header, contenido, footer).
 * Versión inicial desarrollada por Diego Cuervo (INDOTEL). 2026.
 */
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import HeaderMegaMenu from "@/components/layout/HeaderMegaMenu";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen text-slate-900" style={{ backgroundColor: "var(--token-page-bg)" }}>
      <HeaderMegaMenu />
      <div id="contentRoot">
        <main>{children}</main>
        <footer
        className="border-t bg-white"
        style={{
          borderColor: "var(--token-border)",
          fontFamily: "var(--token-font-body)",
        }}
      >
        <div
          className="mx-auto grid w-full gap-6 px-4 py-10 md:grid-cols-3 md:px-6"
          style={{ maxWidth: "var(--token-container-max)" }}
        >
          <div>
            <p className="text-lg font-semibold" style={{ color: "var(--token-text-primary)" }}>REGULATEL</p>
            <p className="mt-2 text-sm" style={{ color: "var(--token-text-secondary)" }}>
              Foro Latinoamericano de Entes Reguladores de Telecomunicaciones.
            </p>
          </div>
          <div className="space-y-2">
            <h2 className="text-sm font-semibold uppercase tracking-wide" style={{ color: "var(--token-text-secondary)" }}>
              Enlaces
            </h2>
            <nav className="flex flex-col gap-1 text-sm">
              <Link
                to="/contacto"
                className="transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--token-accent)]"
                style={{ color: "var(--token-text-secondary)" }}
              >
                Contacto
              </Link>
              <Link
                to="/pendiente/privacidad"
                className="transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--token-accent)]"
                style={{ color: "var(--token-text-secondary)" }}
              >
                Privacidad
              </Link>
              <Link
                to="/pendiente/terminos"
                className="transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--token-accent)]"
                style={{ color: "var(--token-text-secondary)" }}
              >
                Términos
              </Link>
            </nav>
          </div>
          <div className="md:text-right">
            <p className="text-sm" style={{ color: "var(--token-text-secondary)" }}>
              &copy; {new Date().getFullYear()} REGULATEL
            </p>
          </div>
        </div>
      </footer>
      </div>
    </div>
  );
}

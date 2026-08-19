import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { api } from "@/lib/api";

function shouldTrack(pathname: string) {
  if (!pathname) return false;
  if (pathname.startsWith("/admin") || pathname.startsWith("/api")) return false;
  if (pathname === "/login") return false;
  return true;
}

/** Cuenta visitas públicas de forma anónima. No identifica a la persona. */
export default function VisitTracker() {
  const { pathname } = useLocation();

  useEffect(() => {
    if (!shouldTrack(pathname)) return;
    const dnt = typeof navigator !== "undefined" ? navigator.doNotTrack : null;
    if (dnt === "1" || dnt === "yes") return;
    void api.analytics.hit({
      path: pathname,
      referrer: typeof document !== "undefined" ? document.referrer : undefined,
    });
  }, [pathname]);

  return null;
}

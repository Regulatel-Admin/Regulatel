import { useEffect } from "react";

/** Tells search engines not to list this route. Used on /login and /admin. */
export function useNoIndex() {
  useEffect(() => {
    const existing = document.querySelector('meta[name="robots"]');
    const el = existing instanceof HTMLMetaElement ? existing : document.createElement("meta");
    const previous = existing instanceof HTMLMetaElement ? el.getAttribute("content") : null;
    el.setAttribute("name", "robots");
    el.setAttribute("content", "noindex, nofollow");
    if (!existing) document.head.appendChild(el);
    return () => {
      if (existing && previous != null) {
        el.setAttribute("content", previous);
        return;
      }
      el.remove();
    };
  }, []);
}

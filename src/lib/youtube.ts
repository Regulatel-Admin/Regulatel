const YOUTUBE_ID_RE = /^[a-zA-Z0-9_-]{11}$/;

function firstPathSegment(pathname: string): string | undefined {
  return pathname.split("/").filter(Boolean)[0];
}

/**
 * Acepta un ID de 11 caracteres o un enlace de YouTube
 * (watch, youtu.be, embed, shorts, live) y devuelve solo el ID.
 */
export function extractYoutubeId(input: string): string | undefined {
  const raw = input.trim();
  if (!raw) return undefined;
  if (YOUTUBE_ID_RE.test(raw)) return raw;

  try {
    const url = new URL(raw.includes("://") ? raw : `https://${raw}`);
    const host = url.hostname.replace(/^(www|m)\./, "");

    if (host === "youtu.be") {
      const id = firstPathSegment(url.pathname);
      return id && YOUTUBE_ID_RE.test(id) ? id : undefined;
    }

    if (host === "youtube.com" || host === "youtube-nocookie.com") {
      const fromQuery = url.searchParams.get("v");
      if (fromQuery && YOUTUBE_ID_RE.test(fromQuery)) return fromQuery;

      const parts = url.pathname.split("/").filter(Boolean);
      if (
        parts.length >= 2 &&
        (parts[0] === "embed" || parts[0] === "shorts" || parts[0] === "live" || parts[0] === "v")
      ) {
        const id = parts[1];
        if (YOUTUBE_ID_RE.test(id)) return id;
      }
    }
  } catch {
    return undefined;
  }

  return undefined;
}

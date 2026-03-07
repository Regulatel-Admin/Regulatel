/**
 * Site search over the active content source (database or legacy fallback).
 * Components build the index from current app state; this file stays source-agnostic.
 */

import { authorities } from "@/data/authorities";

export type SiteSearchType = "autoridad" | "noticia" | "evento" | "documento";

export interface SiteSearchDoc {
  id: string;
  type: SiteSearchType;
  title: string;
  url: string;
  date: string;
  content: string;
  tags?: string[];
}

export interface SiteSearchResult {
  id: string;
  type: SiteSearchType;
  title: string;
  url: string;
  date: string;
  snippet: string;
  snippetHighlighted: string;
}

export interface SearchNewsSource {
  id?: string;
  slug: string;
  title: string;
  date?: string;
  dateFormatted?: string;
  excerpt?: string;
  category?: string;
  content?: string | string[];
  tags?: string[];
}

export interface SearchEventSource {
  id: string;
  title: string;
  description?: string;
  organizer: string;
  location: string;
  year: number;
  startDate: string;
}

export interface SearchDocumentSource {
  id: string;
  title: string;
  url: string;
  year?: string;
  category: string;
}

function normalizeText(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function buildSearchDocs(input: {
  news: SearchNewsSource[];
  events: SearchEventSource[];
  documents: SearchDocumentSource[];
}): SiteSearchDoc[] {
  const docs: SiteSearchDoc[] = [];

  for (const a of authorities) {
    docs.push({
      id: `autoridad-${a.slug}`,
      type: "autoridad",
      title: a.name,
      url: `/autoridades/${a.slug}`,
      date: a.period ?? "",
      content: [a.name, a.role, a.institution, a.country, a.bio, a.fullBio].filter(Boolean).join(" "),
      tags: [a.role, a.institution, a.country],
    });
  }

  for (const n of input.news) {
    const content = Array.isArray(n.content) ? n.content.join(" ") : (n.content ?? "");
    docs.push({
      id: `noticia-${n.id ?? n.slug}`,
      type: "noticia",
      title: n.title,
      url: `/noticias/${n.slug}`,
      date: n.date ?? n.dateFormatted ?? "",
      content: [n.title, n.excerpt, n.category, content].filter(Boolean).join(" "),
      tags: n.tags,
    });
  }

  input.events.forEach((e) => {
    docs.push({
      id: `evento-${e.id}`,
      type: "evento",
      title: e.title,
      url: `/eventos/${e.id}`,
      date: e.startDate,
      content: [e.title, e.description, e.organizer, e.location, String(e.year)].filter(Boolean).join(" "),
      tags: [e.organizer, e.location, String(e.year)],
    });
  });

  for (const d of input.documents) {
    docs.push({
      id: `doc-${d.id}`,
      type: "documento",
      title: d.title,
      url: d.url,
      date: d.year ?? "",
      content: [d.title, d.category].join(" "),
      tags: [d.category],
    });
  }

  return docs;
}

function extractSnippet(content: string, queryNorm: string, maxLen = 140): string {
  const c = normalizeText(content);
  const words = queryNorm.split(/\s+/).filter(Boolean);
  const firstWord = words[0];
  if (!firstWord) return content.slice(0, maxLen).trim() + (content.length > maxLen ? "…" : "");

  const idx = c.indexOf(firstWord);
  if (idx === -1) return content.slice(0, maxLen).trim() + (content.length > maxLen ? "…" : "");

  const start = Math.max(0, idx - 40);
  const end = Math.min(content.length, start + maxLen);
  let snippet = content.slice(start, end).trim();
  if (start > 0) snippet = "…" + snippet;
  if (end < content.length) snippet = snippet + "…";
  return snippet;
}

/** Build normalized string and map: normIndex -> snippet char index (for accent-insensitive highlight) */
function buildNormMap(snippet: string): { norm: string; normToOrig: number[] } {
  const normToOrig: number[] = [];
  let norm = "";
  for (let j = 0; j < snippet.length; j++) {
    const char = snippet[j];
    const n = char.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
    for (let k = 0; k < n.length; k++) normToOrig.push(j);
    norm += n;
  }
  return { norm, normToOrig };
}

function highlightSnippet(snippet: string, queryNorm: string): string {
  if (!queryNorm.trim()) return snippet;
  const words = queryNorm.split(/\s+/).filter(Boolean);
  const { norm, normToOrig } = buildNormMap(snippet);
  const ranges: [number, number][] = [];
  for (const w of words) {
    if (w.length < 2) continue;
    let i = 0;
    while (true) {
      i = norm.indexOf(w, i);
      if (i === -1) break;
      const start = normToOrig[i];
      const lastNormIdx = i + w.length - 1;
      const end = lastNormIdx < normToOrig.length ? normToOrig[lastNormIdx] + 1 : snippet.length;
      ranges.push([start, end]);
      i += 1;
    }
  }
  ranges.sort((a, b) => a[0] - b[0]);
  const merged: [number, number][] = [];
  for (const [s, e] of ranges) {
    if (merged.length && s <= merged[merged.length - 1][1]) {
      merged[merged.length - 1][1] = Math.max(merged[merged.length - 1][1], e);
    } else {
      merged.push([s, e]);
    }
  }
  let out = "";
  let last = 0;
  for (const [s, e] of merged) {
    out += snippet.slice(last, s) + "<mark>" + snippet.slice(s, e) + "</mark>";
    last = e;
  }
  out += snippet.slice(last);
  return out;
}

function scoreDoc(doc: SiteSearchDoc, queryNorm: string): number {
  const titleNorm = normalizeText(doc.title);
  const contentNorm = normalizeText(doc.content);
  const words = queryNorm.split(/\s+/).filter(Boolean);
  if (words.length === 0) return 0;

  let score = 0;
  const exactQuery = queryNorm;
  if (titleNorm === exactQuery) score += 100;
  else if (titleNorm.includes(exactQuery)) score += 50;
  else if (words.every((w) => titleNorm.includes(w))) score += 40;
  else if (words.some((w) => titleNorm.includes(w))) score += 20;

  if (contentNorm.includes(exactQuery)) score += 15;
  else if (words.every((w) => contentNorm.includes(w))) score += 10;
  else if (words.some((w) => contentNorm.includes(w))) score += 5;

  return score;
}

export function searchSiteDocs(
  docs: SiteSearchDoc[],
  query: string,
  options: { limit?: number; type?: SiteSearchType } = {}
): SiteSearchResult[] {
  const q = query.trim();
  const queryNorm = normalizeText(q);
  if (!queryNorm) return [];
  let filtered = docs;
  if (options.type) filtered = docs.filter((d) => d.type === options.type);

  const scored = filtered
    .map((doc) => ({ doc, score: scoreDoc(doc, queryNorm) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);

  const limit = options.limit ?? 20;
  const results: SiteSearchResult[] = scored.slice(0, limit).map(({ doc }) => {
    const snippet = extractSnippet(doc.content, queryNorm);
    const snippetHighlighted = highlightSnippet(snippet, queryNorm);
    return {
      id: doc.id,
      type: doc.type,
      title: doc.title,
      url: doc.url,
      date: doc.date,
      snippet,
      snippetHighlighted,
    };
  });

  return results;
}

const typeLabels: Record<SiteSearchType, string> = {
  autoridad: "Autoridad",
  noticia: "Noticia",
  evento: "Evento",
  documento: "Documento",
};

export function getTypeLabel(type: SiteSearchType): string {
  return typeLabels[type];
}

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array(m + 1)
    .fill(0)
    .map(() => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }
  return dp[m][n];
}

/** "Did you mean?" when no results: suggest closest title by edit distance or partial match */
export function suggestQueryDocs(docs: SiteSearchDoc[], query: string): string | null {
  const q = query.trim();
  if (!q || q.length < 2) return null;
  const results = searchSiteDocs(docs, q, { limit: 1 });
  if (results.length > 0) return null;
  const queryNorm = normalizeText(q);
  const firstWord = queryNorm.split(/\s+/)[0];
  if (!firstWord) return null;

  for (const doc of docs) {
    const t = normalizeText(doc.title);
    if (t.includes(firstWord)) return doc.title;
  }

  let best: { title: string; dist: number } | null = null;
  const maxDist = Math.min(3, Math.ceil(firstWord.length / 2) + 1);
  for (const doc of docs) {
    const t = normalizeText(doc.title);
    const words = t.split(/\s+/);
    for (const w of words) {
      if (w.length < 2) continue;
      const d = levenshtein(firstWord, w);
      if (d <= maxDist && (best === null || d < best.dist)) {
        best = { title: doc.title, dist: d };
      }
    }
  }
  return best?.title ?? null;
}

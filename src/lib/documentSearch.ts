import type { GestionDocument } from "@/data/gestion";
import { SEMANA_RESOURCE_GROUPS } from "@/data/eventMaterials";
import materials from "@/data/semanaRegulatelMaterials.json";
import {
  resolveNewsAttachments,
  SEMANA_REGULATEL_2026_ATTACHMENTS,
  SEMANA_REGULATEL_2026_EVENT_ID,
} from "@/data/semanaRegulatel2026";
import type { ContentBlock } from "@/types/contentBlocks";
import type { Event, EventAttachment, EventResourceFile } from "@/types/event";
import type { SearchNewsSource, SiteSearchDoc } from "@/lib/siteSearch";

interface DocumentNewsSource extends SearchNewsSource {
  published?: boolean;
  attachments?: EventAttachment[];
  contentBlocks?: ContentBlock[];
}

type SearchableFile = Partial<EventAttachment & EventResourceFile>;

function normalizedTitle(title: string): string {
  return title.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().replace(/\s+/g, " ").trim();
}

export function gestionDocumentSearchPath(document: Pick<GestionDocument, "id" | "category">): string {
  return `/gestion?tipo=${encodeURIComponent(document.category)}&id=${encodeURIComponent(document.id)}`;
}

/** Only internal content pages enter the public index, never a file/access URL. */
export function buildDocumentSearchDocs(input: {
  documents: GestionDocument[];
  news: DocumentNewsSource[];
  events: Event[];
  localize?: (text: string) => string;
}): SiteSearchDoc[] {
  const docs: SiteSearchDoc[] = [];
  const seenUrls = new Set<string>();
  const seenTitles = new Set<string>();
  const localize = input.localize ?? ((text: string) => text);

  const add = (file: SearchableFile, parent: { url: string; title: string; date: string }, fallback: string) => {
    const title = file.title?.trim() || (file.private || file.locked ? "" : file.fileName?.trim()) || fallback;
    if (!title) return;
    // A redacted resource still has a public title and an access request on its parent page.
    if (!file.url?.trim() && !file.private && !file.locked && !file.comingSoon) return;
    const titleKey = `${parent.url}:${normalizedTitle(title)}`;
    const assetKey = file.url?.trim().replace(/#.*$/, "");
    if (seenTitles.has(titleKey) || (assetKey && seenUrls.has(assetKey))) return;
    seenTitles.add(titleKey);
    if (assetKey) seenUrls.add(assetKey);
    const translated = localize(title);
    const parentTitle = localize(parent.title);
    docs.push({
      id: `document-${docs.length}-${parent.url}`,
      type: "documento",
      title: translated,
      url: parent.url,
      date: parent.date,
      content: [translated, parentTitle].filter(Boolean).join(" · "),
      tags: [parentTitle],
    });
  };

  const addBlocks = (blocks: ContentBlock[] | undefined, parent: { url: string; title: string; date: string }) => {
    for (const block of blocks ?? []) {
      if (block.type === "document") add(block, parent, localize("Documento"));
    }
  };

  for (const document of input.documents) {
    add(document, {
      url: gestionDocumentSearchPath(document),
      title: "",
      date: document.year ?? "",
    }, "");
  }

  for (const article of input.news) {
    if (article.published === false || !(article.slug || article.id)) continue;
    const parent = {
      url: `/noticias/${encodeURIComponent(article.slug || article.id!)}`,
      title: article.title,
      date: article.date ?? article.dateFormatted ?? "",
    };
    if (article.contentBlocks !== undefined) addBlocks(article.contentBlocks, parent);
    else for (const file of resolveNewsAttachments(article.slug, article.attachments)) add(file, parent, "");
  }

  for (const event of input.events) {
    if (event.published === false) continue;
    const parent = { url: `/eventos/${encodeURIComponent(event.id)}`, title: event.title, date: event.startDate };
    const group = SEMANA_RESOURCE_GROUPS[event.id];
    const resources = event.resources ?? (group ? materials[group] : undefined);
    for (const file of [...(resources?.programs ?? []), ...(resources?.documents ?? [])]) {
      add(file.title === "Ver programa" ? { ...file, title: "Grupos de Trabajo y Comité Ejecutivo" } : file, parent, "");
    }
    for (const section of event.resources?.customSections ?? []) addBlocks(section.blocks, parent);
    addBlocks(event.contentBlocks, parent);
    const isAsiet = event.id === SEMANA_REGULATEL_2026_EVENT_ID
      || (event.startDate === "2026-10-16" && /asiet/i.test(event.title) && /comtelca/i.test(event.title));
    const attachments = event.attachments ?? (isAsiet ? SEMANA_REGULATEL_2026_ATTACHMENTS : []);
    for (const file of attachments) add(file, parent, "");
  }

  return docs;
}

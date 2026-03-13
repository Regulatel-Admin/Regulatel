import { useState } from "react";
import { ChevronDown, ChevronRight, ExternalLink, FileText } from "lucide-react";
import type { CategoryWithLinks } from "@/data/mejoresPracticas";

interface CategoryAccordionProps {
  category: CategoryWithLinks;
  defaultOpen?: boolean;
  searchNorm?: string;
}

function normalizeForSearch(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\u0300/g, "")
    .trim();
}

function linkMatchesSearch(title: string, url: string, searchNorm: string): boolean {
  if (!searchNorm) return true;
  return (
    normalizeForSearch(title).includes(searchNorm) ||
    normalizeForSearch(url).includes(searchNorm)
  );
}

export default function CategoryAccordion({
  category,
  defaultOpen = false,
  searchNorm = "",
}: CategoryAccordionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const filteredLinks = searchNorm
    ? category.links.filter((l) => linkMatchesSearch(l.title, l.url, searchNorm))
    : category.links;
  const categoryMatchesSearch =
    !searchNorm || normalizeForSearch(category.name).includes(searchNorm);
  const showCategory = categoryMatchesSearch || filteredLinks.length > 0;
  const displayLinks = categoryMatchesSearch ? category.links : filteredLinks;

  if (!showCategory) return null;

  const isEmpty = displayLinks.length === 0;

  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{ borderColor: "rgba(22,61,89,0.08)", backgroundColor: "#fff" }}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-[rgba(22,61,89,0.03)]"
        style={{ color: "var(--regu-gray-900)" }}
        aria-expanded={open}
      >
        {open ? (
          <ChevronDown className="h-5 w-5 shrink-0" style={{ color: "var(--regu-blue)" }} />
        ) : (
          <ChevronRight className="h-5 w-5 shrink-0" style={{ color: "var(--regu-gray-400)" }} />
        )}
        <span className="font-semibold" style={{ fontSize: "0.9375rem" }}>
          {category.name}
        </span>
        <span
          className="ml-auto shrink-0 rounded-full px-2 py-0.5 text-xs font-medium"
          style={{ backgroundColor: "var(--regu-gray-100)", color: "var(--regu-gray-600)" }}
        >
          {displayLinks.length} {displayLinks.length === 1 ? "recurso" : "recursos"}
        </span>
      </button>
      {open && (
        <div
          className="border-t px-4 py-3"
          style={{ borderColor: "rgba(22,61,89,0.06)", backgroundColor: "var(--regu-offwhite, #FAFBFC)" }}
        >
          {isEmpty ? (
            <p className="text-sm" style={{ color: "var(--regu-gray-500)" }}>
              No hay recursos en esta categoría.
            </p>
          ) : (
            <ul className="space-y-2">
              {displayLinks.map((link, i) => (
                <li key={`${link.url}-${i}`}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="flex items-start gap-2 rounded-lg px-3 py-2 text-sm transition hover:bg-white"
                    style={{ color: "var(--regu-gray-800)" }}
                  >
                    <FileText className="mt-0.5 h-4 w-4 shrink-0" style={{ color: "var(--regu-blue)" }} />
                    <span className="min-w-0 flex-1 break-words">{link.title}</span>
                    <ExternalLink className="h-3.5 w-3.5 shrink-0 mt-0.5 opacity-60" aria-hidden />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

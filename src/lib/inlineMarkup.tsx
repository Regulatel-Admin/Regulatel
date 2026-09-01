import { Fragment, type ReactNode } from "react";
import { Link } from "react-router-dom";

export function safeMarkupHref(raw: string): string | null {
  const href = raw.trim();
  if (!href) return null;
  const lower = href.toLowerCase();
  if (lower.startsWith("javascript:") || lower.startsWith("data:") || lower.startsWith("vbscript:")) return null;
  if (href.startsWith("//")) return null;
  if (href.startsWith("/")) return href;
  if (lower.startsWith("https://") || lower.startsWith("http://") || lower.startsWith("mailto:")) return href;
  return null;
}

export function wrapTextareaSelection(
  el: HTMLTextAreaElement,
  value: string,
  before: string,
  after: string,
  fallback = "texto"
): { next: string; selectStart: number; selectEnd: number } {
  const start = el.selectionStart;
  const end = el.selectionEnd;
  const selected = value.slice(start, end) || fallback;
  const next = value.slice(0, start) + before + selected + after + value.slice(end);
  return {
    next,
    selectStart: start + before.length,
    selectEnd: start + before.length + selected.length,
  };
}

function nextMarkupAt(text: string): number {
  for (let i = 0; i < text.length; i++) {
    if (text.startsWith("**", i) || text[i] === "[" || text[i] === "*") return i;
  }
  return -1;
}

function parseInline(text: string, editing: boolean, keyBase: string): ReactNode {
  const nodes: ReactNode[] = [];
  let rest = text;
  let n = 0;
  while (rest.length) {
    const bold = rest.match(/^\*\*([^*]+)\*\*/);
    if (bold) {
      nodes.push(
        <strong key={`${keyBase}-b${n++}`}>{parseInline(bold[1], editing, `${keyBase}-b${n}`)}</strong>
      );
      rest = rest.slice(bold[0].length);
      continue;
    }
    const link = rest.match(/^\[([^\]]+)\]\(([^)]+)\)/);
    if (link) {
      const href = safeMarkupHref(link[2]);
      const inner = parseInline(link[1], editing, `${keyBase}-a${n}`);
      const key = `${keyBase}-a${n++}`;
      if (!href || editing) {
        nodes.push(
          <span key={key} className="underline underline-offset-2" title={href || undefined}>
            {inner}
          </span>
        );
      } else if (href.startsWith("mailto:")) {
        nodes.push(
          <a key={key} href={href} className="underline underline-offset-2">
            {inner}
          </a>
        );
      } else if (href.startsWith("http://") || href.startsWith("https://")) {
        nodes.push(
          <a key={key} href={href} target="_blank" rel="noreferrer" className="underline underline-offset-2">
            {inner}
          </a>
        );
      } else {
        nodes.push(
          <Link key={key} to={href} className="underline underline-offset-2">
            {inner}
          </Link>
        );
      }
      rest = rest.slice(link[0].length);
      continue;
    }
    const italic = rest.match(/^\*([^*]+)\*/);
    if (italic) {
      nodes.push(
        <em key={`${keyBase}-i${n++}`}>{parseInline(italic[1], editing, `${keyBase}-i${n}`)}</em>
      );
      rest = rest.slice(italic[0].length);
      continue;
    }
    const idx = nextMarkupAt(rest);
    if (idx < 0) {
      nodes.push(rest);
      break;
    }
    if (idx === 0) {
      nodes.push(rest[0]);
      rest = rest.slice(1);
      continue;
    }
    nodes.push(rest.slice(0, idx));
    rest = rest.slice(idx);
  }
  if (nodes.length === 1) return nodes[0];
  return nodes;
}

export function renderInlineMarkup(text: string, editing = false): ReactNode {
  if (!text) return null;
  const lines = text.split("\n");
  return lines.map((line, i) => (
    <Fragment key={i}>
      {i > 0 ? <br /> : null}
      {parseInline(line, editing, `l${i}`)}
    </Fragment>
  ));
}

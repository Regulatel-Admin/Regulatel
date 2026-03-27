/**
 * Repara texto donde UTF-8 fue leído como Latin-1 (ej. "Ã³" → "ó", "PerÃº" → "Perú").
 * Solo aplica cuando hay bytes típicos de mojibake (Â, Ã).
 */

import { Buffer } from "node:buffer";

export function fixMojibakeUtf8(s: string): string {
  if (typeof s !== "string" || s.length < 2) return s;
  if (!/[\u00c2\u00c3]/.test(s)) return s;
  const buf = Buffer.from(s, "latin1");
  const fixed = buf.toString("utf8");
  if (fixed === s) return s;
  if (fixed.includes("\uFFFD")) return s;
  return fixed;
}

export function deepFixMojibakeUtf8(val: unknown): unknown {
  if (typeof val === "string") return fixMojibakeUtf8(val);
  if (Array.isArray(val)) return val.map((item) => deepFixMojibakeUtf8(item));
  if (val !== null && typeof val === "object") {
    const o = val as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    for (const k of Object.keys(o)) {
      out[k] = deepFixMojibakeUtf8(o[k]);
    }
    return out;
  }
  return val;
}

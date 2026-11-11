/** Public localization regression checks. Uses local source/catalogues only; no network. */
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const languages = ["en", "pt", "it"];
const catalogues = Object.fromEntries(languages.map(language => [language,
  JSON.parse(fs.readFileSync(path.join(root, "src/i18n/locales/published-" + language + ".json"), "utf8"))]));
const sourceKeys = Object.keys(catalogues.en).sort();
assert.equal(sourceKeys.length, 1229, "The published source inventory must contain 1,229 exact keys");
const manifest = sourceKeys.map(source => ({ source }));
for (const language of languages) {
  assert.deepEqual(Object.keys(catalogues[language]).sort(), sourceKeys, language + ": catalogue must cover the complete source inventory");
  assert.ok(Object.values(catalogues[language]).every(value => typeof value === "string" && value.trim()), language + ": empty or invalid translation");
}
const weekBody = sourceKeys.find(source => source.startsWith("Montevideo, Uruguay.– El Foro Latinoamericano de Entes Reguladores de Telecomunicaciones (REGULATEL)") && source.split(/\n\n+/).filter(Boolean).length === 10);
assert.ok(weekBody, "The source inventory must include the current full CMS article");
for (const language of languages) {
  const translated = catalogues[language][weekBody];
  assert.equal(translated.split(/\n\n+/).filter(Boolean).length, weekBody.split(/\n\n+/).filter(Boolean).length, language + ": the full CMS body must retain every source paragraph");
  for (const acronym of ["REGULATEL", "BEREC", "PRAI", "ASIET", "COMTELCA", "AECID", "CAF"]) assert.ok(translated.includes(acronym), language + ": missing organization " + acronym);
}

// These diagnostics prompt editorial review; they are not brittle translation equality tests.
const diagnostics = { shortTranslations: [], numberChanges: [], urlChanges: [] };
const numbers = text => (text.match(/\d+(?:[.,]\d+)*/g) ?? []).map(value => value.replace(/[.,]/g, "").replace(/^0+(?=\d)/, ""));
const urls = text => text.match(/https?:\/\/[^\s]+/g) ?? [];
for (const language of languages) {
  for (const { source } of manifest) {
    const translated = catalogues[language][source];
    if (source.length > 350 && translated.length / source.length < 0.55) {
      diagnostics.shortTranslations.push({ language, source: source.slice(0, 140), ratio: Number((translated.length / source.length).toFixed(2)) });
    }
    if (JSON.stringify(numbers(source)) !== JSON.stringify(numbers(translated))) {
      diagnostics.numberChanges.push({ language, source: source.slice(0, 140), sourceNumbers: numbers(source), translatedNumbers: numbers(translated) });
    }
    if (JSON.stringify(urls(source)) !== JSON.stringify(urls(translated))) {
      diagnostics.urlChanges.push({ language, source: source.slice(0, 140), sourceUrls: urls(source), translatedUrls: urls(translated) });
    }
  }
}

const entry = String.raw`
import assert from "node:assert/strict";
import { createElement, Children, isValidElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import i18n from "./src/i18n/index";
import en from "./src/i18n/locales/published-en.json";
import pt from "./src/i18n/locales/published-pt.json";
import it from "./src/i18n/locales/published-it.json";
import { localizePublishedText, localizePublishedValue, formatPublishedDate, hasPublishedTextTranslation } from "./src/lib/publishedContent";
import { localizePublishedNode } from "./src/lib/publishedReact";
import { localizeNewsFields, localizeNoticiaData } from "./src/hooks/useLocalizedNews";
import { localizeEvent } from "./src/hooks/useLocalizedEvents";
import { noticiasData } from "./src/pages/noticiasData";
import { PUBLIC_EVENT_ADDITIONS } from "./src/data/publicEventAdditions";
import { EVENTS_SEED } from "./src/data/eventsSeed";

globalThis.fetch = () => Promise.reject(new Error("Network is forbidden in this localization test"));
const catalogues = { en, pt, it };
const languages = ["en", "pt", "it"];
const passed = [];
const failed = [];
function check(name, action) {
  try { action(); passed.push(name); }
  catch (error) { failed.push({ name, message: error.message }); }
}
function freeze(value) {
  if (value && typeof value === "object") { Object.values(value).forEach(freeze); Object.freeze(value); }
  return value;
}
function stableFields(value) {
  const fields = new Set(["id", "slug", "url", "src", "type", "category", "private", "locked", "published", "fileName", "fileType", "registrationUrl", "detailsUrl", "imageFileName", "imageMimeType", "imageSize"]);
  const found = [];
  function walk(item, prefix) {
    if (Array.isArray(item)) item.forEach((child, index) => walk(child, prefix + "[" + index + "]"));
    else if (item && typeof item === "object") Object.entries(item).forEach(([key, child]) => {
      if (fields.has(key)) found.push([prefix + "." + key, child]);
      walk(child, prefix + "." + key);
    });
  }
  walk(value, "root"); return found;
}
const listSize = content => content.reduce((count, paragraph) => count + (paragraph.startsWith("- ") ? paragraph.split("\n").filter(line => line.startsWith("- ")).length : 0), 0);
const conecta = noticiasData.find(item => item.slug === "conecta-latam-caribe-centroamerica-panama-2026");
assert.ok(conecta, "Conecta source article is required");
const eventSource = PUBLIC_EVENT_ADDITIONS.find(item => item.id === conecta.slug);
assert.ok(eventSource, "Conecta source event is required");
const event = freeze({
  ...structuredClone(eventSource),
  imageUrl: "/images/event-original.png",
  slug: "stable-event-slug", category: "documentos",
  attachments: [{ id: "attachment-stable", title: "Boletín informativo — Semana REGULATEL Uruguay", url: "https://example.invalid/original.pdf", fileName: "original-es.pdf", fileType: "application/pdf" }],
  resources: {
    programs: [{ title: "Grupos de Trabajo y Comité Ejecutivo", url: "/original-program.pdf", description: "Materiales del evento", private: true, locked: true }],
    documents: [{ title: "Lineamientos para la Identificación de Líneas Telefónicas Móviles", url: "", private: true, locked: true }],
    photos: [{ src: "/original-photo.jpg", caption: "Foto Grupal" }], survey: "https://example.invalid/survey", taxi: "https://example.invalid/taxi",
    customSections: [{ id: "custom-stable", title: "Materiales del evento", blocks: [{ id: "heading-stable", type: "heading", text: "Protección del usuario" }, { id: "document-stable", type: "document", title: "Mapa de conectividad en México", url: "https://example.invalid/original-map.pdf", fileName: "mapa-original.pdf" }] }]
  },
  contentBlocks: [{ id: "text-stable", type: "text", text: "Conozca sus derechos" }]
});
const frozenEvent = JSON.stringify(event);
const frozenNews = JSON.stringify(conecta);
check("Spanish public data and text remain original", () => {
  assert.equal(localizePublishedText(conecta.content[0], "es-ES"), conecta.content[0]);
  assert.strictEqual(localizePublishedValue(event, "es"), event);
});

for (const language of languages) {
  const t = i18n.getFixedT(language);
  check(language + ": Conecta article translates full body, list items, title, category and date", () => {
    const localized = localizeNoticiaData(conecta, t, language);
    assert.equal(localized.title, catalogues[language][conecta.title]);
    assert.equal(localized.excerpt, catalogues[language][conecta.excerpt]);
    assert.equal(localized.content.length, conecta.content.length);
    assert.equal(listSize(localized.content), listSize(conecta.content));
    for (let index = 0; index < conecta.content.length; index++) {
      assert.equal(localized.content[index], localizePublishedText(conecta.content[index], language), "paragraph " + index);
      assert.ok(localized.content[index].length > 0);
    }
    assert.equal(localized.category, t("newsCategories.Noticias"));
    assert.equal(localized.dateFormatted, formatPublishedDate(conecta.date, language, conecta.dateFormatted));
    assert.equal(JSON.stringify(conecta), frozenNews);
  });
  check(language + ": CMS body and blocks localize before paragraph normalization", () => {
    const original = freeze({ id: "cms-original", slug: conecta.slug, title: conecta.title, excerpt: conecta.excerpt, category: "Noticias", date: conecta.date, dateFormatted: conecta.dateFormatted,
      content: conecta.content[0] + "\n\n" + conecta.content[1], contentBlocks: [{ id: "cms-block", type: "text", text: "Conozca sus derechos" }],
      attachments: [{ id: "cms-attachment", title: "Mapa de conectividad en México", url: "/same-file.pdf", fileName: "same-file.pdf" }] });
    const before = JSON.stringify(original);
    const localized = localizeNewsFields(original, t, language);
    assert.deepEqual(localized.content.split(/\n\n+/), [localizePublishedText(conecta.content[0], language), localizePublishedText(conecta.content[1], language)]);
    assert.equal(localized.contentBlocks[0].text, catalogues[language]["Conozca sus derechos"]);
    assert.equal(localized.attachments[0].title, catalogues[language]["Mapa de conectividad en México"]);
    assert.equal(localized.attachments[0].url, original.attachments[0].url);
    assert.equal(JSON.stringify(original), before);
  });
  check(language + ": a newer CMS title/excerpt/body never receives stale article text by slug", () => {
    const current = { slug: "semana-regulatel-montevideo-2026", title: "Actualización editorial posterior no incluida en el catálogo de pruebas", excerpt: "Nuevo resumen editorial posterior, sin traducción todavía", content: "Nuevo cuerpo editorial posterior no incluido en el catálogo" };
    assert.equal(hasPublishedTextTranslation(current.title, language), false);
    const localized = localizeNewsFields(current, t, language);
    assert.equal(localized.title, current.title); assert.equal(localized.excerpt, current.excerpt); assert.equal(localized.content, current.content);
  });
  check(language + ": event resources, documents, headings and captions translate with access and addresses intact", () => {
    const localized = localizeEvent(event, t, language);
    assert.equal(localized.title, catalogues[language][event.title]);
    assert.equal(localized.resources.programs[0].title, catalogues[language]["Grupos de Trabajo y Comité Ejecutivo"]);
    assert.equal(localized.resources.documents[0].title, catalogues[language]["Lineamientos para la Identificación de Líneas Telefónicas Móviles"]);
    assert.equal(localized.resources.photos[0].caption, catalogues[language]["Foto Grupal"]);
    assert.equal(localized.resources.customSections[0].title, catalogues[language]["Materiales del evento"]);
    assert.equal(localized.resources.customSections[0].blocks[0].text, catalogues[language]["Protección del usuario"]);
    assert.equal(localized.resources.customSections[0].blocks[1].title, catalogues[language]["Mapa de conectividad en México"]);
    assert.equal(localized.attachments[0].title, catalogues[language]["Boletín informativo — Semana REGULATEL Uruguay"]);
    assert.equal(localized.contentBlocks[0].text, catalogues[language]["Conozca sus derechos"]);
    assert.deepEqual(stableFields(localized), stableFields(event));
    assert.equal(JSON.stringify(event), frozenEvent);
  });
  check(language + ": newer event metadata never receives older dictionary text by ID", () => {
    const old = EVENTS_SEED.find(item => item.id === "cumbre-berec-regulatel-2026"); assert.ok(old);
    const current = { ...old, title: "Programa editorial actualizado después del catálogo", description: "Descripción editorial posterior aún sin traducción", organizer: "Organizador posterior aún sin catálogo", location: "Sede posterior aún sin catálogo" };
    const localized = localizeEvent(current, t, language);
    for (const field of ["title", "description", "organizer", "location"]) assert.equal(localized[field], current[field], field);
  });
  check(language + ": public React text and accessible copy localize without touching handlers or control values", () => {
    const handler = () => "unchanged";
    const original = createElement("a", { href: "/original?language=es", id: "control-stable", title: "Materiales del evento", "aria-label": "Abrir documento", onClick: handler, "data-stable": "Documentos" },
      createElement("span", null, "Abrir documento"), createElement("input", { value: "Título original en español", readOnly: true }));
    const nodes = localizePublishedNode(original, language); const localized = Array.isArray(nodes) ? nodes[0] : nodes;
    assert.ok(isValidElement(localized)); assert.strictEqual(localized.props.onClick, handler);
    assert.equal(localized.props.href, original.props.href); assert.equal(localized.props.id, original.props.id); assert.equal(localized.props["data-stable"], "Documentos");
    assert.equal(localized.props.title, catalogues[language]["Materiales del evento"]); assert.equal(localized.props["aria-label"], catalogues[language]["Abrir documento"]);
    const children = Children.toArray(localized.props.children); assert.equal(children[1].props.value, "Título original en español");
    assert.ok(renderToStaticMarkup(localized).includes(catalogues[language]["Abrir documento"]));
    assert.equal(original.props.title, "Materiales del evento"); assert.strictEqual(localizePublishedNode(original, "es"), original);
  });
}
check("Italian publication dates use the correct month and retain invalid-date fallback", () => {
  assert.equal(formatPublishedDate("2026-11-11", "it-IT", "11 noviembre 2026"), "11 novembre 2026");
  assert.equal(formatPublishedDate("2026-11-11T00:00:00.000Z", "it-IT", "11 noviembre 2026"), "11 novembre 2026");
  assert.equal(formatPublishedDate("invalid", "it", "fecha original"), "fecha original");
});
console.log(JSON.stringify({ passed: passed.length, failed, checks: passed }, null, 2));
if (failed.length) process.exitCode = 1;
`;

const temporaryDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "regulatel-published-localization-"));
const bundle = path.join(temporaryDirectory, "test-bundle.cjs");
await build({
  stdin: { contents: entry, resolveDir: root, sourcefile: "published-localization-checks.tsx", loader: "tsx" },
  bundle: true, platform: "node", format: "cjs", outfile: bundle,
  tsconfig: path.join(root, "tsconfig.json"), logLevel: "silent",
});
console.log("Catalogue coverage: " + languages.length + " × " + sourceKeys.length + " exact keys.");
console.log(JSON.stringify({ editorialDiagnostics: {
  shortTranslations: diagnostics.shortTranslations,
  urlChanges: diagnostics.urlChanges,
  numberChangeCount: diagnostics.numberChanges.length,
  numberChangeExamples: diagnostics.numberChanges.slice(0, 10),
} }, null, 2));
const result = spawnSync(process.execPath, [bundle], { cwd: root, env: { ...process.env, TZ: "America/La_Paz" }, encoding: "utf8", maxBuffer: 8 * 1024 * 1024 });
if (result.stdout) process.stdout.write(result.stdout);
if (result.stderr) process.stderr.write(result.stderr);
if (result.error) throw result.error;
process.exitCode = result.status ?? 1;

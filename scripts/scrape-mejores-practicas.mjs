/**
 * Scraper local: extrae TODA la información de la sección Buenas Prácticas Regulatorias
 * de REGULATEL (listado + detalle por país).
 *
 * Uso: node scripts/scrape-mejores-practicas.mjs
 * Opciones: --headed (abre el navegador), --output <ruta> (default: src/data/mejoresPracticasRegulatel.json)
 *
 * Requiere: npm install playwright (o npx playwright install chromium)
 */

import { chromium } from "playwright";
import { writeFileSync, mkdirSync } from "fs";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const LIST_URL = "https://regulatel.indotel.gob.do/pagina/mejores-practicas-regulatorias";
const DETAIL_BASE = "https://regulatel.indotel.gob.do/pagina/detalle";

/** Rango de IDs para descubrir todos los países (listado a veces no expone enlaces) */
const DETAIL_ID_MIN = 170;
const DETAIL_ID_MAX = 212;

/** Mapeo id → { country, entity, acronym } cuando el DOM no los expone */
const KNOWN_ID_META = {
  174: { country: "Argentina", entity: "Ente Nacional de Comunicaciones", acronym: "ENACOM" },
  176: { country: "Chile", entity: "Subsecretaría de Telecomunicaciones", acronym: "SUBTEL" },
  180: { country: "Bolivia", entity: "Autoridad de Regulación y Fiscalización de Telecomunicaciones y Transporte", acronym: "ATT" },
  181: { country: "Costa Rica", entity: "Superintendencia de Telecomunicaciones", acronym: "SUTEL" },
  183: { country: "Brasil", entity: "Agencia Nacional de Telecomunicaciones", acronym: "ANATEL" },
  184: { country: "Colombia", entity: "Comisión de Regulación de Comunicaciones", acronym: "CRC" },
  185: { country: "Cuba", entity: "Ministerio de Comunicaciones", acronym: "MINCOM" },
  186: { country: "El Salvador", entity: "Superintendencia General de Electricidad y Telecomunicaciones", acronym: "SIGET" },
  187: { country: "Ecuador", entity: "Agencia de Regulación y Control de las Telecomunicaciones", acronym: "ARCOTEL" },
  188: { country: "España", entity: "Comisión Nacional de los Mercados y la Competencia", acronym: "CNMC" },
  189: { country: "Guatemala", entity: "Superintendencia de Telecomunicaciones", acronym: "SIT" },
  190: { country: "Honduras", entity: "Comisión Nacional de Telecomunicaciones", acronym: "CONATEL" },
  191: { country: "Italia", entity: "Autorità per le Garanzie nelle Comunicazioni", acronym: "AGCOM" },
  193: { country: "México", entity: "Comisión Reguladora de Telecomunicaciones", acronym: "CRT" },
  194: { country: "Panamá", entity: "Autoridad Nacional de los Servicios Públicos", acronym: "ASEP" },
  195: { country: "Paraguay", entity: "Comisión Nacional de Telecomunicaciones", acronym: "CONATEL" },
  196: { country: "Perú", entity: "Organismo Supervisor de Inversión Privada en Telecomunicaciones", acronym: "OSIPTEL" },
  197: { country: "Portugal", entity: "Autoridade Nacional de Comunicações", acronym: "ANACOM" },
  198: { country: "Puerto Rico", entity: "Negociado de Telecomunicaciones", acronym: "NET" },
  199: { country: "República Dominicana", entity: "Instituto Dominicano de las Telecomunicaciones", acronym: "INDOTEL" },
  200: { country: "Uruguay", entity: "Unidad Reguladora de Servicios de Comunicaciones", acronym: "URSEC" },
  201: { country: "Venezuela", entity: "Comisión Nacional de Telecomunicaciones", acronym: "CONATEL" },
};

function getArg(name) {
  const i = process.argv.findIndex((a) => a === `--${name}`);
  return i === -1 ? undefined : process.argv[i + 1];
}

const HEADED = process.argv.includes("--headed");
const OUTPUT = getArg("output") || "public/mejoresPracticasRegulatel.json";

function log(msg) {
  const ts = new Date().toISOString().slice(11, 23);
  console.log(`[${ts}] ${msg}`);
}

function dedupeLinks(links) {
  const seen = new Set();
  return links.filter((l) => {
    const key = `${(l.title || "").trim()}|${(l.url || "").trim()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * Extrae del listado todos los enlaces a detalle recorriendo la paginación (1, 2, 3…).
 * En cada página recoge los enlaces a detalle?id=… y luego hace clic en la siguiente.
 */
async function scrapeListWithPagination(page) {
  log("Navegando al listado...");
  await page.goto(LIST_URL, { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(3000);

  const seenIds = new Map();
  let currentPage = 1;

  const extractPageEntries = async () => {
    return page.evaluate((detailBase) => {
      const results = [];
      const links = document.querySelectorAll('a[href*="detalle"], a[href*="pagina/detalle"]');
      const seen = new Set();
      links.forEach((a) => {
        const href = (a.getAttribute("href") || a.href || "").trim();
        const match = href.match(/detalle\?id=(\d+)/i) || href.match(/\/detalle\?id=(\d+)/i);
        if (!match) return;
        const id = match[1];
        if (seen.has(id)) return;
        seen.add(id);

        const card = a.closest("div[class*='card'], div[class*='item'], article, .card, [class*='country'], .views-row, div") || a.parentElement || a;
        const text = (card?.innerText || a.innerText || "").trim();
        const lines = text.split(/\n/).map((s) => s.trim()).filter(Boolean);

        let entity = "";
        let country = "";
        let acronym = "";
        if (lines.length >= 3) {
          acronym = lines[0];
          entity = lines[1];
          country = lines[2];
        } else if (lines.length >= 2) {
          acronym = lines[0];
          entity = lines[1];
        } else if (lines.length >= 1) {
          country = lines[0] || entity;
        }

        results.push({
          id,
          detailUrl: `${detailBase}?id=${id}`,
          entity: (entity || "").trim(),
          acronym: (acronym || "").trim(),
          country: (country || "").trim(),
        });
      });
      return results;
    }, DETAIL_BASE);
  };

  for (;;) {
    const entries = await extractPageEntries();
    log(`Página ${currentPage}: ${entries.length} entradas visibles`);
    for (const e of entries) {
      if (!seenIds.has(e.id)) seenIds.set(e.id, e);
    }
    const totalSoFar = seenIds.size;

    const nextPageNum = currentPage + 1;
    const paginationLink = page.locator("a").filter({ hasText: new RegExp(`^${nextPageNum}$`) }).first();
    const hasNext = (await paginationLink.count()) > 0;
    if (!hasNext) break;

    await paginationLink.click();
    await page.waitForTimeout(2500);
    currentPage = nextPageNum;
  }

  const allEntries = Array.from(seenIds.values());
  log(`Total único tras paginación: ${allEntries.length} países`);
  return allEntries;
}

/**
 * Extrae de una página de detalle: entidad, país, categorías y enlaces.
 */
async function scrapeDetail(page, detailUrl, listEntry) {
  try {
    await page.goto(detailUrl, { waitUntil: "networkidle", timeout: 20000 });
    await page.waitForTimeout(1500);
  } catch (e) {
    log(`  Error navegando a ${detailUrl}: ${e.message}`);
    return null;
  }

  const data = await page.evaluate((fallback) => {
    const result = {
      entity: fallback?.entity || "",
      country: fallback?.country || "",
      acronym: fallback?.acronym || "",
      categories: [],
    };

    const main = document.querySelector(".field--name-body, .node__content, [class*='field--name-body']") || document.querySelector("main .region-content, main .content, main .block-content") || document.querySelector("main, [role='main'], .content, #content, .page-content, .region-content") || document.body;
    const links = main.querySelectorAll("a[href^='http'], a[href^='https']");

    const firstH1 = document.querySelector("h1") || main.querySelector("h1");
    if (firstH1) result.entity = (result.entity || firstH1.innerText || "").trim();
    const allH = main.querySelectorAll("h1, h2, h3");
    if (allH.length >= 1 && !result.entity) result.entity = (allH[0].innerText || "").trim();
    if (allH.length >= 2 && !result.acronym) result.acronym = (allH[1].innerText || "").trim();
    if (allH.length >= 3 && !result.country) result.country = (allH[2].innerText || "").trim();

    function isInsideNav(el) {
      const parent = el.closest("nav, [role='navigation'], header, [class*='menu'], [class*='nav'], [id*='nav'], [id*='menu']");
      return !!parent;
    }

    function isCategoryHeader(el) {
      if (isInsideNav(el)) return false;
      const tag = (el.tagName || "").toLowerCase();
      if (tag === "h2" || tag === "h3" || tag === "h4") {
        const t = (el.innerText || "").trim();
        return t.length > 2 && t.length < 200 && !t.startsWith("http");
      }
      if (tag === "p" || tag === "div") {
        if (el.querySelector("a[href^='http']")) return false;
        const t = (el.innerText || "").trim();
        if (t.length < 3 || t.length > 150 || t.startsWith("http")) return false;
        const strong = el.querySelector(":scope > strong, :scope > b, :scope strong, :scope b");
        if (strong) return true;
        if (t.length >= 3 && !/^\d+\.?\s*$/.test(t)) return true;
        return false;
      }
      return false;
    }

    function getHeaderText(el) {
      const tag = (el.tagName || "").toLowerCase();
      if (tag === "h2" || tag === "h3" || tag === "h4") return (el.innerText || "").trim();
      const strong = el.querySelector(":scope > strong, :scope > b, :scope strong, :scope b");
      return (strong ? strong.innerText : el.innerText || "").trim();
    }

    const knownCategoryKeywords = /espectro|competencia|ciberseguridad|protección|tic|tecnologías|accesibilidad|internet|compartición|infraestructura|telecomunicaciones.*emergencia|homologación|plataformas|usuario|económica/i;
    const categoryCandidates = [];
    const walker = document.createTreeWalker(main, NodeFilter.SHOW_ELEMENT, {
      acceptNode: (node) => {
        if (isCategoryHeader(node)) return NodeFilter.FILTER_ACCEPT;
        return NodeFilter.FILTER_SKIP;
      },
    });
    let node;
    while ((node = walker.nextNode())) categoryCandidates.push(node);

    const entityNorm = (result.entity || "").trim().toLowerCase();
    const acronymNorm = (result.acronym || "").trim().toLowerCase();
    let categoryNames = categoryCandidates
      .map((el) => ({ name: getHeaderText(el), element: el }))
      .filter((c) => {
        if (!c.name || c.name.startsWith("http")) return false;
        const n = c.name.trim().toLowerCase();
        if (n === entityNorm || n === acronymNorm) return false;
        if (entityNorm && n.length <= acronymNorm.length + 2 && acronymNorm && n.includes(acronymNorm)) return false;
        return true;
      });
    const firstRealIdx = categoryNames.findIndex((c) => knownCategoryKeywords.test(c.name));
    if (firstRealIdx > 0) categoryNames = categoryNames.slice(firstRealIdx);

    const linkList = [];
    links.forEach((a) => {
      const href = (a.getAttribute("href") || a.href || "").trim();
      const title = (a.innerText || a.textContent || "").trim();
      if (href && (href.startsWith("http://") || href.startsWith("https://")) && title && title.length < 500) {
        linkList.push({ title, url: href });
      }
    });

    if (categoryNames.length > 0) {
      categoryNames.forEach((cat, i) => {
        const nextHead = categoryNames[i + 1]?.element;
        const linksInSection = [];
        let el = cat.element.nextElementSibling;
        while (el && el !== nextHead) {
          (el.querySelectorAll ? el.querySelectorAll("a[href^='http'], a[href^='https']") : []).forEach((a) => {
            const href = (a.getAttribute("href") || a.href || "").trim();
            const title = (a.innerText || a.textContent || "").trim();
            if (href && title) linksInSection.push({ title, url: href });
          });
          el = el.nextElementSibling;
        }
        result.categories.push({
          name: cat.name,
          links: linksInSection,
        });
      });
    } else {
      const seen = new Set();
      const byCategory = {};
      linkList.forEach((l) => {
        const key = `${l.title}|${l.url}`;
        if (seen.has(key)) return;
        seen.add(key);
        const catName = "Recursos";
        if (!byCategory[catName]) byCategory[catName] = [];
        byCategory[catName].push(l);
      });
      Object.entries(byCategory).forEach(([name, links]) => {
        result.categories.push({ name, links });
      });
    }

    if (result.categories.length === 0 && linkList.length > 0) {
      const seen = new Set();
      result.categories.push({
        name: "Recursos y enlaces",
        links: linkList.filter((l) => {
          const k = `${l.title}|${l.url}`;
          if (seen.has(k)) return false;
          seen.add(k);
          return true;
        }),
      });
    }

    return result;
  }, listEntry);

  if (!data) return null;

  const id = listEntry?.id || new URL(detailUrl).searchParams.get("id") || "";
  const known = KNOWN_ID_META[id];
  data.detailUrl = detailUrl;
  data.country = (data.country || listEntry?.country || known?.country || "").trim();
  data.entity = (data.entity || listEntry?.entity || known?.entity || "").trim();
  data.acronym = (data.acronym || listEntry?.acronym || known?.acronym || "").trim();
  const entityNorm = (data.entity || "").trim().toLowerCase();
  const acronymNorm = (data.acronym || "").trim().toLowerCase();
  const isNoiseCategory = (name) => {
    if (!name) return true;
    const n = name.toLowerCase();
    if (n === entityNorm || n === acronymNorm) return true;
    if (name.includes("\n") || name.length > 120) return true;
    if (/loading\.\.\.|^sobre regulatel|menú$|^contacto$|sitios de interés|^¿qué es|objetivos|síguenos/i.test(n)) return true;
    return false;
  };
  const mapped = (data.categories || []).map((cat) => ({
    name: (cat.name || "").trim(),
    links: dedupeLinks(cat.links || []),
  }));
  const valid = mapped.filter((cat) => !isNoiseCategory(cat.name));
  const orphanLinks = mapped.filter((cat) => isNoiseCategory(cat.name)).flatMap((cat) => cat.links);
  if (orphanLinks.length > 0) {
    valid.push({ name: "Recursos", links: dedupeLinks(orphanLinks) });
  }
  data.categories = valid;

  return data;
}

async function main() {
  log("Iniciando scraper REGULATEL - Buenas Prácticas Regulatorias");
  log(`Modo: ${HEADED ? "headed" : "headless"}`);
  log(`Salida: ${OUTPUT}`);

  const browser = await chromium.launch({
    headless: !HEADED,
    args: HEADED ? [] : ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const context = await browser.newContext({
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    viewport: { width: 1280, height: 800 },
  });
  const page = await context.newPage();

  let unique = await scrapeListWithPagination(page);

  if (unique.length === 0) {
    log("No se encontraron enlaces en el listado paginado. Intentando estructura alternativa...");
    const fallbackIds = await page.evaluate(() => {
      const ids = new Set();
      document.querySelectorAll("a[href*='id=']").forEach((a) => {
        const m = (a.href || "").match(/id=(\d+)/);
        if (m) ids.add(m[1]);
      });
      return Array.from(ids);
    });
    for (const id of fallbackIds) {
      const known = KNOWN_ID_META[id];
      unique.push({
        id,
        detailUrl: `${DETAIL_BASE}?id=${id}`,
        entity: known?.entity || "",
        acronym: known?.acronym || "",
        country: known?.country || "",
      });
    }
  }
  if (unique.length === 0) {
    log("Usando rango de IDs " + DETAIL_ID_MIN + "-" + DETAIL_ID_MAX);
    for (let id = DETAIL_ID_MIN; id <= DETAIL_ID_MAX; id++) {
      const sid = String(id);
      const known = KNOWN_ID_META[sid];
      unique.push({
        id: sid,
        detailUrl: `${DETAIL_BASE}?id=${sid}`,
        entity: known?.entity || "",
        acronym: known?.acronym || "",
        country: known?.country || "",
      });
    }
  }

  unique = unique.filter((e, i, arr) => arr.findIndex((x) => x.id === e.id) === i);
  log(`Países a scrapear (detalle): ${unique.length}`);

  const out = [];
  let totalCategories = 0;
  let totalLinks = 0;

  for (let i = 0; i < unique.length; i++) {
    const entry = unique[i];
    log(`[${i + 1}/${unique.length}] Detalle: ${entry.country || entry.entity || entry.id} (id=${entry.id})`);
    try {
      const detail = await scrapeDetail(page, entry.detailUrl, entry);
      const totalLinksInDetail = detail ? detail.categories.reduce((acc, c) => acc + (c.links?.length || 0), 0) : 0;
      const countryName = (detail?.country || entry.country || "").trim();
      const hasValidCountry = countryName && countryName.length > 2 && !/^\d+$/.test(countryName);
      if (detail && totalLinksInDetail > 0 && hasValidCountry) {
        const record = {
          country: countryName,
          entity: detail.entity || entry.entity || "",
          acronym: detail.acronym || entry.acronym || "",
          detailUrl: detail.detailUrl,
          categories: detail.categories,
        };
        out.push(record);
        const cats = detail.categories.length;
        const links = detail.categories.reduce((acc, c) => acc + (c.links?.length || 0), 0);
        totalCategories += cats;
        totalLinks += links;
        log(`  -> ${cats} categorías, ${links} enlaces`);
      }
    } catch (err) {
      log(`  ERROR: ${err.message}`);
    }
    await page.waitForTimeout(800);
  }

  await browser.close();

  out.sort((a, b) => (a.country || "").localeCompare(b.country || "", "es", { sensitivity: "base" }));

  const dir = dirname(OUTPUT);
  try {
    mkdirSync(dir, { recursive: true });
  } catch (_) {}

  const json = JSON.stringify(out, null, 2);
  writeFileSync(OUTPUT, json, "utf8");

  log("---");
  log(`Total países (orden alfabético): ${out.length}`);
  log(`Total categorías: ${totalCategories}`);
  log(`Total enlaces: ${totalLinks}`);
  log(`JSON guardado en: ${OUTPUT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

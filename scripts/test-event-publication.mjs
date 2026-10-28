/**
 * Real event handler and SQL against an isolated, in-memory PostgreSQL database.
 * No .env, database credentials, production requests or browser automation.
 *
 * node scripts/test-event-publication.mjs
 * node scripts/test-event-publication.mjs --serve
 *   Local admin fixture: http://127.0.0.1:4192/admin/eventos
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { Readable } from "node:stream";
import { fileURLToPath, pathToFileURL } from "node:url";
import { build } from "esbuild";
import { PGlite } from "@electric-sql/pglite";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pg = await PGlite.create();
// Deliberately the schema before publication support: the real code must migrate it.
await pg.exec(`
  CREATE TABLE events (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    organizer TEXT NOT NULL,
    location TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    year INTEGER NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('upcoming', 'past')),
    registration_url TEXT,
    details_url TEXT,
    is_featured BOOLEAN DEFAULT false,
    tags JSONB DEFAULT '[]',
    description TEXT,
    image_url TEXT,
    image_file_name TEXT,
    image_mime_type TEXT,
    image_size INTEGER,
    attachments JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  );
  CREATE TABLE news (
    id TEXT PRIMARY KEY, slug TEXT NOT NULL, title TEXT NOT NULL, date DATE NOT NULL,
    date_formatted TEXT, category TEXT, excerpt TEXT NOT NULL, image_url TEXT,
    image_file_name TEXT, image_mime_type TEXT, image_size INTEGER,
    additional_images JSONB DEFAULT '[]', additional_image_names JSONB DEFAULT '[]',
    additional_image_meta JSONB DEFAULT '[]', body TEXT NOT NULL, author TEXT, link TEXT,
    video_url TEXT, published BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
  );
  CREATE TABLE site_settings (key TEXT PRIMARY KEY, value JSONB NOT NULL, updated_at TIMESTAMPTZ DEFAULT NOW());
  INSERT INTO site_settings (key, value) VALUES ('event_materials_layout', '{"version":1,"layout":"simple"}'::jsonb);
`);

const attachments = [
  {
    id: "programa-original",
    title: "Programa conservado",
    url: "/eventos/semana-regulatel-2026/cumbres/pdf/cumbre-regulatel-berec.pdf",
    fileName: "programa-conservado.pdf",
    fileType: "application/pdf",
    fileSize: 12345,
  },
  {
    id: "memoria-original",
    title: "Memoria conservada",
    url: "/documents/semana-regulatel-montevideo-2026/regulatel-reunira-en-montevideo-a-reguladores.docx",
    fileName: "memoria-conservada.docx",
    fileType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    fileSize: 67890,
  },
];

const editableResources = {
  programs: [
    { title: "Programa de apertura", url: attachments[0].url, description: "Primera jornada" },
    { title: "Programa de sesiones", url: attachments[1].url, description: "Segunda jornada" },
  ],
  documents: [
    { title: "Presentación original", url: attachments[0].url, description: "Ponente y entidad originales" },
    { title: "Memoria original", url: attachments[1].url, description: "Conclusiones de la jornada" },
  ],
  photos: [
    { src: "/images/cumbre-regulatel-prai-2025.jpg", caption: "Apertura del encuentro" },
    { src: "/images/cumbre-regulatel-ASIET.jpg", caption: "Sesiones de trabajo" },
    { src: "/images/semana-regulatel-montevideo-2026-carousel.jpg", caption: "Participantes" },
  ],
  survey: "https://example.invalid/encuesta-original",
  taxi: "https://example.invalid/transporte-original",
  sectionOrder: ["programs", "documents", "photos"],
};
const editableBlocks = [
  { id: "heading-original", type: "heading", text: "Sesiones y materiales" },
  { id: "text-original", type: "text", text: "Texto original con tildes.\nSegunda línea." },
  { id: "image-original", type: "image", url: editableResources.photos[0].src, caption: "Descripción conservada" },
  { id: "document-original", type: "document", title: "Documento del encuentro", url: attachments[0].url },
];

await pg.query(`
  INSERT INTO events (
    id, title, organizer, location, start_date, end_date, year, status,
    registration_url, details_url, is_featured, tags, description, image_url,
    image_file_name, image_mime_type, image_size, attachments, created_at, updated_at
  ) VALUES (
    $1, $2, $3, $4, $5::date, $6::date, $7, $8, $9, $10, $11, $12::jsonb,
    $13, $14, $15, $16, $17, $18::jsonb, $19::timestamptz, $20::timestamptz
  )`, [
  "legacy-preserved", "Evento existente: documentos preservados", "REGULATEL QA",
  "La Paz, Bolivia", "2027-11-09", "2027-11-11", 2027, "upcoming",
  "/registro-original", "/detalle-original", true,
  JSON.stringify(["regulación", "documentos originales"]),
  "Descripción original con tildes y dos documentos adjuntos.",
  "/images/regulatel-logo.png", "portada-original.png", "image/png", 45678,
  JSON.stringify(attachments), "2026-01-02T03:04:05.000Z", "2026-02-03T04:05:06.000Z",
]);

function sqlAdapter(db) {
  const tag = async (parts, ...values) => {
    const statement = parts.reduce(
      (result, part, index) => result + part + (index < values.length ? `$${index + 1}` : ""),
      "",
    );
    const result = await db.query(statement, values);
    // postgres.js exposes affected rows as .count, used by DELETE.
    return Object.assign(result.rows, { count: result.affectedRows ?? result.rows.length });
  };
  tag.json = value => JSON.stringify(value);
  return tag;
}

globalThis.__EVENT_PUBLICATION_SQL = sqlAdapter(pg);
const built = await build({
  absWorkingDir: root,
  stdin: {
    contents: 'export { default as handler } from "./server/api-handlers/events.ts"; export { default as newsHandler } from "./server/api-handlers/news.ts"; export { default as settingsHandler } from "./server/api-handlers/settings.ts";',
    resolveDir: root,
    loader: "ts",
  },
  bundle: true,
  platform: "node",
  format: "esm",
  write: false,
  plugins: [{
    name: "isolated-event-database-and-auth",
    setup(builder) {
      builder.onResolve({ filter: /(?:^|\/)db\.js$/ }, () => ({ path: "db", namespace: "fixture" }));
      builder.onResolve({ filter: /(?:^|\/)adminAuth\.js$/ }, () => ({ path: "auth", namespace: "fixture" }));
      builder.onResolve({ filter: /(?:^|\/)documentAccess\.js$/ }, () => ({ path: "documentAccess", namespace: "fixture" }));
      builder.onLoad({ filter: /.*/, namespace: "fixture" }, args => ({
        loader: "js",
        contents: args.path === "db"
          ? 'export function getDb(){return globalThis.__EVENT_PUBLICATION_SQL;} export function isDbConfigured(){return true;}'
          : args.path === "documentAccess"
          ? "export async function getDocumentAccessSession(req){return req.headers['x-event-publication-fixture-reader'] === 'true' ? { userId: 'fixture-reader' } : null;}"
          : `export async function getAuthenticatedAdmin(req) {
              return req.headers['x-event-publication-fixture-admin'] === 'true' ? { user: { id: 'fixture-admin' } } : null;
            }
            export async function ensureAdmin(req) {
              if (req.headers['x-event-publication-fixture-admin'] !== 'true') {
                const error = new Error('Sesión requerida');
                error.name = 'UnauthorizedError';
                throw error;
              }
              return { user: { id: 'fixture-admin', name: 'Prueba local', email: 'admin@example.invalid', role: 'admin' } };
            }`,
      }));
    },
  }],
});

const bundlePath = path.join(root, "output/event-publication-test-bundle.mjs");
fs.mkdirSync(path.dirname(bundlePath), { recursive: true });
fs.writeFileSync(bundlePath, built.outputFiles[0].text);
const app = await import(pathToFileURL(bundlePath).href);

async function request(method, body, authenticated = false, id = null) {
  const req = Readable.from(body === undefined ? [] : [Buffer.from(JSON.stringify(body))]);
  req.method = method;
  req.url = "/api/events" + (id ? "/" + encodeURIComponent(id) : "");
  req.headers = authenticated === "reader" ? { "x-event-publication-fixture-reader": "true" } : authenticated ? { "x-event-publication-fixture-admin": "true" } : {};
  let text = "";
  const res = { statusCode: 200, setHeader() {}, end(value = "") { text += value; } };
  await app.handler(req, res);
  return { status: res.statusCode, data: text ? JSON.parse(text) : null };
}

const rawEvent = async id => (await pg.query(
  "SELECT to_jsonb(events) AS event FROM events WHERE id=$1", [id],
)).rows[0]?.event;
const withoutPublication = (value, timestampKey) => {
  const { published, [timestampKey]: ignoredTimestamp, ...rest } = value;
  return rest;
};
const checks = [];
async function check(name, run) {
  try { await run(); checks.push(name); }
  catch (error) { error.message = `${name}: ${error.message}`; throw error; }
}

try {
  const legacyBefore = await rawEvent("legacy-preserved");
  let migratedApi;
  let migratedStored;
  await check("legacy migration defaults to published and preserves every stored field", async () => {
    assert.equal(Object.hasOwn(legacyBefore, "published"), false);
    const result = await request("GET");
    assert.equal(result.status, 200, JSON.stringify(result));
    assert.equal(result.data.length, 1);
    migratedApi = result.data[0];
    assert.equal(migratedApi.published, true);
    assert.deepEqual(migratedApi.attachments, attachments);
    migratedStored = await rawEvent("legacy-preserved");
    const { published, content_blocks, resources, ...migratedRaw } = migratedStored;
    assert.equal(published, true);
    assert.equal(content_blocks, null);
    assert.equal(resources, null);
    assert.deepEqual(migratedRaw, legacyBefore);
    const column = (await pg.query(`
      SELECT is_nullable, column_default FROM information_schema.columns
      WHERE table_name='events' AND column_name='published'
    `)).rows[0];
    assert.equal(column.is_nullable, "NO");
    assert.match(column.column_default, /true/i);
  });

  await check("publication-only PATCH persists false, true, false and true without changing content", async () => {
    for (const published of [false, true, false, true]) {
      const saved = await request("PATCH", { published }, true, "legacy-preserved");
      assert.equal(saved.status, 200, JSON.stringify(saved));
      assert.equal(saved.data.published, published);
      assert.deepEqual(withoutPublication(saved.data, "updatedAt"), withoutPublication(migratedApi, "updatedAt"));
      const fresh = await request("GET", undefined, false, "legacy-preserved");
      assert.equal(fresh.status, 200);
      assert.equal(fresh.data.published, published);
      assert.deepEqual(fresh.data, saved.data);
      const listed = (await request("GET")).data.find(event => event.id === "legacy-preserved");
      assert.deepEqual(listed, fresh.data);
      const persisted = await rawEvent("legacy-preserved");
      assert.equal(persisted.published, published);
      assert.deepEqual(withoutPublication(persisted, "updated_at"), withoutPublication(migratedStored, "updated_at"));
    }
  });

  const newEvent = {
    id: "draft-created",
    title: "Evento QA borrador",
    organizer: "REGULATEL QA",
    location: "Montevideo, Uruguay",
    startDate: "2027-12-16",
    endDate: "2027-12-17",
    year: 2027,
    registrationUrl: "/registro-borrador",
    detailsUrl: "/detalle-borrador",
    isFeatured: true,
    tags: ["borrador", "QA"],
    description: "Evento creado sin publicar, con imagen y documentos.",
    imageUrl: "/images/regulatel-logo.png",
    imageFileName: "imagen-borrador.png",
    imageMimeType: "image/png",
    imageSize: 23456,
    attachments,
    resources: editableResources,
    contentBlocks: editableBlocks,
    published: false,
  };
  await check("POST can create an unpublished event and GET reloads all its content", async () => {
    const created = await request("POST", newEvent, true);
    assert.equal(created.status, 201, JSON.stringify(created));
    const fresh = await request("GET", undefined, false, newEvent.id);
    assert.equal(fresh.status, 200);
    assert.deepEqual(fresh.data, created.data);
    for (const [key, value] of Object.entries(newEvent)) assert.deepEqual(fresh.data[key], value, key);
    assert.equal((await rawEvent(newEvent.id)).published, false);
  });

  await check("POST without published keeps the existing published-by-default behavior", async () => {
    const { published, ...defaultEvent } = { ...newEvent, id: "default-published", title: "Evento QA publicado por defecto" };
    const created = await request("POST", defaultEvent, true);
    assert.equal(created.status, 201, JSON.stringify(created));
    assert.equal(created.data.published, true);
    const fresh = await request("GET", undefined, false, defaultEvent.id);
    assert.equal(fresh.data.published, true);
    assert.equal((await rawEvent(defaultEvent.id)).published, true);
  });

  await check("PATCH without publication preserves the current unpublished state", async () => {
    const result = await request("PATCH", { title: "Evento QA borrador conservado" }, true, newEvent.id);
    assert.equal(result.status, 200);
    assert.equal(result.data.published, false);
    assert.deepEqual(result.data.attachments, attachments);
    assert.equal((await request("GET", undefined, false, newEvent.id)).data.published, false);
  });

  await check("nonboolean publication payloads cannot accidentally change the state", async () => {
    for (const published of ["true", "false", 0, 1, null]) {
      const result = await request("PATCH", { published }, true, newEvent.id);
      assert.equal(result.status, 200);
      assert.equal(result.data.published, false);
      assert.equal((await rawEvent(newEvent.id)).published, false);
    }
  });

  await check("unauthenticated POST, PATCH and DELETE are rejected without changing rows or audit", async () => {
    const before = (await pg.query("SELECT to_jsonb(events) AS event FROM events ORDER BY id")).rows;
    const auditBefore = (await pg.query("SELECT count(*)::int AS n FROM admin_audit_log")).rows[0].n;
    assert.equal((await request("POST", { ...newEvent, id: "must-not-exist" })).status, 401);
    assert.equal((await request("PATCH", { published: false }, false, "legacy-preserved")).status, 401);
    assert.equal((await request("DELETE", undefined, false, "legacy-preserved")).status, 401);
    assert.deepEqual((await pg.query("SELECT to_jsonb(events) AS event FROM events ORDER BY id")).rows, before);
    assert.equal((await pg.query("SELECT count(*)::int AS n FROM admin_audit_log")).rows[0].n, auditBefore);
  });

  await check("authenticated changes retain the real audit trail", async () => {
    const rows = (await pg.query(`
      SELECT action, resource_type, resource_id, user_id FROM admin_audit_log ORDER BY created_at, id
    `)).rows;
    assert.equal(rows.length, 12);
    assert.equal(rows.filter(row => row.action === "created").length, 2);
    assert.equal(rows.filter(row => row.action === "updated").length, 10);
    assert.ok(rows.every(row => row.resource_type === "event" && row.user_id === "fixture-admin"));
  });

  let reorderedResources;
  let reorderedBlocks;
  await check("resource and block reordering persists titles, descriptions, captions and untouched fields", async () => {
    const before = (await request("GET", undefined, false, newEvent.id)).data;
    reorderedResources = {
      ...editableResources,
      programs: [...editableResources.programs].reverse(),
      documents: [...editableResources.documents].reverse(),
      photos: [...editableResources.photos].reverse(),
      sectionOrder: ["photos", "documents", "programs"],
    };
    reorderedBlocks = [editableBlocks[3], editableBlocks[2], editableBlocks[0], editableBlocks[1]];
    const changed = await request("PATCH", { resources: reorderedResources, contentBlocks: reorderedBlocks }, true, newEvent.id);
    assert.equal(changed.status, 200, JSON.stringify(changed));
    const fresh = (await request("GET", undefined, false, newEvent.id)).data;
    assert.deepEqual(fresh.resources, reorderedResources);
    assert.deepEqual(fresh.contentBlocks, reorderedBlocks);
    const { resources: oldResources, contentBlocks: oldBlocks, updatedAt: oldUpdatedAt, ...oldContent } = before;
    const { resources, contentBlocks, updatedAt, ...newContent } = fresh;
    assert.deepEqual(newContent, oldContent);
    const persisted = await rawEvent(newEvent.id);
    assert.deepEqual(persisted.resources, reorderedResources);
    assert.deepEqual(persisted.content_blocks, reorderedBlocks);
  });

  await check("publication-only changes preserve all structured resources and blocks", async () => {
    for (const published of [true, false, true, false]) {
      const changed = await request("PATCH", { published }, true, newEvent.id);
      assert.equal(changed.status, 200);
      const fresh = (await request("GET", undefined, false, newEvent.id)).data;
      assert.equal(fresh.published, published);
      assert.deepEqual(fresh.resources, reorderedResources);
      assert.deepEqual(fresh.contentBlocks, reorderedBlocks);
      assert.deepEqual(fresh.attachments, attachments);
    }
  });

  await check("intentional empty resources, content blocks and attachments survive reload and unrelated edits", async () => {
    const empty = { programs: [], documents: [], photos: [], survey: "", taxi: "", sectionOrder: [] };
    assert.equal((await request("PATCH", { resources: empty, contentBlocks: [], attachments: [] }, true, newEvent.id)).status, 200);
    assert.equal((await request("PATCH", { title: "Evento QA vaciado intencionalmente" }, true, newEvent.id)).status, 200);
    const fresh = (await request("GET", undefined, false, newEvent.id)).data;
    assert.deepEqual(fresh.resources, empty);
    assert.deepEqual(fresh.contentBlocks, []);
    assert.deepEqual(fresh.attachments, []);
    assert.equal(fresh.published, false);
    const persisted = await rawEvent(newEvent.id);
    assert.deepEqual(persisted.resources, empty);
    assert.deepEqual(persisted.content_blocks, []);
    assert.deepEqual(persisted.attachments, []);
  });

  await check("title-only and coming-soon documents survive real SQL reload", async () => {
    const resources = { programs: [{ title: "Solo título", url: "", description: "Conservada" }], documents: [{ title: "Pendiente", url: "", comingSoon: true }], photos: [], survey: "", taxi: "" };
    assert.equal((await request("PATCH", { resources }, true, newEvent.id)).status, 200);
    const fresh = (await request("GET", undefined, false, newEvent.id)).data;
    assert.equal(fresh.resources.programs[0].title, "Solo título");
    assert.equal(fresh.resources.programs[0].url, "");
    assert.equal(fresh.resources.documents[0].comingSoon, true);
  });

  await check("custom columns survive storage, publication and unrelated edits", async () => {
    const before = (await request("GET", undefined, true, newEvent.id)).data;
    const customSections = [{ id: "custom-test", title: "Presentaciones", blocks: [{ id: "document-test", type: "document", title: "Informe", url: "/informe.pdf" }] }];
    const resources = { ...before.resources, customSections };
    assert.equal((await request("PATCH", { resources }, true, newEvent.id)).status, 200);
    assert.equal((await request("PATCH", { published: true }, true, newEvent.id)).status, 200);
    const fresh = (await request("GET", undefined, false, newEvent.id)).data;
    assert.deepEqual(JSON.parse(JSON.stringify(fresh.resources)), JSON.parse(JSON.stringify(resources)));
    assert.deepEqual((await rawEvent(newEvent.id)).resources.customSections, customSections);
    assert.equal((await request("PATCH", { resources: { ...resources, customSections: [] } }, true, newEvent.id)).status, 200);
    assert.deepEqual((await request("GET", undefined, false, newEvent.id)).data.resources.customSections, []);
  });

  await check("private programs and documents hide their links from visitors only", async () => {
    const before = (await request("GET", undefined, true, newEvent.id)).data;
    const secret = "/documents/privado-qa.pdf";
    const resources = { ...before.resources, programs: [{ title: "Programa público", url: "/programa.pdf" }], documents: [{ title: "Acta privada", url: secret, description: "Visible", private: true }] };
    assert.equal((await request("PATCH", { resources, published: true }, true, newEvent.id)).status, 200);
    const visitorOne = (await request("GET", undefined, false, newEvent.id)).data;
    const visitorList = (await request("GET", undefined, false)).data.find(item => item.id === newEvent.id);
    for (const visitor of [visitorOne, visitorList]) {
      assert.equal(visitor.resources.programs[0].url, "/programa.pdf");
      assert.deepEqual(visitor.resources.documents[0], { title: "Acta privada", url: "", description: "Visible", private: true, locked: true });
      assert.ok(!JSON.stringify(visitor).includes(secret));
    }
    for (const viewer of [true, "reader"]) {
      const allowed = (await request("GET", undefined, viewer, newEvent.id)).data;
      assert.equal(allowed.resources.documents[0].url, secret);
      assert.equal(allowed.resources.documents[0].locked, undefined);
    }
    assert.equal((await request("PATCH", { resources: visitorOne.resources }, true, newEvent.id)).status, 409);
    assert.equal((await rawEvent(newEvent.id)).resources.documents[0].url, secret);
    const reopened = { ...resources, documents: [{ title: "Acta privada", url: secret, description: "Visible" }] };
    assert.equal((await request("PATCH", { resources: reopened }, true, newEvent.id)).status, 200);
    assert.equal((await request("GET", undefined, false, newEvent.id)).data.resources.documents[0].url, secret);
  });

  console.log(`${checks.length} event publication checks passed: legacy migration, preserved content/attachments, durable publish cycles, creation defaults, structured resources/blocks, ordering, intentional removal, auth and audit.`);
  if (!process.argv.includes("--serve")) {
    await pg.close();
  } else {
    const port = 4192;
    const seedNews = async (body) => {
      const req = Readable.from([Buffer.from(JSON.stringify(body))]);
      req.method = "POST"; req.url = "/api/news"; req.headers = { "x-event-publication-fixture-admin": "true" };
      let response = "";
      const res = { statusCode: 200, setHeader() {}, end(value = "") { response += value; } };
      await app.newsHandler(req, res);
      assert.equal(res.statusCode, 201, response);
    };
    await seedNews({ id: "news-visual-fixture", slug: "semana-regulatel-montevideo-2026", title: "Noticia QA: texto, dos imágenes y documento", date: "2026-10-22", dateFormatted: "22 de octubre de 2026", category: "Noticias", excerpt: "Resumen original para comprobar la edición dentro de la página.", imageUrl: "/images/regulatel-logo.png", imageFileName: "portada-qa.png", imageMimeType: "image/png", imageSize: 1234, additionalImages: ["/images/noticias/semana-regulatel-montevideo-2026.png"], additionalImageNames: ["segunda-qa.png"], additionalImageMeta: [{ fileName: "segunda-qa.png", mimeType: "image/png", size: 5678 }], content: "Primer párrafo original con tildes.\n\n**Subtítulo conservado**\n\n- Uno\n- Dos", author: "REGULATEL QA", attachments: [attachments[0]], published: true });
    await seedNews({ id: "news-hidden-fixture", slug: "webinar-violencia-digital-rol-entes-reguladores", title: "Noticia QA despublicada", date: "2026-10-21", dateFormatted: "21 de octubre de 2026", category: "Noticias", excerpt: "No debe reaparecer la versión estática.", imageUrl: "", content: "Borrador preservado.", attachments: [], published: false });
    const adminUser = { id: "fixture-admin", name: "Prueba local", email: "admin@example.invalid", role: "admin" };
    const uploadedFiles = new Map();
    let uploadSequence = 0;
    const uploadUsage = () => {
      const usedBytes = [...uploadedFiles.values()].reduce((sum, file) => sum + file.bytes.length, 0);
      const limitBytes = 1073741824;
      return { usedBytes, limitBytes, remainingBytes: limitBytes - usedBytes, fileCount: uploadedFiles.size, percent: usedBytes / limitBytes * 100 };
    };
    const send = (res, data, status = 200) => {
      res.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
      res.end(JSON.stringify(data));
    };
    const server = http.createServer(async (req, res) => {
      try {
        const url = new URL(req.url, `http://127.0.0.1:${port}`);
        if (url.pathname.startsWith("/api/")) {
          const route = url.searchParams.get("path") ?? url.pathname.replace(/^\/api\//, "");
          const authenticated = req.headers.cookie?.split(";").some(cookie => cookie.trim() === "event-publication-fixture=admin") ?? false;
          delete req.headers["x-event-publication-fixture-admin"];
          if (authenticated) req.headers["x-event-publication-fixture-admin"] = "true";
          if (route === "events" || route.startsWith("events/")) {
            req.url = "/api/" + route;
            res.setHeader("Cache-Control", "no-store");
            return await app.handler(req, res);
          }
          if (route === "news" || route.startsWith("news/")) {
            req.url = "/api/" + route;
            res.setHeader("Cache-Control", "no-store");
            return await app.newsHandler(req, res);
          }
          if (route === "settings") {
            const query = new URLSearchParams(url.searchParams);
            query.delete("path");
            req.url = "/api/settings" + (query.size ? "?" + query : "");
            return await app.settingsHandler(req, res);
          }
          if (route === "uploads" && req.method === "POST") {
            if (!authenticated) return send(res, { error: "Sesión requerida" }, 401);
            const chunks = [];
            for await (const chunk of req) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
            const body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
            const match = typeof body.dataUrl === "string" ? /^data:([^;,]+);base64,([A-Za-z0-9+/=\r\n]*)$/.exec(body.dataUrl) : null;
            if (!match || !body.fileName || !["image", "document"].includes(body.kind)) return send(res, { error: "Archivo de prueba inválido." }, 400);
            const bytes = Buffer.from(match[2], "base64");
            if (!bytes.length || bytes.length > 3 * 1024 * 1024) return send(res, { error: "El archivo debe tener entre 1 byte y 3 MB." }, 400);
            const fileName = String(body.fileName);
            const mimeType = match[1];
            const uploadedUrl = `/fixture-uploads/${++uploadSequence}/${encodeURIComponent(fileName)}`;
            uploadedFiles.set(uploadedUrl, { bytes, mimeType, fileName });
            return send(res, { url: uploadedUrl, fileName, mimeType, size: bytes.length, storage: uploadUsage() }, 201);
          }
          if (req.method !== "GET") return send(res, { error: "This isolated fixture only permits event writes." }, 405);
          if (route === "admin/session") return send(res, { authenticated, configured: true, bootstrapRequired: false, user: authenticated ? adminUser : null });
          if (route === "uploads") return send(res, uploadUsage());
          if (["documents", "admin/users", "admin/audit-log"].includes(route)) return send(res, []);
          if (route === "cifras") return send(res, {});
          return send(res, { error: "No external API is connected to this fixture." }, 404);
        }
        if (req.method !== "GET" && req.method !== "HEAD") { res.writeHead(405).end(); return; }
        if (url.pathname.startsWith("/fixture-uploads/")) {
          const file = uploadedFiles.get(url.pathname);
          if (!file) return send(res, { error: "Archivo de prueba no encontrado." }, 404);
          res.writeHead(200, { "Content-Type": file.mimeType, "Content-Length": file.bytes.length, "Cache-Control": "no-store" });
          res.end(req.method === "HEAD" ? undefined : file.bytes);
          return;
        }
        const dist = path.join(root, "dist");
        const file = path.resolve(dist, "." + decodeURIComponent(url.pathname));
        if (file !== dist && !file.startsWith(dist + path.sep)) { res.writeHead(400).end(); return; }
        res.setHeader("Set-Cookie", "event-publication-fixture=admin; Path=/; HttpOnly; SameSite=Strict");
        res.setHeader("Cache-Control", "no-store");
        const found = fs.existsSync(file) && fs.statSync(file).isFile();
        const target = found ? file : path.join(dist, "index.html");
        if (!fs.existsSync(target)) return send(res, { error: "Build dist before using --serve." }, 503);
        const mime = {
          ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".mjs": "text/javascript",
          ".css": "text/css", ".json": "application/json", ".pdf": "application/pdf",
          ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          ".jpeg": "image/jpeg", ".jpg": "image/jpeg", ".png": "image/png", ".svg": "image/svg+xml",
          ".webp": "image/webp", ".ico": "image/x-icon", ".woff": "font/woff", ".woff2": "font/woff2",
        };
        res.setHeader("Content-Type", mime[path.extname(target)] ?? "application/octet-stream");
        if (req.method === "HEAD") { res.end(); return; }
        fs.createReadStream(target).pipe(res);
      } catch (error) {
        if (!res.headersSent) send(res, { error: error.message }, 500);
        else res.destroy(error);
      }
    });
    server.listen(port, "127.0.0.1", () => {
      console.log(`Isolated event admin fixture: http://127.0.0.1:${port}/admin/eventos`);
      console.log("Only local in-memory events, news and settings are writable. No production credentials or requests are used.");
    });
    for (const signal of ["SIGINT", "SIGTERM"]) process.once(signal, () => {
      server.close(async () => { await pg.close(); process.exit(0); });
    });
  }
} catch (error) {
  await pg.close();
  throw error;
}

/** Real news API and SQL, isolated in-memory database. No credentials or external requests. */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { Readable } from "node:stream";
import { fileURLToPath, pathToFileURL } from "node:url";
import { build } from "esbuild";
import { PGlite } from "@electric-sql/pglite";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pg = await PGlite.create();
await pg.exec(`CREATE TABLE news (
  id TEXT PRIMARY KEY, slug TEXT, title TEXT, date DATE, date_formatted TEXT, category TEXT, excerpt TEXT,
  image_url TEXT, image_file_name TEXT, image_mime_type TEXT, image_size INTEGER,
  additional_images JSONB DEFAULT '[]', additional_image_names JSONB DEFAULT '[]', additional_image_meta JSONB DEFAULT '[]',
  body TEXT, author TEXT, link TEXT, video_url TEXT, published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);`);
const sql = async (parts, ...values) => {
  const query = parts.reduce((text, part, index) => text + part + (index < values.length ? `$${index + 1}` : ""), "");
  const result = await pg.query(query, values);
  return Object.assign(result.rows, { count: result.affectedRows ?? result.rows.length });
};
sql.json = value => JSON.stringify(value);
globalThis.__NEWS_CONTENT_SQL = sql;
const built = await build({ absWorkingDir: root, stdin: { contents: 'export { default as handler } from "./server/api-handlers/news.ts";', resolveDir: root, loader: "ts" }, bundle: true, platform: "node", format: "esm", write: false,
  plugins: [{ name: "news-isolation", setup(builder) {
    builder.onResolve({ filter: /(?:^|\/)db\.js$/ }, () => ({ path: "db", namespace: "fixture" }));
    builder.onResolve({ filter: /(?:^|\/)adminAuth\.js$/ }, () => ({ path: "auth", namespace: "fixture" }));
    builder.onLoad({ filter: /.*/, namespace: "fixture" }, args => ({ loader: "js", contents: args.path === "db" ? 'export function getDb(){return globalThis.__NEWS_CONTENT_SQL;} export function isDbConfigured(){return true;}' : `export async function ensureAdmin(req){if(req.headers['x-admin']!=='true'){const err=new Error('Sesión requerida');err.name='UnauthorizedError';throw err;}return {user:{id:'fixture',name:'Prueba local',email:'admin@example.invalid'}};}` }));
  } }] });
const bundlePath = path.join(root, "output/news-content-test-bundle.mjs");
fs.mkdirSync(path.dirname(bundlePath), { recursive: true });
fs.writeFileSync(bundlePath, built.outputFiles[0].text);
const { handler } = await import(pathToFileURL(bundlePath).href);
async function request(method, body, id = "", admin = true) {
  const req = Readable.from(body === undefined ? [] : [Buffer.from(JSON.stringify(body))]);
  req.method = method; req.url = "/api/news" + (id ? `/${id}` : ""); req.headers = admin ? { "x-admin": "true" } : {};
  let text = ""; const res = { statusCode: 200, setHeader() {}, end(value = "") { text += value; } };
  await handler(req, res);
  return { status: res.statusCode, data: text ? JSON.parse(text) : null };
}
const original = { id: "news-qa", slug: "news-qa", title: "Original con tildes", date: "2026-10-22", dateFormatted: "22 de octubre de 2026", category: "Noticias", excerpt: "Resumen", imageUrl: "/one.png", imageFileName: "one.png", imageMimeType: "image/png", imageSize: 111, additionalImages: ["/two.png"], additionalImageNames: ["two.png"], additionalImageMeta: [{ fileName: "two.png", mimeType: "image/png", size: 222 }], content: "Párrafo original.\n\n**Subtítulo**", author: "REGULATEL", link: "https://example.invalid", videoUrl: "/original.mp4", published: true, attachments: [{ id: "doc", title: "Programa original", url: "/one.pdf", fileName: "one.pdf", fileType: "application/pdf", fileSize: 333 }] };
let count = 0;
try {
  const created = await request("POST", original);
  assert.equal(created.status, 201, JSON.stringify(created));
  assert.equal(created.data.contentBlocks, undefined);
  count++;
  const columns = (await pg.query("SELECT column_name FROM information_schema.columns WHERE table_name='news'")).rows.map(row => row.column_name);
  assert.ok(columns.includes("attachments") && columns.includes("content_blocks")); count++;
  const blocks = [{ id: "text", type: "text", text: "Primer párrafo con tildes.\nSiguiente línea." }, { id: "image", type: "image", url: "/two.png", caption: "Pie original" }, { id: "heading", type: "heading", text: "Subtítulo" }, { id: "doc", type: "document", url: "/one.pdf", title: "Programa" }];
  const saved = await request("PATCH", { contentBlocks: blocks }, original.id);
  assert.equal(saved.status, 200);
  assert.deepEqual(saved.data.contentBlocks, blocks);
  const { contentBlocks, ...retained } = saved.data;
  assert.deepEqual(retained, created.data); count++;
  const reloaded = await request("GET", undefined, original.id, false);
  assert.deepEqual(reloaded.data.contentBlocks, blocks);
  assert.deepEqual((await pg.query("SELECT content_blocks FROM news WHERE id=$1", [original.id])).rows[0].content_blocks, blocks); count++;
  for (const published of [false, true]) {
    const changed = await request("PATCH", { published }, original.id);
    assert.equal(changed.data.published, published);
    assert.deepEqual(changed.data.contentBlocks, blocks);
    assert.deepEqual(changed.data.attachments, original.attachments);
    assert.deepEqual(changed.data.additionalImageMeta, original.additionalImageMeta); count++;
  }
  const noBlocksPatch = await request("PATCH", { title: "Otro título" }, original.id);
  assert.deepEqual(noBlocksPatch.data.contentBlocks, blocks); count++;
  const invalid = await request("PATCH", { contentBlocks: { type: "text" } }, original.id);
  assert.equal(invalid.status, 400);
  assert.deepEqual((await request("GET", undefined, original.id)).data.contentBlocks, blocks); count++;
  const unauthenticated = await request("PATCH", { contentBlocks: [] }, original.id, false);
  assert.equal(unauthenticated.status, 401);
  assert.deepEqual((await request("GET", undefined, original.id)).data.contentBlocks, blocks); count++;
  const removed = await request("PATCH", { contentBlocks: [] }, original.id);
  assert.deepEqual(removed.data.contentBlocks, []);
  assert.deepEqual((await request("GET", undefined, original.id)).data.contentBlocks, []);
  assert.deepEqual(removed.data.attachments, original.attachments); count++;
  console.log(`${count} news content checks passed: legacy migration, real SQL roundtrip, ordered media, publication cycles, field preservation, explicit empty content, validation and auth.`);
} finally { await pg.close(); }

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";
import postgres from "postgres";

// Exercise the real repository functions with the Postgres.js JSON parameter
// helper, without writing test articles into the production database.
const parameters = postgres();
let row;
let writes;
const sql = async (strings, ...values) => {
  const query = strings.join("?");
  if (/INSERT INTO news|UPDATE news SET/.test(query)) writes.push(values);
  return /ALTER TABLE/.test(query) ? [] : [row];
};
sql.json = parameters.json;
globalThis.__newsImagesSql = sql;
const source = (await readFile(new URL("../server/lib/news.ts", import.meta.url), "utf8"))
  .replace('import { getDb } from "./db.js";', "const getDb = () => globalThis.__newsImagesSql;");
const compiled = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ESNext } }).outputText;
const news = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);
const images = ["https://example.test/second.jpg", "https://example.test/third.jpg"];
const names = ["second.jpg", "third.jpg"];
const meta = names.map((fileName) => ({ fileName, mimeType: "image/jpeg", size: 100 }));
function reset(legacy = false) {
  writes = [];
  row = { id: "test", slug: "test", title: "Test", date: "2026-10-16", category: "Noticias", excerpt: "Test", image_url: "https://example.test/cover.jpg", body: "Original", published: true,
    additional_images: legacy ? JSON.stringify(images) : images,
    additional_image_names: legacy ? JSON.stringify(names) : names,
    additional_image_meta: legacy ? JSON.stringify(meta) : meta };
}
function assertJsonArrays() {
  const jsonValues = writes.at(-1).filter((value) => value?.type === 3802).map((value) => value.value);
  assert.deepEqual(jsonValues, [images, names, meta]);
}
test("existing JSON arrays and legacy JSON strings retain all photos and metadata", async () => {
  for (const legacy of [false, true]) {
    reset(legacy);
    const item = await news.getNewsById("test");
    assert.deepEqual(item.additionalImages, images);
    assert.deepEqual(item.additionalImageNames, names);
    assert.deepEqual(item.additionalImageMeta, meta);
  }
});
test("create sends actual arrays through Postgres.js JSON serializer", async () => {
  reset();
  await news.createNews({ id: "test", slug: "test", title: "Test", date: "2026-10-16", dateFormatted: "16 oct 2026", category: "Noticias", excerpt: "Test", imageUrl: row.image_url, body: "Original", published: true, additionalImages: images, additionalImageNames: names, additionalImageMeta: meta });
  assertJsonArrays();
});
test("editing text preserves previously saved legacy gallery", async () => {
  reset(true);
  await news.updateNews("test", { body: "Updated text" });
  assertJsonArrays();
});
test("null or malformed gallery values do not break reading articles", async () => {
  for (const value of [null, "invalid JSON", "{}", {}]) {
    reset();
    row.additional_images = value;
    assert.deepEqual((await news.getNewsById("test")).additionalImages, []);
  }
});

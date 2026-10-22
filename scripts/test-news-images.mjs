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
const blocksSource = await readFile(new URL("../src/types/contentBlocks.ts", import.meta.url), "utf8");
const blocksCompiled = ts.transpileModule(blocksSource, { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ESNext } }).outputText;
globalThis.__newsParseBlocks = (await import(`data:text/javascript;base64,${Buffer.from(blocksCompiled).toString("base64")}`)).parseContentBlocks;
const source = (await readFile(new URL("../server/lib/news.ts", import.meta.url), "utf8"))
  .replace('import { getDb } from "./db.js";', "const getDb = () => globalThis.__newsImagesSql;")
  .replace('import { parseContentBlocks, type ContentBlock } from "../../src/types/contentBlocks.js";', "const parseContentBlocks = value => globalThis.__newsParseBlocks(value);");
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

const visualSource = await readFile(new URL("../src/lib/newsVisualContent.ts", import.meta.url), "utf8");
const visualCompiled = ts.transpileModule(visualSource, { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ESNext } }).outputText;
const visual = await import(`data:text/javascript;base64,${Buffer.from(visualCompiled).toString("base64")}`);
const originalArticle = { id: "visual", slug: "visual", title: "Título original", date: "2026-10-22", dateFormatted: "22 de octubre", category: "Noticias", excerpt: "Resumen original", imageUrl: "/cover.png", imageFileName: "cover.png", imageMimeType: "image/png", imageSize: 101, additionalImages: ["/second.png"], additionalImageNames: ["second.png"], additionalImageMeta: [{ fileName: "second.png", mimeType: "image/png", size: 202 }], content: "Primer párrafo.\n\n**Subtítulo**\n\n- Uno\n- Dos", author: "REGULATEL", link: "https://example.test/original", videoUrl: "/original.mp4", published: true, attachments: [{ id: "document", title: "Programa", url: "/original.pdf", fileName: "original.pdf", fileType: "application/pdf", fileSize: 303 }] };

test("opening visual editing then changing only title preserves all text, images, files and metadata", () => {
  const draft = { ...originalArticle, title: "Nuevo título", contentBlocks: visual.legacyNewsBlocks(originalArticle) };
  const saved = visual.newsVisualPayload(draft);
  const { title, contentBlocks, ...other } = saved;
  const { title: originalTitle, ...originalOther } = originalArticle;
  assert.equal(title, "Nuevo título");
  assert.deepEqual(other, originalOther);
  assert.equal(contentBlocks.length, 6);
});

test("moving an existing image carries its filename, type and size to its new cover position", () => {
  const blocks = visual.legacyNewsBlocks(originalArticle);
  [blocks[0], blocks[1]] = [blocks[1], blocks[0]];
  const saved = visual.newsVisualPayload({ ...originalArticle, contentBlocks: blocks });
  assert.equal(saved.imageUrl, "/second.png");
  assert.equal(saved.imageFileName, "second.png");
  assert.equal(saved.imageSize, 202);
  assert.deepEqual(saved.additionalImageMeta, [{ fileName: "cover.png", mimeType: "image/png", size: 101 }]);
  assert.deepEqual(saved.attachments, originalArticle.attachments);
});

test("a legacy gallery display override preserves the original stored cover and every asset field", () => {
  const displayedOrder = ["/poster.png", "/cover.png", "/second.png"];
  const blocks = visual.legacyNewsBlocks(originalArticle, displayedOrder);
  const saved = visual.newsVisualPayload({ ...originalArticle, title: "Nuevo título", contentBlocks: blocks }, displayedOrder);
  assert.deepEqual(blocks.filter(block => block.type === "image").map(block => block.url), displayedOrder);
  const { title, contentBlocks, ...other } = saved;
  const { title: originalTitle, ...originalOther } = originalArticle;
  assert.deepEqual(other, originalOther);
});

test("legacy image and document blocks carry original metadata and the document's stable id", () => {
  const blocks = visual.legacyNewsBlocks(originalArticle);
  assert.deepEqual(blocks[0], { id: "news-image-0", type: "image", url: "/cover.png", fileName: "cover.png", fileType: "image/png", fileSize: 101 });
  assert.deepEqual(blocks.at(-1), { id: "document", type: "document", url: "/original.pdf", title: "Programa", fileName: "original.pdf", fileType: "application/pdf", fileSize: 303 });
});

test("replacing the cover prioritizes new file metadata and preserves the following image and document", () => {
  const blocks = visual.legacyNewsBlocks(originalArticle);
  blocks[0] = { ...blocks[0], url: "/new-cover.webp", fileName: "new-cover.webp", fileType: "image/webp", fileSize: 444 };
  const saved = visual.newsVisualPayload({ ...originalArticle, contentBlocks: blocks });
  assert.equal(saved.imageUrl, "/new-cover.webp");
  assert.equal(saved.imageFileName, "new-cover.webp");
  assert.equal(saved.imageMimeType, "image/webp");
  assert.equal(saved.imageSize, 444);
  assert.equal(saved.contentBlocks[0].id, blocks[0].id);
  assert.deepEqual(saved.additionalImages, originalArticle.additionalImages);
  assert.deepEqual(saved.additionalImageMeta, originalArticle.additionalImageMeta);
  assert.deepEqual(saved.attachments, originalArticle.attachments);
});

test("replacing a document keeps its title, id and position and stores the new filename, type and size", () => {
  const blocks = visual.legacyNewsBlocks(originalArticle);
  const position = blocks.findIndex(block => block.type === "document");
  blocks[position] = { ...blocks[position], url: "/new-programme.docx", fileName: "new-programme.docx", fileType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", fileSize: 555 };
  const saved = visual.newsVisualPayload({ ...originalArticle, contentBlocks: blocks });
  assert.deepEqual(saved.attachments, [{ ...originalArticle.attachments[0], url: "/new-programme.docx", fileName: "new-programme.docx", fileType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", fileSize: 555 }]);
  assert.equal(saved.contentBlocks[position].id, "document");
  assert.equal(saved.contentBlocks[position].title, "Programa");
  assert.deepEqual(saved.additionalImageMeta, originalArticle.additionalImageMeta);
});

test("older synthetic document block ids recover the original attachment id during replacement", () => {
  const blocks = visual.legacyNewsBlocks(originalArticle);
  blocks[blocks.length - 1] = { id: "news-document-0", type: "document", url: "/replacement.pdf", title: "Programa", fileName: "replacement.pdf", fileType: "application/pdf", fileSize: 777 };
  const saved = visual.newsVisualPayload({ ...originalArticle, contentBlocks: blocks });
  assert.equal(saved.attachments[0].id, "document");
  assert.equal(saved.contentBlocks.at(-1).id, "document");
  assert.equal(saved.attachments[0].fileName, "replacement.pdf");
});

test("new block metadata is retained even when a storage provider reuses the same image URL", () => {
  const blocks = visual.legacyNewsBlocks(originalArticle);
  blocks[0] = { ...blocks[0], fileName: "updated-cover.png", fileSize: 999 };
  const saved = visual.newsVisualPayload({ ...originalArticle, contentBlocks: blocks });
  assert.equal(saved.imageUrl, originalArticle.imageUrl);
  assert.equal(saved.imageFileName, "updated-cover.png");
  assert.equal(saved.imageSize, 999);
});

test("newly added image and document blocks retain their upload metadata and do not replace existing files", () => {
  const blocks = [...visual.legacyNewsBlocks(originalArticle), { id: "new-image", type: "image", url: "/added.webp", fileName: "added.webp", fileType: "image/webp", fileSize: 808 }, { id: "new-document", type: "document", title: "Documento añadido", url: "/added.pdf", fileName: "added.pdf", fileType: "application/pdf", fileSize: 909 }];
  const saved = visual.newsVisualPayload({ ...originalArticle, contentBlocks: blocks });
  assert.equal(saved.imageUrl, originalArticle.imageUrl);
  assert.deepEqual(saved.additionalImages, ["/second.png", "/added.webp"]);
  assert.deepEqual(saved.additionalImageMeta.at(-1), { fileName: "added.webp", mimeType: "image/webp", size: 808 });
  assert.deepEqual(saved.attachments[0], originalArticle.attachments[0]);
  assert.deepEqual(saved.attachments.at(-1), { id: "new-document", title: "Documento añadido", url: "/added.pdf", fileName: "added.pdf", fileType: "application/pdf", fileSize: 909 });
});

test("removing document and image blocks is intentional and does not resurrect legacy fields", () => {
  const saved = visual.newsVisualPayload({ ...originalArticle, contentBlocks: [] });
  assert.equal(saved.imageUrl, "");
  assert.equal(saved.content, "");
  assert.deepEqual(saved.additionalImages, []);
  assert.deepEqual(saved.attachments, []);
});

test("unsafe block URLs are sanitized while text and media order remain intact", () => {
  const parsed = globalThis.__newsParseBlocks([{ id: "a", type: "text", text: "Texto con tildes y\nsalto" }, { id: "b", type: "image", url: "javascript:alert(1)" }, { id: "c", type: "document", url: "/original.pdf", title: "Programa", fileName: "original.pdf", fileType: "application/pdf", fileSize: 303 }]);
  assert.deepEqual(parsed.map(block => block.id), ["a", "b", "c"]);
  assert.equal(parsed[0].text, "Texto con tildes y\nsalto");
  assert.equal(parsed[1].url, "");
  assert.equal(parsed[2].url, "/original.pdf");
  assert.equal(parsed[2].fileName, "original.pdf");
  assert.equal(parsed[2].fileType, "application/pdf");
  assert.equal(parsed[2].fileSize, 303);
});

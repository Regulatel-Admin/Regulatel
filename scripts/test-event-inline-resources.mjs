/** UI event regression checks with a tiny hook host and isolated upload responses.
 * No browser, real uploads, credentials or network requests.
 * node scripts/test-event-inline-resources.mjs
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { build } from "esbuild";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
let slots = [], cursor = 0;
globalThis.__EVENT_RESOURCE_HOOKS = {
  useState(initial) {
    const index = cursor++;
    if (!(index in slots)) slots[index] = typeof initial === "function" ? initial() : initial;
    return [slots[index], value => { slots[index] = typeof value === "function" ? value(slots[index]) : value; }];
  },
  useRef(initial) {
    const index = cursor++;
    if (!(index in slots)) slots[index] = { current: initial };
    return slots[index];
  },
  jsx(type, props, key) {
    if (props?.ref && !props.ref.current) props.ref.current = { value: "", accept: "", click() {} };
    return { type, props: props ?? {}, key };
  },
};
const built = await build({
  absWorkingDir: root,
  stdin: {
    contents: 'export { useEventResourceInlineTools as tools } from "./src/components/site-edit/EventResourceInlineTools.tsx"; export { default as Editor } from "./src/components/site-edit/EventResourcesEditor.tsx";',
    resolveDir: root, loader: "tsx",
  },
  bundle: true, format: "esm", platform: "node", write: false,
  plugins: [{ name: "isolated-ui-host", setup(builder) {
    builder.onResolve({ filter: /^react$/ }, () => ({ path: "hooks", namespace: "fixture" }));
    builder.onResolve({ filter: /^react\/jsx-runtime$/ }, () => ({ path: "jsx", namespace: "fixture" }));
    builder.onResolve({ filter: /^lucide-react$/ }, () => ({ path: "icons", namespace: "fixture" }));
    builder.onResolve({ filter: /EventInlineEditContext(?:\.tsx)?$/ }, () => ({ path: "context", namespace: "fixture" }));
    builder.onResolve({ filter: /(?:^|\/)uploads(?:\.ts)?$/ }, () => ({ path: "upload", namespace: "fixture" }));
    builder.onLoad({ filter: /.*/, namespace: "fixture" }, args => {
      const sources = {
        hooks: "export const useState=globalThis.__EVENT_RESOURCE_HOOKS.useState; export const useRef=globalThis.__EVENT_RESOURCE_HOOKS.useRef; export function useEffect(){}",
        jsx: "export const jsx=globalThis.__EVENT_RESOURCE_HOOKS.jsx; export const jsxs=jsx; export const Fragment=Symbol.for('test.fragment');",
        icons: "export const ArrowDown=()=>null,ArrowUp=()=>null,CalendarDays=()=>null,FileText=()=>null,GripVertical=()=>null,Images=()=>null,Plus=()=>null,Trash2=()=>null,Upload=()=>null,X=()=>null,Pencil=()=>null,Settings2=()=>null;",
        context: "export function useEventInlineEditor(){return globalThis.__EVENT_RESOURCE_CONTEXT;}",
        upload: "export async function uploadAdminFile(input){return await globalThis.__EVENT_RESOURCE_UPLOAD(input);}",
      };
      return { loader: "js", contents: sources[args.path] };
    });
  } }],
});
const bundlePath = path.join(root, "output/event-inline-resources-test-bundle.mjs");
fs.mkdirSync(path.dirname(bundlePath), { recursive: true });
fs.writeFileSync(bundlePath, built.outputFiles[0].text);
const app = await import(pathToFileURL(bundlePath).href);
const source = {
  programs: [{ title: "Programa A", url: "/a.pdf", description: "Primera jornada" }, { title: "Programa B", url: "/b.pdf", description: "Segunda jornada" }],
  documents: [{ title: "Ponente A", url: "/ponente-a.pdf", description: "Entidad A" }, { title: "Ponente B", url: "/ponente-b.pdf", description: "Entidad B" }],
  photos: [{ src: "/a.jpg", caption: "" }, { src: "/b.jpg", caption: "Grupo de trabajo" }],
  survey: "https://example.invalid/survey", taxi: "https://example.invalid/taxi",
  sectionOrder: ["programs", "documents", "photos"],
};
let resources, busyEvents;
function reset() {
  slots = []; cursor = 0; resources = structuredClone(source); busyEvents = [];
  globalThis.__EVENT_RESOURCE_CONTEXT = {
    event: {}, busy: false,
    patch(values) { if (values.resources) resources = values.resources; },
    onBusyChange(value) { this.busy = value; busyEvents.push(value); },
    setResourceDraft(value) { this.resourceDraft = value; },
  };
  globalThis.__EVENT_RESOURCE_UPLOAD = async () => ({ url: "/replacement.pdf" });
}
function renderTools() { cursor = 0; return app.tools(resources, resources.sectionOrder); }
function renderEditor() {
  cursor = 0;
  return app.Editor({ value: resources, onChange: value => { resources = value; }, onBusyChange: value => { busyEvents.push(value); } });
}
function nodes(element, predicate) {
  if (element == null || typeof element !== "object") return [];
  if (Array.isArray(element)) return element.flatMap(item => nodes(item, predicate));
  return [...(predicate(element) ? [element] : []), ...nodes(element.props?.children, predicate)];
}
function text(element) {
  if (element == null || typeof element === "boolean") return "";
  if (typeof element !== "object") return String(element);
  if (Array.isArray(element)) return element.map(text).join("");
  return text(element.props?.children);
}
function byLabel(tree, label) {
  const node = nodes(tree, item => item.props?.["aria-label"] === label)[0];
  assert.ok(node, `Missing control: ${label}`); return node;
}
function button(tree, label) {
  const node = nodes(tree, item => item.type === "button" && text(item) === label)[0];
  assert.ok(node, `Missing button: ${label}`); return node;
}
const flush = async () => { await new Promise(setImmediate); await new Promise(setImmediate); };
const file = { name: "nuevo.pdf", type: "application/pdf", size: 12 };
let count = 0;
async function check(name, run) {
  reset();
  try { await run(); count++; }
  catch (error) { error.message = `${name}: ${error.message}`; throw error; }
}

await check("inline replacement changes only the chosen URL after Apply", async () => {
  const before = structuredClone(resources);
  byLabel(renderTools().itemTools("documents", 1), "Editar documento 2").props.onClick();
  let tools = renderTools();
  byLabel(tools.dialogs, "Archivo de reemplazo").props.onChange({ target: { files: [file] } });
  await flush();
  assert.deepEqual(resources, before, "The uploaded draft must not be applied before Apply");
  assert.equal(globalThis.__EVENT_RESOURCE_CONTEXT.resourceDraft.draft.url, "/replacement.pdf", "Pending modal upload is included in the private recoverable draft");
  tools = renderTools();
  button(tools.dialogs, "Aplicar").props.onClick();
  before.documents[1].url = "/replacement.pdf";
  assert.deepEqual(resources, before);
  assert.equal(globalThis.__EVENT_RESOURCE_CONTEXT.resourceDraft, undefined, "Apply removes only the temporary dialog draft");
  assert.deepEqual(busyEvents, [true, false]);
});

await check("failed inline replacement retains URL, title, description and order", async () => {
  const before = structuredClone(resources);
  globalThis.__EVENT_RESOURCE_UPLOAD = async () => { throw new Error("Upload failed in isolated test"); };
  byLabel(renderTools().itemTools("programs", 0), "Editar programa 1").props.onClick();
  byLabel(renderTools().dialogs, "Archivo de reemplazo").props.onChange({ target: { files: [file] } });
  await flush();
  assert.deepEqual(resources, before);
  assert.match(text(renderTools().dialogs), /Upload failed in isolated test/);
  assert.deepEqual(busyEvents, [true, false]);
});

await check("replacing a photo preserves an intentionally empty caption", async () => {
  byLabel(renderTools().itemTools("photos", 0), "Editar fotografía 1").props.onClick();
  byLabel(renderTools().dialogs, "Archivo de reemplazo").props.onChange({ target: { files: [{ ...file, name: "nueva.jpg", type: "image/jpeg" }] } });
  await flush();
  button(renderTools().dialogs, "Aplicar").props.onClick();
  assert.deepEqual(resources.photos, [{ src: "/replacement.pdf", caption: "" }, source.photos[1]]);
});

await check("item and section arrows preserve all untouched content", async () => {
  byLabel(renderTools().itemTools("programs", 1), "Subir programa 2").props.onClick();
  assert.deepEqual(resources.programs, [...source.programs].reverse());
  byLabel(renderTools().sectionTools("photos"), "Subir sección Galería").props.onClick();
  assert.deepEqual(resources.sectionOrder, ["programs", "photos", "documents"]);
  assert.deepEqual(resources.documents, source.documents);
  assert.deepEqual(resources.photos, source.photos);
});

await check("item drag reorders within its original resource section", async () => {
  let payload = "";
  const dataTransfer = { effectAllowed: "", setData(type, value) { payload = value; }, getData() { return payload; } };
  const event = { dataTransfer, preventDefault() {}, stopPropagation() {} };
  byLabel(renderTools().itemTools("documents", 1), "Arrastrar documento 2").props.onDragStart(event);
  renderTools().itemDragProps("documents", 0).onDrop(event);
  assert.deepEqual(resources.documents, [...source.documents].reverse());
  assert.deepEqual(resources.programs, source.programs);
  assert.deepEqual(resources.photos, source.photos);
});

await check("removing every item leaves an explicit empty array", async () => {
  byLabel(renderTools().sectionTools("programs"), "Quitar sección Programa").props.onClick();
  assert.deepEqual(resources.programs, []);
  assert.deepEqual(resources.documents, source.documents);
  assert.deepEqual(resources.photos, source.photos);
});

await check("public and preview context returns no editing controls", async () => {
  globalThis.__EVENT_RESOURCE_CONTEXT = null;
  const tools = renderTools();
  assert.equal(tools.editing, false);
  assert.equal(tools.itemTools("documents", 0), null);
  assert.equal(tools.sectionTools("programs"), null);
  assert.equal(tools.manageButton, null);
  assert.equal(tools.dialogs, null);
  assert.equal(tools.replacementInput, null);
  assert.equal(tools.replaceButton("documents", 0), null);
  assert.deepEqual(tools.itemDragProps("documents", 0), {});
});

await check("visible row replacement uploads DOCX and changes only its URL without a dialog or Apply", async () => {
  const expected = structuredClone(resources);
  let uploadInput;
  globalThis.__EVENT_RESOURCE_UPLOAD = async value => { uploadInput = value; return { url: "/nuevo.docx" }; };
  const tools = renderTools();
  button(tools.replaceButton("programs", 0), "Reemplazar archivo").props.onClick();
  assert.equal(Boolean(renderTools().dialogs), false);
  const docx = { name: "nuevo.docx", type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", size: 45 };
  byLabel(renderTools().replacementInput, "Reemplazo directo del archivo").props.onChange({ target: { files: [docx] } });
  await flush();
  expected.programs[0].url = "/nuevo.docx";
  assert.deepEqual(resources, expected);
  assert.equal(uploadInput.kind, "document");
  assert.equal(uploadInput.file, docx);
  assert.deepEqual(busyEvents, [true, false]);
  assert.match(text(renderTools().replaceButton("programs", 0)), /Publica los cambios/);
  assert.equal(Boolean(renderTools().dialogs), false);
});

await check("failed visible row replacement reports the error beside the button and preserves all resources", async () => {
  const expected = structuredClone(resources);
  globalThis.__EVENT_RESOURCE_UPLOAD = async () => { throw new Error("DOCX upload rejected"); };
  button(renderTools().replaceButton("documents", 1), "Reemplazar archivo").props.onClick();
  byLabel(renderTools().replacementInput, "Reemplazo directo del archivo").props.onChange({ target: { files: [file] } });
  await flush();
  assert.deepEqual(resources, expected);
  const feedback = renderTools().replaceButton("documents", 1);
  assert.equal(nodes(feedback, item => item.props?.role === "alert").length, 1);
  assert.match(text(feedback), /DOCX upload rejected.*El archivo anterior se conserva/);
  assert.deepEqual(busyEvents, [true, false]);
});

await check("visible replacement follows the same item if its position changes during upload", async () => {
  let finish;
  globalThis.__EVENT_RESOURCE_UPLOAD = () => new Promise(resolve => { finish = resolve; });
  button(renderTools().replaceButton("documents", 0), "Reemplazar archivo").props.onClick();
  byLabel(renderTools().replacementInput, "Reemplazo directo del archivo").props.onChange({ target: { files: [file] } });
  resources = { ...resources, documents: [...resources.documents].reverse() };
  renderTools();
  finish({ url: "/nuevo.docx" }); await flush();
  assert.deepEqual(resources.documents, [source.documents[1], { ...source.documents[0], url: "/nuevo.docx" }]);
  assert.deepEqual(resources.programs, source.programs);
  assert.deepEqual(resources.photos, source.photos);
});

await check("visible image replacement changes only src and retains an empty caption", async () => {
  const expected = structuredClone(resources);
  button(renderTools().replaceButton("photos", 0), "Cambiar imagen").props.onClick();
  byLabel(renderTools().replacementInput, "Reemplazo directo del archivo").props.onChange({ target: { files: [{ ...file, name: "foto.jpg", type: "image/jpeg" }] } });
  await flush();
  expected.photos[0].src = "/replacement.pdf";
  assert.deepEqual(resources, expected);
});

await check("manager replacement keeps metadata and updates the same item after reorder", async () => {
  let resolveUpload;
  globalThis.__EVENT_RESOURCE_UPLOAD = () => new Promise(resolve => { resolveUpload = resolve; });
  byLabel(renderEditor(), "Reemplazar Documentos 1").props.onClick();
  byLabel(renderEditor(), "Reemplazar archivo del recurso").props.onChange({ target: { files: [file] } });
  resources = { ...resources, documents: [...resources.documents].reverse() };
  renderEditor();
  resolveUpload({ url: "/replacement.pdf" }); await flush();
  assert.deepEqual(resources.documents, [source.documents[1], { ...source.documents[0], url: "/replacement.pdf" }]);
  assert.deepEqual(resources.programs, source.programs);
  assert.deepEqual(busyEvents, [true, false]);
});

await check("failed manager replacement retains all resources", async () => {
  const before = structuredClone(resources);
  globalThis.__EVENT_RESOURCE_UPLOAD = async () => { throw new Error("Network unavailable"); };
  byLabel(renderEditor(), "Reemplazar Programa 1").props.onClick();
  byLabel(renderEditor(), "Reemplazar archivo del recurso").props.onChange({ target: { files: [file] } });
  await flush();
  assert.deepEqual(resources, before);
  assert.match(text(renderEditor()), /Network unavailable/);
  assert.deepEqual(busyEvents, [true, false]);
});

console.log(`${count} inline resource event checks passed: replacement success/failure, unchanged titles/descriptions/captions, stable identity, ordering, removal and public controls.`);

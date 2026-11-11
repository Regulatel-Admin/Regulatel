/** Source selection and editor boundary expressions from the real pages; no UI or API. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
let checks = 0;
const clean = value => JSON.parse(JSON.stringify(value));
function check(actual, expected, message) { assert.deepEqual(clean(actual), clean(expected), message); checks++; }
function readAst(file) {
  return ts.createSourceFile(file, fs.readFileSync(path.join(root, file), 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
}
function evaluate(expression, globals) {
  const code = ts.transpileModule(`module.exports = (${expression});`, { compilerOptions: {
    target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS,
  } }).outputText;
  const module = { exports: {} };
  vm.runInNewContext(code, { module, ...globals });
  return module.exports;
}
function variable(ast, name, globals) {
  let expression;
  function visit(node) {
    if (ts.isVariableDeclaration(node) && node.name.getText(ast) === name) expression = node.initializer.getText(ast);
    ts.forEachChild(node, visit);
  }
  visit(ast); assert.ok(expression, name);
  return evaluate(expression, globals);
}
function componentBoundary(ast, name) {
  let opening, element;
  function visit(node) {
    if (ts.isJsxElement(node) && node.openingElement.tagName.getText(ast) === name) {
      opening = node.openingElement; element = node;
    }
    ts.forEachChild(node, visit);
  }
  visit(ast); assert.ok(opening, name);
  return {
    prop: (name, globals) => evaluate(opening.attributes.properties.find(prop => prop.name?.getText(ast) === name).initializer.expression.getText(ast), globals),
    children: globals => evaluate(element.children.find(ts.isJsxExpression).expression.getText(ast), globals),
  };
}
const ast = readAst('src/pages/EventoDetalle.tsx');
const boundary = componentBoundary(ast, 'EventPageEditor');
const raw = {
  id: 'source-published', title: 'Título original', description: 'Descripción original',
  resources: { documents: [{ title: 'Documento original', url: '', private: true, locked: true }] },
};
const translated = {
  ...raw, title: 'Translated title', description: 'Translated description',
  resources: { documents: [{ title: 'Translated document', url: '', private: true, locked: true }] },
};
function select(editing, storedEvents = [], eventsRaw = [raw], fetchedEvent = null) {
  const globals = { id: raw.id, editing, storedEvents, eventsRaw, events: [translated] };
  const fromList = variable(ast, 'eventFromList', globals);
  return variable(ast, 'eventRaw', { eventFromList: fromList, fetchedEvent });
}
const publicSource = select(false);
check(publicSource, raw, 'Source-published events remain raw before the public display is translated');
const mountedSeed = boundary.prop('event', { editing: false, eventRaw: publicSource, event: translated });
check(mountedSeed, raw, 'The editor mounted during public viewing receives the raw seed, not the translated display');
const publicRender = boundary.children({ editing: false, event: translated, renderEvent: value => value });
check(publicRender(mountedSeed), translated, 'Public rendering still receives the translated event');
const editingRender = boundary.children({ editing: true, event: translated, renderEvent: value => value });
check(editingRender(mountedSeed), raw, 'Entering edit mode without remounting preserves the raw draft captured during public viewing');
check(select(true), raw, 'A source-published fallback also remains raw in edit mode when no CMS record exists');
const stored = { ...raw, title: 'Título CMS actualizado', published: false };
check(select(true, [stored]), stored, 'Edit mode gives the raw CMS record priority, including unpublished records');
check(select(false, [], [], raw), raw, 'A fetched event remains raw at the editor boundary');
check(mountedSeed.resources.documents[0], raw.resources.documents[0], 'Private access flags and redacted URLs survive the editor boundary unchanged');

const newsAst = readAst('src/pages/NoticiaIndividual.tsx');
let inlineInitial;
function visitNews(node) {
  if (ts.isJsxSelfClosingElement(node) && node.tagName.getText(newsAst) === 'InlineNewsEditor') {
    const prop = node.attributes.properties.find(prop => prop.name?.getText(newsAst) === 'initial');
    if (prop?.initializer.expression.getText(newsAst).includes('adminNoticia')) inlineInitial = prop.initializer.expression.getText(newsAst);
  }
  ts.forEachChild(node, visitNews);
}
visitNews(newsAst); assert.ok(inlineInitial);
check(evaluate(inlineInitial, { adminNoticia: raw, noticiaStatic: translated, staticNewsForEditing: value => value }), raw,
  'The news editor receives its raw CMS article before any public translation');
check(evaluate(inlineInitial, { adminNoticia: undefined, noticiaStatic: raw, staticNewsForEditing: value => ({ ...value, seeded: true }) }), { ...raw, seeded: true },
  'A static news editor is also seeded from the raw static article');

console.log(`PASS: ${checks} event/news display-source boundary checks; no real requests.`);

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

const root = path.resolve(__dirname, '..');
const clean = value => JSON.parse(JSON.stringify(value));
let checks = 0;
function check(actual, expected, message) {
  assert.deepEqual(clean(actual), clean(expected), message);
  checks += 1;
}
function evaluate(source, globals = {}, imports = {}) {
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS },
  });
  const exports = {};
  const sandbox = { exports, module: { exports }, ...globals, require: name => {
    assert.ok(name in imports, `Unexpected import: ${name}`);
    return imports[name];
  }};
  vm.runInNewContext(outputText, sandbox);
  return sandbox.module.exports;
}
function exportedFunction(file, name, globals = {}) {
  const text = fs.readFileSync(path.join(root, file), 'utf8');
  const ast = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const node = ast.statements.find(node => ts.isFunctionDeclaration(node) && node.name?.text === name);
  assert.ok(node, name);
  return evaluate(`${node.getText(ast)}\nmodule.exports = ${name};`, globals);
}
function removalTransform(file, form, globals = {}) {
  const text = fs.readFileSync(path.join(root, file), 'utf8');
  const ast = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const node = ast.statements.find(node => ts.isFunctionDeclaration(node) && node.name?.text === form);
  let initializer;
  function visit(node) {
    if (ts.isCallExpression(node) && node.expression.getText(ast) === 'useSettingRemoval') {
      initializer = node.arguments[0].properties.find(prop => prop.name?.getText(ast) === 'removeFromValue').initializer;
    }
    ts.forEachChild(node, visit);
  }
  visit(node);
  assert.ok(initializer, `${form}: removal connected`);
  return evaluate(`module.exports = (${initializer.getText(ast)});`, globals);
}

async function testHook() {
  let value = { entries: [{ id: 'target', title: 'Published', image: '/kept.png' }, { id: 'other', extra: 'untouched' }], schema: 9 };
  let loadFailure = false;
  let writeFailure = false;
  let loadGate = null;
  const writes = [];
  const errors = [];
  const saving = [];
  const history = [];
  let gets = 0, closes = 0, clears = 0, refreshes = 0;
  const api = { settings: {
    get: async () => {
      gets++;
      if (loadGate) await loadGate;
      return loadFailure ? { ok: false, error: 'load failed' } : { ok: true, data: { value } };
    },
    set: async (key, next) => {
      if (writeFailure) return { ok: false, error: 'write failed' };
      writes.push({ key, value: clean(next) });
      value = clean(next);
      return { ok: true, data: { key, value } };
    },
  }};
  const { useSettingRemoval } = evaluate(fs.readFileSync(path.join(root, 'src/hooks/useSettingRemoval.ts'), 'utf8'), {}, {
    react: { useRef: value => ({ current: value }), useState: value => [value, () => {}] },
    '@/contexts/SiteEditContext': { useSiteEdit: () => ({
      clearPreview: () => clears++, close: () => closes++, recordPersistedChange: entry => history.push(entry),
    }) },
    '@/contexts/SiteSettingsContext': { useSiteSettings: () => ({ refetch: async () => refreshes++ }) },
    '@/lib/api': { api },
    '@/lib/siteEdit': { cloneJson: clean, notifyCmsSaved: () => {} },
  });
  const create = overrides => useSettingRemoval({
    settingsKey: 'groups', previewKey: 'grupos', label: 'group',
    fallbackValue: { entries: [{ id: 'target', title: 'Stale fallback' }] },
    removeFromValue: value => ({ ...value, entries: value.entries.filter(entry => entry.id !== 'target') }),
    saving: false, setSaving: value => saving.push(value), setError: value => errors.push(value), ...overrides,
  });
  const before = clean(value);
  const expected = { entries: [{ id: 'other', extra: 'untouched' }], schema: 9 };
  await create().remove();
  check(value, expected, 'Persist immediately from fresh data and preserve all adjacent fields');
  check([writes.length, closes, clears, refreshes, history.length], [1, 1, 1, 1, 1], 'Success refreshes/closes and records undo');
  await history[0].undo();
  check(value, before, 'Undo restores the entire original record and image reference');
  await history[0].redo();
  check(value, expected, 'Redo withdraws again');
  const previousWrites = writes.length;
  await create().remove();
  check(writes.length, previousWrites, 'Already absent item needs no write');
  const previousCloses = closes;
  const previousClears = clears;
  loadFailure = true;
  await create().remove();
  check([writes.length, closes, clears, errors.at(-1), saving.at(-1)], [previousWrites, previousCloses, previousClears, 'load failed', false], 'Read failure keeps editor and draft; never writes');
  loadFailure = false;
  writeFailure = true;
  value = clean(before);
  await create().remove();
  check([writes.length, closes, clears, errors.at(-1), saving.at(-1)], [previousWrites, previousCloses, previousClears, 'write failed', false], 'Write failure keeps editor and draft with retry enabled');
  writeFailure = false;
  let resolve;
  loadGate = new Promise(done => { resolve = done; });
  const concurrent = create();
  const previousGets = gets;
  const pending = concurrent.remove();
  await concurrent.remove();
  check(gets, previousGets + 1, 'Double click sends one operation');
  resolve();
  await pending;
  loadGate = null;
  value = JSON.stringify(before);
  await create().remove();
  check(value, expected, 'Legacy JSON string settings remain supported');
  const alreadySaving = create({ saving: true });
  const lockedGets = gets;
  await alreadySaving.remove();
  check(gets, lockedGets, 'Quitar cannot race an active publication');
}

function testFormTransforms() {
  const stampEnteIds = exportedFunction('src/data/entesReguladoresMiembros.ts', 'stampEnteIds');
  const stampDirectorioIds = exportedFunction('src/data/directorioAutoridades.ts', 'stampDirectorioIds');
  const stampMember = exportedFunction('src/data/comiteEjecutivo.ts', 'stampMember');
  const stampComiteIds = exportedFunction('src/data/comiteEjecutivo.ts', 'stampComiteIds', { stampMember });
  const forms = [
    ['GrupoEditForm.tsx', 'GrupoForm', 'entries', 'id'],
    ['MiembrosEditForms.tsx', 'EnteForm', 'entes', 'id'],
    ['MiembrosEditForms.tsx', 'DirectorioForm', 'entries', 'id'],
    ['OrganizacionEditForms.tsx', 'AutoridadForm', 'authorities', 'id'],
    ['RecursosEditForms.tsx', 'ConvenioForm', 'items', 'slug'],
    ['RecursosEditForms.tsx', 'AlbumForm', null, 'slug'],
    ['RecursosEditForms.tsx', 'EstudioForm', 'items', 'id'],
    ['RecursosEditForms.tsx', 'EntrevistaForm', 'interviews', 'slug'],
    ['HomeAvisoForm.tsx', 'HomeAvisoForm', 'slots', 'id'],
  ];
  for (const [file, form, key, identifier] of forms) {
    const remove = removalTransform(`src/components/site-edit/${file}`, form, {
      row: { id: 'target', slug: 'target' }, slot: { id: 'target' }, stampEnteIds, stampDirectorioIds,
    });
    const target = { [identifier]: 'target', title: 'Published', document: '/keep.pdf' };
    const other = { [identifier]: 'other', title: 'Adjacent', metadata: { retained: true } };
    const before = key ? { [key]: [target, other], additional: { untouched: true } } : [target, other];
    const expected = key ? { [key]: [other], additional: { untouched: true } } : [other];
    check(remove(clean(before)), expected, `${form} removes only target without normalizing other content`);
    check(before, key ? { [key]: [target, other], additional: { untouched: true } } : [target, other], `${form} does not mutate original`);
    if (['EstudioForm', 'EntrevistaForm', 'HomeAvisoForm'].includes(form)) {
      check(remove([target, other]), { [key]: [other] }, `${form} supports old raw arrays`);
    }
    const onlyTarget = key ? { [key]: [target] } : [target];
    check(remove(onlyTarget), key ? { [key]: [] } : [], `${form} can withdraw the last item`);
  }
  for (const slot of ['vice', 'miembro']) {
    const remove = removalTransform('src/components/site-edit/OrganizacionEditForms.tsx', 'ComiteLogoForm', { slot, workingId: 'target', stampComiteIds });
    const before = {
      presidente: { id: 'president', name: 'Unchanged' },
      secretarioEjecutivo: { id: 'secretary', logoUrl: '/unchanged.png' },
      vicepresidentes: [{ id: slot === 'vice' ? 'target' : 'other-vice' }],
      miembros: [{ id: slot === 'miembro' ? 'target' : 'other-member' }],
      funciones: ['Unchanged'], additional: { retained: true },
    };
    const expected = clean(before);
    expected[slot === 'vice' ? 'vicepresidentes' : 'miembros'] = [];
    check(remove(clean(before)), expected, `Committee ${slot} withdrawal preserves other members and functions`);
  }
  const entes = removalTransform('src/components/site-edit/MiembrosEditForms.tsx', 'EnteForm', { row: { id: 'ente-/--Peru--0' }, stampEnteIds });
  check(entes({ entes: [{ route: '/', country: 'Peru' }, { id: 'other', country: 'Chile' }] }), { entes: [{ id: 'other', country: 'Chile' }] }, 'Legacy ente without ID can be withdrawn');
  const directorio = removalTransform('src/components/site-edit/MiembrosEditForms.tsx', 'DirectorioForm', { row: { id: 'dir-Peru--OSIPTEL--0' }, stampDirectorioIds });
  check(directorio({ entries: [{ pais: 'Peru', acronym: 'OSIPTEL' }, { id: 'other' }] }), { entries: [{ id: 'other' }] }, 'Legacy directorio without ID can be withdrawn');

  const gallery = exportedFunction('src/contexts/SiteSettingsContext.tsx', 'useGalleryAlbums', {
    useSiteSettings: () => ({ galleryAlbums: [], loading: false }),
    useSiteEdit: () => ({ enabled: false, preview: {} }),
    albumesGaleria: [{ slug: 'static-album' }],
  });
  check(gallery(), [], 'Removing the last gallery album cannot resurrect static defaults');
}

(async () => {
  await testHook();
  testFormTransforms();
  console.log(`PASS: ${checks} site editor withdrawal checks; all requests mocked, no database changes.`);
})().catch(error => { console.error(error); process.exitCode = 1; });

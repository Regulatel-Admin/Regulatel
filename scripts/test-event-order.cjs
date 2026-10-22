const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
const clean = value => JSON.parse(JSON.stringify(value));
let checks = 0;
const check = (actual, expected, note) => { assert.deepEqual(clean(actual), clean(expected), note); checks++; };
function evaluate(source, globals = {}) {
  const { outputText } = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS } });
  const exports = {};
  const context = { exports, module: { exports }, Error, ...globals };
  vm.runInNewContext(outputText, context);
  return context.module.exports;
}
const order = evaluate(fs.readFileSync(path.join(root, 'src/data/eventOrder.ts'), 'utf8'));
function functionIn(file, name, globals = {}) {
  const text = fs.readFileSync(path.join(root, file), 'utf8');
  const ast = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  let expression;
  function visit(node) {
    if (ts.isFunctionDeclaration(node) && node.name?.text === name) expression = `${node.getText(ast)}\nmodule.exports = ${name};`;
    if (ts.isVariableDeclaration(node) && node.name.getText(ast) === name) expression = `module.exports = (${node.initializer.getText(ast)});`;
    ts.forEachChild(node, visit);
  }
  visit(ast);
  assert.ok(expression, name);
  return evaluate(expression, globals);
}

function testOrderAndFilters() {
  check(order.parseEventOrder(null), null, 'Missing order uses default dates');
  check(order.parseEventOrder('not json'), null, 'Malformed order falls back');
  check(order.parseEventOrder({ entries: [] }), null, 'Unexpected object does not override date order');
  check(order.parseEventOrder('["b","a","b","",7,"  c "]'), ['b', 'a', 'c'], 'Saved IDs are unique, trimmed strings');
  const events = [
    { id: 'u2', status: 'upcoming', startDate: '2027-12-08', year: 2027, title: 'Taller', organizer: 'UIT', location: 'Lima' },
    { id: 'p2', status: 'past', startDate: '2025-06-14', year: 2025, title: 'Evento anterior', organizer: 'UIT', location: 'Bogotá' },
    { id: 'u1', status: 'upcoming', startDate: '2027-01-03', year: 2027, title: 'Reunión de cooperación', organizer: 'REGULATEL', location: 'La Paz' },
    { id: 'p1', status: 'past', startDate: '2026-10-16', year: 2026, title: 'Cumbre', organizer: 'ASIET', location: 'Montevideo' },
  ];
  const filter = functionIn('src/pages/Eventos.tsx', 'filterAndSort', { normalizeEvent: event => event });
  const ids = events => events.map(event => event.id);
  const all = filter(events, 'all', 'all', '');
  check(ids(all), ['u1', 'u2', 'p1', 'p2'], 'Default remains chronological with upcoming first');
  check(ids(filter(events, 'past', 'all', '')), ['p1', 'p2'], 'Past events remain newest first by default');
  check(ids(order.applyEventOrder(all, null)), ids(all), 'No saved manual order preserves default');
  check(ids(order.applyEventOrder(all, [])), ids(all), 'Empty saved manual order restores default');
  const saved = ['p2', 'hidden', 'u2', 'p1', 'u1'];
  check(ids(order.applyEventOrder(filter(events, 'past', 'all', ''), saved)), ['p2', 'p1'], 'Saved order applies within a tab');
  check(ids(order.applyEventOrder(filter(events, 'all', '2027', ''), saved)), ['u2', 'u1'], 'Saved order applies within year filter');
  check(ids(filter(events, 'all', 'all', 'reunion')), ['u1'], 'Search matches Spanish diacritics');
  check(ids(filter(events, 'past', 'all', 'bogota')), ['p2'], 'Location search matches Spanish diacritics');
  check(order.completeEventOrder(ids(all), saved), saved, 'IDs absent from current view remain reserved');
  check(order.completeEventOrder(['new'], saved), [...saved, 'new'], 'Newly created event is appended without losing hidden IDs');
  check(order.moveVisibleEvent(['u1','p1','u2','p2','hidden'], ['p1','p2'], 'p2', 'p1'), ['u1','p2','u2','p1','hidden'], 'Moving a filtered card changes only visible slots');
  check(order.moveVisibleEvent(['a','b'], ['a','b'], 'bad', 'b'), ['a','b'], 'Unknown source does nothing');
  check(order.moveVisibleEvent(['a','b'], ['a','b'], 'a', 'a'), ['a','b'], 'Dropping on self does nothing');

  const baseline = ['a','b','hidden','c','d'];
  for (let mask = 1; mask < 32; mask++) {
    const visible = baseline.filter((_, index) => (mask & (1 << index)) !== 0);
    for (const from of visible) for (const to of visible) {
      const result = order.moveVisibleEvent(baseline, visible, from, to);
      check([...result].sort(), [...baseline].sort(), 'Every drag keeps the exact permutation');
      for (let index = 0; index < baseline.length; index++) {
        if (!visible.includes(baseline[index])) check(result[index], baseline[index], 'Filtered or unpublished positions never move');
      }
    }
  }
}

async function testSaving() {
  const preview = { eventOrder: ['b','a','hidden'] };
  const writes = [], history = [], errors = [];
  let saved = ['a','hidden','b','new-hidden'];
  let failRead = false, failWrite = false, clears = 0, refreshes = 0;
  const busy = { current: false };
  const api = { settings: {
    get: async () => failRead ? { ok: false, error: 'read failed' } : { ok: true, data: { value: clean(saved) } },
    set: async (key, value) => {
      if (failWrite) return { ok: false, error: 'write failed' };
      writes.push({ key, value: clean(value) }); saved = clean(value);
      return { ok: true, data: { value } };
    },
  }};
  const createSave = extras => functionIn('src/pages/Eventos.tsx', 'saveOrder', {
    orderDirty: true, draftOrder: preview.eventOrder, orderBusy: busy,
    setSavingOrder: () => {}, setOrderError: value => errors.push(value), setOrderMessage: () => {},
    api, ...order, recordPersistedChange: value => history.push(value), notifyCmsSaved: () => {},
    refetchSettings: async () => refreshes++, clearPreview: () => clears++, ...extras,
  });
  const before = clean(saved);
  await createSave()();
  check(saved, ['b','a','hidden','new-hidden'], 'Saving preserves IDs added or hidden since page load');
  check([writes.length, history.length, clears, refreshes, busy.current], [1,1,1,1,false], 'Save awaits persistence then records history and clears draft');
  await history[0].undo();
  check(saved, before, 'Undo restores original manual order');
  await history[0].redo();
  check(saved, ['b','a','hidden','new-hidden'], 'Redo restores new manual order');
  const previousWrites = writes.length;
  const previousClears = clears;
  failRead = true;
  await createSave()();
  check([writes.length,clears,errors.at(-1),busy.current], [previousWrites,previousClears,'read failed',false], 'Read failure preserves draft and enables retry');
  failRead = false; failWrite = true;
  await createSave()();
  check([writes.length,clears,errors.at(-1),busy.current], [previousWrites,previousClears,'write failed',false], 'Write failure preserves draft and enables retry');
  failWrite = false;
  await createSave({ draftOrder: [] })();
  check(saved, [], 'Returning to date order persists an explicit reset');
  const resetHistory = history.at(-1);
  await resetHistory.undo();
  check(saved, ['b','a','hidden','new-hidden'], 'Reset to chronology can be undone');
  const noOpWrites = writes.length;
  await createSave({ orderDirty: false })();
  await createSave({ draftOrder: undefined })();
  busy.current = true;
  await createSave()();
  check(writes.length, noOpWrites, 'Unchanged, absent, or busy draft never causes a duplicate save');
}

async function testAdminPublication() {
  const event = { id: 'event', published: true, imageUrl: '/photo.jpg', attachments: [{ id: 'document', url: '/file.pdf' }] };
  const original = clean(event);
  const updates = [], messages = [], errors = [];
  const eventBusy = { current: false };
  let fail = false;
  const action = functionIn('src/pages/admin/AdminEventos.tsx', 'changePublication', {
    eventBusy, setBusyEventId: () => {}, setUrlError: value => errors.push(value),
    updateEvent: async (id, patch) => {
      if (fail) throw new Error('publication failed');
      updates.push({ id, patch });
    },
    setSuccessMessage: value => messages.push(value), notifyCmsSaved: () => {},
  });
  await action(event);
  check(updates, [{ id: 'event', patch: { published: false } }], 'Admin withdraw changes only published state');
  check(event, original, 'Withdrawal leaves every image and attachment intact');
  await action({ ...event, published: false });
  check(updates.at(-1), { id: 'event', patch: { published: true } }, 'Admin can republish an unpublished event');
  fail = true;
  await action(event);
  check([updates.length, errors.at(-1), eventBusy.current], [2, 'publication failed', false], 'Admin failure does not report success and releases retry');
  const entered = [];
  const edit = functionIn('src/pages/admin/AdminEventos.tsx', 'openEdit', { enter: route => entered.push(route) });
  edit({ id: 'event/with space' });
  check(entered, ['/eventos/event%2Fwith%20space'], 'Admin Editar opens the event page in edit mode');
}

(async () => {
  testOrderAndFilters();
  await testSaving();
  await testAdminPublication();
  console.log(`PASS: ${checks} event order/publication checks; all requests mocked, no database changes.`);
})().catch(error => { console.error(error); process.exitCode = 1; });

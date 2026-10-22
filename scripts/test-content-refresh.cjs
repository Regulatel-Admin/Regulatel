/** Network responses are mocked; no browser, .env, external requests or database changes. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
const file = 'src/contexts/AdminDataContext.tsx';
const source = fs.readFileSync(path.join(root, file), 'utf8');
const ast = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
const clean = value => JSON.parse(JSON.stringify(value));
let checks = 0;
function check(actual, expected, message) { assert.deepEqual(clean(actual), clean(expected), message); checks++; }
function extract(name, globals) {
  let expression;
  function visit(node) {
    if (ts.isFunctionDeclaration(node) && node.name?.text === name) expression = `${node.getText(ast)}\nmodule.exports = ${name};`;
    if (ts.isVariableDeclaration(node) && node.name.getText(ast) === name && node.initializer && ts.isCallExpression(node.initializer)) {
      expression = `module.exports = (${node.initializer.arguments[0].getText(ast)});`;
    }
    ts.forEachChild(node, visit);
  }
  visit(ast);
  assert.ok(expression, name);
  const { outputText } = ts.transpileModule(expression, { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS } });
  const context = { exports: {}, module: { exports: {} }, ...globals };
  vm.runInNewContext(outputText, context);
  return context.module.exports;
}
function deferred() { let resolve; const promise = new Promise(done => { resolve = done; }); return { promise, resolve }; }
const ok = data => ({ ok: true, data });
const fail = { ok: false, error: 'temporary network failure' };

(async () => {
  const state = {
    adminNews: [], events: [], adminDocuments: [], newsLoaded: false, eventsLoaded: false, documentsLoaded: false,
    contentSource: 'loading', contentError: null, cifras: {},
  };
  const contentRequest = { current: 0 }, databaseSeen = { current: false };
  const update = key => value => { state[key] = typeof value === 'function' ? value(state[key]) : value; };
  let response = { news: fail, events: fail, documents: fail, cifras: fail, settings: fail };
  const api = {
    news: { list: () => Promise.resolve(response.news) },
    events: { list: () => Promise.resolve(response.events) },
    documents: { list: () => Promise.resolve(response.documents) },
    cifras: { list: () => Promise.resolve(response.cifras) },
    settings: { getAll: () => Promise.resolve(response.settings) },
  };
  const refresh = extract('checkContentSource', {
    api, contentRequest, databaseSeen, normalizeEvent: value => value,
    setAdminNewsState: update('adminNews'), setEventsState: update('events'), setAdminDocumentsState: update('adminDocuments'),
    setNewsLoaded: update('newsLoaded'), setEventsLoaded: update('eventsLoaded'), setDocumentsLoaded: update('documentsLoaded'),
    setAdminCifrasPorAnoState: update('cifras'), setContentSource: update('contentSource'), setContentError: update('contentError'),
  });
  const hiddenEvent = { id: 'hidden-event', published: false, startDate: '2026-10-16' };
  const visibleEvent = { id: 'visible-event', published: true, startDate: '2026-10-15' };
  const hiddenNews = { id: 'hidden-news', slug: 'hidden-news', title: 'Unpublished', date: '2026-10-16', published: false };
  const visibleNews = { id: 'visible-news', slug: 'visible-news', title: 'Published', date: '2026-10-15', published: true };
  const document = { id: 'document', title: 'Retained file', category: 'memoria', coverImage: '/keep.png' };
  const common = { AdminDataContext: {}, useContext: () => state, useSiteEdit: () => ({ enabled: false, preview: {} }) };
  const events = extract('useEvents', {
    ...common, normalizeEvent: value => value,
    EVENTS_SEED: [{ id: hiddenEvent.id, published: true }],
    SEMANA_RESOURCE_EVENTS: [{ id: hiddenEvent.id, published: true }, { id: 'static-materials', published: true }],
  });
  const news = extract('useMergedNews', {
    ...common, homeNews: [{ slug: hiddenNews.slug, title: 'Static original', date: '2026-10-16' }], noticiasData: [],
  });
  const documents = extract('useMergedGestionDocuments', {
    ...common, useRevistaDigitalEditions: () => [], getPublishedRevistaEditions: value => value,
    revistaEditionToGestionDocument: value => value, gestionDocuments: [],
  });

  await refresh();
  check([state.newsLoaded, state.eventsLoaded, state.documentsLoaded], [false,false,false], 'Initial errors cannot mark content confirmed');
  check([events(),news(),documents()], [[],[],[]], 'Initial errors cannot restore public static content');
  check(state.contentSource, 'legacy', 'First total outage is reported');
  check(Boolean(state.contentError), true, 'Outage exposes a retryable error');

  response.settings = ok({});
  await refresh();
  check(state.contentSource, 'database', 'Settings availability does not masquerade as complete content');
  check([events(),news()], [[],[]], 'Settings alone cannot reveal events or news without tombstones');

  response = { news: ok([hiddenNews,visibleNews]), events: ok([hiddenEvent,visibleEvent]), documents: ok([document]), cifras: ok({}), settings: ok({}) };
  await refresh();
  check([state.newsLoaded,state.eventsLoaded,state.documentsLoaded], [true,true,true], 'Only complete valid lists prime content');
  check(events().map(value => value.id), ['visible-event','static-materials'], 'Confirmed tombstone suppresses matching static event');
  check(news().map(value => value.slug), ['visible-news'], 'Confirmed tombstone suppresses matching static news');
  check(documents(), [document], 'Confirmed document data is available');
  check(state.contentError, null, 'Successful recovery clears the error');
  const snapshot = clean(state);
  response = { news: fail, events: fail, documents: fail, cifras: fail, settings: fail };
  await refresh();
  check([state.adminNews,state.events,state.adminDocuments], [snapshot.adminNews,snapshot.events,snapshot.adminDocuments], 'Later errors preserve all previous arrays');
  check([state.newsLoaded,state.eventsLoaded,state.documentsLoaded,state.contentSource], [true,true,true,'database'], 'Later errors preserve loaded status and source');
  check(events().map(value => value.id), ['visible-event','static-materials'], 'No event resurrection after total outage');
  check(news().map(value => value.slug), ['visible-news'], 'No news resurrection after total outage');
  check(documents(), [document], 'No document loss after total outage');

  response = { news: ok({ error: 'wrong shape' }), events: ok(null), documents: ok('HTML'), cifras: fail, settings: ok({}) };
  await refresh();
  check([state.adminNews,state.events,state.adminDocuments], [snapshot.adminNews,snapshot.events,snapshot.adminDocuments], 'HTTP success with malformed data cannot erase content');
  check(Boolean(state.contentError), true, 'Malformed content reports an error');

  const pending = deferred();
  response = { news: ok([]), events: pending.promise, documents: ok([]), cifras: fail, settings: ok({}) };
  const oldRefresh = refresh();
  response = { news: ok([hiddenNews,visibleNews]), events: ok([hiddenEvent,visibleEvent]), documents: ok([document]), cifras: fail, settings: ok({}) };
  await refresh();
  pending.resolve(ok([]));
  await oldRefresh;
  check([state.adminNews,state.events,state.adminDocuments], [snapshot.adminNews,snapshot.events,snapshot.adminDocuments], 'Delayed older request cannot overwrite a newer publication snapshot');
  check(events().some(value => value.id === hiddenEvent.id), false, 'Out-of-order completion cannot revive hidden event');

  const gate = deferred();
  const recheck = extract('recheckContentSource', { setContentSource: update('contentSource'), checkContentSource: () => gate.promise });
  const rechecking = recheck();
  check(state.contentSource, 'database', 'Manual retry does not briefly switch confirmed content to static mode');
  gate.resolve(); await rechecking;

  response = { news: ok([]), events: ok([]), documents: ok([]), cifras: ok({}), settings: ok({}) };
  await refresh();
  check([state.adminNews,state.events,state.adminDocuments], [[],[],[]], 'A successful empty list remains a real empty snapshot');
  check([state.newsLoaded,state.eventsLoaded,state.documentsLoaded], [true,true,true], 'Empty successful lists are confirmed');
  console.log(`PASS: ${checks} content refresh/publication checks; all API results mocked, no real requests.`);
})().catch(error => { console.error(error); process.exitCode = 1; });

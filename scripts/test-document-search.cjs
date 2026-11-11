/** Pure index and real autocomplete handlers; no browser, credentials or network. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
const cache = new Map();
let checks = 0;
const clean = value => JSON.parse(JSON.stringify(value));
function check(actual, expected, message) { assert.deepEqual(clean(actual), clean(expected), message); checks++; }
function evaluate(source, requireModule, globals = {}) {
  const module = { exports: {} };
  const code = ts.transpileModule(source, { compilerOptions: {
    target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true,
  } }).outputText;
  vm.runInNewContext(code, { module, exports: module.exports, require: requireModule, ...globals });
  return module.exports;
}
function load(file) {
  let resolved = path.resolve(root, file);
  if (!path.extname(resolved)) resolved += '.ts';
  if (cache.has(resolved)) return cache.get(resolved);
  const source = fs.readFileSync(resolved, 'utf8');
  const result = resolved.endsWith('.json') ? JSON.parse(source) : evaluate(source, id => {
    if (id.startsWith('@/')) return load('src/' + id.slice(2));
    if (id.startsWith('.')) return load(path.resolve(path.dirname(resolved), id));
    throw new Error(`Unexpected dependency: ${id}`);
  });
  cache.set(resolved, result);
  return result;
}
const { buildDocumentSearchDocs } = load('src/lib/documentSearch.ts');
const { mergeSearchNews, searchSiteDocs } = load('src/lib/siteSearch.ts');
const { SEMANA_RESOURCE_GROUPS } = load('src/data/eventMaterials.ts');
const { SEMANA_REGULATEL_2026_NEWS_SLUG } = load('src/data/semanaRegulatel2026.ts');
const event = (extra = {}) => ({
  id: 'published-event', title: 'Published summit', organizer: 'Forum', location: 'City',
  year: 2030, startDate: '2030-04-12', endDate: null, status: 'upcoming',
  registrationUrl: null, detailsUrl: null, isFeatured: false, tags: [],
  createdAt: '', updatedAt: '', ...extra,
});
const emptyResources = { programs: [], documents: [], photos: [], survey: '', taxi: '' };
const fixture = (extra = {}) => buildDocumentSearchDocs({ documents: [], news: [], events: [], ...extra });

check(fixture(), [], 'No documents are invented for an empty source');
const management = { id: 'acta +1', title: 'Acta reservada', category: 'planes-actas', url: 'https://secret.invalid/minutes.pdf', year: '2030' };
const managementDocs = fixture({ documents: [management] });
check(managementDocs.map(doc => [doc.type, doc.title, doc.url]),
  [['documento', management.title, '/gestion?tipo=planes-actas&id=acta%20%2B1']],
  'Management suggestions link to the existing internal document card and its access controls');
check(JSON.stringify(managementDocs).includes(management.url), false, 'Restricted management file URLs never enter the public index');

const sources = {
  documents: [management],
  news: [
    { slug: 'published-news', title: 'Published article', attachments: [{ id: 'release', title: 'Press release', url: '/files/release.docx' }] },
    { slug: 'hidden-news', title: 'Hidden article', published: false, attachments: [{ title: 'Hidden release', url: '/hidden.pdf' }] },
    { slug: 'blocks-news', title: 'Article with blocks', attachments: [{ title: 'Removed legacy attachment', url: '/removed.pdf' }],
      contentBlocks: [{ id: 'doc', type: 'document', title: 'Article document', url: '/files/block.pdf' }, { id: 'image', type: 'image', title: 'Not a document', url: '/image.png' }] },
  ],
  events: [event({
    attachments: [{ id: 'same-program', title: 'Programme copy', url: '/files/programme.pdf' }],
    resources: { ...emptyResources,
      programs: [{ title: 'Summit programme', url: '/files/programme.pdf' }],
      documents: [{ title: 'Private report', url: '', private: true, locked: true, description: 'https://secret.invalid/report.pdf' }],
      customSections: [{ id: 'custom-docs', title: 'Materials', blocks: [{ id: 'custom-file', type: 'document', title: 'Custom document', url: '/files/custom.pdf' }] }],
    },
    contentBlocks: [{ id: 'event-file', type: 'document', title: 'Event block document', url: '/files/event-block.pdf' }],
  }), event({ id: 'hidden-event', published: false, attachments: [{ title: 'Hidden event document', url: '/hidden-event.pdf' }] })],
};
const docs = fixture(sources);
check(docs.map(doc => doc.title), [management.title, 'Press release', 'Article document', 'Summit programme', 'Private report', 'Custom document', 'Event block document'],
  'Only documents rendered on published pages are indexed, including resources, programmes, attachments and document blocks');
check(docs.every(doc => doc.type === 'documento'), true, 'Document scope excludes articles, events, images and authorities');
check(docs.find(doc => doc.title === 'Private report').url, '/eventos/published-event', 'A redacted private document leads to its parent access request page');
check(JSON.stringify(docs).includes('secret.invalid'), false, 'Private resource URLs and descriptions are not copied into snippets or destinations');
const authenticatedPrivate = fixture({ events: [event({ resources: { ...emptyResources,
  documents: [{ title: 'Protected report', private: true, url: 'https://secret.invalid/unredacted.pdf' }],
} })] });
check([authenticatedPrivate[0].url, JSON.stringify(authenticatedPrivate).includes('secret.invalid')], ['/eventos/published-event', false],
  'Even an authorised source containing a private file URL only produces its parent page destination');
check(docs.filter(doc => doc.title === 'Press release').map(doc => doc.url), ['/noticias/published-news'], 'News attachments lead to their published article');
check(docs.filter(doc => doc.url === '/eventos/published-event').length, 4, 'Duplicate attachments and programme files appear only once');
check(new Set(docs.map(doc => doc.id)).size, docs.length, 'Every suggestion has a unique ID');
check(searchSiteDocs(docs, 'programme').map(doc => doc.type), ['documento'], 'The shared search engine searches the document-only index');

const duplicate = fixture({ documents: [management], news: [{ slug: 'other', title: 'Other', attachments: [{ id: 'duplicate', title: 'Same file', url: management.url }] }] });
check(duplicate.length, 1, 'The same file shared across content sources is deduplicated');
const reserved = mergeSearchNews([{ slug: 'hidden', title: 'Static article', attachments: [{ title: 'Suppressed', url: '/suppressed.pdf' }] }], [{ slug: 'hidden', title: 'CMS draft', published: false }], true);
check(fixture({ news: reserved }), [], 'An unpublished CMS override prevents static article documents from resurfacing');
check(fixture({ news: mergeSearchNews(sources.news, [], false) }), [], 'News documents wait for a confirmed CMS snapshot');
check(fixture({ news: [{ slug: SEMANA_REGULATEL_2026_NEWS_SLUG, title: 'Week', attachments: [] }] }), [], 'An explicit empty article attachment list removes static fallback documents');
check(fixture({ news: [{ slug: 'cleared', title: 'Cleared', attachments: [{ title: 'Old', url: '/old.pdf' }], contentBlocks: [] }] }), [], 'An explicit empty article block list suppresses legacy attachments');
const fallbackEventId = Object.keys(SEMANA_RESOURCE_GROUPS)[0];
check(fixture({ events: [event({ id: fallbackEventId })] }).length > 0, true, 'Existing event materials are available when no CMS resource override exists');
check(fixture({ events: [event({ id: fallbackEventId, resources: emptyResources, attachments: [] })] }), [], 'An explicit empty event resource override does not revive original materials');
check(fixture({ news: [sources.news[0]], localize: text => `EN:${text}` }).map(doc => [doc.title, doc.content, doc.url]),
  [['EN:Press release', 'EN:Press release · EN:Published article', '/noticias/published-news']], 'Document labels and parent context localise without changing destinations');

const componentSource = fs.readFileSync(path.join(root, 'src/components/SiteSearchAutocomplete.tsx'), 'utf8');
const ast = ts.createSourceFile('SiteSearchAutocomplete.tsx', componentSource, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
function handler(name, globals) {
  let text;
  function visit(node) {
    if (ts.isVariableDeclaration(node) && node.name.getText(ast) === name) text = `module.exports = ${node.initializer.getText(ast)};`;
    ts.forEachChild(node, visit);
  }
  visit(ast);
  assert.ok(text, name);
  return evaluate(text, () => { throw new Error('Unexpected handler import'); }, globals);
}
const selected = [], navigated = [], opened = [];
let closed = 0, notified = 0;
const select = handler('handleResultClick', {
  navigate: url => navigated.push(url), window: { open: (...args) => opened.push(args) },
  closeDropdown: () => closed++, onResultSelect: () => notified++,
});
select(managementDocs[0]);
check([navigated, opened, closed, notified], [[managementDocs[0].url], [], 1, 1], 'Selecting a document navigates internally and closes the mobile panel callback');
select({ url: 'https://public.invalid/page' });
check(opened, [['https://public.invalid/page', '_blank', 'noopener,noreferrer']], 'Existing site-search external selection behaviour remains available');

function keyFixture(extra = {}) {
  const state = { prevented: false, closed: 0, active: null, open: null, selections: [] };
  const globals = { open: true, results: [managementDocs[0]], activeIndex: -1, value: 'minutes',
    debounceRef: { current: null }, clearTimeout: () => {},
    closeDropdown: () => state.closed++, setOpen: value => { state.open = value; },
    setActiveIndex: value => { state.active = value; }, runSearch: () => [managementDocs[0]],
    handleResultClick: result => state.selections.push(result.url), ...extra };
  const onKeyDown = handler('handleInputKeyDown', globals);
  return { state, press: (key, isComposing = false) => onKeyDown({ key, nativeEvent: { isComposing }, preventDefault: () => { state.prevented = true; } }) };
}
const enter = keyFixture(); enter.press('Enter');
check([enter.state.prevented, enter.state.closed, enter.state.selections], [false, 1, []], 'Enter without an active suggestion leaves the original form submission intact');
const chosen = keyFixture({ activeIndex: 0 }); chosen.press('Enter');
check([chosen.state.prevented, chosen.state.selections], [true, [managementDocs[0].url]], 'Enter on an active suggestion selects it instead of submitting the form');
const arrow = keyFixture({ open: false }); arrow.press('ArrowDown');
check([arrow.state.prevented, arrow.state.active, arrow.state.open], [true, 0, true], 'ArrowDown opens suggestions and selects the first result');
const escape = keyFixture(); escape.press('Escape');
check([escape.state.prevented, escape.state.closed], [true, 1], 'Escape closes the dropdown without clearing or submitting the query');
const composing = keyFixture({ activeIndex: 0 }); composing.press('Enter', true);
check([composing.state.prevented, composing.state.selections], [false, []], 'IME composition Enter is not intercepted');

const cancelled = [], closing = [], pendingSearch = { current: 42 };
handler('closeDropdown', { debounceRef: pendingSearch, clearTimeout: timer => cancelled.push(timer),
  setOpen: value => closing.push(['open', value]), setActiveIndex: value => closing.push(['active', value]) })();
check([cancelled, pendingSearch.current, closing], [[42], null, [['open', false], ['active', -1]]],
  'Closing cancels a pending debounce so Escape or selection cannot reopen old results');
function jsxHandler(name, globals) {
  let expression;
  function visit(node) {
    if (!expression && ts.isJsxAttribute(node) && node.name.getText(ast) === name) expression = node.initializer.expression.getText(ast);
    ts.forEachChild(node, visit);
  }
  visit(ast); assert.ok(expression, name);
  return evaluate(`module.exports = ${expression};`, () => { throw new Error('Unexpected JSX handler import'); }, globals);
}
const changed = [], cleared = [], pointer = [];
jsxHandler('onChange', { onChange: value => changed.push(value), closeDropdown: () => cleared.push('closed'), setResults: value => cleared.push(value) })({ target: { value: '' } });
check([changed, cleared], [[''], ['closed', []]], 'The native search clear control clears both the controlled value and old suggestions');
jsxHandler('onMouseDown', { r: managementDocs[0], handleResultClick: result => pointer.push(result.url) })({ preventDefault: () => pointer.push('prevented') });
check(pointer, ['prevented', managementDocs[0].url], 'Mouse selection prevents input blur and selects the same safe destination as keyboard selection');

let instance = 0;
const react = {
  useRef: value => ({ current: value }), useState: value => [typeof value === 'function' ? value() : value, () => {}],
  useEffect: () => {}, useMemo: fn => fn(), useCallback: fn => fn, useId: () => `:instance-${instance++}:`,
};
const jsx = (type, props) => ({ type, props });
const component = evaluate(componentSource, id => ({
  react, 'react/jsx-runtime': { jsx, jsxs: jsx }, 'react-router-dom': { useNavigate: () => () => {} },
  'react-i18next': { useTranslation: () => ({ t: key => key, i18n: { language: 'en' } }) },
  '@/lib/siteSearch': { buildSearchDocs: () => [], mergeSearchNews: () => [], searchSiteDocs: () => [], getTypeLabel: () => '' },
  '@/lib/documentSearch': { buildDocumentSearchDocs: () => [], gestionDocumentSearchPath: () => '' }, '@/lib/publishedContent': { localizePublishedText: text => text },
  '@/contexts/AdminDataContext': { useAdminData: () => ({ adminNews: [], newsLoaded: true }), useEvents: () => [], useMergedGestionDocuments: () => [] },
  '@/contexts/SiteSettingsContext': { useAutoridadesActuales: () => [] }, '@/pages/noticiasData': { noticiasData: [] },
  '@/hooks/useLocalizedNews': { localizeNoticiaData: value => value, localizeNewsFields: value => value },
  '@/hooks/useLocalizedEvents': { useLocalizedEvents: value => value },
})[id]).default;
const desktop = component({ scope: 'documents', value: '', onChange: () => {} });
const mobile = component({ scope: 'documents', value: '', onChange: () => {}, compact: true });
const desktopInput = desktop.props.children[0], mobileInput = mobile.props.children[0];
check(desktopInput.props['aria-controls'] !== mobileInput.props['aria-controls'], true, 'Desktop and mobile autocomplete instances have distinct listbox IDs');
check(desktopInput.props['aria-label'], 'common.topbar.searchDocumentsAria', 'Document scope uses the existing translated accessible label');

console.log(`PASS: ${checks} document search and autocomplete checks; no real requests.`);

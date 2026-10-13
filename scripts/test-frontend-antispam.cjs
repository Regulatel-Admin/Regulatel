const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const ts = require(root + '/node_modules/typescript');
const copy = new Proxy({}, { get: (_, key) => String(key) });
const tick = async () => { for (let i = 0; i < 8; i++) await Promise.resolve(); };
function setup(file, seed = [], overrides = {}) {
  const states = [...seed], cleanups = [], changes = [], rendered = [], removed = [], timers = new Map(), scripts = [];
  let stateIndex = 0, nextTimer = 0;
  const runtime = { render: (node, opts) => { rendered.push(opts); return 'widget-' + rendered.length; }, remove: (id) => removed.push(id) };
  const window = { turnstile: runtime, setTimeout: (cb) => { timers.set(++nextTimer, cb); return nextTimer; }, clearTimeout: (id) => timers.delete(id) };
  const api = overrides.api || { formSecurity: { config: async () => ({ ok: true, data: { siteKey: 'site-key', formToken: 'form-token', expiresAt: Date.now() + 60000 } }) } };
  const react = {
    useState: (initial) => { const i = stateIndex++; if (states[i] === undefined) states[i] = initial; return [states[i], (v) => { states[i] = typeof v === 'function' ? v(states[i]) : v; }]; },
    useRef: () => ({ current: {} }),
    useEffect: (fn) => { const cleanup = fn(); if (cleanup) cleanups.push(cleanup); },
  };
  const jsx = (type, props) => ({ type, props });
  const modules = {
    react, 'react/jsx-runtime': { jsx, jsxs: jsx, Fragment: 'Fragment' },
    'react-i18next': { useTranslation: () => ({ t: (key) => key, i18n: { language: 'es' } }) },
    'react-router-dom': { Link: 'Link', useSearchParams: () => [new URLSearchParams('token=confirmation-token')] },
    'lucide-react': new Proxy({}, { get: (_, key) => String(key) }),
    'framer-motion': { motion: new Proxy({}, { get: (_, key) => 'motion.' + String(key) }) },
    '@/components/PageHero': { default: 'PageHero' },
    '@/components/FormSecurity': { default: 'FormSecurity', emptyFormSecurity: { ready: false, formToken: '', turnstileToken: '' } },
    '@/lib/api': { api }, '@/lib/formSecurityMessages': { formSecurityMessages: () => copy },
  };
  const document = { getElementById: () => null, createElement: () => ({ remove() {} }), head: { appendChild: (s) => scripts.push(s) } };
  const exports = {};
  const context = { exports, require: (key) => { if (!(key in modules)) throw new Error('Unmocked module ' + key); return modules[key]; }, window, document, Date, Number, Math, Error, URLSearchParams, FormData: class { constructor(form) { this.form = form; } get(key) { return this.form.fields[key] || ''; } } };
  const code = ts.transpileModule(fs.readFileSync(root + '/' + file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2020 } }).outputText;
  vm.runInNewContext(code, context, { filename: file });
  const render = (props = {}) => { stateIndex = 0; return exports.default(props); };
  return { states, cleanups, changes, rendered, removed, timers, scripts, window, render, exports, api };
}
function find(node, predicate) {
  if (!node || typeof node !== 'object') return;
  if (predicate(node)) return node;
  const children = node.props?.children;
  for (const child of [children].flat(Infinity)) { const match = find(child, predicate); if (match) return match; }
}
const event = (fields, valid = true) => ({ preventDefault() {}, currentTarget: { fields, checkValidity: () => valid, reset() { this.didReset = true; } } });
(async () => {
  const security = setup('src/components/FormSecurity.tsx');
  security.render({ action: 'contact', onChange: (state) => security.changes.push(state) });
  await tick();
  assert.equal(security.rendered.length, 1);
  assert.equal(security.rendered[0].action, 'contact');
  assert.equal(security.rendered[0]['response-field'], false);
  security.rendered[0].callback('challenge-token');
  assert.equal(security.changes.at(-1).ready, true);
  assert.equal(security.changes.at(-1).formToken, 'form-token');
  security.rendered[0]['expired-callback']();
  assert.equal(security.changes.at(-1).ready, false);
  security.rendered[0].callback('fresh-challenge');
  security.timers.values().next().value();
  assert.equal(security.changes.at(-1).ready, false);
  security.cleanups[0]();
  assert.equal(security.removed[0], 'widget-1');
  const countAfterCleanup = security.changes.length;
  security.rendered[0].callback('late-token');
  assert.equal(security.changes.length, countAfterCleanup);

  let resolveConfig;
  const stale = setup('src/components/FormSecurity.tsx', [], { api: { formSecurity: { config: () => new Promise((r) => { resolveConfig = r; }) } } });
  stale.render({ action: 'subscribe', onChange: (state) => stale.changes.push(state) });
  stale.cleanups[0]();
  resolveConfig({ ok: true, data: { siteKey: 'key', formToken: 'stale', expiresAt: Date.now() + 60000 } });
  await tick();
  assert.equal(stale.rendered.length, 0);

  const retry = setup('src/components/FormSecurity.tsx');
  delete retry.window.turnstile;
  retry.render({ action: 'subscribe', onChange: (state) => retry.changes.push(state) });
  await tick();
  assert.equal(retry.scripts.length, 1);
  retry.scripts[0].onerror();
  await tick();
  assert.equal(retry.states[1], 'error');
  retry.cleanups[0]();
  retry.render({ action: 'subscribe', onChange: (state) => retry.changes.push(state) });
  await tick();
  assert.equal(retry.scripts.length, 2);
  retry.window.turnstile = { render: (node, opts) => { retry.rendered.push(opts); return 'retry-widget'; }, remove() {} };
  retry.scripts[1].onload();
  await tick();
  assert.equal(retry.rendered.length, 1);

  const ready = { ready: true, formToken: 'issued-form', turnstileToken: 'turnstile' };
  let sentContact;
  const contact = setup('src/pages/Contacto.tsx', [false, false, '', ready, 0], { api: { contact: { send: async (body) => { sentContact = body; return { ok: false, error: 'rejected' }; } } } });
  const contactTree = contact.render();
  const contactEvent = event({ name: 'Ana Pérez', email: 'ana@example.org', organization: 'Entidad', subject: 'Consulta', message: 'Mensaje institucional', website: '' });
  await find(contactTree, (n) => n.type === 'form').props.onSubmit(contactEvent);
  assert.equal(sentContact.formToken, 'issued-form');
  assert.equal(sentContact.turnstileToken, 'turnstile');
  assert.equal(contact.states[3].ready, false);
  assert.equal(contact.states[4], 1);
  assert.equal(contactEvent.currentTarget.didReset, undefined);

  let sentSubscribe;
  const subscribe = setup('src/pages/Subscribe.tsx', [true, 'ana@example.org', true, 'idle', '', ready, 0], { api: { subscribe: { send: async (body) => { sentSubscribe = body; return { ok: true, data: { ok: true } }; } } } });
  const subscribeTree = subscribe.render();
  await find(subscribeTree, (n) => n.type === 'form').props.onSubmit(event({ website: '' }));
  assert.equal(sentSubscribe.consent, true);
  assert.equal(subscribe.states[4], 'subscriptionPending');
  assert.equal(subscribe.states[5].ready, false);
  assert.equal(subscribe.states[6], 1);

  let confirmCalls = 0, confirmToken;
  const confirm = setup('src/pages/ConfirmSubscription.tsx', [], { api: { confirmSubscription: { confirm: async (token) => { confirmCalls++; confirmToken = token; return { ok: true, data: { ok: true } }; } } } });
  const confirmTree = confirm.render();
  await tick();
  assert.equal(confirmCalls, 0, 'GET/mount must not confirm');
  find(confirmTree, (n) => n.type === 'button').props.onClick();
  await tick();
  assert.equal(confirmCalls, 1);
  assert.equal(confirmToken, 'confirmation-token');
  assert.equal(confirm.states[0], 'success');
  console.log('PASS: widget callback/expiry/form expiry/cleanup, stale async mount, script failure/retry, consumed-token resets, consent/pending state, explicit confirmation only.');
})().catch((error) => { console.error(error); process.exitCode = 1; });

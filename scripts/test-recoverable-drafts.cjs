const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const exportsObject = {};
vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(root, 'src/lib/recoverableDrafts.ts'), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText, { exports: exportsObject });
const { DraftSession, draftKey, draftSignature, listDrafts, parseDraft, DraftConflictError } = exportsObject;
class Storage {
  data = new Map(); fail = false;
  get length() { return this.data.size; }
  key(i) { return [...this.data.keys()][i] ?? null; }
  getItem(key) { return this.data.get(key) ?? null; }
  setItem(key, value) { if (this.fail) throw new Error('Quota exceeded'); this.data.set(key, value); }
  removeItem(key) { if (this.fail) throw new Error('Storage unavailable'); this.data.delete(key); }
}
const storage = new Storage();
const baseline = { id: 'evt', title: 'Publicado', startDate: '2026-10-22', organizer: 'REGULATEL', location: 'Montevideo', description: 'Original', attachments: [{ id: 'doc', title: 'Mi archivo', url: '/original.docx' }] };
const edited = { ...baseline, title: 'Última letra á', description: 'Primero\nSegundo\n', attachments: [{ ...baseline.attachments[0], url: '/reemplazado.docx' }], contentBlocks: [{ id: 'txt', type: 'text', text: '' }], resources: { programs: [], documents: [], photos: [], sectionOrder: ['photos', 'documents'] } };
const record = { version: 1, identity: 'event:evt', kind: 'event', path: '/eventos/evt', label: edited.title, baseline: draftSignature(baseline), value: edited, savedAt: 12345 };
let checks = 0;
const check = (label, fn) => { fn(); checks++; console.log(`ok ${checks}: ${label}`); };
const key = draftKey('admin-a', record.identity);
let session = new DraftSession(storage, key, record.identity);
check('Opening an untouched editor creates no saved draft', () => assert.equal(session.read(), null));
check('Typing stores all raw text, replacements and intentional empty arrays', () => {
  session.write(record); assert.equal(storage.getItem(key), JSON.stringify(record));
  assert.equal(baseline.title, 'Publicado'); assert.equal(baseline.attachments[0].url, '/original.docx');
});
check('A new session after closing/reloading restores the full draft', () => {
  session = new DraftSession(storage, key, record.identity);
  assert.equal(JSON.stringify(session.read().value), JSON.stringify(edited));
});
check('Draft identity isolates different events', () => assert.equal(new DraftSession(storage, draftKey('admin-a','event:other'), 'event:other').read(), null));
check('Accounts on the same device cannot list another account drafts', () => assert.equal(listDrafts(storage,'admin-b').length, 0));
check('Drafts remain listed for the same account after sign-in', () => assert.equal(listDrafts(storage,'admin-a')[0].label, edited.title));
check('Published update timestamps and key ordering do not cause false conflicts', () => {
  assert.equal(draftSignature({title:'a',updatedAt:'1',nested:{b:2,a:1}}),draftSignature({nested:{a:1,b:2},title:'a',updatedAt:'2'}));
  assert.notEqual(draftSignature({title:'a'}),draftSignature({title:'b'}));
});
check('Event ordering is recovered exactly', () => {
  const order = { ...record, identity:'event-order', kind:'event-order', path:'/eventos?tab=todos', value:['c','a','b'] };
  new DraftSession(storage,draftKey('admin-a','event-order'),'event-order').write(order);
  assert.equal(JSON.stringify(new DraftSession(storage,draftKey('admin-a','event-order'),'event-order').read().value),'["c","a","b"]');
});
check('Two tabs cannot silently overwrite one another', () => {
  const second = new DraftSession(storage,key,record.identity);
  session.write({...record,value:{...edited,title:'Pestaña uno'},savedAt:12346});
  assert.throws(() => second.write({...record,value:{...edited,title:'Pestaña dos'}}),DraftConflictError);
  assert.equal(JSON.parse(storage.getItem(key)).value.title,'Pestaña uno');
  assert.equal(second.acceptLatest().value.title,'Pestaña uno');
});
check('Publishing in another tab cannot resurrect a removed draft', () => {
  const second = new DraftSession(storage,key,record.identity);
  session.write(null);
  assert.throws(() => second.write(record),DraftConflictError);
  assert.equal(storage.getItem(key),null);
});
check('Explicit conflict resolution permits keeping the chosen version', () => {
  session.acceptLatest(); session.write(record); assert.equal(session.read().value.title,edited.title);
});
check('Storage-full failures preserve the last successful version', () => {
  storage.fail=true;
  assert.throws(()=>session.write({...record,value:{...edited,title:'Nuevo texto'}}));
  assert.equal(session.read().value.title,edited.title);
  storage.fail=false;
  session.write({...record,value:{...edited,title:'Nuevo texto'}});
  assert.equal(session.read().value.title,'Nuevo texto');
});
check('Explicit successful publication/discard removes only its own draft', () => {
  session.write(null); assert.equal(storage.getItem(key),null);
  assert.equal(listDrafts(storage,'admin-a').length,1);
});
check('Malformed or foreign draft identities are rejected', () => {
  for (const raw of ['broken','null',JSON.stringify({...record,version:2}),JSON.stringify({...record,value:null}),JSON.stringify({...record,path:'//evil.invalid'})]) assert.throws(()=>parseDraft(raw,record.identity));
  assert.throws(()=>parseDraft(JSON.stringify(record),'event:other'));
});
check('Listing a damaged record does not delete it or prevent other recovery', () => {
  const brokenKey=draftKey('admin-a','broken'); storage.setItem(brokenKey,'broken');
  assert.equal(listDrafts(storage,'admin-a').length,1); assert.equal(storage.getItem(brokenKey),'broken');
});
check('News drafts retain partial document URLs without publishing or normalizing them', () => {
  const news={...record,identity:'news:new',kind:'news',path:'/noticias/nueva',value:{id:'',slug:'preview-news-new',title:'Borrador',date:'2026-10-22',excerpt:'',category:'Noticias',contentBlocks:[{id:'d',type:'document',url:'h',title:'Programa'}]}};
  const newsKey=draftKey('admin-a',news.identity); new DraftSession(storage,newsKey,news.identity).write(news);
  assert.equal(new DraftSession(storage,newsKey,news.identity).read().value.contentBlocks[0].url,'h');
});
console.log(`${checks} recoverable draft checks passed. No server requests or publication occurred.`);

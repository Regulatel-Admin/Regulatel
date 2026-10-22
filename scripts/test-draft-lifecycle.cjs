/** Run the real autosave hook with a deterministic effect host and browser storage. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
function load(file, requireFn, extra = {}) {
  const exports = {};
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(root,file),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{exports,require:requireFn,...extra});
  return exports;
}
const model = load('src/lib/recoverableDrafts.ts');
class Store {
  data = new Map(); failRead = false; failWrite = false;
  getItem(key) { if(this.failRead) throw Error('Storage blocked'); return this.data.get(key) ?? null; }
  setItem(key,value) { if(this.failWrite) throw Error('Quota'); this.data.set(key,value); }
  removeItem(key) { if(this.failWrite) throw Error('Quota'); this.data.delete(key); }
}
const baseline = { id:'event',title:'Publicado',startDate:'2026-10-22',organizer:'REGULATEL',location:'Uruguay',attachments:[] };
function host(storage, initial = baseline, enabled = true) {
  let slots=[],cursor=0,scheduled=[],changed=true,result;
  const events=new EventTarget(), document=new EventTarget(); document.visibilityState='visible';
  const window={localStorage:storage,addEventListener:events.addEventListener.bind(events),removeEventListener:events.removeEventListener.bind(events),dispatchEvent:events.dispatchEvent.bind(events)};
  const same=(a,b)=>a && b && a.length===b.length && a.every((v,i)=>Object.is(v,b[i]));
  const options={identity:'event:event',kind:'event',path:'/eventos/event',label:initial.title,value:initial,baseline,enabled,onRestore:value=>{options.value=value;changed=true;}};
  const react={
    useRef(value){const i=cursor++;return slots[i]??(slots[i]={current:value});},
    useState(value){const i=cursor++;if(!slots[i])slots[i]={value:typeof value==='function'?value():value};return [slots[i].value,next=>{const value=typeof next==='function'?next(slots[i].value):next;if(!Object.is(value,slots[i].value)){slots[i].value=value;changed=true;}}];},
    useCallback(fn,deps){const i=cursor++;if(!slots[i]||!same(slots[i].deps,deps))slots[i]={value:fn,deps};return slots[i].value;},
    useLayoutEffect(fn,deps){const i=cursor++;if(!slots[i]||!same(slots[i].deps,deps)){const old=slots[i];slots[i]={deps,cleanup:old?.cleanup};scheduled.push(()=>{old?.cleanup?.();slots[i].cleanup=fn();});}},
  };
  react.useEffect=react.useLayoutEffect;
  const hook=load('src/hooks/useRecoverableDraft.ts',name=>{
    if(name==='react')return react;
    if(name.includes('AuthContext'))return {useAuth:()=>({user:{id:'admin'},isAdmin:true})};
    if(name.includes('recoverableDrafts'))return model;
    throw Error(name);
  },{window,document,Event}).useRecoverableDraft;
  function run(){changed=true;let turns=0;while(changed){assert.ok(++turns<40,'Hook must settle, including on storage errors');changed=false;cursor=0;scheduled=[];options.baseline={...options.baseline};result=hook(options);for(const effect of scheduled)effect();}return result;}
  return {options,run,get result(){return result;},edit(value){options.value=value;options.label=value.title;return run();},unmount(){for(const slot of slots)slot?.cleanup?.();},leave(){const event=new Event('beforeunload',{cancelable:true});events.dispatchEvent(event);return event.defaultPrevented;}};
}
let count=0;function check(name,fn){fn();count++;console.log(`ok ${count}: ${name}`);}
check('Reload restores last input, without blur or any API',()=>{
  const storage=new Store();let editor=host(storage);editor.run();assert.equal(storage.data.size,0);
  editor.edit({...baseline,title:'Último carácter ñ'});assert.ok(editor.result.savedAt);assert.equal(editor.leave(),false);editor.unmount();
  editor=host(storage);editor.run();assert.equal(editor.options.value.title,'Último carácter ñ');assert.equal(editor.result.recovered,true);
});
check('A public page never restores a private draft',()=>{
  const storage=new Store();const edit=host(storage);edit.run();edit.edit({...baseline,title:'Privado'});edit.unmount();
  const publicPage=host(storage,baseline,false);publicPage.run();assert.equal(publicPage.options.value.title,'Publicado');assert.equal(publicPage.result.recovered,false);
});
check('Storage quota retains old content, warns on leave, and retries current text',()=>{
  const storage=new Store();const edit=host(storage);edit.run();edit.edit({...baseline,title:'Anterior'});storage.failWrite=true;
  edit.edit({...baseline,title:'Texto aún no guardado'});assert.ok(edit.result.error);assert.equal(edit.leave(),true);
  storage.failWrite=false;edit.result.retry();edit.run();assert.equal(edit.result.error,'');assert.equal(edit.leave(),false);
  assert.equal(JSON.parse([...storage.data.values()][0]).value.title,'Texto aún no guardado');
});
check('Retry after blocked initial storage retains text typed during the failure',()=>{
  const storage=new Store();const old=host(storage);old.run();old.edit({...baseline,title:'Viejo borrador'});old.unmount();
  storage.failRead=true;const edit=host(storage);edit.run();edit.edit({...baseline,title:'Más reciente sin acceso al almacenamiento'});
  storage.failRead=false;edit.result.retry();edit.run();assert.equal(edit.options.value.title,'Más reciente sin acceso al almacenamiento');
  assert.equal(JSON.parse([...storage.data.values()][0]).value.title,edit.options.value.title);
});
check('Corrupt saved data is retained instead of silently overwritten',()=>{
  const storage=new Store();const key=model.draftKey('admin','event:event');storage.setItem(key,'broken');
  const edit=host(storage);edit.run();edit.edit({...baseline,title:'En memoria'});assert.ok(edit.result.error);assert.equal(storage.getItem(key),'broken');
});
check('Discard and successful publication clear only after their explicit action',()=>{
  const storage=new Store();const edit=host(storage);edit.run();edit.edit({...baseline,title:'Pendiente'});edit.result.discard();edit.run();
  assert.equal(edit.options.value.title,baseline.title);assert.equal(storage.data.size,0);
  const saved={...baseline,title:'Publicado por clic'};edit.edit(saved);edit.result.clear(saved);edit.options.baseline=saved;edit.run();assert.equal(storage.data.size,0);
});
check('Changed public revision is flagged while the complete draft is recovered',()=>{
  const storage=new Store();const edit=host(storage);edit.run();edit.edit({...baseline,title:'Borrador privado'});edit.unmount();
  const next=host(storage);next.options.baseline={...baseline,title:'Otra publicación'};next.options.value=next.options.baseline;next.run();
  assert.equal(next.result.changedPublished,true);assert.equal(next.options.value.title,'Borrador privado');
});
check('Conflicting tabs can recover the latest draft without overwriting it',()=>{
  const storage=new Store();const a=host(storage);a.run();a.edit({...baseline,title:'Inicio'});const b=host(storage);b.run();
  a.edit({...baseline,title:'Primera pestaña'});b.edit({...baseline,title:'Segunda pestaña'});assert.equal(b.result.conflict,true);
  b.result.recoverLatest();b.run();assert.equal(b.options.value.title,'Primera pestaña');assert.equal(b.result.conflict,false);
});
console.log(`${count} real draft lifecycle checks passed.`);

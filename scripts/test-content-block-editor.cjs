/** Real editor handlers and search merge; all uploads are mocked, no browser or external writes. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto').webcrypto;
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
const editorSource = fs.readFileSync(path.join(root, 'src/components/site-edit/ContentBlocksEditor.tsx'), 'utf8');
const editorAst = ts.createSourceFile('ContentBlocksEditor.tsx', editorSource, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
const clean = value => JSON.parse(JSON.stringify(value));
let checks = 0;
function check(actual, expected, message) { assert.deepEqual(clean(actual), clean(expected), message); checks++; }
function evaluate(text, globals = {}) {
  const exports = {};
  const context = { exports, module: { exports }, Error, crypto, ...globals };
  vm.runInNewContext(ts.transpileModule(text, { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS } }).outputText, context);
  return context.module.exports;
}
function extract(ast, name, globals = {}) {
  let text;
  function visit(node) {
    if (ts.isFunctionDeclaration(node) && node.name?.text === name) text = `${node.getText(ast)}\nmodule.exports = ${name};`;
    if (ts.isVariableDeclaration(node) && node.name.getText(ast) === name) text = `module.exports = (${node.initializer.getText(ast)});`;
    ts.forEachChild(node, visit);
  }
  visit(ast); assert.ok(text, name); return evaluate(text, globals);
}
const model = evaluate(fs.readFileSync(path.join(root, 'src/types/contentBlocks.ts'), 'utf8'));
const original = [
  { id: 'heading', type: 'heading', text: 'Título original' },
  { id: 'image', type: 'image', url: '/old-photo.jpg', title: 'Título imagen', caption: 'Descripción conservada', fileName: 'old.jpg', fileType: 'image/jpeg', fileSize: 10 },
  { id: 'middle', type: 'text', text: 'Este párrafo está entre dos archivos y debe conservarse.' },
  { id: 'document', type: 'document', url: '/old-document.docx', title: 'Mi documento', fileName: 'old.docx', fileType: 'application/docx', fileSize: 20 },
  { id: 'last', type: 'text', text: 'Final conservado' },
];
const docFile = { name: 'new-document.pdf', type: 'application/pdf', size: 99 };
const imageFile = { name: 'new-photo.png', type: 'image/png', size: 101 };
function deferred() { let resolve; const promise = new Promise(done => { resolve = done; }); return { promise, resolve }; }
function fixture(uploadResult = async input => ({ url: `/uploaded/${input.file.name}`, fileName: input.file.name, mimeType: input.file.type, size: input.file.size })) {
  const state = { uploading: false, activeId: null, adding: true, error: null, uploads: [], busy: [], changes: [] };
  const latest = { current: clean(original) };
  const change = next => { latest.current = next; state.changes.push(clean(next)); };
  const globals = {
    ...model, latest, changeRef: { current: change }, uploadLock: { current: false }, replaceId: { current: null },
    images: { current: { value: 'selected' } }, documents: { current: { value: 'selected' } }, replacement: { current: { value: 'selected' } },
    folder: 'events', disabled: false, onChange: change,
    uploadAdminFile: async input => { state.uploads.push(input); return uploadResult(input); },
    onBusyChange: value => state.busy.push(value), setUploading: value => { state.uploading = value; },
    setActiveId: value => { state.activeId = value; }, setAdding: value => { state.adding = value; }, setError: value => { state.error = value; },
  };
  const handler = name => extract(editorAst, name, { ...globals, blocks: latest.current, patch: extract(editorAst,'patch',globals) });
  return {
    state,latest,globals,
    patch: (...args) => handler('patch')(...args), add: (...args) => handler('add')(...args), move: (...args) => handler('move')(...args), upload: (...args) => handler('upload')(...args),
  };
}

async function testContentBlocks() {
  const edited = fixture();
  edited.patch('document',{ url: 'h' });
  check(edited.latest.current[3].url,'h','Typing an intermediate URL is preserved in the draft');
  edited.patch('middle',{ text: '' });
  check([edited.latest.current.length,edited.latest.current[2].text],[5,''],'Clearing text does not delete its block or adjacent files');
  edited.patch('middle',{ text: 'Texto nuevo entre los archivos' });
  for (const type of ['text','heading','image','document']) {
    edited.add(type);
    const added = edited.latest.current.at(-1);
    check([added.type,edited.state.activeId,edited.state.adding],[type,added.id,false],'Adding a block activates only the new block');
  }
  check(edited.latest.current[2].text,'Texto nuevo entre los archivos','Adding every kind of block preserves the intermediate paragraph');
  check(new Set(edited.latest.current.map(block => block.id)).size,edited.latest.current.length,'All new block IDs are unique');

  for (let from = 0; from < original.length; from++) for (let to = 0; to < original.length; to++) {
    const moved = fixture(); moved.move(from,to);
    const expected = clean(original); const [block] = expected.splice(from,1); expected.splice(to,0,block);
    check(moved.latest.current,expected,'Moving blocks preserves complete text and file metadata');
  }
  const boundaries = fixture(); boundaries.move(-1,0); boundaries.move(0,99);
  check(boundaries.latest.current,original,'Invalid movement cannot drop any block');

  for (const [id,file,type] of [['document',docFile,'document'],['image',imageFile,'image']]) {
    const replace = fixture(); await replace.upload([file],type,id);
    const index = original.findIndex(block => block.id === id);
    const expected = { ...original[index], url: `/uploaded/${file.name}`, fileName: file.name, fileType: file.type, fileSize: file.size };
    check(replace.latest.current[index],expected,'Replacement changes only file metadata, preserving ID/title/caption/position');
    check(replace.latest.current.filter(block => block.id !== id),original.filter(block => block.id !== id),'Replacement preserves every surrounding block including intermediate text');
    check([replace.state.busy,replace.state.uploading,replace.globals.uploadLock.current],[[true,false],false,false],'Replacement releases publication busy state');
    const parsed = model.parseContentBlocks(replace.latest.current);
    check(parsed[index],expected,'File metadata survives serialization/reload parsing');
  }
  const rejected = fixture(async () => { throw new Error('upload failed'); });
  await rejected.upload([docFile],'document','document');
  check(rejected.latest.current,original,'Failed replacement retains the old file and all text');
  check([rejected.state.changes.length,rejected.state.error,rejected.state.busy],[0,'upload failed',[true,false]],'Failed replacement reports error and permits retry');

  const replacementGate = deferred();
  const latest = fixture(() => replacementGate.promise);
  const replacing = latest.upload([docFile],'document','document');
  await latest.upload([docFile],'document','document');
  latest.patch('middle',{ text: 'Texto actualizado mientras sube' });
  latest.patch('document',{ title: 'Nombre actualizado' });
  replacementGate.resolve({ url: '/new-final.pdf',fileName: 'final.pdf',mimeType: docFile.type,size: 777 }); await replacing;
  check([latest.latest.current[2].text,latest.latest.current[3].title],['Texto actualizado mientras sube','Nombre actualizado'],'Async replacement uses current content, never an old snapshot');
  check(latest.state.uploads.length,1,'Upload lock prevents duplicate replacement requests');

  const appendGate = deferred();
  const appended = fixture(() => appendGate.promise);
  const appending = appended.upload([imageFile],'image');
  appended.patch('middle',{ text: 'Otro texto intermedio conservado' });
  appendGate.resolve({url:'/new-photo.png',fileName:imageFile.name,mimeType:imageFile.type,size:imageFile.size}); await appending;
  check([appended.latest.current.length,appended.latest.current[2].text,appended.latest.current.at(-1).url],[6,'Otro texto intermedio conservado','/new-photo.png'],'New file appends after latest text instead of replacing it');
  const disabled = fixture(); disabled.globals.disabled = true;
  await disabled.upload([docFile],'document','document');
  check(disabled.state.uploads.length,0,'Disabled editor never starts upload');
  check(original[2].text,'Este párrafo está entre dos archivos y debe conservarse.','Original paragraph fixture is unchanged');
  assert.ok(!/deleteAdminFile|uploads\.delete|deleteFile/.test(editorSource),'Replacement must not delete previous files'); checks++;
}

async function testBlurThenPublish() {
  const file = 'src/components/site-edit/EventPageEditor.tsx';
  const source = fs.readFileSync(path.join(root,file),'utf8');
  const ast = ts.createSourceFile(file,source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
  const eventModel = evaluate(fs.readFileSync(path.join(root,'src/types/event.ts'),'utf8'), {
    require: id => { assert.equal(id,'./contentBlocks.js'); return model; },
  });
  const initial = {
    id:'inline-event',title:'Old title',description:'Old description',organizer:'REGULATEL',location:'Montevideo',
    startDate:'2026-10-16',endDate:null,year:2026,status:'past',registrationUrl:null,detailsUrl:null,isFeatured:false,
    published:true,tags:[],attachments:[],contentBlocks:[],createdAt:'',updatedAt:'',
  };
  const rowRef = {current:clean(initial)}, queuedRows=[], writes=[], history=[], errors=[];
  const globals = {
    row:clean(initial),rowRef,events:[clean(initial)],saved:clean(initial),event:clean(initial),
    getEventYear:eventModel.getEventYear,getEventStatus:eventModel.getEventStatus,
    setRow:value=>queuedRows.push(clean(value)),setMessage:()=>{},
    busyRef:{current:false},uploadBusy:false,setSaving:()=>{},setError:value=>errors.push(value),
    safeContentUrl:model.safeContentUrl,
    updateEvent:async(id,payload)=>writes.push({id,payload:clean(payload)}),
    addEvent:async()=>{throw new Error('Unexpected create');},deleteEvent:async()=>{},
    notifyCmsSaved:()=>{},editableSeed:value=>clean(value),setSaved:()=>{},reset:()=>{},captureBaseline:()=>{},clearPreview:()=>{},setRemoved:()=>{},
    recordPersistedChange:value=>history.push(value),
  };
  const patch=extract(ast,'patch',globals),persist=extract(ast,'persist',globals);
  patch({title:'Title committed by blur'});
  patch({description:'Description committed before click'});
  // No rerender occurs here: the stale `row` value in globals is deliberately untouched.
  await persist(true);
  check([writes[0].payload.title,writes[0].payload.description],['Title committed by blur','Description committed before click'],'Blur commits are published even before React has rerendered');
  check(globals.row.title,'Old title','Test really keeps the render closure stale');
  check([queuedRows.length,history.length,errors.at(-1)],[2,1,''],'Both field edits are queued and the publication succeeds');
}

function testSearchMerge() {
  const file = 'src/lib/siteSearch.ts'; const text = fs.readFileSync(path.join(root,file),'utf8');
  const ast = ts.createSourceFile(file,text,ts.ScriptTarget.Latest,true,ts.ScriptKind.TS);
  const merge = extract(ast,'mergeSearchNews');
  const staticNews = [
    {slug:'hidden',title:'Hidden static original',date:'2026-10-16',content:['Old body']},
    {slug:'updated',title:'Old title',date:'2026-10-15'},
    {slug:'static-only',title:'Untouched static',date:'2026-10-14'},
  ];
  const stored = [
    {id:'hidden-id',slug:'HIDDEN',title:'Unpublished override',published:false},
    {id:'updated-id',slug:'updated',title:'Updated public title',published:true,content:'New body'},
    {id:'db-only-id',slug:'db-only',title:'New public article',published:true},
  ];
  check(merge(staticNews,stored,false),[],'Search never indexes static news before publication state has loaded');
  const merged = merge(staticNews,stored,true);
  check(merged.map(item=>item.slug).sort(),['db-only','static-only','updated'],'Search slugs match the public mixed list and exclude hidden static originals');
  check(merged.find(item=>item.slug==='updated').title,'Updated public title','A stored published article replaces its static original');
  check(merged.find(item=>item.slug==='updated').content,'New body','Search uses current database body');
  check(merge(staticNews,[],true),staticNews,'Confirmed empty database still exposes the legitimate static list');
  check(merge([],stored,true).map(item=>item.slug),['updated','db-only'],'Database-only search exposes only published rows');
  check(merge([{slug:'fallback-id',title:'Static old'}],[{id:'fallback-id',slug:'',title:'Hidden',published:false}],true),[],'Hidden row reserves its ID when slug is absent');
  check(merge([],[{id:'fallback-id',slug:'',title:'Published fallback',published:true}],true).map(item=>item.slug),['fallback-id'],'Published legacy rows use the same slug-or-ID route as public lists');
  const before = clean([staticNews,stored]); merge(staticNews,stored,true);
  check([staticNews,stored],before,'Search merge never mutates source lists');
}
(async()=>{await testContentBlocks();await testBlurThenPublish();testSearchMerge();console.log(`PASS: ${checks} content block/search checks; uploads mocked and files retained.`);})().catch(error=>{console.error(error);process.exitCode=1;});

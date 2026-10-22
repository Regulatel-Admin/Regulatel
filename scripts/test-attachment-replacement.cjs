/** Exercises the real attachment handlers with mocked uploads; no file storage or API writes. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'src/components/admin/EventAttachmentsField.tsx'), 'utf8');
const ast = ts.createSourceFile('EventAttachmentsField.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
const clean = value => JSON.parse(JSON.stringify(value));
let checks = 0;
const check = (actual, expected, message) => { assert.deepEqual(clean(actual), clean(expected), message); checks++; };
function evaluate(text, globals = {}) {
  const exports = {};
  const context = { exports, module: { exports }, Error, ...globals };
  vm.runInNewContext(ts.transpileModule(text, { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS } }).outputText, context);
  return context.module.exports;
}
function extract(name, globals = {}) {
  let text;
  function visit(node) {
    if (ts.isFunctionDeclaration(node) && node.name?.text === name) text = `${node.getText(ast)}\nmodule.exports = ${name};`;
    if (ts.isVariableDeclaration(node) && node.name.getText(ast) === name) text = `module.exports = (${node.initializer.getText(ast)});`;
    ts.forEachChild(node, visit);
  }
  visit(ast); assert.ok(text, name); return evaluate(text, globals);
}
const { moveContentBlock } = evaluate(fs.readFileSync(path.join(root, 'src/types/contentBlocks.ts'), 'utf8'));
const newAttachmentId = extract('newAttachmentId');
const titleFromFileName = extract('titleFromFileName');
const original = [
  { id: 'first', title: 'Programa', url: '/keep-first.pdf', fileName: 'first.pdf', fileType: 'application/pdf', fileSize: 10 },
  { id: 'target', title: 'Mi título original', url: '/keep-old.docx', fileName: 'old.docx', fileType: 'application/docx', fileSize: 20, extra: { retained: true } },
  { id: 'last', title: 'Memoria', url: '/keep-last.pdf', fileName: 'last.pdf', fileType: 'application/pdf', fileSize: 30 },
];
const pickedFile = { name: 'replacement.pdf', type: 'application/pdf', size: 99 };
const uploaded = { url: '/new-file.pdf', fileName: 'stored-replacement.pdf', mimeType: 'application/pdf', size: 101 };
function fixture(upload = async () => uploaded) {
  const state = { uploading: false, replacingId: null, error: null, uploads: [], busy: [], changes: [] };
  const refs = {
    valueRef: { current: clean(original) }, disabledRef: { current: false }, uploadInFlight: { current: false },
    replacementTarget: { current: 'target' }, replacementInput: { current: { value: 'selected-file' } }, inputRef: { current: { value: 'selected-files' } },
    changeRef: { current: value => state.changes.push(clean(value)) }, busyChangeRef: { current: value => state.busy.push(value) },
  };
  const globals = {
    ...refs, folder: 'events', moveContentBlock, newAttachmentId, titleFromFileName,
    uploadAdminFile: async input => { state.uploads.push(input); return upload(input); },
    setUploading: value => { state.uploading = value; }, setReplacingId: value => { state.replacingId = value; }, setError: value => { state.error = value; },
  };
  const commit = extract('commit', globals);
  return {
    state, ...refs, commit,
    replace: extract('replaceFile', { ...globals, commit }),
    add: extract('handleFiles', { ...globals, commit }),
    move: extract('moveAttachment', { ...globals, commit }),
  };
}
function deferred() { let resolve, reject; const promise = new Promise((ok, fail) => { resolve = ok; reject = fail; }); return { promise, resolve, reject }; }
(async () => {
  const success = fixture();
  await success.replace([pickedFile]);
  check(success.valueRef.current.map(item => item.id), ['first','target','last'], 'Replace keeps the same ID and position');
  check(success.valueRef.current[1], { ...original[1], url: uploaded.url, fileName: uploaded.fileName, fileType: uploaded.mimeType, fileSize: uploaded.size }, 'Replace updates only file metadata and preserves title/other fields');
  check([success.valueRef.current[0], success.valueRef.current[2]], [original[0],original[2]], 'Adjacent files are unchanged');
  check(success.state.busy, [true,false], 'Parent publication is blocked until upload finishes');
  check([success.state.uploading,success.state.replacingId,success.uploadInFlight.current,success.replacementInput.current.value], [false,null,false,''], 'Success releases busy state and resets picker');
  check(success.state.uploads.map(input => [input.kind,input.folder,input.file.name]), [['document','events','replacement.pdf']], 'Replacement uses the document uploader once');

  const failed = fixture(async () => { throw new Error('Upload rejected'); });
  await failed.replace([pickedFile]);
  check(failed.valueRef.current, original, 'Failure keeps the old DOCX and all metadata untouched');
  check([failed.state.changes.length,failed.state.error,failed.state.busy,failed.uploadInFlight.current], [0,'Upload rejected',[true,false],false], 'Failure reports an error and enables retry without changing anything');

  const fallback = fixture(async () => ({ url: '/replacement-minimal.pdf' }));
  await fallback.replace([pickedFile]);
  check(fallback.valueRef.current[1], { ...original[1], url: '/replacement-minimal.pdf', fileName: pickedFile.name, fileType: pickedFile.type, fileSize: pickedFile.size }, 'Missing upload metadata falls back to the selected file');

  const pending = deferred();
  const concurrent = fixture(() => pending.promise);
  const replacing = concurrent.replace([pickedFile]);
  await concurrent.replace([pickedFile]);
  concurrent.valueRef.current = [clean(original[2]), { ...clean(original[1]), title: 'Título actualizado durante la subida' }, clean(original[0])];
  pending.resolve(uploaded); await replacing;
  check(concurrent.state.uploads.length, 1, 'Double selection cannot start a second concurrent replacement');
  check(concurrent.valueRef.current.map(item => item.id), ['last','target','first'], 'Completion uses current order instead of a stale render');
  check(concurrent.valueRef.current[1].title, 'Título actualizado durante la subida', 'Completion preserves the latest title');

  const deletedGate = deferred();
  const removed = fixture(() => deletedGate.promise);
  const removedPending = removed.replace([pickedFile]);
  removed.valueRef.current = [clean(original[0]),clean(original[2])];
  deletedGate.resolve(uploaded); await removedPending;
  check(removed.valueRef.current, [original[0],original[2]], 'Replacement cannot resurrect an attachment removed elsewhere');
  check([removed.state.changes.length,Boolean(removed.state.error)], [0,true], 'Missing target is reported without changing other attachments');

  for (let from = 0; from < original.length; from++) for (let to = 0; to < original.length; to++) {
    const reorder = fixture();
    reorder.move(original[from].id, original[to].id);
    const expected = clean(original); const [item] = expected.splice(from,1); expected.splice(to,0,item);
    check(reorder.valueRef.current, expected, 'Drag and arrow movement preserve all titles, URLs, and file metadata');
  }
  const invalid = fixture();
  invalid.move('missing','target'); invalid.move('target','missing');
  check(invalid.state.changes.length,0,'Missing drag targets cannot change the list');
  invalid.disabledRef.current = true;
  invalid.move('first','last'); await invalid.replace([pickedFile]); await invalid.add([pickedFile]);
  check([invalid.state.changes.length,invalid.state.uploads.length], [0,0], 'Disabled controls cannot reorder or upload');
  invalid.disabledRef.current = false; invalid.uploadInFlight.current = true;
  invalid.move('first','last'); await invalid.replace([pickedFile]); await invalid.add([pickedFile]);
  check([invalid.state.changes.length,invalid.state.uploads.length], [0,0], 'An active upload also blocks reorder and duplicate operations');

  const addGate = deferred();
  const append = fixture(() => addGate.promise);
  const adding = append.add([pickedFile]);
  append.valueRef.current = [clean(original[2]),clean(original[0])];
  addGate.resolve(uploaded); await adding;
  check(append.valueRef.current.slice(0,2), [original[2],original[0]], 'Adding files appends to the latest list without restoring removed files');
  check([append.valueRef.current.length,append.valueRef.current[2].title,append.state.busy], [3,'stored replacement',[true,false]], 'New uploads retain the normal add behavior');
  check(original[1].url, '/keep-old.docx', 'Original test record is never mutated');
  assert.ok(!/deleteAdminFile|uploads\.delete|deleteFile/.test(source), 'Old blob must never be deleted by replacement'); checks++;
  console.log(`PASS: ${checks} attachment order/replacement checks; uploads mocked, old files retained.`);
})().catch(error => { console.error(error); process.exitCode = 1; });

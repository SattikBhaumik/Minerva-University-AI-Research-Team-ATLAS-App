/**
 * SavedPaths checks. Run: node js/saved.test.js
 * Uses an in-memory stand-in for localStorage, plus one that throws, the
 * way a private window or blocked site data does.
 */
let store = {};
global.localStorage = {
  getItem: (k) => (k in store ? store[k] : null),
  setItem: (k, v) => { store[k] = String(v); },
};
const SavedPaths = require('./saved.js');

const tests = [];
function test(name, fn) { tests.push({ name, fn }); }
function assert(cond, msg) { if (!cond) throw new Error(msg || 'assertion failed'); }

test('saves a path under its role', () => {
  store = {};
  assert(SavedPaths.save(['minervan', 'know', 'ss'], 'Social Sciences'), 'save should succeed');
  const [e] = SavedPaths.list();
  assert(e.role === 'minervan' && e.name === 'Social Sciences' && e.path.join('.') === 'minervan.know.ss');
});

test('saving the same path again does not duplicate it', () => {
  store = {};
  SavedPaths.save(['applicant', 'world', 'ns'], 'A');
  SavedPaths.save(['applicant', 'world', 'ns'], 'B');
  const all = SavedPaths.list();
  assert(all.length === 1 && all[0].name === 'B', `expected one entry named B, got ${JSON.stringify(all)}`);
});

test('remove deletes only that entry', () => {
  store = {};
  SavedPaths.save(['applicant', 'a'], 'one');
  SavedPaths.save(['applicant', 'b'], 'two');
  const id = SavedPaths.list().find((e) => e.name === 'one').id;
  SavedPaths.remove(id);
  const names = SavedPaths.list().map((e) => e.name);
  assert(names.length === 1 && names[0] === 'two', names.join(','));
});

test('corrupt or blocked storage: empty list, save reports failure', () => {
  store = { atlas_saved_paths: '{not json' };
  assert(SavedPaths.list().length === 0, 'corrupt data should read as empty');
  const real = global.localStorage;
  global.localStorage = { getItem: () => { throw new Error('blocked'); }, setItem: () => { throw new Error('blocked'); } };
  assert(SavedPaths.list().length === 0, 'blocked storage should read as empty');
  assert(SavedPaths.save(['applicant'], 'x') === false, 'blocked storage should report failure');
  global.localStorage = real;
});

let failed = 0;
for (const { name, fn } of tests) {
  try { fn(); console.log(`✓ ${name}`); } catch (e) { console.error(`✗ ${name}: ${e.message}`); failed++; }
}
console.log(`${tests.length - failed} passed, ${failed} failed`);
if (failed) process.exit(1);

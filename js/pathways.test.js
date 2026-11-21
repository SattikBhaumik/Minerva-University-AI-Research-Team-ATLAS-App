/**
 * Pathway data checks. Run: node js/pathways.test.js
 *
 * Holds the owner's rule "never give too many options": every choice in
 * data/pathways.json has 2 to 3 options, every option cites a source, and
 * every path ends. The negative controls prove the checks can fail.
 */
const fs = require('node:fs');
const path = require('node:path');
const Pathways = require('./pathways.js');

const data = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'pathways.json'), 'utf-8'));

const tests = [];
function test(name, fn) { tests.push({ name, fn }); }
function assert(cond, msg) { if (!cond) throw new Error(msg || 'assertion failed'); }
const clone = (o) => JSON.parse(JSON.stringify(o));

test('shipped pathway data passes every check', () => {
  const errors = Pathways.validate(data);
  assert(errors.length === 0, errors.join('\n  '));
});

test('negative control: a fourth option is rejected', () => {
  const bad = clone(data);
  const opts = bad.nodes['y3-NS-1'].options;
  opts.push({ ...opts[0], id: 'extra' });
  assert(Pathways.validate(bad).some((e) => e.includes('must be 2 to 3')), 'four options slipped through');
});

test('negative control: an option without a source is rejected', () => {
  const bad = clone(data);
  delete bad.nodes.start.options[0].source;
  assert(Pathways.validate(bad).some((e) => e.includes('needs a source')), 'missing source slipped through');
});

test('negative control: a cycle is rejected', () => {
  const bad = clone(data);
  bad.nodes['y4-NS'].next = 'y1-NS';
  assert(Pathways.validate(bad).some((e) => e.startsWith('cycle')), 'cycle slipped through');
});

test('negative control: a dangling next is rejected', () => {
  const bad = clone(data);
  bad.nodes['y2-CS'].next = 'nowhere';
  assert(Pathways.validate(bad).some((e) => e.includes('does not exist')), 'dangling next slipped through');
});

test('every course code shown exists in the catalog', () => {
  const catalog = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'catalog', 'catalog-2026.v410.json'), 'utf-8'));
  const known = new Set(catalog.courses.map((c) => c.code));
  const shown = JSON.stringify(data.nodes).match(/\b[A-Z]{1,3}\d{2,5}[A-Z]?\b/g) || [];
  const unknown = [...new Set(shown)].filter((c) => !known.has(c));
  assert(unknown.length === 0, `not in catalog: ${unknown.join(', ')}`);
  const planted = JSON.stringify({ x: 'NS999 Imaginary Physics' }).match(/\b[A-Z]{1,3}\d{2,5}[A-Z]?\b/g);
  assert(planted.some((c) => !known.has(c)), 'negative control: an invented code should be caught');
});

let failed = 0;
for (const { name, fn } of tests) {
  try { fn(); console.log(`✓ ${name}`); } catch (e) { console.error(`✗ ${name}: ${e.message}`); failed++; }
}
console.log(`${tests.length - failed} passed, ${failed} failed`);
if (failed) process.exit(1);

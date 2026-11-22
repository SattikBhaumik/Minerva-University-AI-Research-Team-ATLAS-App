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
  const opts = bad.nodes['after-NS'].options;
  opts.push({ ...opts[0], id: 'extra' });
  assert(Pathways.validate(bad).some((e) => e.includes('must be 2 to 3')), 'four options slipped through');
});

test('only an owner-approved choice may exceed three, and never more than six', () => {
  const wide = Object.entries(data.nodes).filter(([, n]) => n.kind === 'choice' && n.options.length > 3);
  assert(wide.every(([, n]) => n.ownerException), `unapproved: ${wide.map(([k]) => k).join(', ')}`);
  const bad = clone(data);
  delete bad.nodes['m-college-1'].ownerException;
  assert(Pathways.validate(bad).some((e) => e.includes('m-college-1') && e.includes('must be 2 to 3')), 'removing the exception should fail');
  const seven = clone(data);
  const opts = seven.nodes['y3-CS-1'].options;
  while (opts.length < 7) opts.push({ ...opts[0], id: `extra${opts.length}` });
  assert(Pathways.validate(seven).some((e) => e.includes('must be 2 to 6')), 'seven options should fail even with the exception');
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
  // "M27", "M28" are Minerva class-year tags in story titles, not courses.
  const unknown = [...new Set(shown)].filter((c) => !known.has(c) && !/^M\d{2}$/.test(c));
  assert(unknown.length === 0, `not in catalog: ${unknown.join(', ')}`);
  const planted = JSON.stringify({ x: 'NS999 Imaginary Physics' }).match(/\b[A-Z]{1,3}\d{2,5}[A-Z]?\b/g);
  assert(planted.some((c) => !known.has(c)), 'negative control: an invented code should be caught');
});

test('version.json matches every ?v= tag in index.html', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf-8');
  const tags = [...new Set([...html.matchAll(/\?v=([\w.-]+)"/g)].map((m) => m[1]))];
  const v = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'version.json'), 'utf-8')).v;
  assert(tags.length === 1, `index.html mixes versions: ${tags.join(', ')}`);
  assert(tags[0] === v, `index.html says ${tags[0]}, version.json says ${v}`);
});

test('every link shown is one of the verified links', () => {
  const links = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'catalog', 'links.json'), 'utf-8'));
  const verified = new Set([links.catalogPdf, ...Object.values(links.concentrationPages).filter(Boolean)]);
  Object.values(links.collegeTabs).forEach((t) => verified.add(`${links.majorsPage}?tab=${t}`));
  const shown = [];
  Object.values(data.nodes).forEach((n) => [n, ...(n.options || [])].forEach((h) => (h.links || []).forEach((l) => shown.push(l.url))));
  Object.values(data.courseInfo).forEach((c) => shown.push(c.url.replace(/#page=\d+$/, '')));
  const stories = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'catalog', 'stories.json'), 'utf-8'));
  Object.values(stories.colleges).flat().forEach((st) => verified.add(st.url));
  Object.values(data.nodes).forEach((n) => ((n.aside || {}).groups || []).forEach((g) => g.items.forEach((it) => { if (it && it.url) shown.push(it.url); })));
  const unknown = [...new Set(shown)].filter((u) => !verified.has(u));
  assert(shown.length > 50, `expected many links, got ${shown.length}`);
  assert(unknown.length === 0, `unverified: ${unknown.join(', ')}`);
});

let failed = 0;
for (const { name, fn } of tests) {
  try { fn(); console.log(`✓ ${name}`); } catch (e) { console.error(`✗ ${name}: ${e.message}`); failed++; }
}
console.log(`${tests.length - failed} passed, ${failed} failed`);
if (failed) process.exit(1);

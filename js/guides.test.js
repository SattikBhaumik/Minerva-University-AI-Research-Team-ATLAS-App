/**
 * Guides tests: the workload arithmetic, backup restore merging, and the
 * shape of the three Minerva data files the views read.
 * Run: node js/guides.test.js
 */
const fs = require('node:fs');
const path = require('node:path');

const mem = {};
global.localStorage = {
  getItem: (k) => (k in mem ? mem[k] : null),
  setItem: (k, v) => { mem[k] = String(v); },
  removeItem: (k) => { delete mem[k]; },
};
const Guides = require('./guides.js');
const read = (f) => JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'catalog', f), 'utf-8'));

const tests = [];
const test = (name, fn) => tests.push({ name, fn });
const assert = (c, m) => { if (!c) throw new Error(m || 'assertion failed'); };
const eq = (a, b, m) => { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(m || `expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`); };

test('four courses: (3 + 8..10) h each, handbook 6.13', () => {
  const h = Guides.weekHours({ courses: 4, el: 0, own: [] });
  eq([h.low, h.high, h.seminars], [44, 52, 12]);
});

test('EL199 is capped at 10 h a week and own hours add', () => {
  const h = Guides.weekHours({ courses: 3, el: 25, own: [{ name: 'job', hours: 6 }, { name: 'x', hours: 'bad' }] });
  eq([h.el199, h.own, h.low, h.high], [10, 6, 49, 55]);
});

test('restore keeps local notes and adds missing ones', () => {
  for (const k of Object.keys(mem)) delete mem[k];
  localStorage.setItem(Guides.KEYS.journal, JSON.stringify({ Tokyo: 'mine' }));
  Guides.restoreData({ journal: { Tokyo: 'theirs', 'San Francisco': 'from file', bad: 3 } });
  eq(JSON.parse(localStorage.getItem(Guides.KEYS.journal)), { Tokyo: 'mine', 'San Francisco': 'from file' });
});

test('restore fills an empty schools grid but never overwrites one', () => {
  for (const k of Object.keys(mem)) delete mem[k];
  const file = { schools: { schools: [{ id: 'a', name: 'Minerva' }], criteria: [{ id: 'c', name: 'Cost' }], cells: { 'a|c': 'x' } } };
  Guides.restoreData(file);
  eq(JSON.parse(localStorage.getItem(Guides.KEYS.schools)).schools[0].name, 'Minerva');
  Guides.restoreData({ schools: { schools: [{ id: 'b', name: 'Other' }], criteria: [] } });
  eq(JSON.parse(localStorage.getItem(Guides.KEYS.schools)).schools.length, 1);
});

test('backup carries every Guides key', () => {
  eq(Object.keys(Guides.backupData()).sort(), Object.keys(Guides.KEYS).sort());
});

test('rotation.json: Years 1 to 4 in order, each sourced', () => {
  const r = read('rotation.json');
  eq(r.current.map((c) => c.year), [1, 2, 3, 4]);
  r.current.forEach((c) => {
    assert(c.city && c.stage && c.summary, `year ${c.year} incomplete`);
    assert(Array.isArray(c.partners) && Array.isArray(c.examples), `year ${c.year} lists`);
    assert(/^https:\/\/www\.minerva\.edu\//.test(c.source.url), `year ${c.year} source`);
  });
  assert(/^\d{4}-\d{2}-\d{2}$/.test(r.readOn), 'readOn');
});

test('faq.json: every category has answered questions from minerva.edu', () => {
  const f = read('faq.json');
  assert(f.source.url.startsWith('https://www.minerva.edu/'), 'source');
  assert(f.categories.length > 0, 'categories');
  f.categories.forEach((c) => {
    assert(c.name && c.items.length, `empty category ${c.name}`);
    c.items.forEach((it) => assert(it.q && it.a && Array.isArray(it.links), `bad item in ${c.name}`));
  });
});

test('scholarships.json: names, and dates only when complete', () => {
  const s = read('scholarships.json');
  assert(s.items.length > 0, 'items');
  s.items.forEach((it) => {
    assert(it.name, 'name');
    assert(it.deadline === null || /^\d{4}-\d{2}-\d{2}$/.test(it.deadline), `${it.name} deadline`);
    assert(it.url === null || /^https?:\/\//.test(it.url), `${it.name} url`);
  });
});

test('interview starter questions stay off the site until approved', () => {
  const ed = read('editorial.json');
  const p = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'pathways.json'), 'utf-8'));
  const asides = Object.values(p.nodes).filter((n) => n.aside && n.aside.interview);
  assert(asides.length === 5, `expected 5 college asides, got ${asides.length}`);
  const shown = asides.every((n) => n.aside.interviewQuestions.length > 0);
  eq(shown, ed.interviewKit.status === 'approved');
});

(async () => {
  let passed = 0, failed = 0;
  for (const { name, fn } of tests) {
    try { await fn(); console.log(`✓ ${name}`); passed++; } catch (e) { console.error(`✗ ${name}: ${e.message}`); failed++; }
  }
  console.log(`${passed} passed, ${failed} failed`);
  if (failed) process.exit(1);
})();

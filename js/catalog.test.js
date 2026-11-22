/**
 * Catalog rule checks. Run: node js/catalog.test.js
 */
const fs = require('node:fs');
const path = require('node:path');
const Catalog = require('./catalog.js');
global.Catalog = Catalog;

const raw = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'catalog', 'catalog-2026.v410.json'), 'utf-8'));
const pathways = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'pathways.json'), 'utf-8'));
const C = Catalog.create(raw);

const tests = [];
function test(name, fn) { tests.push({ name, fn }); }
function assert(cond, msg) { if (!cond) throw new Error(msg || 'assertion failed'); }
const has = (...codes) => new Set(codes);

test('prerequisites keep "or" groups and drop Cornerstones', () => {
  const g = C.prereqs('NS152').map((x) => x.codes.join('|'));
  assert(g.includes('NS110L|NS110U') && g.includes('NS113'), JSON.stringify(g));
  assert(!JSON.stringify(C.prereqs('NS110L')).includes('FA51'), 'Cornerstones should be dropped');
});

test('unlocks is the reverse of prerequisites', () => {
  assert(C.unlocks('NS110U').includes('NS142'), C.unlocks('NS110U').join(','));
  assert(C.unlocks('CS111').includes('CS114'), 'CS111 should unlock CS114');
});

test('open now respects prerequisites', () => {
  const open = C.openNow(has('CS111'));
  assert(open.includes('CS114') && !open.includes('CS146'), 'CS114 open, CS146 not yet');
  assert(C.missingFor('NS142', has('CS111')).join() === 'NS110U,CS113', C.missingFor('NS142', has('CS111')).join());
});

test('major rules read from the catalog: AH 3 of 4, NS one physics course', () => {
  const ah = C.majorRequirements('AH').reqs.map((r) => r.label);
  assert(ah.some((l) => l.startsWith('at least 3 of AH110')), ah.join(' / '));
  const ns = C.majorRequirements('NS').reqs.map((r) => r.label);
  assert(ns.includes('NS110U or NS110L') && ns.includes('NS113') && !ns.includes('NS110U'), ns.join(' / '));
});

test('major progress counts concentration courses and outside credits', () => {
  const rows = C.majorProgress('CS', has('CS110', 'CS111', 'CS113', 'CS114', 'CS144', 'CS154', 'CS164', 'NS110U', 'NS111', 'NS112', 'NS113', 'SS110'));
  const by = Object.fromEntries(rows.map((r) => [r.label.split(' ')[0] + (r.label.includes('credits') ? 'cr' : ''), r]));
  assert(rows.find((r) => r.label === '3 concentration courses').ok, 'three concentration courses');
  assert(rows.find((r) => r.label.startsWith('20 credits')).ok, '5 outside courses x 4 credits');
  assert(rows.every((r) => r.ok), JSON.stringify(rows.filter((r) => !r.ok)));
  assert(by, 'rows exist');
});

test('minors: blocked in your own college, Business needs a concentration course, interdisciplinary is flexible', () => {
  const m = C.minorStatus(has('B110', 'B111', 'B112', 'B113'), ['CS']);
  const bz = m.find((x) => x.name === 'Business');
  assert(bz.missing.includes('one Business concentration course'), JSON.stringify(bz));
  assert(m.find((x) => x.name === 'Mathematics').blocked, 'a CS major cannot minor in a CS minor');
  assert(m.find((x) => x.name === 'Neuroscience').flexible, 'interdisciplinary minors are flexible');
});

test('a saved plan maps back to its courses and college', () => {
  const p = ['applicant', 'world', 'ns', 'ok', 'ok', 'ns110u', 'cs', 'matter-and-energy', 'ok', 'grad'];
  const codes = C.planCourses(pathways, p);
  ['NS110U', 'NS111', 'NS142', 'NS152', 'NS162', 'CS111', 'FA51'].forEach((c) => assert(codes.has(c), `missing ${c}`));
  assert(C.planCollege(pathways, p) === 'NS', C.planCollege(pathways, p));
});

test('open now drops alternatives of a requirement already met', () => {
  assert(C.openNow(has('NS110U'), ['NS']).includes('NS110L') === false, 'NS110L should drop once NS110U is taken');
  assert(C.openNow(has('NS110U'), []).includes('NS110L'), 'without a major, NS110L is still just a course');
  const ah = C.openNow(has('AH110', 'AH111', 'AH112'), ['AH']);
  assert(!ah.includes('AH113'), 'AH113 drops once 3 of 4 AH core are done');
  assert(C.openNow(has('AH110', 'AH111'), ['AH']).includes('AH112'), 'with 2 of 4, the others stay open');
});

test('credits: attempted, internship hours, tutorials per major', () => {
  const s = C.creditSummary(has('FA50', 'FA51', 'CS110', 'CP191'), 240);
  assert(s.attempted === 14 && s.el === 4 && s.total === 18, JSON.stringify(s));
  assert(C.creditSummary(has(), 130).el === 2 && C.creditSummary(has(), 100).el === 0, 'hour thresholds');
  assert(C.majorTutorials('CS').includes('IL18102') && C.majorTutorials('B')[0] === 'B199', JSON.stringify(C.majorTutorials('CS')));
});

test('calendar data: real dates, valid rules, Minerva sources; rules map to the right year', () => {
  const cal = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'catalog', 'calendar.json'), 'utf-8'));
  const real = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(`${s}T00:00:00Z`)) && new Date(`${s}T00:00:00Z`).toISOString().startsWith(s);
  assert(cal.events.length > 10 && cal.events.every((e) => real(e.start) && (!e.end || (real(e.end) && e.end >= e.start)) && e.title), 'bad event');
  assert(cal.rules.every((r) => r.month >= 1 && r.month <= 12 && r.day >= 1 && r.day <= 31 && r.years.every((y) => y >= 1 && y <= 4)), 'bad rule');
  assert(Object.values(cal.sources).every((s) => /^https:\/\/([a-z.]+\.)?(minerva\.edu|website-files\.com)\//.test(s.url)), 'non-Minerva source');
  const T = (() => { const m = {}; new Function('module', fs.readFileSync(path.join(__dirname, 'tools.js'), 'utf-8') + ';module.Tools=Tools;')(m); return m.Tools; })();
  const d = T.ruleDates({ title: 'Declare', month: 1, day: 31, years: [1, 2], category: 'deadline' }, 2026);
  assert(d[0].start === '2027-01-31' && d[1].start === '2028-01-31', JSON.stringify(d));
  assert(T.ruleDates({ title: 'x', month: 9, day: 30, years: [4], category: 'deadline' }, 2026)[0].start === '2029-09-30', 'Sept of Year 4');
});

let failed = 0;
for (const { name, fn } of tests) {
  try { fn(); console.log(`✓ ${name}`); } catch (e) { console.error(`✗ ${name}: ${e.message}`); failed++; }
}
console.log(`${tests.length - failed} passed, ${failed} failed`);
if (failed) process.exit(1);

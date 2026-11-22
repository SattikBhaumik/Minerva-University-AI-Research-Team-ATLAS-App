/**
 * Catalog: Minerva's course catalog as data, and the rules ATLAS reads from it.
 *
 * Pure functions over data/catalog/catalog-2026.v410.json, shared by the
 * prerequisite map, the course tracker, plan comparison and the minor
 * planner. No DOM here, so js/catalog.test.js runs it in node.
 *
 * Every rule below is read from the catalog's own text (major rules,
 * minor course lists); where the catalog says a requirement can be met
 * "in multiple ways", ATLAS says so instead of guessing.
 */
const Catalog = (() => {
  'use strict';

  const COLLEGES = {
    AH: { name: 'Arts & Humanities', college: 'Arts and Humanities' },
    B: { name: 'Business', college: 'Business' },
    CS: { name: 'Computational Sciences', college: 'Computational Sciences' },
    NS: { name: 'Natural Sciences', college: 'Natural Sciences' },
    SS: { name: 'Social Sciences', college: 'Social Sciences' },
  };
  const CODE_RE = /\b([A-Z]{1,3}\d{2,5}[A-Z]?)\b/g;
  const CORNERSTONES = [['FA50', 'FA51'], ['EA50', 'EA51'], ['CX50', 'CX51'], ['MC50', 'MC51']];

  function prefixOf(code) {
    return (code.match(/^[A-Z]+/) || [''])[0];
  }

  function create(raw) {
    const course = {};
    raw.courses.forEach((c) => { course[c.code] = c; });

    // Everyone has these by Year 2, so they never block anything.
    const foundation = (code) => {
      const t = (course[code] && course[code].type) || '';
      return t.startsWith('Cornerstone') || t.startsWith('Non Degree') || t.startsWith('Structure') || code === 'CS51B' || code === 'PR51';
    };

    // Prerequisites as clauses of alternatives: [[NS110L, NS110U], [NS113]].
    // A clause marked "(corequisite)" may be taken in the same term.
    function prereqs(code) {
      const c = course[code];
      if (!c || !c.prerequisites || c.prerequisites === 'None') return [];
      return c.prerequisites.split(/, (?=[A-Z]{1,3}\d)/).map((clause) => ({
        codes: [...new Set((clause.match(CODE_RE) || []).filter((x) => course[x] && !foundation(x)))],
        coreq: /corequisite/.test(clause),
      })).filter((g) => g.codes.length);
    }

    const unlockIndex = {};
    raw.courses.forEach((c) => prereqs(c.code).forEach((g) => g.codes.forEach((x) => {
      (unlockIndex[x] = unlockIndex[x] || []).push(c.code);
    })));
    const unlocks = (code) => [...new Set(unlockIndex[code] || [])].sort();

    const major = (col) => raw.majors.find((m) => m.college === COLLEGES[col].college);
    const core = (col) => raw.courses.filter((c) => c.type === 'Major Core' && prefixOf(c.code) === col).map((c) => c.code);
    const concentrations = (col) => raw.concentrations.filter((c) => c.college === COLLEGES[col].college);
    const concentrationCourses = (col) => [...new Set(concentrations(col).flatMap((c) => c.courses.map((x) => x.code)))];

    // "n of these" requirements stated in a major's rules or description.
    function majorRequirements(col) {
      const m = major(col);
      const text = [m.description, ...m.rules].join(' ');
      const reqs = [];
      for (const r of text.matchAll(/at least (\d+) (?:of the following \d+ core classes|course from the following): ([A-Z0-9, ]+[A-Z0-9])/g)) {
        const codes = r[2].match(/[A-Z]{1,3}\d{2,5}[A-Z]?/g);
        reqs.push({ n: Number(r[1]), codes, label: `at least ${r[1]} of ${codes.join(', ')}` });
      }
      const either = text.match(/requires completion of either ([A-Z0-9]+) or ([A-Z0-9]+)/);
      if (either) reqs.push({ n: 1, codes: [either[1], either[2]], label: `${either[1]} or ${either[2]}` });
      const covered = new Set(reqs.flatMap((r) => r.codes).filter((c) => core(col).includes(c)));
      const coreRule = reqs.find((r) => r.codes.every((c) => core(col).includes(c)));
      core(col).filter((c) => !covered.has(c)).forEach((c) => reqs.push({ n: 1, codes: [c], label: c }));
      return { reqs, coreRuleCodes: coreRule ? coreRule.codes : [] };
    }

    const satisfied = (code, have) => prereqs(code).every((g) => g.coreq || g.codes.some((x) => have.has(x)));
    const missingFor = (code, have) => prereqs(code).filter((g) => !g.coreq && !g.codes.some((x) => have.has(x))).map((g) => g.codes.join(' or '));

    // Courses a student could take next: major core and concentration
    // courses in any college whose prerequisites are met.
    // With majors given, alternatives in an "n of these" requirement that is
    // already met drop out (NS110L once NS110U is ticked; AH's fourth core
    // course once three are done): no major needs them any more.
    function openNow(have, majors = []) {
      const settled = new Set();
      majors.forEach((col) => majorRequirements(col).reqs.forEach((r) => {
        if (r.codes.length > 1 && r.codes.filter((c) => have.has(c)).length >= r.n) r.codes.forEach((c) => settled.add(c));
      }));
      return raw.courses
        .filter((c) => (c.type === 'Major Core' || c.type === 'Concentration') && !have.has(c.code) && !settled.has(c.code) && satisfied(c.code, have))
        .map((c) => c.code);
    }

    const credits = (code) => (course[code] && course[code].credits) || 0;

    // Progress against one major's catalog rules.
    function majorProgress(col, have) {
      const { reqs } = majorRequirements(col);
      const rows = reqs.map((r) => {
        const done = r.codes.filter((c) => have.has(c)).length;
        return { label: r.label, done: Math.min(done, r.n), need: r.n, ok: done >= r.n };
      });
      const conc = concentrationCourses(col).filter((c) => have.has(c)).length;
      rows.push({ label: '3 concentration courses', done: Math.min(conc, 3), need: 3, ok: conc >= 3 });
      const outside = [...have].filter((c) => prefixOf(c) !== col && Object.keys(COLLEGES).includes(prefixOf(c))
        && ['Major Core', 'Concentration'].includes((course[c] || {}).type)).reduce((s, c) => s + credits(c), 0);
      rows.push({ label: '20 credits from other colleges (core or concentration courses)', done: Math.min(outside, 20), need: 20, ok: outside >= 20 });
      return rows;
    }

    // College minors: every listed course (Business adds one concentration
    // course), in a different college from every major. Interdisciplinary
    // minors say they can be met "in multiple ways", so ATLAS does not judge them.
    function minorStatus(have, majors) {
      return raw.minors.map((m) => {
        const col = Object.keys(COLLEGES).find((k) => COLLEGES[k].college === m.college);
        const codes = m.courses.map((x) => x.code);
        const flexible = !col;
        const extra = /one Business Concentration course/.test(m.rules.join(' '));
        const doneCodes = codes.filter((c) => have.has(c));
        const missing = codes.filter((c) => !have.has(c));
        if (extra && !concentrationCourses('B').some((c) => have.has(c))) missing.push('one Business concentration course');
        return {
          name: m.name.replace(/^[^-]+ - /, ''), college: col ? COLLEGES[col].name : 'Interdisciplinary',
          codes, done: doneCodes, missing, flexible,
          blocked: Boolean(col && majors.includes(col)),
        };
      });
    }

    // The courses a saved ATLAS plan names: every course code in the
    // options and steps it passed through.
    function planCourses(pathways, path) {
      const codes = new Set();
      let id = pathways.start;
      for (const value of path) {
        const node = pathways.nodes[id];
        if (!node) break;
        const holder = node.kind === 'choice' ? node.options.find((o) => o.id === value) : node;
        if (!holder) break;
        const text = [holder.plan || '', ...(holder.courses || [])].join(' ');
        (text.match(CODE_RE) || []).forEach((c) => { if (course[c]) codes.add(c); });
        if (/Cornerstones/.test(holder.plan || '')) CORNERSTONES.flat().forEach((c) => codes.add(c));
        id = node.kind === 'choice' ? holder.next : node.next;
      }
      return codes;
    }

    // The college a saved plan landed in (its "college-XX" step), or null.
    function planCollege(pathways, path) {
      let id = pathways.start;
      for (const value of path) {
        if (id.startsWith('college-')) return id.slice('college-'.length);
        const node = pathways.nodes[id];
        if (!node) break;
        const holder = node.kind === 'choice' ? node.options.find((o) => o.id === value) : node;
        if (!holder) break;
        id = node.kind === 'choice' ? holder.next : node.next;
      }
      return id && id.startsWith('college-') ? id.slice('college-'.length) : null;
    }

    // Senior Tutorials the catalog lists for a major (Business: its practicum).
    function majorTutorials(col) {
      if (col === 'B') return ['B199'];
      return major(col).courses.map((x) => x.code).filter((c) => /^IL181\d+/.test(c));
    }
    const CAPSTONE = ['CP191', 'CP192', 'CP193', 'CP194', 'CP196'];

    // Credits, per the catalog and handbook: tuition covers 120 attempted
    // credits; EL199 internship credit is not "attempted" (240 hours = 4
    // credits, 120 hours = 2) and counts toward the 8-credit cap on
    // transfer, prior learning and internship credit; a degree needs 120.
    function creditSummary(have, elHours) {
      const attempted = [...have].filter((c) => c !== 'EL199').reduce((s, c) => s + credits(c), 0);
      const el = elHours >= 240 ? 4 : elHours >= 120 ? 2 : 0;
      return { attempted, el, elCapped: Math.min(el, 8), total: attempted + Math.min(el, 8), tuitionCap: 120, degree: 120, outsideCap: 8 };
    }

    return {
      majorTutorials, CAPSTONE, creditSummary,
      course, COLLEGES, CORNERSTONES, prefixOf, prereqs, unlocks, core, concentrations, concentrationCourses,
      majorRequirements, majorProgress, openNow, missingFor, minorStatus, planCourses, planCollege, credits,
    };
  }

  return { create, COLLEGES };
})();

if (typeof module !== 'undefined') module.exports = Catalog;

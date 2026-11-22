/**
 * Tools: the views beside the pathway explorer.
 *
 *   Prerequisite map   what a course needs and what it opens
 *   Course tracker     tick courses taken; progress against catalog rules
 *   Compare plans      two saved plans side by side
 *   Minors & majors    which minors or second major a plan or tracker fits
 *
 * All data is Minerva's catalog (js/catalog.js) and the visitor's own
 * saved plans and ticks, which stay in this browser (js/saved.js).
 */
const Tools = (() => {
  'use strict';

  const TRACKER_KEY = 'atlas_tracker';
  let C = null;          // Catalog.create(...) result
  let P = null;          // pathways data
  let catalogPdf = '';
  const openSections = new Set();   // tracker sections the visitor opened or closed
  const closedSections = new Set();

  function el(tag, cls, text) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  }
  function option(value, label, selected) {
    const o = el('option', null, label);
    o.value = value;
    if (selected) o.selected = true;
    return o;
  }
  function select(label, options, onChange) {
    const wrap = el('label', 'tool-field');
    wrap.append(el('span', 'caption-label', label));
    const s = el('select', 'field-input');
    options.forEach((o) => s.append(o));
    s.addEventListener('change', () => onChange(s.value));
    wrap.append(s);
    return { wrap, s };
  }
  const title = (code) => (C.course[code] ? `${code} ${C.course[code].title}` : code);
  const pageUrl = (code) => `${catalogPdf}#page=${C.course[code].page}`;
  const relevantCourses = (col) => [...C.core(col), ...C.concentrationCourses(col).filter((c) => !C.core(col).includes(c))];

  function setQuery(params) {
    const q = new URLSearchParams(window.location.search);
    Object.entries(params).forEach(([k, v]) => (v ? q.set(k, v) : q.delete(k)));
    history.replaceState(history.state, '', `?${q.toString()}${window.location.hash}`);
  }

  /* ---------------- Prerequisite map ---------------- */

  function renderMap(root, code) {
    root.textContent = '';
    const start = C.course[code] ? code : 'NS142';
    const col = C.prefixOf(start);
    const head = el('div', 'tool-controls');
    const colSel = select('College', Object.entries(C.COLLEGES).map(([k, v]) => option(k, v.name, k === col)), (k) => renderMap(root, relevantCourses(k)[0]));
    const courseSel = select('Course', relevantCourses(col).map((c) => option(c, title(c), c === start)), (c) => renderMap(root, c));
    head.append(colSel.wrap, courseSel.wrap);
    root.append(head);
    setQuery({ course: start });

    const chip = (c) => {
      const b = el('button', 'map-chip', title(c));
      b.type = 'button';
      b.addEventListener('click', () => renderMap(root, c));
      return b;
    };
    const grid = el('div', 'map-grid');
    const needs = el('div', 'card map-col');
    needs.append(el('h3', 'section-header', 'Needs'));
    const groups = C.prereqs(start);
    if (!groups.length) needs.append(el('p', 'caption', 'Only the Year 1 Cornerstones.'));
    groups.forEach((g) => {
      const row = el('div', 'map-group');
      g.codes.forEach((c, i) => { if (i) row.append(el('span', 'caption', 'or')); row.append(chip(c)); });
      if (g.coreq) row.append(el('span', 'caption', '(can be taken together)'));
      needs.append(row);
    });
    const mid = el('div', 'card map-col map-center');
    const c = C.course[start];
    mid.append(el('p', 'caption', C.COLLEGES[col] ? C.COLLEGES[col].name : ''), el('h3', 'section-header', title(start)),
      el('p', 'body', c.description.split(/(?<=[.!?])\s+/).slice(0, 2).join(' ')));
    const a = el('a', 'caption pw-about-link', `Full description in the catalog, p. ${c.page}`);
    a.href = pageUrl(start); a.target = '_blank'; a.rel = 'noopener';
    mid.append(a);
    const opens = el('div', 'card map-col');
    opens.append(el('h3', 'section-header', 'Opens'));
    const un = C.unlocks(start).filter((x) => ['Major Core', 'Concentration'].includes(C.course[x].type));
    if (!un.length) opens.append(el('p', 'caption', 'No other course lists it as a prerequisite.'));
    un.forEach((x) => opens.append(chip(x)));
    grid.append(needs, mid, opens);
    root.append(grid);

    // The whole chain back to Year 1, as nested lists.
    const chain = el('div', 'card map-chain');
    chain.append(el('h3', 'section-header', 'Full chain'));
    const tree = (code0, seen) => {
      const ul = el('ul', 'map-tree');
      C.prereqs(code0).forEach((g) => {
        const li = el('li', 'body');
        li.append(g.codes.map(title).join(' or '));
        g.codes.forEach((x) => { if (!seen.has(x)) { const s = new Set(seen); s.add(x); const sub = tree(x, s); if (sub.children.length) li.append(sub); } });
        ul.append(li);
      });
      return ul;
    };
    const t = tree(start, new Set([start]));
    chain.append(t.children.length ? t : el('p', 'caption', 'Nothing before it but the Cornerstones.'));
    root.append(chain);
  }

  /* ---------------- Course tracker ---------------- */

  function loadTracker() {
    try { return Object.assign({ majors: ['NS'], minors: [], taken: [] }, JSON.parse(localStorage.getItem(TRACKER_KEY) || '{}')); } catch (e) { return { majors: ['NS'], minors: [], taken: [] }; }
  }
  function saveTracker(t) {
    try { localStorage.setItem(TRACKER_KEY, JSON.stringify(t)); return true; } catch (e) { return false; }
  }
  const trackerCourses = () => new Set(loadTracker().taken);

  function renderTracker(root) {
    const t = loadTracker();
    root.textContent = '';
    const head = el('div', 'tool-controls');
    const colOpts = (cur, none) => [...(none ? [option('', 'None', !cur)] : []), ...Object.entries(C.COLLEGES).map(([k, v]) => option(k, v.name, k === cur))];
    const update = (fn) => { fn(t); saveTracker(t); renderTracker(root); };
    head.append(
      select('Major', colOpts(t.majors[0]), (v) => update((x) => { x.majors[0] = v; })).wrap,
      select('Second major (optional)', colOpts(t.majors[1], true), (v) => update((x) => { x.majors = [x.majors[0], v].filter(Boolean); })).wrap,
    );
    root.append(head);

    const have = new Set(t.taken);
    const layout = el('div', 'tracker-grid');
    const list = el('div', 'card');
    list.append(el('h3', 'section-header', 'Courses taken'));
    const box = (codes, label) => {
      const id = `tr-${codes[0]}`;
      const row = el('label', 'tracker-row');
      const cb = el('input');
      cb.type = 'checkbox'; cb.id = id; cb.checked = codes.every((c) => have.has(c));
      cb.addEventListener('change', () => update((x) => {
        const s = new Set(x.taken);
        codes.forEach((c) => (cb.checked ? s.add(c) : s.delete(c)));
        x.taken = [...s];
      }));
      row.append(cb, el('span', 'body', label));
      return row;
    };
    // Remembers what the visitor opened or closed, so ticking a box (which
    // redraws the tracker) does not collapse the section they are in.
    const section = (name, rows, open) => {
      const d = el('details', 'tracker-section');
      d.open = openSections.has(name) || (open && !closedSections.has(name));
      d.addEventListener('toggle', () => {
        if (d.open) { openSections.add(name); closedSections.delete(name); } else { openSections.delete(name); closedSections.add(name); }
      });
      d.append(el('summary', 'body-strong', name));
      rows.forEach((r) => d.append(r));
      return d;
    };
    list.append(section('Year 1 Cornerstones', C.CORNERSTONES.map((pair) => box(pair, `${C.course[pair[1]].title} (${pair.join(', ')})`)), t.taken.length === 0));
    Object.keys(C.COLLEGES).forEach((col) => {
      const mine = t.majors.includes(col);
      list.append(section(`${C.COLLEGES[col].name}${mine ? ' (your major)' : ''}`, relevantCourses(col).map((c) => box([c], title(c))), mine));
    });
    const status = el('div', 'tracker-side');
    t.majors.forEach((col) => {
      const card = el('div', 'card');
      card.append(el('h3', 'section-header', `${C.COLLEGES[col].name} major`));
      const ul = el('ul', 'tracker-status');
      C.majorProgress(col, have).forEach((r) => {
        const li = el('li', `body ${r.ok ? 'is-done' : ''}`);
        li.append(el('span', 'tracker-mark', r.ok ? '✓' : '○'), `${r.label}: ${r.done}/${r.need}`);
        ul.append(li);
      });
      card.append(ul);
      status.append(card);
    });
    const open = el('div', 'card');
    open.append(el('h3', 'section-header', 'Open to you now'));
    const nowOpen = C.openNow(have).filter((c) => t.majors.includes(C.prefixOf(c)));
    if (!nowOpen.length) open.append(el('p', 'caption', 'Tick the courses you have taken to see what opens.'));
    nowOpen.slice(0, 12).forEach((c) => open.append(el('p', 'body', title(c))));
    if (nowOpen.length > 12) open.append(el('p', 'caption', `${nowOpen.length - 12} more`));
    const reset = el('button', 'btn btn-ghost', 'Clear all ticks');
    reset.type = 'button';
    reset.addEventListener('click', () => { if (window.confirm('Clear every tick?')) update((x) => { x.taken = []; }); });
    open.append(el('p', 'caption', 'Ticks stay in this browser only. The catalog is the authority; check with your advisor.'), reset);
    status.append(open);
    layout.append(list, status);
    root.append(layout);
  }

  /* ---------------- Compare plans ---------------- */

  function planSummary(entry) {
    const rows = [];
    let id = P.start;
    for (const value of entry.path) {
      const n = P.nodes[id];
      if (!n) break;
      const opt = n.kind === 'choice' ? n.options.find((o) => o.id === value) : n;
      if (!opt) break;
      if (n.kind === 'choice' && value !== 'more') rows.push([n.stage, opt.label]);
      id = n.kind === 'choice' ? opt.next : n.next;
    }
    return rows;
  }

  function renderCompare(root, saved) {
    root.textContent = '';
    const plans = saved.list();
    if (plans.length < 2) {
      root.append(el('p', 'body', 'Save at least two plans (the "Save this plan" button at the end of a pathway) to compare them here.'));
      return;
    }
    const q = new URLSearchParams(window.location.search);
    let a = plans.find((p) => p.id === q.get('a')) || plans[0];
    let b = plans.find((p) => p.id === q.get('b') && p.id !== a.id) || plans.find((p) => p.id !== a.id);
    const head = el('div', 'tool-controls');
    const opts = (cur) => plans.map((p) => option(p.id, p.name, p.id === cur.id));
    head.append(
      select('Plan A', opts(a), (v) => { setQuery({ a: v }); renderCompare(root, saved); }).wrap,
      select('Plan B', opts(b), (v) => { setQuery({ b: v }); renderCompare(root, saved); }).wrap,
    );
    root.append(head);
    const ca = C.planCourses(P, a.path), cb = C.planCourses(P, b.path);
    const both = [...ca].filter((c) => cb.has(c)).sort();
    const onlyA = [...ca].filter((c) => !cb.has(c)).sort();
    const onlyB = [...cb].filter((c) => !ca.has(c)).sort();
    const grid = el('div', 'compare-grid');
    const col = (entry, only) => {
      const card = el('div', 'card');
      card.append(el('h3', 'section-header', entry.name));
      const ul = el('ul', 'pw-summary');
      planSummary(entry).forEach(([stage, label]) => { const li = el('li', 'body'); li.append(el('span', 'caption', `${stage}: `), label); ul.append(li); });
      card.append(ul, el('p', 'caption-label', `Only in this plan (${only.length})`));
      only.forEach((c) => card.append(el('p', 'body', title(c))));
      return card;
    };
    grid.append(col(a, onlyA), col(b, onlyB));
    root.append(grid);
    const common = el('div', 'card');
    common.append(el('h3', 'section-header', `In both plans (${both.length})`));
    both.forEach((c) => common.append(el('p', 'body', title(c))));
    root.append(common);
  }

  /* ---------------- Minors and double majors ---------------- */

  function renderMinors(root, saved) {
    root.textContent = '';
    const plans = saved.list();
    const q = new URLSearchParams(window.location.search);
    const src = q.get('from') || 'tracker';
    const head = el('div', 'tool-controls');
    head.append(select('Courses from', [option('tracker', 'My course tracker', src === 'tracker'), ...plans.map((p) => option(p.id, `Saved plan: ${p.name}`, p.id === src))],
      (v) => { setQuery({ from: v }); renderMinors(root, saved); }).wrap);
    let have, majors;
    const plan = plans.find((p) => p.id === src);
    if (plan) { have = C.planCourses(P, plan.path); majors = [C.planCollege(P, plan.path)].filter(Boolean); }
    else { have = trackerCourses(); majors = loadTracker().majors; }
    const second = q.get('second') || '';
    head.append(select('Try a second major', [option('', 'None', !second), ...Object.entries(C.COLLEGES).filter(([k]) => !majors.includes(k)).map(([k, v]) => option(k, v.name, k === second))],
      (v) => { setQuery({ second: v }); renderMinors(root, saved); }).wrap);
    root.append(head);
    root.append(el('p', 'caption', `Major${majors.length > 1 ? 's' : ''}: ${majors.map((m) => C.COLLEGES[m].name).join(', ') || 'none yet'} · ${have.size} courses counted. A degree allows up to two majors and two minors.`));

    if (second) {
      const card = el('div', 'card');
      card.append(el('h3', 'section-header', `${C.COLLEGES[second].name} as a second major`));
      C.majorProgress(second, have).forEach((r) => card.append(el('p', `body ${r.ok ? 'is-done' : ''}`, `${r.ok ? '✓' : '○'} ${r.label}: ${r.done}/${r.need}`)));
      root.append(card);
    }
    const list = el('div', 'minor-grid');
    C.minorStatus(have, majors)
      .sort((x, y) => (x.blocked - y.blocked) || (x.flexible - y.flexible) || (x.missing.length - y.missing.length))
      .forEach((m) => {
        const card = el('div', `card minor-card ${m.blocked ? 'is-blocked' : ''}`);
        card.append(el('p', 'caption', m.college), el('h3', 'body-strong', m.name));
        if (m.blocked) card.append(el('p', 'caption', 'Not available: a minor must be in a different college from your major.'));
        else if (m.flexible) card.append(el('p', 'body', `Interdisciplinary; the catalog says it can be met in multiple ways. Listed: ${m.codes.join(', ')}.`));
        else {
          card.append(el('p', 'body', `${m.done.length} of ${m.codes.length} listed courses${m.missing.length ? '' : ' · complete'}`));
          if (m.missing.length) card.append(el('p', 'caption', `Still needed: ${m.missing.join(', ')}`));
        }
        list.append(card);
      });
    root.append(list);
  }

  function init(catalogRaw, pathways, pdf) {
    C = Catalog.create(catalogRaw);
    P = pathways;
    catalogPdf = pdf;
  }

  return { init, renderMap, renderTracker, renderCompare, renderMinors, TRACKER_KEY };
})();

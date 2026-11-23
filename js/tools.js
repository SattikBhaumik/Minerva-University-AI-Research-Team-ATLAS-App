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
  // Status marks as inline SVG icons (done: check in a circle; to do: circle).
  function mark(ok) {
    const span = el('span', `tracker-mark ${ok ? 'is-done' : ''}`);
    span.setAttribute('aria-label', ok ? 'done' : 'not yet');
    span.innerHTML = ok
      ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/></svg>'
      : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="9"/></svg>';
    return span;
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
    // A drawn diagram: needs on the left, the course in the middle, what it
    // opens on the right. Nodes are real buttons; the lines are an SVG
    // overlay measured from where the nodes actually landed.
    const diagram = el('div', 'map-diagram map-animate');
    const lane = (label) => { const l = el('div', 'map-lane'); l.append(el('p', 'caption-label map-lane-label', label)); return l; };
    const needs = lane('Needs');
    const groups = C.prereqs(start);
    const fromNodes = [];
    if (!groups.length) needs.append(el('p', 'caption', 'Only the Year 1 Cornerstones.'));
    groups.forEach((g) => {
      const box = el('div', 'map-node-group');
      g.codes.forEach((c, i) => { if (i) box.append(el('span', 'caption map-or', 'or')); box.append(chip(c)); });
      if (g.coreq) box.append(el('span', 'caption', 'can be taken together'));
      needs.append(box);
      fromNodes.push(box);
    });
    const mid = el('div', 'map-lane map-lane-center');
    const centerCard = el('div', 'card map-center');
    const c = C.course[start];
    centerCard.append(el('p', 'caption', C.COLLEGES[col] ? C.COLLEGES[col].name : ''), el('h3', 'section-header', title(start)),
      el('p', 'body', c.description.split(/(?<=[.!?])\s+/).slice(0, 2).join(' ')));
    const a = el('a', 'caption pw-about-link', `Full description in the catalog, p. ${c.page}`);
    a.href = pageUrl(start); a.target = '_blank'; a.rel = 'noopener';
    centerCard.append(a);
    mid.append(centerCard);
    const opens = lane('Opens');
    const un = C.unlocks(start).filter((x) => ['Major Core', 'Concentration'].includes(C.course[x].type));
    const toNodes = [];
    if (!un.length) opens.append(el('p', 'caption', 'No other course lists it as a prerequisite.'));
    un.forEach((x) => { const n = chip(x); n.classList.add('map-node'); opens.append(n); toNodes.push(n); });
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'map-lines');
    svg.setAttribute('aria-hidden', 'true');
    diagram.append(svg, needs, mid, opens);
    root.append(diagram);

    // Lines draw themselves only on the first layout; a later redraw
    // (window resize) just repositions them.
    const shownAt = performance.now();
    const draw = () => {
      const animate = performance.now() - shownAt < 400;
      const box = diagram.getBoundingClientRect();
      svg.setAttribute('width', box.width);
      svg.setAttribute('height', box.height);
      svg.textContent = '';
      const cr = centerCard.getBoundingClientRect();
      const line = (x1, y1, x2, y2) => {
        const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const mx = (x1 + x2) / 2;
        p.setAttribute('d', `M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`);
        p.setAttribute('pathLength', '1');
        if (animate) p.setAttribute('class', 'map-path-draw');
        svg.append(p);
      };
      const cy = cr.top + cr.height / 2 - box.top;
      // Every line starts at the center card, so they all grow outward from it.
      fromNodes.forEach((n) => { const r = n.getBoundingClientRect(); line(cr.left - box.left, cy, r.right - box.left, r.top + r.height / 2 - box.top); });
      toNodes.forEach((n) => { const r = n.getBoundingClientRect(); line(cr.right - box.left, cy, r.left - box.left, r.top + r.height / 2 - box.top); });
    };
    requestAnimationFrame(draw);
    if (window.ResizeObserver) new ResizeObserver(draw).observe(diagram);

    // The whole chain back to Year 1, as nested lists.
    const chain = el('div', 'card map-chain map-animate-late');
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
        li.append(mark(r.ok), `${r.label}: ${r.done}/${r.need}`);
        ul.append(li);
      });
      card.append(ul);
      status.append(card);
    });
    // Credits against the tuition cap and degree, with internship hours.
    const cr = C.creditSummary(have, Number(t.elHours) || 0);
    const credits = el('div', 'card');
    credits.append(el('h3', 'section-header', 'Credits'));
    const cl = el('ul', 'tracker-status');
    [[`${cr.attempted} of 120 attempted credits (what tuition covers)`, cr.attempted <= 120],
      [`${cr.total} of 120 credits toward the degree`, cr.total >= 120],
      [`Internship (EL199): ${cr.el} credits; at most 8 from transfer, prior learning and internships`, cr.el <= 8]]
      .forEach(([text, ok]) => { const li = el('li', `body ${ok ? 'is-done' : ''}`); li.append(mark(ok), text); cl.append(li); });
    credits.append(cl);
    const hours = el('label', 'tool-field');
    hours.append(el('span', 'caption-label', 'Internship hours logged (240 hours = 4 credits, 120 = 2)'));
    const hin = el('input', 'field-input');
    hin.type = 'number'; hin.min = '0'; hin.step = '10'; hin.value = t.elHours || '';
    hin.addEventListener('change', () => update((x) => { x.elHours = Math.max(0, Number(hin.value) || 0); }));
    hours.append(hin);
    credits.append(hours);
    status.append(credits);

    // Years 3 and 4: capstone steps and the major's Senior Tutorials.
    const plan = el('div', 'card');
    plan.append(el('h3', 'section-header', 'Years 3 and 4'));
    plan.append(el('p', 'caption-label', 'Capstone'));
    C.CAPSTONE.forEach((c) => plan.append(box([c], `${title(c)} · ${C.course[c].credits} credits`)));
    t.majors.forEach((col) => {
      const tut = C.majorTutorials(col);
      plan.append(el('p', 'caption-label', col === 'B' ? 'Business Practicum' : `Senior Tutorials listed for ${C.COLLEGES[col].name}`));
      tut.forEach((c) => plan.append(box([c], title(c))));
      if (col !== 'B') plan.append(el('p', 'caption', 'Majors also need 8 more credits from Senior Tutorials, extra concentration courses or approved internships.'));
    });
    status.append(plan);

    const open = el('div', 'card');
    open.append(el('h3', 'section-header', 'Open to you now'));
    const nowOpen = C.openNow(have, t.majors).filter((c) => t.majors.includes(C.prefixOf(c)));
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
      card.append(ul);
      const col = C.planCollege(P, entry.path);
      const after = col && P.nodes[`after-${col}`];
      if (after) {
        const facts = (after.options.find((o) => o.id === 'undecided') || after.options[0]).facts;
        const out = el('div', 'compare-outcomes');
        out.append(el('p', 'caption-label', `After Minerva: ${C.COLLEGES[col].name} (Minerva's figures)`));
        facts.forEach((f) => out.append(el('p', 'body', f)));
        const chosen = after.options.find((o) => entry.path.includes(o.id) && o.id !== 'undecided');
        if (chosen) chosen.facts.filter((f) => /%/.test(f)).forEach((f) => out.append(el('p', 'body', f)));
        const src = el('a', 'caption pw-about-link', after.options[0].source.label);
        src.href = after.options[0].source.url; src.target = '_blank'; src.rel = 'noopener';
        out.append(src);
        card.append(out);
      }
      card.append(el('p', 'caption-label', `Only in this plan (${only.length})`));
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
      const ul = el('ul', 'tracker-status');
      C.majorProgress(second, have).forEach((r) => { const li = el('li', `body ${r.ok ? 'is-done' : ''}`); li.append(mark(r.ok), `${r.label}: ${r.done}/${r.need}`); ul.append(li); });
      card.append(ul);
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

  /* ---------------- Reflect on plans (+ advisor export) ---------------- */

  const REFLECT_KEY = 'atlas_reflect';
  function loadReflect() {
    try { return Object.assign({ notes: {}, criteria: [], ratings: {} }, JSON.parse(localStorage.getItem(REFLECT_KEY) || '{}')); } catch (e) { return { notes: {}, criteria: [], ratings: {} }; }
  }
  function saveReflect(r) { try { localStorage.setItem(REFLECT_KEY, JSON.stringify(r)); } catch (e) { /* storage blocked: notes just do not persist */ } }
  const pkey = (entry) => entry.path.join('.');

  function renderReflect(root, saved) {
    root.textContent = '';
    const plans = saved.list();
    const r = loadReflect();
    if (!plans.length) {
      root.append(el('p', 'body', 'Save a plan first (the "Save this plan" button at the end of a pathway). Three plans that differ on purpose make the comparison below worth doing.'));
      return;
    }
    const q = new URLSearchParams(window.location.search);
    const cur = plans.find((p) => p.id === q.get('plan')) || plans[0];
    const head = el('div', 'tool-controls');
    head.append(select('Plan', plans.map((p) => option(p.id, p.name, p.id === cur.id)), (v) => { setQuery({ plan: v }); renderReflect(root, saved); }).wrap);
    root.append(head);
    const notes = r.notes[pkey(cur)] = r.notes[pkey(cur)] || { courses: {}, questions: '' };
    const why = el('div', 'card');
    why.append(el('h3', 'section-header', 'Why this?'), el('p', 'caption', 'A sentence per course in your own words. Saved in this browser only.'));
    [...C.planCourses(P, cur.path)].sort().forEach((code) => {
      const f = el('label', 'tool-field reflect-field');
      f.append(el('span', 'caption-label', title(code)));
      const ta = el('textarea', 'field-input');
      ta.rows = 2; ta.value = notes.courses[code] || '';
      ta.addEventListener('input', () => { notes.courses[code] = ta.value; saveReflect(r); });
      f.append(ta);
      why.append(f);
    });
    const qf = el('label', 'tool-field reflect-field');
    qf.append(el('span', 'caption-label', 'Open questions for an advisor or a Minervan'));
    const qa = el('textarea', 'field-input');
    qa.rows = 3; qa.value = notes.questions || '';
    qa.addEventListener('input', () => { notes.questions = qa.value; saveReflect(r); });
    qf.append(qa);
    why.append(qf);
    root.append(why);

    // Your own criteria, weighted, and each plan rated against them.
    const crit = el('div', 'card');
    crit.append(el('h3', 'section-header', 'Your criteria'), el('p', 'caption', 'Name what matters to you, weight it 1 to 3, then rate up to three plans 1 to 5. The scores are yours, not ATLAS\'s.'));
    const addRow = el('div', 'tool-controls');
    const cin = el('input', 'field-input'); cin.placeholder = 'e.g. research experience, time for art, cost of extra courses';
    cin.setAttribute('aria-label', 'New criterion');
    const add = el('button', 'btn btn-ghost', 'Add criterion'); add.type = 'button';
    add.addEventListener('click', () => { const v = cin.value.trim(); if (v && r.criteria.length < 6) { r.criteria.push({ name: v.slice(0, 60), weight: 2 }); saveReflect(r); renderReflect(root, saved); } });
    addRow.append(cin, add);
    crit.append(addRow);
    const compared = plans.slice(0, 3);
    if (r.criteria.length) {
      const table = el('table', 'reflect-table');
      const hr = el('tr'); hr.append(el('th', null, 'Criterion'), el('th', null, 'Weight'));
      compared.forEach((p) => hr.append(el('th', null, p.name)));
      table.append(hr);
      r.criteria.forEach((cr, i) => {
        const tr = el('tr');
        const name = el('td'); name.append(cr.name + ' ');
        const del = el('button', 'saved-delete', '×'); del.type = 'button'; del.setAttribute('aria-label', `Remove ${cr.name}`);
        del.addEventListener('click', () => { r.criteria.splice(i, 1); saveReflect(r); renderReflect(root, saved); });
        name.append(del);
        const w = el('td'); const ws = el('select', 'field-input');
        [1, 2, 3].forEach((n) => ws.append(option(String(n), String(n), n === cr.weight)));
        ws.addEventListener('change', () => { cr.weight = Number(ws.value); saveReflect(r); renderReflect(root, saved); });
        w.append(ws);
        tr.append(name, w);
        compared.forEach((p) => {
          const td = el('td'); const rs = el('select', 'field-input');
          const cur0 = ((r.ratings[pkey(p)] || {})[cr.name]) || 0;
          [0, 1, 2, 3, 4, 5].forEach((n) => rs.append(option(String(n), n ? String(n) : '-', n === cur0)));
          rs.addEventListener('change', () => { (r.ratings[pkey(p)] = r.ratings[pkey(p)] || {})[cr.name] = Number(rs.value); saveReflect(r); renderReflect(root, saved); });
          td.append(rs); tr.append(td);
        });
        table.append(tr);
      });
      const tot = el('tr'); tot.append(el('td', 'body-strong', 'Weighted total'), el('td'));
      compared.forEach((p) => tot.append(el('td', 'body-strong', String(r.criteria.reduce((sum, cr) => sum + cr.weight * (((r.ratings[pkey(p)] || {})[cr.name]) || 0), 0)))));
      table.append(tot);
      const wrap = el('div', 'reflect-table-wrap'); wrap.append(table);
      crit.append(wrap);
    }
    if (plans.length < 3) crit.append(el('p', 'caption', `${plans.length} of 3 plans saved. Try a third that differs on purpose: another college, or the opposite choice at one step.`));
    root.append(crit);

    const actions = el('div', 'pw-actions');
    const pr = el('button', 'btn btn-primary', 'Print for an advisor'); pr.type = 'button';
    pr.addEventListener('click', () => printAdvisor(cur, notes, r));
    actions.append(pr);
    root.append(actions);
  }

  // A one-page sheet: the plan's picks, courses with your notes, questions,
  // and your criteria. Printed alone; removed again after printing.
  function printAdvisor(entry, notes, r) {
    const sheet = el('div', 'advisor-sheet');
    sheet.append(el('h1', 'view-heading', `ATLAS plan: ${entry.name}`), el('p', 'caption', `Saved ${new Date(entry.savedAt).toLocaleDateString()} · courses and rules from Minerva's Course Catalog 2026.v410`));
    const picks = el('ul', 'pw-summary');
    planSummary(entry).forEach(([stage, label]) => { const li = el('li', 'body'); li.append(el('span', 'caption', `${stage}: `), label); picks.append(li); });
    sheet.append(el('h2', 'section-header', 'Picks'), picks, el('h2', 'section-header', 'Courses and why'));
    [...C.planCourses(P, entry.path)].sort().forEach((code) => {
      const p = el('p', 'body'); p.append(el('span', 'body-strong', title(code)));
      if (notes.courses[code]) p.append(` · ${notes.courses[code]}`);
      sheet.append(p);
    });
    if (notes.questions) sheet.append(el('h2', 'section-header', 'Open questions'), el('p', 'body advisor-questions', notes.questions));
    if (r.criteria.length) {
      sheet.append(el('h2', 'section-header', 'What matters to me'));
      r.criteria.forEach((cr) => sheet.append(el('p', 'body', `${cr.name} (weight ${cr.weight}): rated ${((r.ratings[pkey(entry)] || {})[cr.name]) || '-'} of 5`)));
    }
    document.body.append(sheet);
    document.body.classList.add('printing-advisor');
    const done = () => { document.body.classList.remove('printing-advisor'); sheet.remove(); window.removeEventListener('afterprint', done); };
    window.addEventListener('afterprint', done);
    window.print();
    setTimeout(() => { if (document.body.contains(sheet) && !window.matchMedia('print').matches) done(); }, 1500);
  }

  /* ---------------- Deadlines calendar (+ .ics) ---------------- */

  let CAL = null;
  const pad = (n) => String(n).padStart(2, '0');
  const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

  // A rule's dates for a class that started in fall `startYear`: academic
  // year k runs Aug/Sep of startYear+k-1 to the next summer.
  function ruleDates(rule, startYear) {
    return rule.years.map((y) => {
      const year = startYear + y - 1 + (rule.month < 8 ? 1 : 0);
      return { start: `${year}-${pad(rule.month)}-${pad(rule.day)}`, end: null, title: `${rule.title} (Year ${y})`, category: rule.category, approximate: rule.approximate, detail: rule.detail, source: rule.source };
    });
  }

  // Fall runs Aug to Dec, Spring Jan to Apr, Summer May to Aug 20. The
  // study year counts from the class's first fall.
  function semesterOf(e, startYear) {
    const y = Number(e.start.slice(0, 4)), m = Number(e.start.slice(5, 7));
    const endOfYear = /End of Academic Year/.test(e.title);
    const sem = endOfYear || (m >= 5 && m <= 7) ? 'Summer' : m >= 8 ? 'Fall' : 'Spring';
    const fallYear = m >= 8 && !endOfYear ? y : y - 1;
    const n = fallYear - startYear + 1;
    const label = `${sem} semester`;
    return { key: `${fallYear}-${sem}`, label: n >= 1 && n <= 4 ? `Year ${n}: ${label}` : label };
  }

  function icsFor(events) {
    const esc = (t) => String(t || '').replace(/[\\;,]/g, (m) => `\\${m}`).replace(/\n/g, '\\n');
    const day = (s) => s.replace(/-/g, '');
    const next = (s) => { const d = new Date(`${s}T00:00:00Z`); d.setUTCDate(d.getUTCDate() + 1); return d.toISOString().slice(0, 10).replace(/-/g, ''); };
    const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
    const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//ATLAS//Minerva dates//EN', 'CALSCALE:GREGORIAN'];
    events.forEach((e, i) => {
      lines.push('BEGIN:VEVENT', `UID:atlas-${day(e.start)}-${i}@atlas`, `DTSTAMP:${stamp}`, `DTSTART;VALUE=DATE:${day(e.start)}`,
        `DTEND;VALUE=DATE:${e.end ? next(e.end) : next(e.start)}`, `SUMMARY:${esc((e.approximate ? 'About: ' : '') + e.title)}`,
        `DESCRIPTION:${esc([e.detail, `Source: Minerva ${e.source === 'handbook' ? 'Undergraduate Student Handbook' : 'academic calendar'}. Check with Minerva before relying on it.`].filter(Boolean).join(' '))}`, 'END:VEVENT');
    });
    lines.push('END:VCALENDAR');
    return lines.join('\r\n');
  }

  function renderCalendar(root) {
    root.textContent = '';
    if (!CAL) { root.append(el('p', 'body', 'The calendar is loading or could not be loaded. Reload to try again.')); return; }
    const q = new URLSearchParams(window.location.search);
    const thisYear = new Date().getFullYear();
    const startYear = Number(q.get('start')) || (new Date().getMonth() >= 7 ? thisYear : thisYear - 1);
    const head = el('div', 'tool-controls');
    head.append(select('I started at Minerva in fall', [0, 1, 2, 3, 4].map((k) => thisYear - 4 + k + 1).map((y) => option(String(y), String(y), y === startYear)),
      (v) => { setQuery({ start: v }); renderCalendar(root); }).wrap);
    root.append(head);
    const fromRules = (CAL.rules || []).flatMap((rule) => ruleDates(rule, startYear));
    const all = [...(CAL.events || []).map((e) => Object.assign({}, e)), ...fromRules].sort((a, b) => a.start.localeCompare(b.start));
    const dl = el('button', 'btn btn-primary', 'Add to my calendar (.ics)'); dl.type = 'button';
    dl.addEventListener('click', () => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([icsFor(all)], { type: 'text/calendar' }));
      a.download = `atlas-minerva-dates-class-of-${startYear + 4}.ics`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    });
    const acts = el('div', 'pw-actions'); acts.append(dl);
    root.append(acts, el('p', 'caption', 'All-day events from Minerva\'s academic calendar and Undergraduate Student Handbook. Dates marked "about" are approximate in the handbook itself. Minerva\'s own pages win if anything differs.'));
    const today = iso(new Date());
    const upcoming = all.filter((e) => (e.end || e.start) >= today);
    const showAll = root.dataset.showEarlier === '1';
    const shown = showAll ? all : upcoming;
    const earlier = all.length - upcoming.length;
    let group = '';
    const list = el('div', 'card cal-list');
    shown.forEach((e) => {
      const g = semesterOf(e, startYear);
      if (g.key !== group) { group = g.key; list.append(el('h3', 'section-header cal-month', g.label)); }
      const row = el('div', `cal-row cal-${e.category || 'other'}`);
      const when = new Date(`${e.start}T12:00:00`).toLocaleDateString(undefined, { day: 'numeric', month: 'short' }) + (e.end ? ` to ${new Date(`${e.end}T12:00:00`).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}` : '');
      row.append(el('span', 'caption cal-when', (e.approximate ? 'about ' : '') + when), el('span', 'body', e.title), el('span', 'caption cal-cat', e.category || ''));
      list.append(row);
    });
    if (!shown.length) list.append(el('p', 'body', 'No dates ahead for this class in the data ATLAS has.'));
    if (earlier > 0) {
      const t = el('button', 'btn', showAll ? 'Hide dates already past' : `Show ${earlier} earlier ${earlier === 1 ? 'date' : 'dates'}`); t.type = 'button';
      t.addEventListener('click', () => { root.dataset.showEarlier = showAll ? '0' : '1'; renderCalendar(root); });
      list.prepend(t);
    }
    root.append(list);
    if ((CAL.conflicts || []).length) {
      const cf = el('div', 'card');
      cf.append(el('h3', 'section-header', 'Where Minerva\'s own sources disagree'));
      const ul = el('ul', 'conflict-list');
      CAL.conflicts.forEach((c) => {
        const li = el('li', 'body');
        li.append(el('span', 'body-strong', c.what));
        const sub = el('ul', 'conflict-sides');
        sub.append(el('li', 'body', `Calendar: ${c.calendar}`), el('li', 'body', `Handbook: ${c.handbook}`));
        li.append(sub);
        ul.append(li);
      });
      cf.append(ul);
      root.append(cf);
    }
    if (SCH && SCH.items.length) {
      const card = el('details', 'card sch-card');
      card.append(el('summary', 'section-header', `External scholarships Minerva lists (${SCH.items.length})`),
        el('p', 'caption', `${SCH.note} Deadlines are as Minerva lists them, without a year, so they are not in the .ics file. Check each program's page.`));
      const ul = el('ul', 'sch-list');
      SCH.items.forEach((it) => {
        const li = el('li', 'body');
        li.append(it.url ? (() => { const a = el('a', 'body-strong', it.name); a.href = it.url; a.target = '_blank'; a.rel = 'noopener'; return a; })() : el('span', 'body-strong', it.name));
        const meta = [it.deadlineText, it.eligibility].filter(Boolean).join(' · ');
        if (meta) li.append(el('span', 'caption sch-meta', meta));
        ul.append(li);
      });
      const srcp = el('p', 'caption pw-source');
      const a = el('a', null, SCH.source.label); a.href = SCH.source.url; a.target = '_blank'; a.rel = 'noopener';
      srcp.append(el('span', 'caption-label', 'Source: '), a, ` · read ${SCH.readOn}`);
      card.append(ul, srcp);
      root.append(card);
    }
    const src = el('p', 'caption pw-source');
    Object.values(CAL.sources || {}).forEach((s, i) => { if (i) src.append(' · '); const a = el('a', null, s.label); a.href = s.url; a.target = '_blank'; a.rel = 'noopener'; src.append(a); });
    root.append(src);
  }

  let SCH = null;
  function setCalendar(cal) { CAL = cal; }
  function setScholarships(sch) { SCH = sch; }

  function init(catalogRaw, pathways, pdf) {
    C = Catalog.create(catalogRaw);
    P = pathways;
    catalogPdf = pdf;
  }

  return { init, renderMap, renderTracker, renderCompare, renderMinors, renderReflect, renderCalendar, setCalendar, setScholarships, icsFor, ruleDates, TRACKER_KEY, REFLECT_KEY };
})();

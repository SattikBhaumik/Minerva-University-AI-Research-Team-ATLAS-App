/**
 * Guides: views built on Minerva's own pages plus the visitor's own notes.
 *
 *   Cities           the four-year rotation (data/catalog/rotation.json)
 *                    with a private journal per city
 *   Questions        Minerva's FAQ, verbatim, searchable (faq.json)
 *   Compare schools  a blank grid: the visitor's schools and criteria
 *   Weekly workload  the handbook's hours per course, plus the visitor's own
 *
 * Everything the visitor types stays in this browser (localStorage) and
 * goes into the sidebar backup file. Nothing is sent anywhere.
 */
const Guides = (() => {
  'use strict';

  const KEYS = { journal: 'atlas_journal', interview: 'atlas_interview', schools: 'atlas_schools', week: 'atlas_week' };
  const DATA = { rotation: null, faq: null };

  function el(tag, cls, text) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  }
  function link(text, url) {
    const a = el('a', null, text);
    a.href = url; a.target = '_blank'; a.rel = 'noopener';
    return a;
  }
  function load(key, fallback) {
    try { return Object.assign(fallback, JSON.parse(localStorage.getItem(KEYS[key]) || '{}')); } catch (e) { return fallback; }
  }
  function store(key, value) {
    try { localStorage.setItem(KEYS[key], JSON.stringify(value)); return true; } catch (e) { return false; }
  }
  function textarea(label, value, rows, onInput) {
    const f = el('label', 'tool-field reflect-field');
    f.append(el('span', 'caption-label', label));
    const ta = el('textarea', 'field-input');
    ta.rows = rows; ta.value = value || '';
    ta.addEventListener('input', () => onInput(ta.value));
    f.append(ta);
    return f;
  }
  const uid = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

  /* ---------------- Cities: rotation timeline + journal ---------------- */

  function renderCities(root) {
    root.textContent = '';
    const R = DATA.rotation;
    if (!R) { root.append(el('p', 'body', 'The rotation is loading or could not be loaded. Reload to try again.')); return; }
    const journal = load('journal', {});
    const line = el('ol', 'city-line');
    R.current.forEach((c) => {
      const li = el('li', 'card city-stop');
      li.append(el('p', 'caption city-year', `Year ${c.year} · ${c.stage}`), el('h3', 'section-header', c.city), el('p', 'body', c.summary));
      if (c.examples.length) {
        const ul = el('ul', 'pw-facts');
        c.examples.forEach((t) => ul.append(el('li', 'body', t)));
        li.append(ul);
      }
      if (c.partners.length) {
        const p = el('p', 'body');
        p.append(el('span', 'caption-label', 'Partners Minerva names: '), c.partners.join(', '));
        li.append(p);
      }
      const src = el('p', 'caption pw-source');
      src.append(el('span', 'caption-label', 'Source: '), link(c.source.label, c.source.url));
      li.append(src);
      li.append(textarea(`My notes on ${c.city}`, journal[c.city], 3, (v) => { journal[c.city] = v; store('journal', journal); }));
      line.append(li);
    });
    root.append(el('p', 'caption', R.note), line);

    if ((R.conflicts || []).length) {
      const cf = el('div', 'card');
      cf.append(el('h3', 'section-header', 'Where Minerva\'s own pages disagree'));
      const ul = el('ul', 'conflict-list');
      R.conflicts.forEach((c) => { const li = el('li', 'body'); li.append(el('span', 'body-strong', `${c.what}: `), c.detail); ul.append(li); });
      cf.append(ul);
      root.append(cf);
    }
    if ((R.pastCities || []).length) {
      const pc = el('div', 'card');
      pc.append(el('h3', 'section-header', 'Other cities Minerva has named'));
      const ul = el('ul', 'conflict-list');
      R.pastCities.forEach((c) => {
        const li = el('li', 'body');
        li.append(el('span', 'body-strong', `${c.city}: `), `${c.when} `);
        if (c.source && c.source.url) li.append('(', link(c.source.label || 'source', c.source.url), ')');
        ul.append(li);
      });
      pc.append(ul);
      root.append(pc);
    }
  }

  /* ---------------- Questions: Minerva's FAQ, verbatim ---------------- */

  function renderFaq(root) {
    root.textContent = '';
    const F = DATA.faq;
    if (!F) { root.append(el('p', 'body', 'The questions are loading or could not be loaded. Reload to try again.')); return; }
    const head = el('div', 'tool-controls');
    const f = el('label', 'tool-field');
    f.append(el('span', 'caption-label', 'Search Minerva\'s answers'));
    const input = el('input', 'field-input');
    input.type = 'search'; input.placeholder = 'e.g. visa, financial aid, internship';
    f.append(input);
    head.append(f);
    const count = el('p', 'caption');
    const body = el('div');
    root.append(head, count, body);
    const src = el('p', 'caption pw-source');
    src.append(el('span', 'caption-label', 'Source: '), link(F.source.label, F.source.url), ` · read ${F.readOn}`);
    root.append(src);

    function draw() {
      const words = input.value.toLowerCase().split(/\s+/).filter(Boolean);
      const hit = (it) => words.every((w) => `${it.q} ${it.a}`.toLowerCase().includes(w));
      body.textContent = '';
      let shown = 0;
      F.categories.forEach((cat) => {
        const items = cat.items.filter(hit);
        if (!items.length) return;
        shown += items.length;
        const group = el('details', 'card faq-cat');
        if (words.length) group.open = true;
        group.append(el('summary', 'section-header', `${cat.name} (${items.length})`));
        items.forEach((it) => {
          const d = el('details', 'faq-item');
          d.append(el('summary', 'body-strong', it.q), el('p', 'body faq-answer', it.a));
          if ((it.links || []).length) {
            const p = el('p', 'caption');
            it.links.forEach((u, i) => { if (i) p.append(' · '); p.append(link(u.replace(/^https?:\/\/(www\.)?/, ''), u)); });
            d.append(p);
          }
          group.append(d);
        });
        body.append(group);
      });
      count.textContent = words.length ? `${shown} ${shown === 1 ? 'answer' : 'answers'} match.` : '';
      if (words.length && !shown) body.append(el('p', 'body', 'No answer on Minerva\'s FAQ page uses those words. Try one word, or ask Minerva admissions.'));
    }
    input.addEventListener('input', draw);
    draw();
  }

  /* ---------------- Compare schools: a blank grid ---------------- */

  const MAX_SCHOOLS = 5;
  const MAX_CRITERIA = 8;

  function renderSchools(root) {
    root.textContent = '';
    const s = load('schools', { schools: [], criteria: [], cells: {} });
    const save = () => store('schools', s);
    const redraw = () => renderSchools(root);

    function adder(label, placeholder, list, max) {
      const row = el('div', 'tool-controls');
      const input = el('input', 'field-input');
      input.placeholder = placeholder;
      input.setAttribute('aria-label', label);
      const btn = el('button', 'btn btn-ghost', label); btn.type = 'button';
      const add = () => { const v = input.value.trim(); if (v && list.length < max) { list.push({ id: uid(), name: v.slice(0, 60) }); save(); redraw(); } };
      btn.addEventListener('click', add);
      input.addEventListener('keydown', (e) => { if (e.key === 'Enter') add(); });
      if (list.length >= max) { input.disabled = true; btn.disabled = true; }
      row.append(input, btn);
      return row;
    }
    const card = el('div', 'card');
    card.append(adder('Add a school', 'Every school you are weighing, Minerva included', s.schools, MAX_SCHOOLS),
      adder('Add a criterion', 'What matters to you: cost, class size, a city, a program', s.criteria, MAX_CRITERIA));
    root.append(card);
    if (!s.schools.length || !s.criteria.length) {
      root.append(el('p', 'body', 'Add at least one school and one criterion. ATLAS fills in nothing: the facts come from each school\'s own pages, and the judgment is yours.'));
      return;
    }
    const del = (name, onClick) => { const b = el('button', 'saved-delete', '×'); b.type = 'button'; b.setAttribute('aria-label', `Remove ${name}`); b.addEventListener('click', onClick); return b; };
    const table = el('table', 'reflect-table schools-table');
    const hr = el('tr'); hr.append(el('th', null, 'Criterion'));
    s.schools.forEach((sc) => {
      const th = el('th'); th.append(`${sc.name} `, del(sc.name, () => { s.schools = s.schools.filter((x) => x.id !== sc.id); save(); redraw(); }));
      hr.append(th);
    });
    table.append(hr);
    s.criteria.forEach((cr) => {
      const tr = el('tr');
      const th = el('th'); th.append(`${cr.name} `, del(cr.name, () => { s.criteria = s.criteria.filter((x) => x.id !== cr.id); save(); redraw(); }));
      tr.append(th);
      s.schools.forEach((sc) => {
        const td = el('td');
        const ta = el('textarea', 'field-input');
        ta.rows = 2; ta.value = s.cells[`${sc.id}|${cr.id}`] || '';
        ta.setAttribute('aria-label', `${cr.name} at ${sc.name}`);
        ta.addEventListener('input', () => { s.cells[`${sc.id}|${cr.id}`] = ta.value; save(); });
        td.append(ta); tr.append(td);
      });
      table.append(tr);
    });
    const wrap = el('div', 'reflect-table-wrap'); wrap.append(table);
    const acts = el('div', 'pw-actions');
    const pr = el('button', 'btn btn-primary', 'Print the grid'); pr.type = 'button';
    pr.addEventListener('click', () => {
      document.body.classList.add('printing-grid');
      const done = () => { document.body.classList.remove('printing-grid'); window.removeEventListener('afterprint', done); };
      window.addEventListener('afterprint', done);
      window.print();
      setTimeout(() => { if (!window.matchMedia('print').matches) done(); }, 1500);
    });
    acts.append(pr);
    root.append(wrap, acts);
  }

  /* ---------------- Weekly workload ---------------- */

  // Handbook 6.13: a 4-credit course is two 90-minute seminars a week plus a
  // minimum of 8 to 10 hours outside class. EL199 work during a semester is
  // capped at 120 hours, typically no more than 10 a week over 12 weeks.
  const SEMINAR_HOURS = 3;
  const OUTSIDE = [8, 10];
  const EL_MAX_WEEKLY = 10;
  const WEEK_HOURS = 168;

  function weekHours(w) {
    const own = (w.own || []).reduce((sum, o) => sum + (Number(o.hours) || 0), 0);
    const el199 = Math.min(EL_MAX_WEEKLY, Math.max(0, Number(w.el) || 0));
    const n = Math.max(0, Number(w.courses) || 0);
    return { low: n * (SEMINAR_HOURS + OUTSIDE[0]) + el199 + own, high: n * (SEMINAR_HOURS + OUTSIDE[1]) + el199 + own, seminars: n * SEMINAR_HOURS, el199, own };
  }

  function renderWeek(root, handbookUrl) {
    root.textContent = '';
    const w = load('week', { courses: 4, el: 0, own: [] });
    const save = () => store('week', w);
    const redraw = () => renderWeek(root, handbookUrl);
    const controls = el('div', 'card');
    const num = (label, value, max, onChange) => {
      const f = el('label', 'tool-field');
      f.append(el('span', 'caption-label', label));
      const i = el('input', 'field-input');
      i.type = 'number'; i.min = '0'; i.max = String(max); i.value = String(value);
      i.addEventListener('change', () => { onChange(Math.min(max, Math.max(0, Number(i.value) || 0))); save(); redraw(); });
      f.append(i);
      return f;
    };
    const row = el('div', 'tool-controls');
    row.append(num('Courses this semester', w.courses, 6, (v) => { w.courses = v; }),
      num(`EL199 hours a week (at most ${EL_MAX_WEEKLY})`, w.el, EL_MAX_WEEKLY, (v) => { w.el = v; }));
    controls.append(row);

    controls.append(el('h3', 'section-header', 'My other commitments'));
    w.own.forEach((o, i) => {
      const r = el('div', 'tool-controls week-own');
      const name = el('input', 'field-input'); name.value = o.name; name.placeholder = 'e.g. sleep, a job, a club'; name.setAttribute('aria-label', 'Commitment');
      name.addEventListener('input', () => { o.name = name.value.slice(0, 60); save(); });
      const hrs = el('input', 'field-input week-hours'); hrs.type = 'number'; hrs.min = '0'; hrs.max = '100'; hrs.value = String(o.hours);
      hrs.setAttribute('aria-label', `Hours a week for ${o.name || 'this commitment'}`);
      hrs.addEventListener('change', () => { o.hours = Math.min(100, Math.max(0, Number(hrs.value) || 0)); save(); redraw(); });
      const del = el('button', 'saved-delete', '×'); del.type = 'button'; del.setAttribute('aria-label', `Remove ${o.name}`);
      del.addEventListener('click', () => { w.own.splice(i, 1); save(); redraw(); });
      r.append(name, hrs, el('span', 'caption', 'h/week'), del);
      controls.append(r);
    });
    if (w.own.length < 8) {
      const add = el('button', 'btn btn-ghost', 'Add a commitment'); add.type = 'button';
      add.addEventListener('click', () => { w.own.push({ name: '', hours: 0 }); save(); redraw(); });
      controls.append(add);
    }
    root.append(controls);

    const h = weekHours(w);
    const out = el('div', 'card');
    out.append(el('h3', 'section-header', `At least ${h.low} to ${h.high} hours a week`),
      el('p', 'body', `${w.courses} × (${SEMINAR_HOURS} h of seminars + ${OUTSIDE[0]} to ${OUTSIDE[1]} h outside class) + ${h.el199} h EL199 + ${h.own} h of your own = ${h.low} to ${h.high} h. Left of ${WEEK_HOURS}: ${Math.max(0, WEEK_HOURS - h.high)} to ${Math.max(0, WEEK_HOURS - h.low)} h.`));
    const bar = el('div', 'week-bar');
    bar.setAttribute('role', 'img');
    bar.setAttribute('aria-label', `Of ${WEEK_HOURS} hours: ${h.seminars} seminars, ${h.low - h.seminars - h.el199 - h.own} to ${h.high - h.seminars - h.el199 - h.own} coursework, ${h.el199} EL199, ${h.own} your own`);
    [['week-seminar', h.seminars, 'Seminars'], ['week-work', h.low - h.seminars - h.el199 - h.own, 'Coursework (minimum)'], ['week-range', h.high - h.low, 'Up to'], ['week-el', h.el199, 'EL199'], ['week-mine', h.own, 'Yours']].forEach(([cls, v, label]) => {
      if (v <= 0) return;
      const seg = el('span', `week-seg ${cls}`);
      seg.style.width = `${Math.min(100, (v / WEEK_HOURS) * 100)}%`;
      seg.title = `${label}: ${v} h`;
      bar.append(seg);
    });
    out.append(bar, el('p', 'caption', 'Not counted: one Location-Based Assignment per course, which the handbook gives no hours for. Some courses meet less and ask for more outside class.'));
    if (h.high > WEEK_HOURS) out.append(el('p', 'body week-over', `That is more than the ${WEEK_HOURS} hours in a week.`));
    const src = el('p', 'caption pw-source');
    src.append(el('span', 'caption-label', 'Source: '), link('Undergraduate Student Handbook 2026-27, 6.13 Course Credit and the EL199 rules', handbookUrl));
    out.append(src);
    root.append(out);
  }

  /* ---------------- Interview kit (beside Minerva's stories) ---------------- */

  // Questions the visitor writes for a Minervan or alum, and the answers
  // they hear back, kept per college. `approved` are editor-approved
  // starter questions from editorial.json (none until the owner signs off).
  function interviewKit(college, approved) {
    const all = load('interview', {});
    const mine = all[college] = all[college] || { questions: '', answers: '' };
    const box = el('div', 'interview-kit');
    box.append(el('p', 'caption pw-about-group', 'Interview kit'));
    if ((approved || []).length) {
      const ul = el('ul', 'pw-facts');
      approved.forEach((q) => ul.append(el('li', 'body', q)));
      box.append(ul);
    }
    box.append(textarea('My questions for a Minervan or alum', mine.questions, 3, (v) => { mine.questions = v; store('interview', all); }),
      textarea('What they told me', mine.answers, 3, (v) => { mine.answers = v; store('interview', all); }));
    return box;
  }

  /* ---------------- Backup and restore of the visitor's notes ---------------- */

  function backupData() {
    const out = {};
    Object.entries(KEYS).forEach(([k, key]) => { try { out[k] = JSON.parse(localStorage.getItem(key) || 'null'); } catch (e) { out[k] = null; } });
    return out;
  }

  // Keep what is here; add what the file has that is not.
  function restoreData(extras) {
    if (!extras || typeof extras !== 'object') return;
    const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);
    if (isObj(extras.journal)) {
      const mine = load('journal', {});
      Object.entries(extras.journal).forEach(([city, text]) => { if (typeof text === 'string' && !mine[city]) mine[city] = text; });
      store('journal', mine);
    }
    if (isObj(extras.interview)) {
      const mine = load('interview', {});
      Object.entries(extras.interview).forEach(([col, v]) => { if (isObj(v) && !mine[col]) mine[col] = { questions: String(v.questions || ''), answers: String(v.answers || '') }; });
      store('interview', mine);
    }
    if (isObj(extras.schools)) {
      const mine = load('schools', { schools: [], criteria: [], cells: {} });
      if (!mine.schools.length && !mine.criteria.length && Array.isArray(extras.schools.schools)) {
        const ok = (x) => x && typeof x.id === 'string' && typeof x.name === 'string';
        store('schools', {
          schools: extras.schools.schools.filter(ok).slice(0, MAX_SCHOOLS),
          criteria: (extras.schools.criteria || []).filter(ok).slice(0, MAX_CRITERIA),
          cells: isObj(extras.schools.cells) ? extras.schools.cells : {},
        });
      }
    }
    if (isObj(extras.week)) {
      let have = null;
      try { have = localStorage.getItem(KEYS.week); } catch (e) { have = null; }
      if (!have) store('week', { courses: Number(extras.week.courses) || 0, el: Number(extras.week.el) || 0, own: Array.isArray(extras.week.own) ? extras.week.own.slice(0, 8) : [] });
    }
  }

  function setData(name, value) { DATA[name] = value; }

  return { renderCities, renderFaq, renderSchools, renderWeek, interviewKit, backupData, restoreData, setData, weekHours, KEYS };
})();

if (typeof module !== 'undefined') module.exports = Guides;

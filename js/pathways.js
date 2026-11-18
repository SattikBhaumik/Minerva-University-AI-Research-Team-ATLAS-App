/**
 * Pathways: the ATLAS pathway explorer.
 *
 * Each stage is a layer: a horizontal row of tabs (2 or 3 options) or a
 * fixed step with one Continue button. Picking a tab opens its panel and
 * drops the next layer in below; changing an earlier tab cuts every layer
 * under it. Only the next step is ever shown, never the whole tree.
 *
 * No applicant data: the picks live in the URL fragment (#path=a.b.c) and
 * nowhere else. No storage, no network beyond loading data/pathways.json.
 *
 * Pathways.validate(data) is pure so js/pathways.test.js can run it in node.
 */
const Pathways = (() => {
  'use strict';

  const MAX_OPTIONS = 3;
  const MIN_OPTIONS = 2;
  const CONTINUE = 'ok';

  /* ---- Data validation (pure) ---- */

  function validate(data) {
    const errors = [];
    const nodes = data && data.nodes;
    if (!nodes || typeof nodes !== 'object') return ['data.nodes is missing'];
    if (!nodes[data.start]) errors.push(`start node "${data.start}" does not exist`);

    const isSource = (s) => s && typeof s.label === 'string' && /^https:\/\//.test(s.url || '');

    for (const [id, node] of Object.entries(nodes)) {
      if (!node.stage || !node.prompt) errors.push(`${id}: needs stage and prompt`);
      if (node.kind === 'choice') {
        const opts = node.options || [];
        if (opts.length < MIN_OPTIONS || opts.length > MAX_OPTIONS) {
          errors.push(`${id}: has ${opts.length} options; must be ${MIN_OPTIONS} to ${MAX_OPTIONS}`);
        }
        const seen = new Set();
        for (const o of opts) {
          if (!o.id || o.id === CONTINUE || seen.has(o.id)) errors.push(`${id}: bad or duplicate option id "${o.id}"`);
          seen.add(o.id);
          if (!o.label || !o.whatYouDo || !o.keepsOpen) errors.push(`${id}/${o.id}: needs label, whatYouDo, keepsOpen`);
          if (!isSource(o.source)) errors.push(`${id}/${o.id}: needs a source with an https url`);
          if (!nodes[o.next]) errors.push(`${id}/${o.id}: next "${o.next}" does not exist`);
        }
      } else if (node.kind === 'step') {
        if (!Array.isArray(node.items) || node.items.length === 0) errors.push(`${id}: step needs items`);
        if (!isSource(node.source)) errors.push(`${id}: needs a source with an https url`);
        if (!nodes[node.next]) errors.push(`${id}: next "${node.next}" does not exist`);
      } else if (node.kind !== 'end') {
        errors.push(`${id}: unknown kind "${node.kind}"`);
      }
    }
    if (errors.length) return errors;

    // Every node reachable from start, and no cycles (every path ends).
    const nextOf = (n) => n.kind === 'choice' ? n.options.map((o) => o.next)
      : n.kind === 'step' ? [n.next] : [];
    const state = {};
    const visit = (id, trail) => {
      if (state[id] === 'open') { errors.push(`cycle: ${trail.concat(id).join(' > ')}`); return; }
      if (state[id] === 'done') return;
      state[id] = 'open';
      nextOf(nodes[id]).forEach((n) => visit(n, trail.concat(id)));
      state[id] = 'done';
    };
    visit(data.start, []);
    Object.keys(nodes).forEach((id) => { if (!state[id]) errors.push(`${id}: unreachable from start`); });
    return errors;
  }

  /* ---- Path <-> URL fragment ---- */

  function readPath() {
    const m = /(?:^#|&)path=([^&]*)/.exec(window.location.hash);
    return m && m[1] ? decodeURIComponent(m[1]).split('.') : [];
  }

  function writePath(path) {
    const url = path.length
      ? `#path=${path.map(encodeURIComponent).join('.')}`
      : window.location.pathname + window.location.search;
    history.replaceState(history.state, '', url);
  }

  /* ---- DOM helpers ---- */

  function el(tag, className, text) {
    const e = document.createElement(tag);
    if (className) e.className = className;
    if (text !== undefined) e.textContent = text;
    return e;
  }

  function sourceLine(source, asOf) {
    const p = el('p', 'caption pw-source');
    p.append('Source: ');
    const a = el('a', null, source.label);
    a.href = source.url;
    a.target = '_blank';
    a.rel = 'noopener';
    p.append(a, ` · as of ${asOf}`);
    return p;
  }

  /* ---- Explorer ---- */

  function mount(root, data) {
    const nodes = data.nodes;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let path = [];          // one entry per layer: option id, or 'ok' for steps
    let layers = [];        // [{ nodeId, section }]
    let uid = 0;

    root.textContent = '';
    const notice = el('p', 'caption pw-notice', data.notice);
    notice.setAttribute('role', 'note');
    const stack = el('div', 'pw-stack');
    root.append(notice, stack);

    function cutBelow(index) {
      layers.slice(index + 1).forEach((l) => l.section.remove());
      layers = layers.slice(0, index + 1);
      path = path.slice(0, index);
    }

    function choose(index, value, animate) {
      cutBelow(index);
      path.push(value);
      writePath(path);
      const node = nodes[layers[index].nodeId];
      const nextId = node.kind === 'choice'
        ? node.options.find((o) => o.id === value).next
        : node.next;
      addLayer(nextId, animate);
    }

    function addLayer(nodeId, animate) {
      const node = nodes[nodeId];
      const index = layers.length;
      const section = el('section', `pw-layer pw-${node.kind}`);
      if (animate) section.classList.add('pw-enter');
      section.setAttribute('aria-label', node.stage);
      if (index > 0) section.append(el('div', 'pw-connector'));

      const card = el('div', 'pw-card');
      card.append(el('p', 'caption pw-stage', node.stage));
      const heading = el('h3', 'section-header pw-prompt', node.prompt);
      card.append(heading);
      section.append(card);
      stack.append(section);
      layers.push({ nodeId, section });

      if (node.kind === 'choice') buildChoice(card, node, index, heading);
      else if (node.kind === 'step') buildStep(card, node, index);
      else buildEnd(card, node);

      if (animate) {
        section.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      }
    }

    function buildChoice(card, node, index, heading) {
      const base = `pw-${uid++}`;
      heading.id = `${base}-h`;
      const tabs = el('div', 'pw-tabs');
      tabs.setAttribute('role', 'tablist');
      tabs.setAttribute('aria-labelledby', heading.id);
      const panel = el('div', 'pw-panel');
      panel.id = `${base}-panel`;
      panel.setAttribute('role', 'tabpanel');
      panel.hidden = true;

      const buttons = node.options.map((opt) => {
        const b = el('button', 'pw-tab', opt.label);
        b.type = 'button';
        b.id = `${base}-${opt.id}`;
        b.setAttribute('role', 'tab');
        b.setAttribute('aria-selected', 'false');
        b.setAttribute('aria-controls', panel.id);
        b.addEventListener('click', () => select(opt, b, true));
        tabs.append(b);
        return b;
      });

      // Arrow keys move focus along the row; Enter or Space picks.
      tabs.addEventListener('keydown', (e) => {
        const i = buttons.indexOf(document.activeElement);
        if (i < 0) return;
        const step = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
        if (!step) return;
        e.preventDefault();
        buttons[(i + step + buttons.length) % buttons.length].focus();
      });

      function select(opt, button, animate) {
        buttons.forEach((b) => {
          const on = b === button;
          b.setAttribute('aria-selected', String(on));
          b.classList.toggle('is-selected', on);
        });
        panel.setAttribute('aria-labelledby', button.id);
        fillPanel(panel, opt);
        panel.hidden = false;
        panel.classList.remove('pw-reveal');
        if (animate) { void panel.offsetWidth; panel.classList.add('pw-reveal'); }
        choose(index, opt.id, animate);
      }

      card.append(tabs, panel);
      layers[index].select = (optId) => {
        const i = node.options.findIndex((o) => o.id === optId);
        if (i < 0) return false;
        select(node.options[i], buttons[i], false);
        return true;
      };
    }

    function fillPanel(panel, opt) {
      panel.textContent = '';
      panel.append(el('p', 'body', opt.whatYouDo));
      if (opt.facts && opt.facts.length) {
        const ul = el('ul', 'pw-facts');
        opt.facts.forEach((f) => ul.append(el('li', 'body', f)));
        panel.append(ul);
      }
      const keeps = el('p', 'body pw-keeps');
      keeps.append(el('span', 'body-strong', 'Keeps open: '), opt.keepsOpen);
      panel.append(keeps, sourceLine(opt.source, data.asOf));
    }

    function buildStep(card, node, index) {
      const ul = el('ul', 'pw-facts');
      node.items.forEach((t) => ul.append(el('li', 'body', t)));
      card.append(ul);
      if (node.note) card.append(el('p', 'body pw-note', node.note));
      card.append(sourceLine(node.source, data.asOf));
      const btn = el('button', 'btn btn-primary pw-continue', node.continueLabel || 'Continue');
      btn.type = 'button';
      const go = (animate) => { btn.hidden = true; choose(index, CONTINUE, animate); };
      btn.addEventListener('click', () => go(true));
      card.append(btn);
      layers[index].select = (value) => { if (value !== CONTINUE) return false; go(false); return true; };
    }

    function buildEnd(card, node) {
      const ol = el('ol', 'pw-summary');
      layers.slice(0, -1).forEach((l, i) => {
        const n = nodes[l.nodeId];
        const label = n.kind === 'choice' ? n.options.find((o) => o.id === path[i]).label : n.prompt;
        const li = el('li', 'body');
        li.append(el('span', 'caption', `${n.stage}: `), label);
        ol.append(li);
      });
      card.append(ol, el('p', 'body-strong pw-note', node.note));

      const actions = el('div', 'pw-actions');
      const share = el('button', 'btn btn-primary', 'Copy link to this path');
      share.type = 'button';
      share.addEventListener('click', async () => {
        try {
          await shareTarget({ title: 'ATLAS pathway', text: 'A possible Minerva path', url: window.location.href });
          if (!navigator.share) share.textContent = 'Link copied';
        } catch (e) {
          share.textContent = 'Could not copy. Use the address bar.';
        }
      });
      const restart = el('button', 'btn btn-ghost', 'Start over');
      restart.type = 'button';
      restart.addEventListener('click', () => {
        cutBelow(0);
        layers[0].section.remove();
        layers = [];
        path = [];
        writePath(path);
        addLayer(data.start, true);
      });
      actions.append(share, restart);
      card.append(actions);
    }

    // Build the first layer, then replay any path from the URL without animation.
    addLayer(data.start, false);
    for (const value of readPath()) {
      const layer = layers[layers.length - 1];
      if (!layer.select || !layer.select(value)) break;
    }
    writePath(path);
  }

  return { validate, mount, MAX_OPTIONS };
})();

if (typeof module !== 'undefined') module.exports = Pathways;

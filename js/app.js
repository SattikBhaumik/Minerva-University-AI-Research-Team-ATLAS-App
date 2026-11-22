/**
 * App — Main Application Logic
 *
 * Architecture: single IIFE wrapping the entire app.
 * Views are <section> elements toggled by showView().
 * Feature modules are nested IIFEs for encapsulation.
 *
 * Conventions:
 *  - $('id') is shorthand for document.getElementById
 *  - All API calls go through API (js/api.js)
 *  - State is plain JS objects/variables (no framework)
 *  - DOM updates use textContent (safe) or innerHTML (only with escHtml)
 *
 * See AGENTS.md for full conventions and DECISIONS.md for architecture choices.
 */

// Dark mode — flash-free init (runs before DOM renders)
(function() {
  const saved = localStorage.getItem('app_theme');
  if (saved === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
})();

(function () {
  'use strict';

  /* ---- Helpers ---- */
  const $ = (id) => document.getElementById(id);

  function escHtml(str) {
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  function showLoading() { /* TODO: show global loading indicator */ }
  function hideLoading() { /* TODO: hide global loading indicator */ }

  /* ---- DOM Refs ---- */
  const viewHome = $('view-home');
  const roleBtns = document.querySelectorAll('[data-role]');
  let pathways = null;

  /* ---- State ---- */
  let currentView = 'home';
  let currentItem = null;
  // Player-level mute (?mute=1 door). Every player reads it, so a harness run
  // is silent unless it opts in.
  let playerMuted = false;

  /* ================================================================
     VIEW SYSTEM
  ================================================================ */

  /**
   * Switch the active view. Hides all views, shows the target.
   * Updates sidebar nav active state and browser history.
   *
   * Wrapped in document.startViewTransition() when supported — gives
   * us cross-view morphs at zero JS cost (analog to iOS
   * .matchedTransitionSource + .zoom and Android sharedBounds). Falls
   * back to instant swap when unsupported (Safari ≤ 18 / Firefox).
   * The API auto-disables itself under prefers-reduced-motion.
   *
   * IntersectionObserver instances inside views MUST pass
   * `root: document.getElementById('main-content')` since <main> is
   * the scroll container (body is overflow:hidden flex-column).
   * Disconnect observers when leaving the view to prevent memory leaks.
   */
  function showView(name, fromHistory = false) {
    if (document.startViewTransition) {
      document.startViewTransition(() => applyViewSwap(name, fromHistory));
    } else {
      applyViewSwap(name, fromHistory);
    }
  }

  function applyViewSwap(name, fromHistory) {
    currentView = name;

    // Define your views and nav buttons here:
    const views = {
      home: viewHome,
      map: $('view-map'),
      tracker: $('view-tracker'),
      compare: $('view-compare'),
      minors: $('view-minors'),
      reflect: $('view-reflect'),
      calendar: $('view-calendar'),
      cities: $('view-cities'),
      faq: $('view-faq'),
      schools: $('view-schools'),
      week: $('view-week'),
    };
    const navBtns = {};
    document.querySelectorAll('.tool-nav').forEach((b) => { navBtns[b.dataset.view] = b; });
    if (!views[name]) name = 'home';

    Object.entries(views).forEach(([n, el]) => {
      if (el) { el.hidden = n !== name; }
    });

    Object.entries(navBtns).forEach(([n, btn]) => {
      if (btn) {
        btn.classList.toggle('active', n === name);
        btn.setAttribute('aria-current', n === name ? 'page' : 'false');
      }
    });

    // Close mobile sidebar on navigation
    $('channels-sidebar')?.classList.remove('open');

    if (!fromHistory) {
      const url = name === 'home' ? `?${location.hash}` : `?view=${name}${location.hash}`;
      history.pushState({ view: name }, '', url);
      document.title = name === 'home' ? 'ATLAS' : `ATLAS — ${name}`;
    }

    renderTool(name);

    // Stop/cleanup for views that need it when leaving:
    // if (name !== 'tv') window.tvStop?.();
  }

  /* ================================================================
     AUTH
  ================================================================ */

  // FILL IN: Your auth flow
  // Example pattern:
  // $('auth-form').addEventListener('submit', async (e) => {
  //   e.preventDefault();
  //   try {
  //     const session = await API.login(handle, password);
  //     localStorage.setItem('session', JSON.stringify(session));
  //     authScreen.hidden = true;
  //     appScreen.hidden = false;
  //     init();
  //   } catch (err) {
  //     $('auth-error').textContent = err.message;
  //     $('auth-error').hidden = false;
  //   }
  // });

  /* ================================================================
     PATHWAYS
  ================================================================ */

  // The tool views render on show, once the catalog has loaded.
  let pathwaysData = null;
  let toolsReady = false;
  let handbookUrl = '';
  function renderTool(name) {
    if (!toolsReady) return;
    const root = $(`${name}-root`);
    if (!root) return;
    const q = new URLSearchParams(window.location.search);
    if (name === 'map') Tools.renderMap(root, q.get('course'));
    if (name === 'tracker') Tools.renderTracker(root);
    if (name === 'compare') Tools.renderCompare(root, SavedPaths);
    if (name === 'minors') Tools.renderMinors(root, SavedPaths);
    if (name === 'reflect') Tools.renderReflect(root, SavedPaths);
    if (name === 'calendar') Tools.renderCalendar(root);
    if (name === 'cities') Guides.renderCities(root);
    if (name === 'faq') Guides.renderFaq(root);
    if (name === 'schools') Guides.renderSchools(root);
    if (name === 'week') Guides.renderWeek(root, handbookUrl);
  }

  async function loadPathways() {
    const root = $('pathways-root');
    try {
      const data = await API.getPathways();
      const errors = Pathways.validate(data);
      if (errors.length) throw new Error(errors[0]);
      pathways = Pathways.mount(root, data);
      pathwaysData = data;
      API.getCatalog().then((cat) => {
        const pdf = (Object.values(data.courseInfo)[0] || { url: '' }).url.split('#')[0];
        Tools.init(cat, data, pdf);
        toolsReady = true;
        renderTool(currentView);
        API.getCalendar().then((cal) => {
          Tools.setCalendar(cal);
          handbookUrl = (cal.sources && cal.sources.handbook && cal.sources.handbook.url) || '';
          if (currentView === 'calendar' || currentView === 'week') renderTool(currentView);
        }).catch((err) => console.log('calendar load failed', err));
        API.getScholarships().then((sch) => { Tools.setScholarships(sch); if (currentView === 'calendar') renderTool('calendar'); })
          .catch((err) => console.log('scholarships load failed', err));
        API.getRotation().then((r) => { Guides.setData('rotation', r); if (currentView === 'cities') renderTool('cities'); })
          .catch((err) => console.log('rotation load failed', err));
        API.getFaq().then((f) => { Guides.setData('faq', f); if (currentView === 'faq') renderTool('faq'); })
          .catch((err) => console.log('faq load failed', err));
      }).catch((err) => console.log('catalog load failed', err));
    } catch (err) {
      console.log('pathways load failed', err);
      root.textContent = '';
      const banner = document.createElement('div');
      banner.className = 'error-banner';
      banner.setAttribute('role', 'alert');
      banner.textContent = 'Could not load the pathways. Reload the page to try again.';
      root.append(banner);
    }
  }

  /* ================================================================
     INITIALIZATION
  ================================================================ */

  // Reload once if a newer version is deployed than the one this page runs.
  async function checkForNewVersion() {
    try {
      const latest = await API.getLatestVersion();
      const key = `atlas_reloaded_for_${latest}`;
      if (latest && API.version && latest !== API.version && !sessionStorage.getItem(key)) {
        sessionStorage.setItem(key, '1');
        window.location.reload();
      }
    } catch (err) {
      console.log('version check skipped', err);
    }
  }

  /* ================================================================
     SAVED PATHS (this browser only; see js/saved.js)
  ================================================================ */

  const sidebar = $('channels-sidebar');
  const menuBtns = document.querySelectorAll('.menu-btn');

  function setMenu(open) {
    sidebar?.classList.toggle('open', open);
    menuBtns.forEach((b) => b.setAttribute('aria-expanded', String(open)));
  }

  function setSavedOpen(role, open) {
    const toggle = document.querySelector(`[data-saved-toggle="${role}"]`);
    const list = document.querySelector(`[data-saved-list="${role}"]`);
    toggle.setAttribute('aria-expanded', String(open));
    list.hidden = !open;
  }

  // Rounded to two significant figures: the limit itself is an estimate.
  function roughly(n) {
    if (n < 100) return String(n);
    const p = 10 ** (String(Math.floor(n)).length - 2);
    return (Math.floor(n / p) * p).toLocaleString();
  }

  function renderStorage() {
    const note = $('storage-note');
    if (!note) return;
    const u = SavedPaths.usage();
    if (!u.available) {
      note.textContent = 'Saving is unavailable in this browser.';
      return;
    }
    const saved = `${u.count} ${u.count === 1 ? 'plan' : 'plans'} saved`;
    note.textContent = u.plansLeft > 0
      ? `${saved} · room for about ${roughly(u.plansLeft)} more · this browser only`
      : `${saved} · storage full: delete a plan to save another`;
  }

  function renderSaved() {
    renderStorage();
    const entries = SavedPaths.list();
    ['applicant', 'minervan'].forEach((role) => {
      const mine = entries.filter((e) => e.role === role);
      document.querySelector(`[data-saved-count="${role}"]`).textContent = String(mine.length);
      const list = document.querySelector(`[data-saved-list="${role}"]`);
      list.textContent = '';
      if (!mine.length) {
        const empty = document.createElement('li');
        empty.className = 'caption saved-empty';
        empty.textContent = 'None saved yet';
        list.append(empty);
      }
      mine.forEach((entry) => {
        const li = document.createElement('li');
        li.className = 'saved-item';
        const open = document.createElement('button');
        open.type = 'button';
        open.className = 'saved-open';
        const name = document.createElement('span');
        name.className = 'saved-name';
        name.textContent = entry.name;
        const when = document.createElement('span');
        when.className = 'caption';
        when.textContent = new Date(entry.savedAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
        open.append(name, when);
        open.addEventListener('click', () => {
          pathways?.startWith(entry.path, true);
          setMenu(false);
        });
        const ren = document.createElement('button');
        ren.type = 'button';
        ren.className = 'saved-delete saved-rename';
        ren.setAttribute('aria-label', `Rename saved plan ${entry.name}`);
        ren.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>';
        ren.addEventListener('click', () => {
          // Swap the name for a text box: Enter or leaving it saves, Esc cancels.
          const input = document.createElement('input');
          input.type = 'text';
          input.className = 'field-input saved-input';
          input.value = entry.name;
          input.maxLength = SavedPaths.MAX_NAME;
          input.setAttribute('aria-label', 'New name for this plan');
          let done = false;
          const finish = (keep) => {
            if (done) return;
            done = true;
            if (keep) SavedPaths.rename(entry.id, input.value);
            renderSaved();
            setSavedOpen(entry.role, true);
            document.querySelector(`[data-saved-list="${entry.role}"] [data-id="${entry.id}"]`)?.focus();
          };
          input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') { e.preventDefault(); finish(true); }
            if (e.key === 'Escape') { e.preventDefault(); finish(false); }
          });
          input.addEventListener('blur', () => finish(true));
          li.replaceChildren(input);
          input.focus();
          input.select();
        });
        open.dataset.id = entry.id;
        const del = document.createElement('button');
        del.type = 'button';
        del.className = 'saved-delete';
        del.setAttribute('aria-label', `Delete saved plan ${entry.name}`);
        del.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>';
        del.addEventListener('click', () => {
          if (!window.confirm(`Delete "${entry.name}"?`)) return;
          SavedPaths.remove(entry.id);
          renderSaved();
        });
        li.append(open, ren, del);
        list.append(li);
      });
    });
  }

  async function init() {
    renderSaved();
    document.querySelectorAll('[data-saved-toggle]').forEach((toggle) => {
      toggle.addEventListener('click', () => {
        const role = toggle.dataset.savedToggle;
        setSavedOpen(role, toggle.getAttribute('aria-expanded') !== 'true');
      });
    });
    // Backups: a file the visitor keeps, so clearing the browser loses nothing.
    $('backup-btn')?.addEventListener('click', () => {
      let reflect = null;
      try { reflect = JSON.parse(localStorage.getItem(Tools.REFLECT_KEY) || 'null'); } catch (err) { reflect = null; }
      const blob = new Blob([JSON.stringify({ atlas: 'saved-plans', version: 3, plans: SavedPaths.list(), reflect, extras: Guides.backupData() }, null, 1)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `atlas-saved-plans-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    });
    $('restore-input')?.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      let added = 0, ok = false;
      try {
        const parsed = JSON.parse(await file.text());
        ({ added, ok } = SavedPaths.importAll(Array.isArray(parsed) ? parsed : parsed.plans));
        // Reflection notes: keep what is here, add what the file has that is not.
        if (ok && parsed.reflect && typeof parsed.reflect === 'object') {
          let mine = {};
          try { mine = JSON.parse(localStorage.getItem(Tools.REFLECT_KEY) || '{}'); } catch (err) { mine = {}; }
          const merged = {
            notes: Object.assign({}, parsed.reflect.notes || {}, mine.notes || {}),
            criteria: (mine.criteria && mine.criteria.length) ? mine.criteria : (parsed.reflect.criteria || []).slice(0, 6),
            ratings: Object.assign({}, parsed.reflect.ratings || {}, mine.ratings || {}),
          };
          try { localStorage.setItem(Tools.REFLECT_KEY, JSON.stringify(merged)); } catch (err) { /* storage blocked */ }
        }
        if (ok) Guides.restoreData(parsed.extras);
      } catch (err) { ok = false; }
      e.target.value = '';
      renderSaved();
      $('storage-note').textContent = ok ? `Restored ${added} ${added === 1 ? 'plan' : 'plans'} from the file.` : 'That file is not an ATLAS backup.';
      setTimeout(renderStorage, 4000);
    });

    window.addEventListener('pathways:save', (e) => {
      e.detail.ok = SavedPaths.save(e.detail.path, e.detail.name);
      renderSaved();
      if (e.detail.ok) setSavedOpen(e.detail.path[0], true);
    });
    menuBtns.forEach((b) => b.addEventListener('click', () => setMenu(!sidebar.classList.contains('open'))));
    // Phones: a tap outside the open sidebar closes it.
    document.addEventListener('click', (e) => {
      // A control the click just replaced (rename) is detached: not "outside".
      if (!e.target.isConnected) return;
      if (sidebar?.classList.contains('open') && !sidebar.contains(e.target) && ![...menuBtns].some((b) => b.contains(e.target))) setMenu(false);
    });
    checkForNewVersion();
    // Sidebar roles start a fresh path with that answer picked; the active
    // role follows whatever the first answer in the path is.
    document.querySelectorAll('.tool-nav').forEach((btn) => btn.addEventListener('click', () => {
      showView(btn.dataset.view);
      setMenu(false);
    }));
    roleBtns.forEach((btn) => btn.addEventListener('click', () => {
      if (currentView !== 'home') showView('home');
      pathways?.startWith([btn.dataset.role], true);
      setMenu(false);
    }));
    window.addEventListener('pathways:change', (e) => {
      roleBtns.forEach((btn) => {
        const on = btn.dataset.role === e.detail[0];
        btn.classList.toggle('active', on);
        if (on) btn.setAttribute('aria-current', 'true'); else btn.removeAttribute('aria-current');
      });
    });
    loadPathways();

    // URL routing (deep links / bookmarks). The URL is the web's door — the
    // twin of the native harness hooks in tools/app_config.py:
    //   ?view=<tab>          APP_START_TAB     (also a real, shareable URL)
    //   ?item=<id>           APP_START_ITEM    (also a real, shareable URL)
    //   ?mute=1              APP_MUTE
    //   ?door_seconds=<n>    APP_DOOR_SECONDS  (return home after n seconds)
    const params = new URLSearchParams(window.location.search);
    // First render swaps instantly: a view transition here cross-fades the
    // page against itself while a #path= link scrolls to its last layer.
    applyViewSwap(params.get('view') || 'home', true);
    const urlItem = params.get('item');
    if (urlItem) currentItem = urlItem; // FILL IN: open the item's detail view
    if (params.get('mute') === '1') playerMuted = true;
    const doorSeconds = Number(params.get('door_seconds'));
    if (doorSeconds > 0) {
      setTimeout(() => { currentItem = null; showView('home'); }, doorSeconds * 1000);
    }
  }

  // Browser back/forward
  window.addEventListener('popstate', (e) => {
    const view = e.state?.view || 'home';
    showView(view, true);
  });

  /* ================================================================
     BOOT
  ================================================================ */
  init();
})();

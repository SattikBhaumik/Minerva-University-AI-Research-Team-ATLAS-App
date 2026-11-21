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
    };
    const navBtns = {
    };

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

  async function loadPathways() {
    const root = $('pathways-root');
    try {
      const data = await API.getPathways();
      const errors = Pathways.validate(data);
      if (errors.length) throw new Error(errors[0]);
      pathways = Pathways.mount(root, data);
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
  const menuBtn = $('menu-btn');

  function setMenu(open) {
    sidebar?.classList.toggle('open', open);
    menuBtn?.setAttribute('aria-expanded', String(open));
  }

  function setSavedOpen(role, open) {
    const toggle = document.querySelector(`[data-saved-toggle="${role}"]`);
    const list = document.querySelector(`[data-saved-list="${role}"]`);
    toggle.setAttribute('aria-expanded', String(open));
    list.hidden = !open;
  }

  function renderSaved() {
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
        li.append(open, del);
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
    window.addEventListener('pathways:save', (e) => {
      e.detail.ok = SavedPaths.save(e.detail.path, e.detail.name);
      renderSaved();
      if (e.detail.ok) setSavedOpen(e.detail.path[0], true);
    });
    menuBtn?.addEventListener('click', () => setMenu(!sidebar.classList.contains('open')));
    // Phones: a tap outside the open sidebar closes it.
    document.addEventListener('click', (e) => {
      if (sidebar?.classList.contains('open') && !sidebar.contains(e.target) && !menuBtn.contains(e.target)) setMenu(false);
    });
    checkForNewVersion();
    // Sidebar roles start a fresh path with that answer picked; the active
    // role follows whatever the first answer in the path is.
    roleBtns.forEach((btn) => btn.addEventListener('click', () => {
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

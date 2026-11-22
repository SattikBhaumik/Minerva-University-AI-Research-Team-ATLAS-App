/**
 * SavedPaths: pathways a visitor saved, kept in this browser only.
 *
 * ATLAS never sends applicant data anywhere: saved paths live in
 * localStorage on this device and nowhere else. Every access is wrapped,
 * because storage can be blocked (private windows, cleared site data);
 * then the list is simply empty and saving reports that it failed.
 *
 * Entry: { id, role, path: [option ids], name, savedAt (ISO date), renamed? }
 */
const SavedPaths = (() => {
  'use strict';

  const KEY = 'atlas_saved_paths';
  const MAX_NAME = 80;
  // Browsers do not report the localStorage limit. Chrome, Edge, Firefox
  // and Safari all allow about 5 MB per site, so estimate with 5,000,000
  // characters. The site is sattikbhaumik.github.io, shared by every
  // GitHub Pages project there, so usage counts every key, not just ours.
  const LIMIT_CHARS = 5000000;
  const TYPICAL_PLAN_CHARS = 230;

  function list() {
    try {
      const raw = JSON.parse(localStorage.getItem(KEY) || '[]');
      return Array.isArray(raw) ? raw.filter((e) => e && Array.isArray(e.path) && e.path.length) : [];
    } catch (e) {
      return [];
    }
  }

  function write(entries) {
    try {
      localStorage.setItem(KEY, JSON.stringify(entries));
      return true;
    } catch (e) {
      return false;
    }
  }

  // Saving the same path again refreshes its date instead of duplicating it.
  function save(path, name) {
    const entries = list();
    const key = path.join('.');
    const now = new Date().toISOString();
    const existing = entries.find((e) => e.path.join('.') === key);
    if (existing) {
      existing.savedAt = now;
      if (!existing.renamed) existing.name = name;
    } else {
      entries.unshift({ id: `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`, role: path[0], path, name, savedAt: now });
    }
    entries.sort((a, b) => b.savedAt.localeCompare(a.savedAt));
    return write(entries);
  }

  // A blank name keeps the old one; a name the person chose survives re-saves.
  function rename(id, name) {
    const clean = String(name || '').replace(/\s+/g, ' ').trim().slice(0, MAX_NAME);
    const entries = list();
    const entry = entries.find((e) => e.id === id);
    if (!entry || !clean) return false;
    entry.name = clean;
    entry.renamed = true;
    return write(entries);
  }

  function remove(id) {
    return write(list().filter((e) => e.id !== id));
  }

  // Room left, as plans: free characters / the average size of a saved plan.
  function usage() {
    try {
      let used = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        used += k.length + (localStorage.getItem(k) || '').length;
      }
      const entries = list();
      const ours = (localStorage.getItem(KEY) || '').length;
      const perPlan = entries.length ? Math.max(TYPICAL_PLAN_CHARS, Math.ceil(ours / entries.length)) : TYPICAL_PLAN_CHARS;
      const freeChars = Math.max(0, LIMIT_CHARS - used);
      return { available: true, count: entries.length, usedChars: used, freeChars, plansLeft: Math.floor(freeChars / perPlan) };
    } catch (e) {
      return { available: false, count: 0, usedChars: 0, freeChars: 0, plansLeft: 0 };
    }
  }

  // Restore from a backup file: only well-formed entries, merged by path
  // (an existing plan keeps its name), so restoring twice adds nothing.
  function importAll(entries) {
    if (!Array.isArray(entries)) return { added: 0, ok: false };
    const current = list();
    const known = new Set(current.map((e) => e.path.join('.')));
    let added = 0;
    entries.forEach((e) => {
      const valid = e && Array.isArray(e.path) && e.path.length && e.path.every((x) => typeof x === 'string' && /^[\w-]+$/.test(x))
        && typeof e.name === 'string' && ['applicant', 'minervan'].includes(e.path[0]);
      if (!valid || known.has(e.path.join('.'))) return;
      known.add(e.path.join('.'));
      current.push({
        id: `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`, role: e.path[0], path: e.path,
        name: e.name.slice(0, MAX_NAME), savedAt: typeof e.savedAt === 'string' ? e.savedAt : new Date().toISOString(), renamed: Boolean(e.renamed),
      });
      added++;
    });
    current.sort((a, b) => b.savedAt.localeCompare(a.savedAt));
    return { added, ok: write(current) };
  }

  return { list, save, rename, remove, usage, importAll, MAX_NAME, LIMIT_CHARS };
})();

if (typeof module !== 'undefined') module.exports = SavedPaths;

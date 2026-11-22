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

  return { list, save, rename, remove, MAX_NAME };
})();

if (typeof module !== 'undefined') module.exports = SavedPaths;

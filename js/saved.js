/**
 * SavedPaths: pathways a visitor saved, kept in this browser only.
 *
 * ATLAS never sends applicant data anywhere: saved paths live in
 * localStorage on this device and nowhere else. Every access is wrapped,
 * because storage can be blocked (private windows, cleared site data);
 * then the list is simply empty and saving reports that it failed.
 *
 * Entry: { id, role, path: [option ids], name, savedAt (ISO date) }
 */
const SavedPaths = (() => {
  'use strict';

  const KEY = 'atlas_saved_paths';

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
      existing.name = name;
    } else {
      entries.unshift({ id: `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`, role: path[0], path, name, savedAt: now });
    }
    entries.sort((a, b) => b.savedAt.localeCompare(a.savedAt));
    return write(entries);
  }

  function remove(id) {
    return write(list().filter((e) => e.id !== id));
  }

  return { list, save, remove };
})();

if (typeof module !== 'undefined') module.exports = SavedPaths;

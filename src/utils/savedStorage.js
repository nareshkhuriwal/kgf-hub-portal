const KEY = "kgf_saved_item_ids";

export function loadSavedIds() {
  try {
    const raw = localStorage.getItem(KEY);
    return Array.isArray(JSON.parse(raw)) ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveSavedIds(idsArray) {
  try {
    localStorage.setItem(KEY, JSON.stringify(idsArray || []));
  } catch {}
}

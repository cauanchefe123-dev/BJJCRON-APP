export function getDeletedIds(): Set<string> {
  try {
    const saved = localStorage.getItem('bjjcron_deleted_ids');
    if (saved) {
      const arr = JSON.parse(saved);
      return new Set(arr.map((id: string) => String(id).toLowerCase().trim()));
    }
  } catch (e) {}
  return new Set();
}

export function markAsDeleted(...identifiers: (string | undefined | null)[]) {
  const set = getDeletedIds();
  let changed = false;
  identifiers.forEach(id => {
    if (!id) return;
    const clean = String(id).toLowerCase().trim();
    if (clean && !set.has(clean)) {
      set.add(clean);
      changed = true;
    }
  });
  if (changed) {
    localStorage.setItem('bjjcron_deleted_ids', JSON.stringify(Array.from(set)));
  }
}

export function isDeletedRecord(...identifiers: (string | undefined | null)[]): boolean {
  const set = getDeletedIds();
  return identifiers.some(id => {
    if (!id) return false;
    const clean = String(id).toLowerCase().trim();
    return set.has(clean);
  });
}

export function isTestMockRecord(val: string | undefined | null): boolean {
  return false;
}

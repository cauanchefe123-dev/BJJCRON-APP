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
  if (!val) return false;
  const str = String(val).toLowerCase().trim();
  return (
    str.includes('std-pending-') ||
    str.includes('user-student-pending-') ||
    str === 'std-1' ||
    str === 'std-2' ||
    str === 'std-3' ||
    str === 'std-4' ||
    str === 'std-5' ||
    str === 'std-6' ||
    str === 'std-7' ||
    str === 'std-precad-1' ||
    str === 'user-student-1' ||
    str === 'user-student-2' ||
    str === 'user-student-precadastrado' ||
    str === 'user-admin' ||
    str === 'user-prof-1' ||
    str === 'aluno@bjjcron.com' ||
    str === 'ana.roxa@bjjcron.com' ||
    str === 'matheus.equipe@bjjcron.com' ||
    str === 'rodrigo.mendes@email.com' ||
    str === 'beatriz.marrom@email.com' ||
    str === 'pai.enzo@email.com' ||
    str === 'felipe.camargo@email.com' ||
    str === 'professor@bjjcron.com' ||
    str === 'admin@bjjcron.com' ||
    str === 'bruno.solicitacao@email.com' ||
    str === 'rafael.trovao@email.com' ||
    str === 'camila.oliveira@email.com' ||
    str.includes('matheus pre-cadastrado') ||
    str.includes('beatriz santos') ||
    str.includes('enzo gabriel') ||
    str.includes('felipe camargo') ||
    str.includes('lucas silva') ||
    str.includes('ana paula oliveira') ||
    str.includes('rodrigo mendes')
  );
}

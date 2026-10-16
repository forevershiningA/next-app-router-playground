import type { HeadstoneState } from '#/lib/headstone-store.types';

type ObjectVisibility = Pick<
  HeadstoneState,
  'showBase' | 'showLedger' | 'showKerbset'
>;

export function clampEditingObject(
  editingObject: HeadstoneState['editingObject'],
  visibility: ObjectVisibility,
): HeadstoneState['editingObject'] {
  if (editingObject === 'ledger' && !visibility.showLedger) {
    return visibility.showBase ? 'base' : 'headstone';
  }
  if (editingObject === 'kerbset' && !visibility.showKerbset) {
    if (visibility.showLedger) return 'ledger';
    if (visibility.showBase) return 'base';
    return 'headstone';
  }
  if (editingObject === 'base' && !visibility.showBase) {
    return visibility.showLedger ? 'ledger' : 'headstone';
  }
  return editingObject;
}

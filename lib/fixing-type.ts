import type { FixingType } from '#/lib/headstone-store';

const FIXING_TYPE_LABELS: Record<FixingType, string> = {
  'flat-back': 'Flat Back',
  'lugs-with-studs': 'Lugs with Studs',
  screws: 'Screws (visible from front)',
};

export function getFixingTypeLabel(fixingType: FixingType): string {
  return FIXING_TYPE_LABELS[fixingType];
}

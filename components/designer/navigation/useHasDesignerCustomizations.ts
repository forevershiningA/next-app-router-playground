'use client';

import { useHeadstoneStore } from '#/lib/headstone-store';

export function useHasDesignerCustomizations() {
  const hasInscriptions = useHeadstoneStore(
    (state) => state.inscriptions.length > 0,
  );
  const hasAdditions = useHeadstoneStore(
    (state) => state.selectedAdditions.length > 0,
  );
  const hasMotifs = useHeadstoneStore(
    (state) => state.selectedMotifs.length > 0,
  );
  const hasEmblems = useHeadstoneStore(
    (state) => state.selectedEmblems.length > 0,
  );

  return hasInscriptions || hasAdditions || hasMotifs || hasEmblems;
}

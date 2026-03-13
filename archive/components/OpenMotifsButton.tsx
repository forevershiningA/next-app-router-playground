/**
 * Example button component to open the motifs overlay panel
 * You can use this anywhere in your app to trigger the motifs panel
 */

'use client';

import { useHeadstoneStore } from '#/lib/headstone-store';

export function OpenMotifsButton() {
  const setActivePanel = useHeadstoneStore((s) => s.setActivePanel);

  const handleClick = () => {
    setActivePanel('motifs');
  };

  return (
    <button
      onClick={handleClick}
      className="rounded-lg bg-violet-600 px-4 py-2 font-medium text-white hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2"
    >
      Select Motifs
    </button>
  );
}

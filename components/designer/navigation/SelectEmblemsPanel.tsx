'use client';

import { useHeadstoneStore } from '#/lib/headstone-store';
import { loadEmblems } from '#/app/_internal/_emblems-loader';
import EmblemOverlayPanel from '#/components/designer/panels/EmblemOverlayPanel';
import EmblemSelectionGrid from '#/app/select-emblems/_ui/EmblemSelectionGrid';

export default function SelectEmblemsPanel() {
  const activePanel = useHeadstoneStore((s) => s.activePanel);
  const selectedEmblemId = useHeadstoneStore((s) => s.selectedEmblemId);
  const emblems = loadEmblems();

  return (
    <div className="flex h-full flex-col">
      {activePanel === 'emblem' && selectedEmblemId && (
        <div className="day:border-gray-200 day:bg-white/95 mb-4 rounded-2xl border border-[#3A3A3A] bg-[#1F1F1F]/95 p-4 shadow-xl backdrop-blur-sm">
          <EmblemOverlayPanel />
        </div>
      )}
      <div className="day:border-gray-200 day:bg-white/95 flex-1 overflow-hidden rounded-2xl border border-[#3A3A3A] bg-[#1F1F1F]/95 shadow-xl shadow-black/15">
        <EmblemSelectionGrid emblems={emblems} />
      </div>
    </div>
  );
}

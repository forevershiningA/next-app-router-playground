'use client';

import { data } from '#/app/_internal/_data';
import AdditionSelector from '#/components/designer/selectors/AdditionSelector';
import { formatDimensionTriplet } from '#/lib/unit-system';
import { useUnitSystem } from '#/lib/use-unit-system';
import { useHeadstoneStore } from '#/lib/headstone-store';

type SelectAdditionsPanelProps = {
  forceAdditionCatalog: boolean;
  panelSource: 'menu' | 'canvas' | null;
  isSelectAdditionsPage: boolean;
};

export default function SelectAdditionsPanel({
  forceAdditionCatalog,
  panelSource,
  isSelectAdditionsPage,
}: SelectAdditionsPanelProps) {
  const unitSystem = useUnitSystem();
  const selectedAdditionId = useHeadstoneStore((s) => s.selectedAdditionId);
  const activePanel = useHeadstoneStore((s) => s.activePanel);
  const additionOffsets = useHeadstoneStore((s) => s.additionOffsets);
  const setAdditionOffset = useHeadstoneStore((s) => s.setAdditionOffset);
  const setSelectedAdditionId = useHeadstoneStore(
    (s) => s.setSelectedAdditionId,
  );
  const removeAddition = useHeadstoneStore((s) => s.removeAddition);
  const duplicateAddition = useHeadstoneStore((s) => s.duplicateAddition);
  const additionsList = data.additions || [];
  const activeAdditionOffset = selectedAdditionId
    ? additionOffsets[selectedAdditionId] || {
        xPos: 0,
        yPos: 0,
        scale: 1,
        rotationZ: 0,
      }
    : null;
  const hasActiveAddition =
    !!selectedAdditionId &&
    !!activeAdditionOffset &&
    activePanel === 'addition';

  // Find the addition type to determine if rotation should be enabled
  // Extract base ID from instance ID (e.g., "K0096_177030562074Z" -> "K0096")
  const baseAdditionId = selectedAdditionId?.split('_')[0];
  const activeAddition = baseAdditionId
    ? additionsList.find((a) => a.id === baseAdditionId)
    : null;
  const additionSizes = activeAddition?.sizes ?? [];
  const maxSize = additionSizes.length;
  const selectedSizeVariant = Math.max(
    1,
    Math.min(maxSize || 1, Math.round(activeAdditionOffset?.sizeVariant ?? 1)),
  );
  const isStatueOrVase =
    activeAddition?.type === 'statue' || activeAddition?.type === 'vase';
  const activeAdditionDisplayName =
    activeAddition?.name.replace(
      /^Applicazione\s+Preghiera/i,
      'Praying Hands Motif',
    ) ?? '';

  const additionRotation =
    ((activeAdditionOffset?.rotationZ ?? 0) * 180) / Math.PI;
  const showAdditionCatalog =
    forceAdditionCatalog ||
    panelSource === 'menu' ||
    (panelSource === null && isSelectAdditionsPage);
  const additionLabelClass =
    'text-sm font-semibold text-slate-100 day:text-gray-800';
  const additionControlButtonClass =
    'flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/[0.08] text-white transition-colors hover:border-[#D7B356]/50 hover:bg-white/[0.13] day:border-gray-200 day:bg-gray-100 day:text-gray-700 day:hover:bg-gray-200';
  const additionNumberInputClass =
    'h-8 w-16 rounded-md border border-white/10 bg-white/[0.08] px-2 text-right text-sm font-semibold text-white transition-colors focus:border-[#D7B356] focus:ring-2 focus:ring-[#D7B356]/30 focus:outline-none day:border-gray-300 day:bg-gray-100 day:text-gray-900';
  const additionRangeInputClass =
    'fs-range h-1.5 w-full cursor-pointer appearance-none rounded-full bg-gradient-to-r from-[#D7B356] to-[#E4C778] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-300 [&::-moz-range-thumb]:h-[20px] [&::-moz-range-thumb]:w-[20px] [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[#171717] [&::-moz-range-thumb]:bg-[#D7B356] [&::-moz-range-thumb]:shadow-[0_0_8px_rgba(215,179,86,0.35),0_0_0_3px_rgba(0,0,0,0.25)] [&::-webkit-slider-thumb]:h-[20px] [&::-webkit-slider-thumb]:w-[20px] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#171717] [&::-webkit-slider-thumb]:bg-[#D7B356] [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(215,179,86,0.35),0_0_0_3px_rgba(0,0,0,0.25)] [&::-webkit-slider-thumb]:transition-shadow [&::-webkit-slider-thumb]:hover:shadow-[0_0_12px_rgba(215,179,86,0.55),0_0_0_3px_rgba(0,0,0,0.25)]';
  const additionRangeBoundsClass =
    'mt-1 flex w-full justify-between text-xs text-white/35 day:text-gray-400';

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      {hasActiveAddition ? (
        <div className="custom-scrollbar flex min-h-[calc(44dvh-128px)] flex-1 flex-col gap-3 overflow-y-auto pr-1 md:min-h-0">
          <div className="flex flex-col gap-3">
            {activeAddition && (
              <div className="day:text-gray-900 px-1 pt-1 text-sm font-semibold text-white">
                {activeAdditionDisplayName}
              </div>
            )}

            {maxSize > 1 && (
              <div className="flex items-center gap-3 px-1 pt-1">
                <label className={`${additionLabelClass} shrink-0`}>Size</label>
                <select
                  value={selectedSizeVariant}
                  onChange={(e) => {
                    if (!selectedAdditionId || !activeAdditionOffset) return;
                    setAdditionOffset(selectedAdditionId, {
                      ...activeAdditionOffset,
                      sizeVariant: Number(e.target.value),
                      scale: 1,
                    });
                  }}
                  className="day:border-gray-300 day:bg-gray-100 day:text-gray-900 min-w-0 flex-1 rounded-md border border-white/10 bg-[#121212] px-3 py-2 text-sm font-semibold text-white outline-none focus:border-[#D7B356]"
                >
                  {additionSizes.map((size, index) => (
                    <option
                      key={`${size.width}-${size.height}-${size.depth}-${index}`}
                      value={index + 1}
                    >
                      {formatDimensionTriplet(
                        size.width,
                        size.height,
                        size.depth,
                        unitSystem,
                      )}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="space-y-3">
              {/* Rotation Slider - Only shown for applications, not for statues/vases */}
              {!isStatueOrVase && (
                <div className="px-1 pt-1">
                  <div className="flex items-center justify-between gap-2">
                    <label className={additionLabelClass}>Rotation</label>
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (!selectedAdditionId || !activeAdditionOffset)
                            return;
                          const newVal = Math.max(-180, additionRotation - 1);
                          setAdditionOffset(selectedAdditionId, {
                            ...activeAdditionOffset,
                            rotationZ: (newVal * Math.PI) / 180,
                          });
                        }}
                        className={additionControlButtonClass}
                        aria-label="Decrease rotation by 1 degree"
                      >
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M20 12H4"
                          />
                        </svg>
                      </button>
                      <input
                        type="number"
                        min={-180}
                        max={180}
                        step={1}
                        value={Math.round(additionRotation)}
                        onChange={(e) => {
                          if (!selectedAdditionId || !activeAdditionOffset)
                            return;
                          setAdditionOffset(selectedAdditionId, {
                            ...activeAdditionOffset,
                            rotationZ: (Number(e.target.value) * Math.PI) / 180,
                          });
                        }}
                        onBlur={(e) => {
                          if (!selectedAdditionId || !activeAdditionOffset)
                            return;
                          const val = Number(e.target.value);
                          if (val < -180) {
                            setAdditionOffset(selectedAdditionId, {
                              ...activeAdditionOffset,
                              rotationZ: (-180 * Math.PI) / 180,
                            });
                          } else if (val > 180) {
                            setAdditionOffset(selectedAdditionId, {
                              ...activeAdditionOffset,
                              rotationZ: (180 * Math.PI) / 180,
                            });
                          }
                        }}
                        className={additionNumberInputClass}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (!selectedAdditionId || !activeAdditionOffset)
                            return;
                          const newVal = Math.min(180, additionRotation + 1);
                          setAdditionOffset(selectedAdditionId, {
                            ...activeAdditionOffset,
                            rotationZ: (newVal * Math.PI) / 180,
                          });
                        }}
                        className={additionControlButtonClass}
                        aria-label="Increase rotation by 1 degree"
                      >
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                      </button>
                      <span className="day:text-gray-600 text-sm font-semibold text-white/70">
                        °
                      </span>
                    </div>
                  </div>
                  <div className="relative mt-3">
                    <input
                      type="range"
                      min={-180}
                      max={180}
                      step={1}
                      value={additionRotation}
                      onChange={(e) => {
                        if (selectedAdditionId && activeAdditionOffset) {
                          setAdditionOffset(selectedAdditionId, {
                            ...activeAdditionOffset,
                            rotationZ: (Number(e.target.value) * Math.PI) / 180,
                          });
                        }
                      }}
                      className={additionRangeInputClass}
                    />
                    <div className={additionRangeBoundsClass}>
                      <span>-180°</span>
                      <span>180°</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="day:border-gray-200 grid shrink-0 grid-cols-2 gap-2 border-t border-white/10 pt-3">
            <button
              type="button"
              className="day:bg-white day:text-[#8a6a12] cursor-pointer rounded-lg border border-[#D7B356]/60 bg-[#171717] px-3 py-2 text-sm font-semibold text-[#F2D58B] transition-colors hover:bg-[#D7B356]/15"
              onClick={() =>
                selectedAdditionId && duplicateAddition(selectedAdditionId)
              }
            >
              Duplicate
            </button>
            <button
              type="button"
              className="day:bg-white day:text-red-700 cursor-pointer rounded-lg border border-red-500/50 bg-[#171717] px-3 py-2 text-sm font-semibold text-red-200 transition-colors hover:bg-red-500/15"
              onClick={() => {
                if (selectedAdditionId) {
                  removeAddition(selectedAdditionId);
                  setSelectedAdditionId(null);
                }
              }}
            >
              Delete
            </button>
          </div>
        </div>
      ) : null}

      {showAdditionCatalog && !hasActiveAddition && (
        <div className="day:border-gray-200 day:bg-white min-h-[calc(44dvh-148px)] flex-1 rounded-lg border border-white/10 bg-[#171717] p-3.5 shadow-lg shadow-black/15 md:min-h-0">
          <AdditionSelector additions={additionsList} />
        </div>
      )}
    </div>
  );
}

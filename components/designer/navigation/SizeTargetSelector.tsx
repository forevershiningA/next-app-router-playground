import SegmentedControl from '#/components/ui/SegmentedControl';
import { DesignerOptionButton } from '#/components/designer/ui/DesignerControl';
import BaseConfigurationOptions from '#/components/designer/panels/BaseConfigurationOptions';
import type { HeadstoneState } from '#/lib/headstone-store.types';

interface SizeTargetSelectorProps {
  isFullMonument: boolean;
  isPlaque: boolean;
  isSizeAdjustmentCompact: boolean;
  isStainlessSteelHeadstone: boolean;
  supportsFlowerPots: boolean;
  editingObject: HeadstoneState['editingObject'];
  setEditingObject: HeadstoneState['setEditingObject'];
  setSelected: HeadstoneState['setSelected'];
  setShowBase: HeadstoneState['setShowBase'];
  headstoneStyle: HeadstoneState['headstoneStyle'];
  setHeadstoneStyle: HeadstoneState['setHeadstoneStyle'];
  setSizeAdjustmentCompact: (compact: boolean) => void;
}

export function SizeTargetSelector({
  isFullMonument,
  isPlaque,
  isSizeAdjustmentCompact,
  isStainlessSteelHeadstone,
  supportsFlowerPots,
  editingObject,
  setEditingObject,
  setSelected,
  setShowBase,
  headstoneStyle,
  setHeadstoneStyle,
  setSizeAdjustmentCompact,
}: SizeTargetSelectorProps) {
  const sizeTabOptions = isFullMonument
    ? [
        { label: 'Headstone', value: 'headstone' },
        { label: 'Base', value: 'base' },
        { label: 'Ledger', value: 'ledger' },
        { label: 'Kerbset', value: 'kerbset' },
      ]
    : [
        { label: 'Headstone', value: 'headstone' },
        { label: 'Base', value: 'base' },
      ];

  return (
    <>
      {!isSizeAdjustmentCompact && !isPlaque && (
        <SegmentedControl
          className="p-0.5 md:p-1 [&_button]:py-1.5 [&_button]:text-[13px] md:[&_button]:py-2 md:[&_button]:text-sm"
          value={editingObject}
          onChange={(value) => {
            setSizeAdjustmentCompact(false);
            setEditingObject(value as HeadstoneState['editingObject']);
            setSelected(value as Exclude<HeadstoneState['selected'], null>);
            if (value === 'base') setShowBase(true);
          }}
          options={sizeTabOptions}
        />
      )}

      {!isSizeAdjustmentCompact && editingObject === 'base' && (
        <BaseConfigurationOptions
          isStainlessSteelHeadstone={isStainlessSteelHeadstone}
          supportsFlowerPots={supportsFlowerPots}
        />
      )}

      {!isSizeAdjustmentCompact &&
        editingObject === 'headstone' &&
        !isPlaque && (
          <>
            <div
              role="group"
              aria-label="Headstone style"
              className="flex items-center gap-2 px-1 py-1"
            >
              <span className="mr-auto font-serif text-sm font-normal text-white day:text-[#1a1714]">
                Style
              </span>
              {[
                { label: 'Upright', value: 'upright' },
                { label: 'Slant', value: 'slant' },
              ].map((option) => (
                <DesignerOptionButton
                  key={option.value}
                  selected={headstoneStyle === option.value}
                  variant="solid"
                  onClick={() =>
                    setHeadstoneStyle(option.value as 'upright' | 'slant')
                  }
                  className="min-w-20 rounded-lg px-3 py-1.5 font-sans text-xs font-semibold"
                >
                  {option.label}
                </DesignerOptionButton>
              ))}
            </div>
          </>
        )}
    </>
  );
}

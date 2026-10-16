'use client';

import React from 'react';
import { useHeadstoneStore } from '#/lib/headstone-store';
import { useMobileNavStore } from '#/lib/mobile-nav-store';
import { useUnitSystem } from '#/lib/use-unit-system';
import { useCurrency } from '#/lib/use-currency';
import {
  displayLengthValueFromMm,
  getLengthUnitLabel,
  lengthValueToMm,
} from '#/lib/unit-system';
import { DesignerTabButton } from '#/components/designer/ui/DesignerControl';
import { DimensionRangeCard } from '#/components/designer/navigation/DimensionRangeCard';
import { FixedPlaqueSizeControl } from '#/components/designer/navigation/FixedPlaqueSizeControl';
import { SizeTargetSelector } from '#/components/designer/navigation/SizeTargetSelector';
import { useSizeAdjustmentControls } from '#/components/designer/navigation/useSizeAdjustmentControls';

type SelectSizePanelProps = {
  isPlaque: boolean;
  isStainlessSteelHeadstone: boolean;
  supportsFlowerPots: boolean;
  extraClassName?: string;
};

export default function SelectSizePanel({
  isPlaque,
  isStainlessSteelHeadstone,
  supportsFlowerPots,
  extraClassName = '',
}: SelectSizePanelProps) {
  const unitSystem = useUnitSystem();
  const { currency, rates } = useCurrency();
  const displayLength = React.useCallback(
    (valueMm: number) => displayLengthValueFromMm(valueMm, unitSystem),
    [unitSystem],
  );
  const displayLengthToMm = React.useCallback(
    (value: number) => lengthValueToMm(value, unitSystem),
    [unitSystem],
  );
  const lengthUnit = getLengthUnitLabel(unitSystem);
  const catalog = useHeadstoneStore((s) => s.catalog);
  const editingObject = useHeadstoneStore((s) => s.editingObject);
  const setEditingObject = useHeadstoneStore((s) => s.setEditingObject);
  const setSelected = useHeadstoneStore((s) => s.setSelected);
  const showBase = useHeadstoneStore((s) => s.showBase);
  const setShowBase = useHeadstoneStore((s) => s.setShowBase);
  const widthMm = useHeadstoneStore((s) => s.widthMm);
  const heightMm = useHeadstoneStore((s) => s.heightMm);
  const setWidthMm = useHeadstoneStore((s) => s.setWidthMm);
  const setHeightMm = useHeadstoneStore((s) => s.setHeightMm);
  const baseWidthMm = useHeadstoneStore((s) => s.baseWidthMm);
  const baseHeightMm = useHeadstoneStore((s) => s.baseHeightMm);
  const setBaseWidthMm = useHeadstoneStore((s) => s.setBaseWidthMm);
  const setBaseHeightMm = useHeadstoneStore((s) => s.setBaseHeightMm);
  const ledgerWidthMm = useHeadstoneStore((s) => s.ledgerWidthMm);
  const ledgerHeightMm = useHeadstoneStore((s) => s.ledgerHeightMm);
  const ledgerDepthMm = useHeadstoneStore((s) => s.ledgerDepthMm);
  const setLedgerWidthMm = useHeadstoneStore((s) => s.setLedgerWidthMm);
  const setLedgerHeightMm = useHeadstoneStore((s) => s.setLedgerHeightMm);
  const setLedgerDepthMm = useHeadstoneStore((s) => s.setLedgerDepthMm);
  const kerbWidthMm = useHeadstoneStore((s) => s.kerbWidthMm);
  const kerbHeightMm = useHeadstoneStore((s) => s.kerbHeightMm);
  const kerbDepthMm = useHeadstoneStore((s) => s.kerbDepthMm);
  const setKerbWidthMm = useHeadstoneStore((s) => s.setKerbWidthMm);
  const setKerbHeightMm = useHeadstoneStore((s) => s.setKerbHeightMm);
  const setKerbDepthMm = useHeadstoneStore((s) => s.setKerbDepthMm);
  const headstoneStyle = useHeadstoneStore((s) => s.headstoneStyle);
  const setHeadstoneStyle = useHeadstoneStore((s) => s.setHeadstoneStyle);
  const uprightThickness = useHeadstoneStore((s) => s.uprightThickness);
  const setUprightThickness = useHeadstoneStore((s) => s.setUprightThickness);
  const slantThickness = useHeadstoneStore((s) => s.slantThickness);
  const setSlantThickness = useHeadstoneStore((s) => s.setSlantThickness);
  const baseThickness = useHeadstoneStore((s) => s.baseThickness);
  const setBaseThickness = useHeadstoneStore((s) => s.setBaseThickness);
  const fixedSizes = useHeadstoneStore((s) => s.fixedSizes);
  const isSizeAdjustmentCompact = useMobileNavStore(
    (s) => s.isSizeAdjustmentCompact,
  );
  const setSizeAdjustmentCompact = useMobileNavStore(
    (s) => s.setSizeAdjustmentCompact,
  );
  const setSizeAdjustmentActive = useMobileNavStore(
    (s) => s.setSizeAdjustmentActive,
  );
  const { activeSizeControl, setActiveSizeControl, compactSizeRangeProps } =
    useSizeAdjustmentControls({
      isPlaque,
      setSizeAdjustmentCompact,
      setSizeAdjustmentActive,
    });
  const firstShape = catalog?.product?.shapes?.[0];
  const isFullMonument = catalog?.product?.type === 'full-monument';

  const currentWidthMm =
    editingObject === 'base'
      ? baseWidthMm
      : editingObject === 'ledger'
        ? ledgerWidthMm
        : editingObject === 'kerbset'
          ? kerbWidthMm
          : widthMm;
  const currentHeightMm =
    editingObject === 'base'
      ? baseHeightMm
      : editingObject === 'ledger'
        ? ledgerHeightMm
        : editingObject === 'kerbset'
          ? kerbHeightMm
          : heightMm;
  const setCurrentWidthMm =
    editingObject === 'base'
      ? setBaseWidthMm
      : editingObject === 'ledger'
        ? setLedgerWidthMm
        : editingObject === 'kerbset'
          ? setKerbWidthMm
          : setWidthMm;
  const setCurrentHeightMm =
    editingObject === 'base'
      ? setBaseHeightMm
      : editingObject === 'ledger'
        ? setLedgerHeightMm
        : editingObject === 'kerbset'
          ? setKerbHeightMm
          : setHeightMm;

  const minWidth =
    editingObject === 'base'
      ? widthMm
      : editingObject === 'ledger' || editingObject === 'kerbset'
        ? 300
        : (firstShape?.table?.minWidth ?? 40);
  const maxWidth =
    editingObject === 'base'
      ? 2000
      : editingObject === 'ledger' || editingObject === 'kerbset'
        ? 2000
        : (firstShape?.table?.maxWidth ?? 1200);
  const minHeight =
    editingObject === 'base'
      ? 50
      : editingObject === 'ledger'
        ? 30
        : editingObject === 'kerbset'
          ? 100
          : (firstShape?.table?.minHeight ?? 40);
  const maxHeight =
    editingObject === 'base'
      ? 200
      : editingObject === 'ledger'
        ? 150
        : editingObject === 'kerbset'
          ? 500
          : (firstShape?.table?.maxHeight ?? 1200);

  const minThickness =
    editingObject === 'base'
      ? (firstShape?.stand?.minDepth ?? 100)
      : editingObject === 'ledger'
        ? 400
        : editingObject === 'kerbset'
          ? 500
          : (firstShape?.table?.minDepth ?? 100);
  const maxThickness =
    editingObject === 'base'
      ? (firstShape?.stand?.maxDepth ?? 300)
      : editingObject === 'ledger'
        ? 2900
        : editingObject === 'kerbset'
          ? 3000
          : (firstShape?.table?.maxDepth ?? 300);

  const currentDepthMm =
    editingObject === 'ledger'
      ? ledgerDepthMm
      : editingObject === 'kerbset'
        ? kerbDepthMm
        : null;
  const setCurrentDepthMm =
    editingObject === 'ledger'
      ? setLedgerDepthMm
      : editingObject === 'kerbset'
        ? setKerbDepthMm
        : null;
  const currentHeadstoneThickness =
    headstoneStyle === 'upright' ? uprightThickness : slantThickness;
  const setCurrentHeadstoneThickness = (value: number) => {
    if (headstoneStyle === 'upright') {
      setUprightThickness(value);
    } else {
      setSlantThickness(value);
    }
  };

  const dimensionCardClass =
    'min-h-[98px] border-t border-white/10 px-3 py-3 day:border-gray-200 md:min-h-0 md:px-3.5 md:py-3.5';
  const dimensionHeaderClass =
    'flex min-h-8 items-center justify-between gap-2';
  const dimensionLabelClass =
    'text-sm font-semibold text-slate-100 day:text-gray-800';
  const controlButtonClass =
    'flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/[0.08] text-white transition-colors hover:border-[#D7B356]/50 hover:bg-white/[0.13] disabled:cursor-not-allowed disabled:opacity-50 day:border-gray-200 day:bg-gray-100 day:text-gray-700 day:hover:bg-gray-200';
  const numberInputBaseClass =
    'h-8 w-16 rounded-md border bg-white/[0.08] px-2 text-right text-sm font-semibold text-white transition-colors focus:ring-2 focus:outline-none day:bg-gray-100 day:text-gray-900';
  const rangeInputClass =
    'fs-range h-1.5 w-full cursor-pointer appearance-none rounded-full bg-gradient-to-r from-[#D7B356] to-[#E4C778] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-300 [&::-moz-range-thumb]:h-[20px] [&::-moz-range-thumb]:w-[20px] [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[#171717] [&::-moz-range-thumb]:bg-[#D7B356] [&::-moz-range-thumb]:shadow-[0_0_8px_rgba(215,179,86,0.35),0_0_0_3px_rgba(0,0,0,0.25)] [&::-webkit-slider-thumb]:h-[20px] [&::-webkit-slider-thumb]:w-[20px] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#171717] [&::-webkit-slider-thumb]:bg-[#D7B356] [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(215,179,86,0.35),0_0_0_3px_rgba(0,0,0,0.25)] [&::-webkit-slider-thumb]:transition-shadow [&::-webkit-slider-thumb]:hover:shadow-[0_0_12px_rgba(215,179,86,0.55),0_0_0_3px_rgba(0,0,0,0.25)]';
  const rangeBlockClass = 'relative mt-2 h-[31px] md:mt-3 md:h-[35px]';
  const rangeBoundsClass =
    'mt-1 flex h-4 w-full justify-between text-xs leading-4 text-white/35 day:text-gray-400';
  // Which dimension controls exist for the current editing target. Width and
  // Height always exist; the third (depth) is Thickness or Length depending on
  // the target.
  const depthControlLabel =
    editingObject === 'headstone' && !isPlaque
      ? 'Thickness'
      : editingObject === 'base'
        ? showBase
          ? 'Thickness'
          : null
        : (editingObject === 'ledger' || editingObject === 'kerbset') &&
            currentDepthMm !== null
          ? 'Length'
          : null;
  const effectiveSizeControl =
    activeSizeControl === 'depth' && !depthControlLabel
      ? 'width'
      : activeSizeControl;
  // On mobile only the selected dimension card is shown; desktop shows all.
  const sizeCardVisibility = (control: 'width' | 'height' | 'depth') =>
    `${effectiveSizeControl === control ? '' : 'hidden'} md:block`;
  const sizeControlOptions = [
    { label: 'Width', value: 'width' },
    { label: 'Height', value: 'height' },
    ...(depthControlLabel
      ? [{ label: depthControlLabel, value: 'depth' }]
      : []),
  ];

  return (
    <div
      data-testid="designer-size-panel"
      className={`fs-size-panel flex flex-col rounded-lg p-3 shadow-xl backdrop-blur-sm md:gap-4 md:p-3.5 ${isSizeAdjustmentCompact ? 'gap-1.5' : 'gap-3'} ${extraClassName}`}
    >
      <SizeTargetSelector
        isFullMonument={isFullMonument}
        isPlaque={isPlaque}
        isSizeAdjustmentCompact={isSizeAdjustmentCompact}
        isStainlessSteelHeadstone={isStainlessSteelHeadstone}
        supportsFlowerPots={supportsFlowerPots}
        editingObject={editingObject}
        setEditingObject={setEditingObject}
        setSelected={setSelected}
        setShowBase={setShowBase}
        headstoneStyle={headstoneStyle}
        setHeadstoneStyle={setHeadstoneStyle}
        setSizeAdjustmentCompact={setSizeAdjustmentCompact}
      />

      {/* Fixed size slider for Full Colour Plaque (product 32) */}
      {catalog?.product?.id === '32' &&
      editingObject === 'headstone' &&
      fixedSizes.length > 0 ? (
        <FixedPlaqueSizeControl
          sizes={fixedSizes}
          widthMm={widthMm}
          heightMm={heightMm}
          setWidthMm={setWidthMm}
          setHeightMm={setHeightMm}
          currency={currency}
          rates={rates}
          isCompact={isSizeAdjustmentCompact}
          controlButtonClass={controlButtonClass}
          dimensionCardClass={dimensionCardClass}
          dimensionHeaderClass={dimensionHeaderClass}
          dimensionLabelClass={dimensionLabelClass}
          rangeInputClass={rangeInputClass}
          rangeBoundsClass={rangeBoundsClass}
          compactSizeRangeProps={compactSizeRangeProps}
        />
      ) : (
        <>
          {/* Mobile: pick a single dimension to edit (keeps the sheet short so
                the product stays visible). Desktop shows all cards at once. */}
          {!isSizeAdjustmentCompact && (
            <div className="md:hidden">
              <div
                role="group"
                aria-label="Dimension"
                className="flex border-b border-[var(--designer-border)]"
              >
                {sizeControlOptions.map((option) => {
                  const isActive = effectiveSizeControl === option.value;
                  return (
                    <DesignerTabButton
                      key={option.value}
                      selected={isActive}
                      onClick={() => {
                        setSizeAdjustmentCompact(false);
                        setActiveSizeControl(
                          option.value as 'width' | 'height' | 'depth',
                        );
                      }}
                    >
                      {option.label}
                    </DesignerTabButton>
                  );
                })}
              </div>
            </div>
          )}
          <DimensionRangeCard
            label="Width"
            valueMm={currentWidthMm}
            minMm={minWidth}
            maxMm={maxWidth}
            setValueMm={setCurrentWidthMm}
            displayLength={displayLength}
            displayLengthToMm={displayLengthToMm}
            step={unitSystem === 'imperial' ? 1 : 10}
            lengthUnit={lengthUnit}
            cardClass={`${dimensionCardClass} ${sizeCardVisibility('width')} ${editingObject === 'base' && !showBase ? 'pointer-events-none opacity-50' : ''}`}
            headerClass={dimensionHeaderClass}
            labelClass={dimensionLabelClass}
            controlButtonClass={controlButtonClass}
            numberInputBaseClass={numberInputBaseClass}
            rangeInputClass={rangeInputClass}
            rangeBlockClass={rangeBlockClass}
            rangeBoundsClass={rangeBoundsClass}
            compactSizeRangeProps={compactSizeRangeProps}
            disabled={editingObject === 'base' && !showBase}
          />
          <DimensionRangeCard
            label="Height"
            valueMm={currentHeightMm}
            minMm={minHeight}
            maxMm={maxHeight}
            setValueMm={setCurrentHeightMm}
            displayLength={displayLength}
            displayLengthToMm={displayLengthToMm}
            step={unitSystem === 'imperial' ? 1 : 10}
            lengthUnit={lengthUnit}
            cardClass={`${dimensionCardClass} ${sizeCardVisibility('height')} ${editingObject === 'base' && !showBase ? 'pointer-events-none opacity-50' : ''}`}
            headerClass={dimensionHeaderClass}
            labelClass={dimensionLabelClass}
            controlButtonClass={controlButtonClass}
            numberInputBaseClass={numberInputBaseClass}
            rangeInputClass={rangeInputClass}
            rangeBlockClass={rangeBlockClass}
            rangeBoundsClass={rangeBoundsClass}
            compactSizeRangeProps={compactSizeRangeProps}
            disabled={editingObject === 'base' && !showBase}
          />
        </>
      )}

      {editingObject === 'headstone' && !isPlaque && (
        <DimensionRangeCard
          label="Thickness"
          valueMm={currentHeadstoneThickness}
          minMm={minThickness}
          maxMm={maxThickness}
          setValueMm={setCurrentHeadstoneThickness}
          displayLength={displayLength}
          displayLengthToMm={displayLengthToMm}
          step={unitSystem === 'imperial' ? 1 : 10}
          numberValue={Math.round}
          numberValueToMm={(value) => value}
          numberMin={minThickness}
          numberMax={maxThickness}
          numberStep={10}
          lengthUnit={lengthUnit}
          cardClass={`${dimensionCardClass} ${sizeCardVisibility('depth')}`}
          headerClass={dimensionHeaderClass}
          labelClass={dimensionLabelClass}
          controlButtonClass={controlButtonClass}
          numberInputBaseClass={numberInputBaseClass}
          rangeInputClass={rangeInputClass}
          rangeBlockClass={rangeBlockClass}
          rangeBoundsClass={rangeBoundsClass}
          compactSizeRangeProps={compactSizeRangeProps}
        />
      )}

      {editingObject === 'base' && showBase && (
        <DimensionRangeCard
          label="Thickness"
          valueMm={baseThickness}
          minMm={minThickness}
          maxMm={maxThickness}
          setValueMm={setBaseThickness}
          displayLength={displayLength}
          displayLengthToMm={displayLengthToMm}
          step={unitSystem === 'imperial' ? 1 : 10}
          numberValue={Math.round}
          numberValueToMm={(value) => value}
          numberMin={minThickness}
          numberMax={maxThickness}
          numberStep={10}
          lengthUnit={lengthUnit}
          cardClass={`${dimensionCardClass} ${sizeCardVisibility('depth')}`}
          headerClass={dimensionHeaderClass}
          labelClass={dimensionLabelClass}
          controlButtonClass={controlButtonClass}
          numberInputBaseClass={numberInputBaseClass}
          rangeInputClass={rangeInputClass}
          rangeBlockClass={rangeBlockClass}
          rangeBoundsClass={rangeBoundsClass}
          compactSizeRangeProps={compactSizeRangeProps}
        />
      )}

      {(editingObject === 'ledger' || editingObject === 'kerbset') &&
        currentDepthMm !== null &&
        setCurrentDepthMm && (
          <DimensionRangeCard
            label="Length"
            valueMm={currentDepthMm}
            minMm={minThickness}
            maxMm={maxThickness}
            setValueMm={setCurrentDepthMm}
            displayLength={displayLength}
            displayLengthToMm={displayLengthToMm}
            step={unitSystem === 'imperial' ? 1 : 10}
            numberValue={(value) => value}
            numberValueToMm={(value) => value}
            numberMin={minThickness}
            numberMax={maxThickness}
            numberStep={10}
            lengthUnit={lengthUnit}
            cardClass={`${dimensionCardClass} ${sizeCardVisibility('depth')}`}
            headerClass={dimensionHeaderClass}
            labelClass={dimensionLabelClass}
            controlButtonClass={controlButtonClass}
            numberInputBaseClass={numberInputBaseClass}
            rangeInputClass={rangeInputClass}
            rangeBlockClass={rangeBlockClass}
            rangeBoundsClass={rangeBoundsClass}
            compactSizeRangeProps={compactSizeRangeProps}
            clampOnBlur={false}
            showInvalidState={false}
          />
        )}
    </div>
  );
}

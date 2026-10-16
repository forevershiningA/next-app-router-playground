'use client';

import { useHeadstoneStore } from '#/lib/headstone-store';
import { DEFAULT_TEX, TEX_BASE } from '#/lib/headstone-store.types';
import { DesignerOptionButton } from '#/components/designer/ui/DesignerControl';

type BaseConfigurationOptionsProps = {
  isStainlessSteelHeadstone: boolean;
  supportsFlowerPots: boolean;
};

const STAINLESS_STEEL_BASE_TEX = `${TEX_BASE}brushed-ss-swatch.webp`;
const GRANITE_BASE_TEX = `${TEX_BASE}${DEFAULT_TEX}`;

export default function BaseConfigurationOptions({
  isStainlessSteelHeadstone,
  supportsFlowerPots,
}: BaseConfigurationOptionsProps) {
  const showBase = useHeadstoneStore((state) => state.showBase);
  const setShowBase = useHeadstoneStore((state) => state.setShowBase);
  const baseMaterialUrl = useHeadstoneStore((state) => state.baseMaterialUrl);
  const setBaseMaterialUrl = useHeadstoneStore(
    (state) => state.setBaseMaterialUrl,
  );
  const baseFinish = useHeadstoneStore((state) => state.baseFinish);
  const setBaseFinish = useHeadstoneStore((state) => state.setBaseFinish);
  const baseOption = useHeadstoneStore((state) => state.baseOption);
  const setBaseOption = useHeadstoneStore((state) => state.setBaseOption);
  const baseLidFinish = useHeadstoneStore((state) => state.baseLidFinish);
  const setBaseLidFinish = useHeadstoneStore(
    (state) => state.setBaseLidFinish,
  );

  const isStainlessSteelBase =
    showBase && (baseMaterialUrl ?? '').includes('ss-swatch');
  const isGraniteBase = showBase && !isStainlessSteelBase;

  return (
    <div className="contents">
      <div className="flex gap-2">
        <DesignerOptionButton
          selected={!showBase}
          onClick={() => setShowBase(false)}
          className="flex-1 rounded-md px-3 py-1.5 font-medium"
        >
          No Base
        </DesignerOptionButton>
        {isStainlessSteelHeadstone ? (
          <>
            <DesignerOptionButton
              selected={isStainlessSteelBase && showBase}
              onClick={() => {
                setBaseFinish('default');
                setBaseMaterialUrl(STAINLESS_STEEL_BASE_TEX);
                setShowBase(true);
              }}
              className="flex-1 rounded-md px-3 py-1.5 font-medium"
            >
              Stainless
            </DesignerOptionButton>
            <DesignerOptionButton
              selected={isGraniteBase && showBase}
              onClick={() => {
                setBaseFinish('default');
                setBaseMaterialUrl(GRANITE_BASE_TEX);
                setShowBase(true);
              }}
              className="flex-1 rounded-md px-3 py-1.5 font-medium"
            >
              Granite
            </DesignerOptionButton>
          </>
        ) : (
          <>
            <DesignerOptionButton
              selected={baseFinish === 'default' && showBase}
              onClick={() => {
                setBaseFinish('default');
                setShowBase(true);
              }}
              className="flex-1 rounded-md px-3 py-1.5 font-medium"
            >
              Polished
            </DesignerOptionButton>
            <DesignerOptionButton
              selected={baseFinish === 'rock-pitch' && showBase}
              onClick={() => {
                setBaseFinish('rock-pitch');
                setShowBase(true);
              }}
              className="flex-1 rounded-md px-3 py-1.5 font-medium"
            >
              Rockface
            </DesignerOptionButton>
          </>
        )}
      </div>
      <div className="-mx-3 border-t border-white/10 md:-mx-3.5"></div>
      {supportsFlowerPots && (
        <div className="order-last space-y-3 md:order-none">
          <div className="-mx-3.5 border-t border-white/10"></div>
          <fieldset className="space-y-2 text-sm">
            <legend className="day:text-[#625a51] text-white/75">
              Base option
            </legend>
            <div className="flex gap-2" role="group" aria-label="Base option">
              <DesignerOptionButton
                selected={baseOption === 'none'}
                onClick={() => setBaseOption('none')}
                className="flex-1 rounded-md px-3 py-1.5 font-medium"
              >
                None
              </DesignerOptionButton>
              <DesignerOptionButton
                selected={baseOption === 'flower-pots'}
                onClick={() => setBaseOption('flower-pots')}
                className="flex-1 rounded-md px-3 py-1.5 font-medium"
              >
                Flower Pots
              </DesignerOptionButton>
            </div>
          </fieldset>
          {baseOption === 'flower-pots' && (
            <fieldset className="space-y-2 text-sm">
              <legend className="day:text-[#625a51] text-white/75">
                Lid finish
              </legend>
              <div className="flex gap-2" role="group" aria-label="Lid finish">
                {[
                  { label: 'Black Lid', value: 'black' },
                  { label: 'Silver Lid', value: 'silver' },
                  { label: 'Gold Lid', value: 'gold' },
                ].map((option) => (
                  <DesignerOptionButton
                    key={option.value}
                    selected={baseLidFinish === option.value}
                    onClick={() =>
                      setBaseLidFinish(
                        option.value as 'black' | 'silver' | 'gold',
                      )
                    }
                    className="flex-1 rounded-md px-3 py-1.5 font-medium"
                  >
                    {option.label}
                  </DesignerOptionButton>
                ))}
              </div>
            </fieldset>
          )}
        </div>
      )}
    </div>
  );
}

'use client';

import { useHeadstoneStore } from '#/lib/headstone-store';

type StainlessSteelOptionsPanelProps = {
  mode: 'corners' | 'holes';
  onBack: () => void;
};

const selectedOptionClass = 'border-[#DEBD68] bg-[#DEBD68]/10 text-[#DEBD68]';
const idleOptionClass =
  'border-white/10 text-gray-300 hover:border-white/20 hover:bg-white/5';

export default function StainlessSteelOptionsPanel({
  mode,
  onBack,
}: StainlessSteelOptionsPanelProps) {
  const ssCorners = useHeadstoneStore((state) => state.ssCorners);
  const setSsCorners = useHeadstoneStore((state) => state.setSsCorners);
  const ssHoles = useHeadstoneStore((state) => state.ssHoles);
  const setSsHoles = useHeadstoneStore((state) => state.setSsHoles);
  const isCorners = mode === 'corners';
  const title = isCorners ? 'Corners' : 'Holes';

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center border-b border-white/10 px-5 py-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-3 rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-white/70 transition-colors duration-200 hover:border-white/40 hover:text-white"
        >
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/5">
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </span>
          <span className="tracking-wide">Back&nbsp;to&nbsp;Menu</span>
        </button>
      </div>
      <div className="flex items-end justify-between border-b border-white/10 px-5 py-4">
        <div className="w-full text-right">
          <p
            className="font-playfair-display text-xs tracking-[0.35em] italic"
            style={{ color: '#aaaaaa' }}
          >
            Guided Step
          </p>
          <h2 className="font-playfair-display mt-1 text-2xl font-normal tracking-wide text-white">
            {title}
          </h2>
          <div className="mt-3 ml-auto h-px w-24 bg-white/20" />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4 p-2">
          <p className="text-xs font-medium tracking-wider text-white/50 uppercase">
            {isCorners ? 'Corner Style' : 'Mounting Holes'}
          </p>
          {isCorners ? (
            <div className="grid grid-cols-2 gap-4">
              {(['straight', 'rounded'] as const).map((corner) => (
                <button
                  key={corner}
                  type="button"
                  onClick={() => setSsCorners(corner)}
                  className={`flex flex-col items-center gap-3 rounded-2xl border p-5 transition-all ${ssCorners === corner ? selectedOptionClass : idleOptionClass}`}
                >
                  <svg
                    viewBox="0 0 80 60"
                    className="h-16 w-20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    aria-hidden="true"
                  >
                    <rect
                      x="6"
                      y="6"
                      width="68"
                      height="48"
                      rx={corner === 'rounded' ? 12 : 0}
                    />
                  </svg>
                  <span className="text-sm font-medium">
                    {corner === 'straight' ? 'Straight' : 'Rounded'}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {(['corner', 'side-center', 'none'] as const).map((holes) => (
                <button
                  key={holes}
                  type="button"
                  onClick={() => setSsHoles(holes)}
                  className={`flex items-center gap-4 rounded-2xl border p-4 transition-all ${ssHoles === holes ? selectedOptionClass : idleOptionClass}`}
                >
                  <svg
                    viewBox="0 0 80 60"
                    className="h-12 w-16 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    aria-hidden="true"
                  >
                    <rect x="6" y="6" width="68" height="48" />
                    {holes === 'corner' && (
                      <>
                        <circle
                          cx="16"
                          cy="16"
                          r="3.5"
                          fill="currentColor"
                          stroke="none"
                        />
                        <circle
                          cx="64"
                          cy="16"
                          r="3.5"
                          fill="currentColor"
                          stroke="none"
                        />
                        <circle
                          cx="16"
                          cy="44"
                          r="3.5"
                          fill="currentColor"
                          stroke="none"
                        />
                        <circle
                          cx="64"
                          cy="44"
                          r="3.5"
                          fill="currentColor"
                          stroke="none"
                        />
                      </>
                    )}
                    {holes === 'side-center' && (
                      <>
                        <circle
                          cx="16"
                          cy="30"
                          r="3.5"
                          fill="currentColor"
                          stroke="none"
                        />
                        <circle
                          cx="64"
                          cy="30"
                          r="3.5"
                          fill="currentColor"
                          stroke="none"
                        />
                      </>
                    )}
                  </svg>
                  <span className="text-left text-sm font-medium">
                    {holes === 'corner'
                      ? 'Hole on each corner'
                      : holes === 'side-center'
                        ? 'Holes in centre of each side'
                        : 'No drilled holes'}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

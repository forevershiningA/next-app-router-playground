'use client';

import React from 'react';
import TailwindSlider from '#/ui/TailwindSlider';
import SceneOverlayController from '#/components/SceneOverlayController';
import CanvasFallback from '#/components/CanvasFallback';
import { useHeadstoneStore } from '#/lib/headstone-store';

export default function SizeSelector({
  children,
}: {
  children: React.ReactNode;
}) {
  const widthMm = useHeadstoneStore((s) => s.widthMm);
  const setWidthMm = useHeadstoneStore((s) => s.setWidthMm);
  const heightMm = useHeadstoneStore((s) => s.heightMm);
  const setHeightMm = useHeadstoneStore((s) => s.setHeightMm);
  const headstoneStyle = useHeadstoneStore((s) => s.headstoneStyle);
  const setHeadstoneStyle = useHeadstoneStore((s) => s.setHeadstoneStyle);
  const slantThickness = useHeadstoneStore((s) => s.slantThickness);
  const setSlantThickness = useHeadstoneStore((s) => s.setSlantThickness);

  return (
    <div className="relative w-full">
      <SceneOverlayController
        section="size"
        title="Select Size"
        persistKey="size"
      >
        <p className="mb-3 text-sm leading-relaxed text-white/85">
          Choose the headstone width &amp; height in millimetres. Thickness is
          computed from size; cemeteries may have regulations on allowable
          dimensions.
        </p>
        
        {/* Headstone Style Selection */}
        <div className="mb-4 space-y-2">
          <label className="block text-sm font-medium text-slate-200">
            Headstone Style
          </label>
          <div className="grid grid-cols-2 gap-2 rounded-lg bg-slate-950 p-1">
            <button
              onClick={() => setHeadstoneStyle('upright')}
              className={`rounded-md px-3 py-2 text-sm font-medium transition-all ${
                headstoneStyle === 'upright'
                  ? 'bg-[#D7B356] text-slate-900 shadow-md'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              Upright
            </button>
            <button
              onClick={() => setHeadstoneStyle('slant')}
              className={`rounded-md px-3 py-2 text-sm font-medium transition-all ${
                headstoneStyle === 'slant'
                  ? 'bg-[#D7B356] text-slate-900 shadow-md'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              Slant
            </button>
          </div>
          <p className="text-xs text-slate-400">
            {headstoneStyle === 'upright' 
              ? 'Traditional vertical monument' 
              : 'Beveled marker at an angle'}
          </p>
        </div>

        {/* Slant Thickness Control (only for slant style) */}
        {headstoneStyle === 'slant' && (
          <div className="mb-4">
            <TailwindSlider
              label="Slant Angle"
              value={slantThickness * 100} // Convert 0.1-1.0 to 10-100 for display
              min={10}
              max={100}
              step={5}
              onChange={(val) => setSlantThickness(val / 100)} // Convert back to 0.1-1.0
              unit="%"
            />
            <p className="mt-1 text-xs text-slate-400">
              {slantThickness <= 0.15 ? 'Very steep angle (~45°)' :
               slantThickness <= 0.25 ? 'Standard cemetery angle (~30°)' :
               slantThickness <= 0.5 ? 'Moderate angle (~20°)' :
               'Shallow angle (nearly vertical)'}
            </p>
          </div>
        )}

        <div className="space-y-3">
          <TailwindSlider
            label="Width"
            value={widthMm}
            min={300}
            max={1200}
            step={10}
            onChange={setWidthMm}
            unit="mm"
          />
          <TailwindSlider
            label="Height"
            value={heightMm}
            min={300}
            max={1200}
            step={10}
            onChange={setHeightMm}
            unit="mm"
          />
        </div>
      </SceneOverlayController>

      <CanvasFallback>
        {children}
      </CanvasFallback>
    </div>
  );
}

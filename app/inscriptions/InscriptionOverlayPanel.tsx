"use client";

import React, { useCallback } from "react";
import SceneOverlayController from "#/components/SceneOverlayController";
import { useHeadstoneStore, Line } from "#/lib/headstone-store";
import TailwindSlider from "#/ui/TailwindSlider";


/* --------------------------- types + helpers --------------------------- */

const FONTS = [
  "Garamond",
  "Times New Roman",
  "Palatino",
  "Helvetica",
  "Arial",
  "Optima",
  "Trajan Pro",
];

/* --------------------------- component --------------------------- */

export default function InscriptionOverlayPanel() {
  const lines = useHeadstoneStore((s) => s.inscriptions);
  const updateLineStore = useHeadstoneStore((s) => s.updateInscription);

  const incomingText = useHeadstoneStore((s) => s.activeInscriptionText);
  const setActiveInscriptionText = useHeadstoneStore((s) => s.setActiveInscriptionText);
  const selectedInscriptionId = useHeadstoneStore((s) => s.selectedInscriptionId);
  const closeInscriptions = useHeadstoneStore((s) => s.closeInscriptions);
  const activePanel = useHeadstoneStore((s) => s.activePanel);

  const activeId = selectedInscriptionId;
  const active = lines.find((l) => l.id === activeId) ?? null;

  const updateLine = useCallback((id: string, patch: Partial<Line>) => {
    updateLineStore(id, patch);
  }, [updateLineStore]);

  return (
    <SceneOverlayController
      section="inscriptions"
      title="Edit Your Inscription"
      persistKey="inscriptions"
      isOpen={activePanel === "inscription"}
      onClose={closeInscriptions}
    >
      <div className="mb-4">
        <label htmlFor="inscriptionTextInput" className="mb-1 block text-xs font-semibold text-violet-300">
          Inscription Text
        </label>
        <input
          id="inscriptionTextInput"
          data-inscriptions-auto-focus
          className="w-full rounded-lg border border-violet-400/60 bg-transparent px-3 py-2 outline-none ring-0 focus:border-violet-300"
          value={incomingText ?? ""}
          onChange={(e) => {
            setActiveInscriptionText(e.target.value);
            if (active) {
              updateLine(active.id, { text: e.target.value });
            }
          }}
          placeholder="Type here…"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="inscriptionFontSelect" className="mb-1 block text-xs text-white/70">Select Font</label>
        <div className="relative">
          <select
            id="inscriptionFontSelect"
            className="w-full appearance-none rounded-md border border-white/15 bg-neutral-900 px-3 py-2 pr-8 text-sm outline-none"
            value={active?.font ?? FONTS[0]}
            onChange={(e) => active && updateLine(active.id, { font: e.target.value })}
          >
            {FONTS.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/50">
            ▾
          </span>
        </div>
      </div>

      <div className="space-y-4">
        <TailwindSlider
          label="Size"
          value={active?.sizeMm ?? 30}
          min={5}
          max={1200}
          step={1}
          onChange={(v) => active && updateLine(active.id, { sizeMm: v })}
          unit="mm"
        />
        <TailwindSlider
          label="Rotation"
          value={active?.rotationDeg ?? 0}
          min={-180}
          max={180}
          step={1}
          onChange={(v) => active && updateLine(active.id, { rotationDeg: v })}
          unit="°"
        />
      </div>
    </SceneOverlayController>
  );
}
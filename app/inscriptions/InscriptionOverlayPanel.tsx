// app/inscriptions/InscriptionOverlayPanel.tsx
"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Slider from "@mui/material/Slider";
import MuiInput from "@mui/material/Input";
import SceneOverlayController from "#/components/SceneOverlayController";
import { useHeadstoneStore, Line } from "#/lib/headstone-store";

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

/* styled Input — same as ui/input-slider.tsx */
const Input = styled(MuiInput)`
  width: 80px;
  text-align: right;

  & .MuiInput-input {
    color: #fff;
  }

  &:before {
    border-bottom-color: rgba(255, 255, 255, 0.35);
  }

  &:after {
    border-bottom-color: #90caf9;
  }
`;

/* --------------------------- component --------------------------- */

export default function InscriptionOverlayPanel() {
  const lines = useHeadstoneStore((s) => s.inscriptions);
  const setStoreLines = useHeadstoneStore((s) => s.setInscriptions);
  const addLineStore = useHeadstoneStore((s) => s.addInscriptionLine);
  const updateLineStore = useHeadstoneStore((s) => s.updateInscription);
  const duplicateLineStore = useHeadstoneStore((s) => s.duplicateInscription);
  const deleteLineStore = useHeadstoneStore((s) => s.deleteInscription);

  const incomingText = useHeadstoneStore((s) => s.activeInscriptionText);
  const setActiveInscriptionText = useHeadstoneStore((s) => s.setActiveInscriptionText);
  const selectedInscriptionId = useHeadstoneStore((s) => s.selectedInscriptionId);
  const setSelectedInscriptionId = useHeadstoneStore((s) => s.setSelectedInscriptionId);
  const closeInscriptions = useHeadstoneStore((s) => s.closeInscriptions);

  const activeId = selectedInscriptionId;
  const active = lines.find((l) => l.id === activeId) ?? null;

  const [panelIsOpen, setPanelIsOpen] = useState(false);

  useEffect(() => {
    const handleOpen = (event: Event) => {
      const customEvent = event as CustomEvent<{ section: string }>;
      if (customEvent.detail?.section === "inscriptions") {
        setPanelIsOpen(true);
      }
    };
    const handleClose = (event: Event) => {
      const customEvent = event as CustomEvent<{ section: string }>;
      if (customEvent.detail?.section === "inscriptions") {
        setPanelIsOpen(false);
        setSelectedInscriptionId(null);
      }
    };
    window.addEventListener("fs:open-overlay", handleOpen as EventListener);
    window.addEventListener("fs:close-overlay", handleClose as EventListener);
    return () => {
      window.removeEventListener("fs:open-overlay", handleOpen as EventListener);
      window.removeEventListener("fs:close-overlay", handleClose as EventListener);
    };
  }, [setSelectedInscriptionId]);


  const addLine = useCallback(() => {
    const id = addLineStore({ text: "New line", font: FONTS[0], sizeMm: 19, rotationDeg: 0 });
    setSelectedInscriptionId(id);
    setActiveInscriptionText("New line");
  }, [addLineStore, setSelectedInscriptionId, setActiveInscriptionText]);


  const updateLine = useCallback((id: string, patch: Partial<Line>) => {
    updateLineStore(id, patch);
  }, [updateLineStore]);


  const duplicateLine = useCallback((id: string) => {
    const newLineId = duplicateLineStore(id);
    setSelectedInscriptionId(newLineId);
    const duplicatedLine = lines.find(l => l.id === newLineId);
    if (duplicatedLine) setActiveInscriptionText(duplicatedLine.text);
  }, [duplicateLineStore, setSelectedInscriptionId, setActiveInscriptionText, lines]);


  const deleteLine = useCallback((id: string) => {
    deleteLineStore(id);
    setActiveInscriptionText("");
  }, [deleteLineStore, setActiveInscriptionText]);

  useEffect(() => {
    if (!incomingText) return;
    if (!active) {
      const id = addLineStore({ text: incomingText, font: FONTS[0], sizeMm: 19, rotationDeg: 0 });
      setSelectedInscriptionId(id);
      return;
    }
    if (active.text !== incomingText) {
      updateLine(active.id, { text: incomingText });
    }
  }, [incomingText, active, addLineStore, setSelectedInscriptionId, updateLine]);

  const [sizeDraft, setSizeDraft] = useState<number>(active?.sizeMm ?? 19);
  const [sizeText, setSizeText] = useState<string>(String(active?.sizeMm ?? 19));
  const sizeRaf = useRef<number | null>(null);

  useEffect(() => {
    setSizeDraft(active?.sizeMm ?? 19);
    setSizeText(String(active?.sizeMm ?? 19));
  }, [active?.id, active?.sizeMm]);

  const sizeClamp = useCallback((v: number) => Math.min(120, Math.max(5, Math.round(v))), []);

  const sizeCommit = useCallback((next: number) => {
    const v = sizeClamp(next);
    if (!active) return;
    if (sizeRaf.current != null) cancelAnimationFrame(sizeRaf.current);
    sizeRaf.current = requestAnimationFrame(() => {
      updateLine(active.id, { sizeMm: v });
      sizeRaf.current = null;
    });
  }, [active, sizeClamp, updateLine]);

  useEffect(() => {
    return () => {
      const id = sizeRaf.current;
      if (id != null) {
        cancelAnimationFrame(id);
        sizeRaf.current = null;
      }
    };
  }, []);

  const [rotDraft, setRotDraft] = useState<number>(active?.rotationDeg ?? 0);
  const [rotText, setRotText] = useState<string>(String(active?.rotationDeg ?? 0));
  const rotRaf = useRef<number | null>(null);

  useEffect(() => {
    setRotDraft(active?.rotationDeg ?? 0);
    setRotText(String(active?.rotationDeg ?? 0));
  }, [active?.id, active?.rotationDeg]);

  const rotClamp = useCallback((v: number) => Math.min(45, Math.max(-45, Math.round(v))), []);

  const rotCommit = useCallback((next: number) => {
    const v = rotClamp(next);
    if (!active) return;
    if (rotRaf.current != null) cancelAnimationFrame(rotRaf.current);
    rotRaf.current = requestAnimationFrame(() => {
      updateLine(active.id, { rotationDeg: v });
      rotRaf.current = null;
    });
  }, [active, rotClamp, updateLine]);

  useEffect(() => {
    return () => {
      const id = rotRaf.current;
      if (id != null) {
        cancelAnimationFrame(id);
        rotRaf.current = null;
      }
    };
  }, []);

  if (!panelIsOpen) return null;

  return (
    <SceneOverlayController
      section="inscriptions"
      title="Add Your Inscription"
      persistKey="inscriptions"
      isOpen={panelIsOpen}
      onClose={closeInscriptions}
    >
      <div className="flex flex-wrap gap-2 mb-3">
        {lines.map((l, i) => (
          <button
            key={l.id}
            onClick={() => setSelectedInscriptionId(l.id)}
            className={`rounded-md border px-2 py-1 text-xs ${
              l.id === active?.id
                ? "border-white/60 bg-white/10"
                : "border-white/10 bg-white/5 hover:bg-white/10"
            }`}
          >
            Line {i + 1}
          </button>
        ))}
        <button
          onClick={addLine}
          className="rounded-md border border-white/20 bg-white/10 px-2 py-1 text-xs hover:bg-white/15"
        >
          + Add New Line
        </button>
      </div>

      <div className="mb-4">
        <label htmlFor="inscriptionTextInput" className="mb-1 block text-xs font-semibold text-violet-300">
          Add Your Inscription
        </label>
        <input
          id="inscriptionTextInput"
          data-inscriptions-auto-focus
          className="w-full rounded-lg border border-violet-400/60 bg-transparent px-3 py-2 outline-none ring-0 focus:border-violet-300"
          value={incomingText ?? ""}
          onChange={(e) => setActiveInscriptionText(e.target.value)}
          onBlur={() => active && updateLine(active.id, { text: incomingText })}
          placeholder="Type here…"
          disabled={!active}
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
            disabled={!active}
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

      <Box sx={{ width: "100%", maxWidth: 1000, mx: "auto", mt: 1, mb: 1 }}>
        <Typography gutterBottom>Size</Typography>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ flexWrap: "nowrap" }}>
          <Box sx={{ width: 24 }} aria-hidden />
          <Box sx={{ flexShrink: 0, width: { xs: 140, sm: 170, md: 200 } }}>
            <Slider
              value={sizeDraft}
              min={5}
              max={120}
              step={1}
              sx={{ width: "100%" }}
              onChange={(_, v) => {
                const n = Array.isArray(v) ? v[0] : Number(v);
                setSizeDraft(n);
                setSizeText(String(n));
                sizeCommit(n);
              }}
              aria-label="Size"
              disabled={!active}
            />
          </Box>
          <Input
            value={sizeText}
            onChange={(e) => setSizeText(e.target.value.replace(/[^\d]/g, ""))}
            onBlur={() => {
              const parsed = Number(sizeText);
              const v = Number.isFinite(parsed) ? sizeClamp(parsed) : sizeDraft;
              setSizeDraft(v);
              setSizeText(String(v));
              sizeCommit(v);
            }}
            inputProps={{ inputMode: "numeric", pattern: "[0-9]*", "aria-label": "Size" }}
            disabled={!active}
          />
          <Typography variant="body2">mm</Typography>
        </Stack>
      </Box>

      <Box sx={{ width: "100%", maxWidth: 1000, mx: "auto", mt: 1, mb: 1 }}>
        <Typography gutterBottom>Rotation</Typography>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ flexWrap: "nowrap" }}>
          <Box sx={{ width: 24 }} aria-hidden />
          <Box sx={{ flexShrink: 0, width: { xs: 140, sm: 170, md: 200 } }}>
            <Slider
              value={rotDraft}
              min={-45}
              max={45}
              step={1}
              sx={{ width: "100%" }}
              onChange={(_, v) => {
                const n = Array.isArray(v) ? v[0] : Number(v);
                setRotDraft(n);
                setRotText(String(n));
                rotCommit(n);
              }}
              aria-label="Rotation"
              disabled={!active}
            />
          </Box>
          <Input
            value={rotText}
            onChange={(e) =>
              setRotText(
                e.target.value
                  .replace(/[^\d-]/g, "")
                  .replace(/(?!^)-/g, "")
              )
            }
            onBlur={() => {
              const parsed = Number(rotText);
              const v = Number.isFinite(parsed) ? rotClamp(parsed) : rotDraft;
              setRotDraft(v);
              setRotText(String(v));
              rotCommit(v);
            }}
            inputProps={{ inputMode: "numeric", "aria-label": "Rotation" }}
            disabled={!active}
          />
          <Typography variant="body2">°</Typography>
        </Stack>
      </Box>

      <div className="mt-2 flex items-center gap-3">
        <button
          onClick={() => active && duplicateLine(active.id)}
          className="flex items-center gap-2 rounded-md bg-neutral-700 px-3 py-2 text-sm hover:bg-neutral-600"
          disabled={!active}
        >
          <span className="inline-block rounded bg-white/20 px-1.5">+</span>
          Duplicate
        </button>
        <button
          onClick={() => active && deleteLine(active.id)}
          className="rounded-md bg-red-600 px-3 py-2 text-sm hover:bg-red-500"
          disabled={!active}
        >
          Delete
        </button>
      </div>
    </SceneOverlayController>
  );
}
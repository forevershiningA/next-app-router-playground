"use client";

import * as React from "react";
import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Slider from "@mui/material/Slider";
import MuiInput from "@mui/material/Input";
import SceneOverlayController from "#/components/SceneOverlayController";
import { useHeadstoneStore } from "#/lib/headstone-store";

/* --------------------------- types + helpers --------------------------- */

type Line = {
  id: string;
  text: string;
  font: string;
  sizeMm: number;
  rotationDeg: number;
};

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
  // store-backed CRUD if available; otherwise local fallback
  const storeLines = useHeadstoneStore?.((s: any) => s.inscriptions) as Line[] | undefined;
  const setStoreLines = useHeadstoneStore?.((s: any) => s.setInscriptions) as
    | ((v: Line[]) => void)
    | undefined;
  const addLineStore = useHeadstoneStore?.((s: any) => s.addInscriptionLine) as
    | ((line?: Partial<Line>) => string)
    | undefined;
  const updateLineStore = useHeadstoneStore?.((s: any) => s.updateInscription) as
    | ((id: string, patch: Partial<Line>) => void)
    | undefined;
  const duplicateLineStore = useHeadstoneStore?.((s: any) => s.duplicateInscription) as
    | ((id: string) => string)
    | undefined;
  const deleteLineStore = useHeadstoneStore?.((s: any) => s.deleteInscription) as
    | ((id: string) => void)
    | undefined;
  const incomingText =
    useHeadstoneStore?.((s: any) => s.activeInscriptionText) as string | undefined;

  // deterministic IDs (no Math.random, safe for Next prerender)
  const rid = React.useId();
  const idRef = React.useRef(1);
  const newId = React.useCallback(() => `l-${rid}-${++idRef.current}`, [rid]);

  const [localLines, setLocalLines] = React.useState<Line[]>(
    storeLines?.length
      ? storeLines
      : [{ id: `l-${rid}-1`, text: "In Loving Memory", font: "Garamond", sizeMm: 19, rotationDeg: 0 }]
  );

  const lines = storeLines ?? localLines;
  const [activeId, setActiveId] = React.useState<string>(
    storeLines?.[0]?.id ?? localLines[0]?.id ?? `l-${rid}-1`
  );

  React.useEffect(() => {
    if (!lines.find((l) => l.id === activeId) && lines[0]) setActiveId(lines[0].id);
  }, [lines, activeId]);

  const setLines = (next: Line[]) => {
    setLocalLines(next);
    setStoreLines?.(next);
  };

  const addLine = () => {
    if (addLineStore) {
      const id = addLineStore({ text: "New line", font: "Garamond", sizeMm: 19, rotationDeg: 0 });
      setActiveId(id);
      return;
    }
    const id = newId();
    setLines([...lines, { id, text: "New line", font: "Garamond", sizeMm: 19, rotationDeg: 0 }]);
    setActiveId(id);
  };

  const updateLine = (id: string, patch: Partial<Line>) => {
    if (updateLineStore) return updateLineStore(id, patch);
    setLines(lines.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  };

  const duplicateLine = (id: string) => {
    if (duplicateLineStore) {
      const newLineId = duplicateLineStore(id);
      setActiveId(newLineId);
      return;
    }
    const src = lines.find((l) => l.id === id);
    if (!src) return;
    const newLineId = newId();
    setLines([...lines, { ...src, id: newLineId }]);
    setActiveId(newLineId);
  };

  const deleteLine = (id: string) => {
    if (deleteLineStore) {
      deleteLineStore(id);
    } else {
      setLines(lines.filter((l) => l.id !== id));
    }
    const next = lines.filter((l) => l.id !== id);
    if (next[0]) setActiveId(next[0].id);
  };

  const active = lines.find((l) => l.id === activeId) ?? lines[0];

  // Sync text from 3D click
  React.useEffect(() => {
    if (!incomingText) return;
    if (!active) {
      const id = addLineStore
        ? addLineStore({ text: incomingText, font: "Garamond", sizeMm: 19, rotationDeg: 0 })
        : newId();
      if (!addLineStore) {
        setLines([{ id, text: incomingText, font: "Garamond", sizeMm: 19, rotationDeg: 0 }]);
      }
      setActiveId(id);
      return;
    }
    if (active.text !== incomingText) updateLine(active.id, { text: incomingText });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incomingText]);

  // -------------------- Size (mm) slider state --------------------
  const [sizeDraft, setSizeDraft] = React.useState<number>(active?.sizeMm ?? 19);
  const [sizeText, setSizeText] = React.useState<string>(String(active?.sizeMm ?? 19));
  const sizeRaf = React.useRef<number | null>(null);

  React.useEffect(() => {
    setSizeDraft(active?.sizeMm ?? 19);
    setSizeText(String(active?.sizeMm ?? 19));
  }, [active?.id, active?.sizeMm]);

  const sizeClamp = (v: number) => Math.min(120, Math.max(5, Math.round(v)));

  const sizeCommit = (next: number) => {
    const v = sizeClamp(next);
    if (!active) return;
    if (sizeRaf.current != null) cancelAnimationFrame(sizeRaf.current);
    sizeRaf.current = requestAnimationFrame(() => {
      updateLine(active.id, { sizeMm: v });
      sizeRaf.current = null;
    });
  };

  React.useEffect(() => {
    return () => {
      const id = sizeRaf.current;
      if (id != null) {
        cancelAnimationFrame(id);
        sizeRaf.current = null;
      }
    };
  }, []);

  // -------------------- Rotation (deg) slider state --------------------
  const [rotDraft, setRotDraft] = React.useState<number>(active?.rotationDeg ?? 0);
  const [rotText, setRotText] = React.useState<string>(String(active?.rotationDeg ?? 0));
  const rotRaf = React.useRef<number | null>(null);

  React.useEffect(() => {
    setRotDraft(active?.rotationDeg ?? 0);
    setRotText(String(active?.rotationDeg ?? 0));
  }, [active?.id, active?.rotationDeg]);

  const rotClamp = (v: number) => Math.min(45, Math.max(-45, Math.round(v)));

  const rotCommit = (next: number) => {
    const v = rotClamp(next);
    if (!active) return;
    if (rotRaf.current != null) cancelAnimationFrame(rotRaf.current);
    rotRaf.current = requestAnimationFrame(() => {
      updateLine(active.id, { rotationDeg: v });
      rotRaf.current = null;
    });
  };

  React.useEffect(() => {
    return () => {
      const id = rotRaf.current;
      if (id != null) {
        cancelAnimationFrame(id);
        rotRaf.current = null;
      }
    };
  }, []);

  return (
    <SceneOverlayController
      section="inscriptions"
      title="Add Your Inscription"
      persistKey="inscriptions"
    >
      {/* line pills + add */}
      <div className="flex flex-wrap gap-2 mb-3">
        {lines.map((l, i) => (
          <button
            key={l.id}
            onClick={() => setActiveId(l.id)}
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

      {/* text input */}
      <div className="mb-4">
        <label className="mb-1 block text-xs font-semibold text-violet-300">
          Add Your Inscription
        </label>
        <input
          data-inscriptions-auto-focus
          className="w-full rounded-lg border border-violet-400/60 bg-transparent px-3 py-2 outline-none ring-0 focus:border-violet-300"
          value={active?.text ?? ""}
          onChange={(e) => active && updateLine(active.id, { text: e.target.value })}
          placeholder="Type here…"
        />
      </div>

      {/* font select */}
      <div className="mb-4">
        <label className="mb-1 block text-xs text-white/70">Select Font</label>
        <div className="relative">
          <select
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

      {/* Size (MM) */}
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
            />
          </Box>
          <Input
            value={sizeText}
            onChange={(e) => setSizeText(e.target.value.replace(/[^\d]/g, ""))}
            onBlur={() => {
              const parsed = Number(sizeText);
              const v = Number.isFinite(parsed) ? Math.min(120, Math.max(5, Math.round(parsed))) : sizeDraft;
              setSizeDraft(v);
              setSizeText(String(v));
              sizeCommit(v);
            }}
            inputProps={{ inputMode: "numeric", pattern: "[0-9]*", "aria-label": "Size" }}
          />
          <Typography variant="body2">mm</Typography>
        </Stack>
      </Box>

      {/* Rotation (°) */}
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
              const v = Number.isFinite(parsed) ? Math.min(45, Math.max(-45, Math.round(parsed))) : rotDraft;
              setRotDraft(v);
              setRotText(String(v));
              rotCommit(v);
            }}
            inputProps={{ inputMode: "numeric", "aria-label": "Rotation" }}
          />
          <Typography variant="body2">°</Typography>
        </Stack>
      </Box>

      {/* actions */}
      <div className="mt-2 flex items-center gap-3">
        <button
          onClick={() => active && duplicateLine(active.id)}
          className="flex items-center gap-2 rounded-md bg-neutral-700 px-3 py-2 text-sm hover:bg-neutral-600"
        >
          <span className="inline-block rounded bg-white/20 px-1.5">+</span>
          Duplicate
        </button>
        <button
          onClick={() => active && deleteLine(active.id)}
          className="rounded-md bg-red-600 px-3 py-2 text-sm hover:bg-red-500"
        >
          Delete
        </button>
      </div>
    </SceneOverlayController>
  );
}

"use client";

import * as React from "react";
import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Slider from "@mui/material/Slider";
import MuiInput from "@mui/material/Input";
import HeightIcon from "@mui/icons-material/Height";
import { useHeadstoneStore } from "#/lib/headstone-store";

const MIN = 300;
const MAX = 1200;

const Input = styled(MuiInput)`
  width: 80px;
  text-align: right;
  & .MuiInput-input { color: #fff; }
  &:before { border-bottom-color: rgba(255,255,255,.35); }
  &:after  { border-bottom-color: #90caf9; }
`;

export default function InputSlider() {
  // Ensure a defined number on the very first render
  const storeMm     = useHeadstoneStore((s) => s.heightMm);
  const setHeightMm = useHeadstoneStore((s) => s.setHeightMm);
  const safeStoreMm = Number.isFinite(storeMm) ? storeMm : MIN;

  // Local slider state (number) + input state (string)
  const [draft, setDraft] = React.useState<number>(safeStoreMm);
  const [text, setText]   = React.useState<string>(String(safeStoreMm));

  // Keep local states in sync when store changes externally
  React.useEffect(() => {
    setDraft(safeStoreMm);
    setText(String(safeStoreMm));
  }, [safeStoreMm]);

  const clamp = (v: number) => Math.min(MAX, Math.max(MIN, Math.round(v)));

  // Throttled commit so 3D updates stay smooth
  const raf = React.useRef<number | null>(null);
  const commit = React.useCallback((next: number) => {
    const v = clamp(next);
    if (raf.current) cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => {
      setHeightMm(v);
      raf.current = null;
    });
  }, [setHeightMm]);

  React.useEffect(() => () => { if (raf.current) cancelAnimationFrame(raf.current); }, []);

  return (
    <Box sx={{ width: "100%", maxWidth: 1000, mx: "auto", mt: 2, mb: 2 }}>
      <Typography id="height-slider" gutterBottom>Height</Typography>

      <Grid container alignItems="center" wrap="nowrap" columnSpacing={2}>
        <Grid item><HeightIcon /></Grid>

        <Grid item sx={{ flexGrow: 1, minWidth: 240 }}>
          <Slider
            value={draft}                 // always a number
            min={MIN}
            max={MAX}
            step={1}
            onChange={(_, v) => {
              const n = Array.isArray(v) ? v[0] : Number(v);
              setDraft(n);
              commit(n);
              setText(String(n));         // keep the input in sync while dragging
            }}
            aria-labelledby="height-slider"
          />
        </Grid>

        <Grid item>
          <Input
            value={text}                  // controlled string, never undefined
            onChange={(e) => {
              const onlyDigits = e.target.value.replace(/[^\d]/g, "");
              setText(onlyDigits);
            }}
            onBlur={() => {
              const parsed = Number(text);
              const v = Number.isFinite(parsed) ? clamp(parsed) : draft;
              setText(String(v));
              setDraft(v);
              commit(v);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") (e.currentTarget as HTMLInputElement).blur();
              // allow editing keys only
              const ok =
                /[0-9]/.test(e.key) ||
                ["Backspace","Delete","ArrowLeft","ArrowRight","Home","End","Tab","Enter"].includes(e.key) ||
                e.ctrlKey || e.metaKey;
              if (!ok) e.preventDefault();
            }}
            inputProps={{ inputMode: "numeric", pattern: "[0-9]*", "aria-labelledby": "height-slider" }}
          />
        </Grid>

        <Grid item><Typography variant="body2">mm</Typography></Grid>
      </Grid>
    </Box>
  );
}

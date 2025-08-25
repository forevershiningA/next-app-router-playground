"use client";

import * as React from "react";
import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Slider from "@mui/material/Slider";
import MuiInput from "@mui/material/Input";
import WidthIcon from "@mui/icons-material/KeyboardDoubleArrowRight";
import HeightIcon from "@mui/icons-material/KeyboardDoubleArrowUp";
import { useHeadstoneStore } from "#/lib/headstone-store";

const MIN = 300;
const MAX = 1200;

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

interface InputSliderProps {
  type: "height" | "width";
}

export default function InputSlider({ type }: InputSliderProps) {
  const storeMm = useHeadstoneStore(
    (s) => s[`${type}Mm` as "heightMm" | "widthMm"]
  );

  const setMm = useHeadstoneStore(
    (s) =>
      s[
        `set${type.charAt(0).toUpperCase() + type.slice(1)}Mm` as
          | "setHeightMm"
          | "setWidthMm"
      ]
  );

  const safeStoreMm = Number.isFinite(storeMm) ? storeMm : MIN;

  const [draft, setDraft] = React.useState<number>(safeStoreMm);
  const [text, setText] = React.useState<string>(String(safeStoreMm));

  React.useEffect(() => {
    setDraft(safeStoreMm);
    setText(String(safeStoreMm));
  }, [safeStoreMm]);

  const clamp = (v: number) => Math.min(MAX, Math.max(MIN, Math.round(v)));

  // Throttled commit to store
  const raf = React.useRef<number | null>(null);
  const commit = React.useCallback(
    (next: number) => {
      const v = clamp(next);
      if (raf.current) cancelAnimationFrame(raf.current);
      raf.current = requestAnimationFrame(() => {
        setMm(v);
        raf.current = null;
      });
    },
    [setMm]
  );

  React.useEffect(() => {
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, []);

  const sliderId = `${type}-slider`;

  return (
    <Box sx={{ width: "100%", maxWidth: 1000, mx: "auto", mt: 2, mb: 2 }}>
      <Typography id={sliderId} gutterBottom className="capitalize">
        {type}
      </Typography>

      <Stack
        direction="row"
        spacing={2}
        alignItems="center"
        sx={{ flexWrap: "nowrap" }}
      >
        <Box aria-hidden>
          {type === "height" ? <HeightIcon /> : <WidthIcon />}
        </Box>

         <Box sx={{ flexShrink: 0, width: { xs: 140, sm: 170, md: 200 } }}>
          <Slider
            value={draft}
            min={MIN}
            max={MAX}
            step={1}
            sx={{ width: '100%' }}
            onChange={(_, v) => {
              const n = Array.isArray(v) ? v[0] : Number(v);
              setDraft(n);
              commit(n);
              setText(String(n));
            }}
            aria-labelledby={sliderId}
          />
        </Box>

        <Input
          value={text}
          onChange={(e) => setText(e.target.value.replace(/[^\d]/g, ""))}
          onBlur={() => {
            const parsed = Number(text);
            const v = Number.isFinite(parsed) ? clamp(parsed) : draft;
            setDraft(v);
            setText(String(v));
            commit(v);
          }}
          inputProps={{
            inputMode: "numeric",
            pattern: "[0-9]*",
            "aria-labelledby": sliderId,
          }}
        />

        <Typography variant="body2">mm</Typography>
      </Stack>
    </Box>
  );
}

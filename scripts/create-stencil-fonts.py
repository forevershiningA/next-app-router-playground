#!/usr/bin/env python3
"""
Create stencil/bridged variants of inscription fonts.

Dependencies:
  python -m pip install fonttools skia-pathops

Examples:
  python scripts/create-stencil-fonts.py
  python scripts/create-stencil-fonts.py --font public/fonts/Garamond.ttf
  python scripts/create-stencil-fonts.py --bridge-width 0.12 --out-dir public/fonts/stencil

The script subtracts simple bridge rectangles from selected glyphs and writes
new files named <FontName>_stencil.ttf/otf. It is intentionally conservative:
font metrics and names are preserved except for the family/full-name suffix.
"""

from __future__ import annotations

import argparse
import copy
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable

try:
    from fontTools.pens.recordingPen import DecomposingRecordingPen, RecordingPen
    from fontTools.pens.ttGlyphPen import TTGlyphPen
    from fontTools.ttLib import TTFont
except ModuleNotFoundError as exc:
    raise SystemExit(
        "Missing dependency. Install with: python -m pip install fonttools skia-pathops"
    ) from exc

try:
    import pathops
except ModuleNotFoundError as exc:
    raise SystemExit(
        "Missing dependency. Install with: python -m pip install fonttools skia-pathops"
    ) from exc


DEFAULT_FONT_DIR = Path("public/fonts")
DEFAULT_CHARS = "04689ABDOPQRabdegopq"
FONT_SUFFIX = " Stencil"
FILE_SUFFIX = "_stencil"


class UnsupportedFontError(RuntimeError):
    pass


@dataclass(frozen=True)
class Bridge:
    x: float
    y: float
    width: float
    height: float


def replay_to_path(recording: RecordingPen) -> pathops.Path:
    path = pathops.Path()
    current: tuple[float, float] | None = None
    for operator, operands in recording.value:
        if operator == "moveTo":
            (x, y), = operands
            path.moveTo(x, y)
            current = (x, y)
        elif operator == "lineTo":
            (x, y), = operands
            path.lineTo(x, y)
            current = (x, y)
        elif operator == "qCurveTo":
            points = list(operands)
            if current is None:
                continue
            if points[-1] is None:
                points = points[:-1]
                if not points:
                    continue
                end = points[0]
            else:
                end = points[-1]
            start_x, start_y = current
            for index, control in enumerate(points[:-1]):
                next_on = end if index == len(points) - 2 else (
                    (control[0] + points[index + 1][0]) / 2,
                    (control[1] + points[index + 1][1]) / 2,
                )
                path.quadTo(control[0], control[1], next_on[0], next_on[1])
                current = next_on
        elif operator == "curveTo":
            c1, c2, end = operands
            path.cubicTo(c1[0], c1[1], c2[0], c2[1], end[0], end[1])
            current = end
        elif operator == "closePath":
            path.close()
            current = None
        elif operator == "endPath":
            current = None
            pass
    return path


def path_to_glyph(path: pathops.Path, glyph_set, original_width: int):
    pen = TTGlyphPen(glyph_set)
    path.draw(pen)
    glyph = pen.glyph()
    glyph.width = original_width
    return glyph


def rectangle_path(bridge: Bridge) -> pathops.Path:
    left = bridge.x - bridge.width / 2
    right = bridge.x + bridge.width / 2
    bottom = bridge.y - bridge.height / 2
    top = bridge.y + bridge.height / 2
    path = pathops.Path()
    path.moveTo(left, bottom)
    path.lineTo(right, bottom)
    path.lineTo(right, top)
    path.lineTo(left, top)
    path.close()
    return path


def glyph_bounds(recording: RecordingPen) -> tuple[float, float, float, float] | None:
    xs: list[float] = []
    ys: list[float] = []
    for _operator, operands in recording.value:
        for operand in operands:
            if operand is None:
                continue
            if isinstance(operand, tuple) and len(operand) == 2:
                xs.append(float(operand[0]))
                ys.append(float(operand[1]))
    if not xs or not ys:
        return None
    return min(xs), min(ys), max(xs), max(ys)


def side_notch(
    min_x: float,
    max_x: float,
    y: float,
    height: float,
    start_x: float,
    overshoot: float,
) -> Bridge:
    right = max_x + overshoot
    left = min(start_x, right)
    return Bridge(
        x=(left + right) / 2,
        y=y,
        width=max(right - left, 1),
        height=height,
    )


def bridge_for_char(char: str, bounds: tuple[float, float, float, float], bridge_width: float) -> list[Bridge]:
    min_x, min_y, max_x, max_y = bounds
    glyph_width = max_x - min_x
    glyph_height = max_y - min_y
    center_x = (min_x + max_x) / 2
    center_y = (min_y + max_y) / 2
    min_thickness = max(glyph_height * 0.026, 5)
    side_overshoot = max(glyph_width * 0.08, 18)
    side_start = center_x + glyph_width * 0.14

    if char in "PDR":
        return [side_notch(
            min_x,
            max_x,
            y=min_y + glyph_height * 0.66,
            height=max(glyph_height * 0.055, min_thickness),
            start_x=side_start,
            overshoot=side_overshoot,
        )]

    if char in "pbdq":
        return [side_notch(
            min_x,
            max_x,
            y=min_y + glyph_height * 0.66,
            height=max(glyph_height * 0.055, min_thickness),
            start_x=side_start,
            overshoot=side_overshoot,
        )]

    if char == "B":
        return [
            side_notch(
                min_x,
                max_x,
                y=min_y + glyph_height * 0.68,
                height=max(glyph_height * 0.05, min_thickness),
                start_x=side_start,
                overshoot=side_overshoot,
            ),
            side_notch(
                min_x,
                max_x,
                y=min_y + glyph_height * 0.35,
                height=max(glyph_height * 0.05, min_thickness),
                start_x=side_start,
                overshoot=side_overshoot,
            ),
        ]

    if char == "A":
        return [side_notch(
            min_x,
            max_x,
            y=min_y + glyph_height * 0.46,
            height=max(glyph_height * 0.05, min_thickness),
            start_x=center_x + glyph_width * 0.08,
            overshoot=side_overshoot,
        )]

    if char == "e":
        return [side_notch(
            min_x,
            max_x,
            y=center_y + glyph_height * 0.18,
            height=max(glyph_height * 0.05, min_thickness),
            start_x=center_x + glyph_width * 0.14,
            overshoot=side_overshoot,
        )]

    if char == "g":
        return [side_notch(
            min_x,
            max_x,
            y=center_y + glyph_height * 0.12,
            height=max(glyph_height * 0.052, min_thickness),
            start_x=center_x + glyph_width * 0.14,
            overshoot=side_overshoot,
        )]

    if char == "a":
        return [side_notch(
            min_x,
            max_x,
            y=center_y + glyph_height * 0.06,
            height=max(glyph_height * 0.055, min_thickness),
            start_x=center_x + glyph_width * 0.12,
            overshoot=side_overshoot,
        )]

    if char in "0OQ":
        return [side_notch(
            min_x,
            max_x,
            y=center_y,
            height=max(glyph_height * 0.05, min_thickness),
            start_x=side_start,
            overshoot=side_overshoot,
        )]

    if char == "8":
        return [
            side_notch(
                min_x,
                max_x,
                y=min_y + glyph_height * 0.66,
                height=max(glyph_height * 0.05, min_thickness),
                start_x=side_start,
                overshoot=side_overshoot,
            ),
            side_notch(
                min_x,
                max_x,
                y=min_y + glyph_height * 0.34,
                height=max(glyph_height * 0.05, min_thickness),
                start_x=side_start,
                overshoot=side_overshoot,
            ),
        ]

    if char == "6":
        return [side_notch(
            min_x,
            max_x,
            y=min_y + glyph_height * 0.42,
            height=max(glyph_height * 0.05, min_thickness),
            start_x=side_start,
            overshoot=side_overshoot,
        )]

    if char == "9":
        return [side_notch(
            min_x,
            max_x,
            y=min_y + glyph_height * 0.58,
            height=max(glyph_height * 0.05, min_thickness),
            start_x=side_start,
            overshoot=side_overshoot,
        )]

    return [side_notch(
        min_x,
        max_x,
        y=center_y,
        height=max(glyph_height * bridge_width, min_thickness),
        start_x=side_start,
        overshoot=side_overshoot,
    )]


def subtract_bridge(glyph_path: pathops.Path, bridge: Bridge) -> pathops.Path:
    return pathops.op(glyph_path, rectangle_path(bridge), pathops.PathOp.DIFFERENCE)


def set_name_record(font: TTFont, name_id: int, suffix: str) -> None:
    name_table = font["name"]
    for record in name_table.names:
        if record.nameID != name_id:
            continue
        try:
            current = record.toUnicode()
        except UnicodeDecodeError:
            continue
        if current.endswith(suffix):
            continue
        record.string = f"{current}{suffix}".encode(record.getEncoding())


def update_font_names(font: TTFont) -> None:
    # Family, subfamily-unique/full names, PostScript name.
    for name_id in (1, 4, 6):
        set_name_record(font, name_id, FONT_SUFFIX if name_id != 6 else "Stencil")


def cmap_for_chars(font: TTFont, chars: Iterable[str]) -> dict[str, str]:
    cmap = font.getBestCmap() or {}
    result: dict[str, str] = {}
    for char in chars:
        glyph_name = cmap.get(ord(char))
        if glyph_name:
            result[char] = glyph_name
    return result


def create_stencil_font(source: Path, output: Path, chars: str, bridge_width: float) -> int:
    font = TTFont(source)
    if "glyf" not in font:
        raise UnsupportedFontError(f"{source.name}: only TrueType glyf fonts are supported by this script")

    glyph_set = font.getGlyphSet()
    glyf = font["glyf"]
    hmtx = font["hmtx"]
    changed = 0

    for char, glyph_name in cmap_for_chars(font, chars).items():
        if glyph_name not in glyf:
            continue

        recording = DecomposingRecordingPen(glyph_set)
        glyph_set[glyph_name].draw(recording)
        bounds = glyph_bounds(recording)
        if not bounds:
            continue

        glyph_path = replay_to_path(recording)
        stencil_path = glyph_path
        for bridge in bridge_for_char(char, bounds, bridge_width):
            stencil_path = subtract_bridge(stencil_path, bridge)
        width, left_side_bearing = hmtx[glyph_name]
        new_glyph = path_to_glyph(stencil_path, glyph_set, width)
        glyf[glyph_name] = new_glyph
        hmtx[glyph_name] = (width, left_side_bearing)
        changed += 1

    update_font_names(font)
    font.save(output)
    return changed


def iter_fonts(font_dir: Path) -> Iterable[Path]:
    for pattern in ("*.ttf", "*.otf"):
        yield from sorted(font_dir.glob(pattern))


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Generate stencil variants of inscription fonts.")
    parser.add_argument("--font-dir", type=Path, default=DEFAULT_FONT_DIR)
    parser.add_argument("--out-dir", type=Path, default=None)
    parser.add_argument("--font", type=Path, action="append", default=[])
    parser.add_argument("--chars", default=DEFAULT_CHARS)
    parser.add_argument("--bridge-width", type=float, default=0.11)
    parser.add_argument("--overwrite", action="store_true")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    sources = args.font or list(iter_fonts(args.font_dir))
    out_dir = args.out_dir or args.font_dir
    out_dir.mkdir(parents=True, exist_ok=True)

    if not sources:
        print(f"No fonts found in {args.font_dir}", file=sys.stderr)
        return 1

    failures = 0
    for source in sources:
        output = out_dir / f"{source.stem}{FILE_SUFFIX}{source.suffix}"
        if output.exists() and not args.overwrite:
            print(f"skip {output} (exists; use --overwrite)")
            continue
        try:
            changed = create_stencil_font(source, output, args.chars, args.bridge_width)
            print(f"wrote {output} ({changed} glyphs bridged)")
        except UnsupportedFontError as exc:
            print(f"skip {source}: {exc}")
        except Exception as exc:
            failures += 1
            print(f"failed {source}: {exc}", file=sys.stderr)

    return 1 if failures else 0


if __name__ == "__main__":
    raise SystemExit(main())

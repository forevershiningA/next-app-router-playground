#!/usr/bin/env python3
"""
Convert TTF/OTF fonts to WOFF2.

Dependencies:
  python -m pip install fonttools brotli

Examples:
  python scripts/convert-fonts-to-woff2.py --font-dir public/fonts/stencil
  python scripts/convert-fonts-to-woff2.py --font public/fonts/stencil/Garamond_stencil.ttf --overwrite
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path
from typing import Iterable

try:
    from fontTools.ttLib import TTFont
except ModuleNotFoundError as exc:
    raise SystemExit(
        "Missing dependency. Install with: python -m pip install fonttools brotli"
    ) from exc


DEFAULT_FONT_DIR = Path("public/fonts/stencil")
SUPPORTED_SUFFIXES = {".ttf", ".otf"}


def iter_fonts(font_dir: Path) -> Iterable[Path]:
    for suffix in SUPPORTED_SUFFIXES:
        yield from sorted(font_dir.glob(f"*{suffix}"))


def convert_font(source: Path, output: Path) -> None:
    font = TTFont(source)
    font.flavor = "woff2"
    font.save(output)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Convert fonts to WOFF2.")
    parser.add_argument("--font-dir", type=Path, default=DEFAULT_FONT_DIR)
    parser.add_argument("--font", type=Path, action="append", default=[])
    parser.add_argument("--out-dir", type=Path, default=None)
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
        output = out_dir / f"{source.stem}.woff2"
        if output.exists() and not args.overwrite:
            print(f"skip {output} (exists; use --overwrite)")
            continue

        try:
            convert_font(source, output)
            print(f"wrote {output}")
        except Exception as exc:
            failures += 1
            print(f"failed {source}: {exc}", file=sys.stderr)

    return 1 if failures else 0


if __name__ == "__main__":
    raise SystemExit(main())

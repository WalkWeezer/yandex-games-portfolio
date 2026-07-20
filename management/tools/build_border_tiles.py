#!/usr/bin/env python3
"""Build simple full-cell fog-frame wall/window tiles (no corners).

True top-down slabs that fill 256×256 like desk/floor — not isometric ends.
Outputs:
  frames/tile_wall.png
  frames/tile_window.png
"""
from __future__ import annotations

from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[2]
FRAMES = ROOT / "games" / "deadline-escape" / "refs" / "sprites" / "frames"
SIDE = 256

# layout-feel-ish
CAP = (55, 60, 68, 255)          # dark wall top
CAP_HI = (78, 84, 94, 255)
FACE = (180, 168, 152, 255)      # warm beige edge
FACE_DK = (150, 138, 122, 255)
TRIM = (110, 118, 128, 255)
GLASS = (120, 190, 220, 210)
GLASS_LINE = (230, 245, 255, 160)
SHADOW = (20, 22, 28, 55)


def round_rect(draw, box, r, fill):
    draw.rounded_rectangle(box, radius=r, fill=fill)


def make_wall(with_window: bool = False) -> Image.Image:
    """Symmetric top-down slab — same on every edge (no facing / no corners)."""
    im = Image.new("RGBA", (SIDE, SIDE), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    m = 8
    # soft shadow
    sh = Image.new("RGBA", (SIDE, SIDE), (0, 0, 0, 0))
    sd = ImageDraw.Draw(sh)
    sd.rounded_rectangle((m + 3, m + 5, SIDE - m + 1, SIDE - m + 3), radius=14, fill=SHADOW)
    sh = sh.filter(ImageFilter.GaussianBlur(3))
    im = Image.alpha_composite(im, sh)
    d = ImageDraw.Draw(im)

    # wall top (fills cell) + uniform frame
    round_rect(d, (m, m, SIDE - m, SIDE - m), 14, CAP)
    d.rounded_rectangle((m + 5, m + 5, SIDE - m - 5, SIDE - m - 5), radius=10, outline=CAP_HI, width=5)
    # inner plate
    d.rounded_rectangle((m + 18, m + 18, SIDE - m - 18, SIDE - m - 18), radius=8, fill=(62, 68, 76, 255))
    d.rounded_rectangle((m + 18, m + 18, SIDE - m - 18, SIDE - m - 18), radius=8, outline=TRIM, width=2)

    if with_window:
        gx0, gy0 = m + 32, m + 32
        gx1, gy1 = SIDE - m - 32, SIDE - m - 32
        d.rounded_rectangle((gx0, gy0, gx1, gy1), radius=8, fill=(70, 78, 88, 255))
        d.rounded_rectangle((gx0 + 7, gy0 + 7, gx1 - 7, gy1 - 7), radius=6, fill=GLASS)
        cx = (gx0 + gx1) // 2
        cy = (gy0 + gy1) // 2
        d.line((cx, gy0 + 10, cx, gy1 - 10), fill=GLASS_LINE, width=3)
        d.line((gx0 + 10, cy, gx1 - 10, cy), fill=GLASS_LINE, width=3)

    return im


def main() -> int:
    FRAMES.mkdir(parents=True, exist_ok=True)
    wall = make_wall(False)
    win = make_wall(True)
    wall.save(FRAMES / "tile_wall.png")
    win.save(FRAMES / "tile_window.png")
    preview = Image.new("RGBA", (SIDE * 2 + 16, SIDE), (0, 0, 0, 0))
    preview.paste(wall, (0, 0), wall)
    preview.paste(win, (SIDE + 16, 0), win)
    preview.save(FRAMES.parent / "border_wall_preview.png")
    print("DONE simple wall/window (no corners)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

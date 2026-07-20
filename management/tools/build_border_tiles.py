#!/usr/bin/env python3
"""Build edge-aligned fog-frame wall/window tiles (no corners).

Each tile is 256×256 transparent; the wall band fills the FULL width/height
of the cell and sits flush against the OUTER edge:

  n — horizontal band at TOP
  s — horizontal band at BOTTOM
  w — vertical band at LEFT
  e — vertical band at RIGHT

Outputs frames/tile_wall_{n,s,e,w}.png, tile_window_{n,s,e,w}.png
plus aliases tile_wall.png / tile_window.png (= n).
"""
from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[2]
FRAMES = ROOT / "games" / "deadline-escape" / "refs" / "sprites" / "frames"
SIDE = 256
# thickness of wall band inside the cell (~half cell, flush to outer edge)
BAND = 118

CAP = (52, 57, 66, 255)
CAP_HI = (86, 92, 102, 255)
FACE = (186, 174, 158, 255)
FACE_DK = (148, 136, 120, 255)
TRIM = (120, 128, 138, 255)
INNER = (64, 70, 78, 255)
GLASS = (110, 185, 215, 220)
GLASS_LINE = (235, 248, 255, 180)
FRAME = (72, 80, 90, 255)
SHADOW = (15, 17, 22, 70)


def _h_band(with_window: bool, at_bottom: bool) -> Image.Image:
    """Horizontal wall: full width, flush top or bottom."""
    im = Image.new("RGBA", (SIDE, SIDE), (0, 0, 0, 0))
    y0 = SIDE - BAND if at_bottom else 0
    y1 = SIDE if at_bottom else BAND

    sh = Image.new("RGBA", (SIDE, SIDE), (0, 0, 0, 0))
    sd = ImageDraw.Draw(sh)
    # shadow toward play (inward from wall)
    if at_bottom:
        sd.rectangle((0, y0 - 10, SIDE, y0 + 4), fill=SHADOW)
    else:
        sd.rectangle((0, y1 - 4, SIDE, y1 + 10), fill=SHADOW)
    sh = sh.filter(ImageFilter.GaussianBlur(3))
    im = Image.alpha_composite(im, sh)
    d = ImageDraw.Draw(im)

    # full-width cap
    d.rectangle((0, y0, SIDE, y1), fill=CAP)
    # outer trim line
    if at_bottom:
        d.rectangle((0, y1 - 5, SIDE, y1), fill=TRIM)
        face_y0, face_y1 = y0, y0 + 22
    else:
        d.rectangle((0, y0, SIDE, y0 + 5), fill=TRIM)
        face_y0, face_y1 = y1 - 22, y1
    # beige face toward play
    d.rectangle((0, face_y0, SIDE, face_y1), fill=FACE)
    d.line((0, face_y0 if not at_bottom else face_y1 - 1,
            SIDE, face_y0 if not at_bottom else face_y1 - 1), fill=FACE_DK, width=2)
    # highlight seam
    d.line((0, y0 + 6 if not at_bottom else y1 - 7, SIDE,
            y0 + 6 if not at_bottom else y1 - 7), fill=CAP_HI, width=2)

    if with_window:
        # window inset in the band, full-ish width
        pad_x = 28
        if at_bottom:
            gy0, gy1 = y0 + 26, y1 - 10
        else:
            gy0, gy1 = y0 + 10, y1 - 26
        d.rectangle((pad_x, gy0, SIDE - pad_x, gy1), fill=FRAME)
        d.rectangle((pad_x + 5, gy0 + 5, SIDE - pad_x - 5, gy1 - 5), fill=GLASS)
        cx = SIDE // 2
        cy = (gy0 + gy1) // 2
        d.line((cx, gy0 + 6, cx, gy1 - 6), fill=GLASS_LINE, width=3)
        d.line((pad_x + 8, cy, SIDE - pad_x - 8, cy), fill=GLASS_LINE, width=3)

    return im


def _v_band(with_window: bool, at_right: bool) -> Image.Image:
    """Vertical wall: full height, flush left or right."""
    im = Image.new("RGBA", (SIDE, SIDE), (0, 0, 0, 0))
    x0 = SIDE - BAND if at_right else 0
    x1 = SIDE if at_right else BAND

    sh = Image.new("RGBA", (SIDE, SIDE), (0, 0, 0, 0))
    sd = ImageDraw.Draw(sh)
    if at_right:
        sd.rectangle((x0 - 10, 0, x0 + 4, SIDE), fill=SHADOW)
    else:
        sd.rectangle((x1 - 4, 0, x1 + 10, SIDE), fill=SHADOW)
    sh = sh.filter(ImageFilter.GaussianBlur(3))
    im = Image.alpha_composite(im, sh)
    d = ImageDraw.Draw(im)

    d.rectangle((x0, 0, x1, SIDE), fill=CAP)
    if at_right:
        d.rectangle((x1 - 5, 0, x1, SIDE), fill=TRIM)
        face_x0, face_x1 = x0, x0 + 22
    else:
        d.rectangle((x0, 0, x0 + 5, SIDE), fill=TRIM)
        face_x0, face_x1 = x1 - 22, x1
    d.rectangle((face_x0, 0, face_x1, SIDE), fill=FACE)
    d.line((face_x0 if not at_right else face_x1 - 1, 0,
            face_x0 if not at_right else face_x1 - 1, SIDE), fill=FACE_DK, width=2)
    d.line((x0 + 6 if not at_right else x1 - 7, 0,
            x0 + 6 if not at_right else x1 - 7, SIDE), fill=CAP_HI, width=2)

    if with_window:
        pad_y = 28
        if at_right:
            gx0, gx1 = x0 + 26, x1 - 10
        else:
            gx0, gx1 = x0 + 10, x1 - 26
        d.rectangle((gx0, pad_y, gx1, SIDE - pad_y), fill=FRAME)
        d.rectangle((gx0 + 5, pad_y + 5, gx1 - 5, SIDE - pad_y - 5), fill=GLASS)
        cx = (gx0 + gx1) // 2
        cy = SIDE // 2
        d.line((cx, pad_y + 8, cx, SIDE - pad_y - 8), fill=GLASS_LINE, width=3)
        d.line((gx0 + 6, cy, gx1 - 6, cy), fill=GLASS_LINE, width=3)

    return im


def main() -> int:
    FRAMES.mkdir(parents=True, exist_ok=True)
    walls = {
        "n": _h_band(False, at_bottom=False),
        "s": _h_band(False, at_bottom=True),
        "w": _v_band(False, at_right=False),
        "e": _v_band(False, at_right=True),
    }
    wins = {
        "n": _h_band(True, at_bottom=False),
        "s": _h_band(True, at_bottom=True),
        "w": _v_band(True, at_right=False),
        "e": _v_band(True, at_right=True),
    }
    for d, im in walls.items():
        im.save(FRAMES / f"tile_wall_{d}.png")
        print(f"  tile_wall_{d}.png")
    for d, im in wins.items():
        im.save(FRAMES / f"tile_window_{d}.png")
        print(f"  tile_window_{d}.png")
    # aliases
    walls["n"].save(FRAMES / "tile_wall.png")
    wins["n"].save(FRAMES / "tile_window.png")

    # preview 2×4
    keys = ["n", "s", "w", "e"]
    prev = Image.new("RGBA", (SIDE * 4 + 24, SIDE * 2 + 12), (30, 32, 40, 255))
    # checker underlay so edges read
    for r in range(2):
        for c in range(4):
            base = Image.new("RGBA", (SIDE, SIDE), (200, 205, 212, 255))
            src = walls[keys[c]] if r == 0 else wins[keys[c]]
            cell = Image.alpha_composite(base, src)
            prev.paste(cell, (c * (SIDE + 8), r * (SIDE + 12)))
    prev.save(FRAMES.parent / "border_wall_preview.png")
    print("DONE edge-aligned wall/window (n/s/w/e, no corners)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

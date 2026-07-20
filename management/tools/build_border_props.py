#!/usr/bin/env python3
"""Build 1×1 office props for fog-frame variety next to walls.

Strict: each prop fits a single 256×256 cell (never wider).
Outputs: tile_cabinet.png, tile_printer.png, tile_trash.png
plus border_props_preview.png
"""
from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[2]
FRAMES = ROOT / "games" / "deadline-escape" / "refs" / "sprites" / "frames"
SIDE = 256


def _shadow(im: Image.Image, box: tuple[int, int, int, int]) -> Image.Image:
    sh = Image.new("RGBA", (SIDE, SIDE), (0, 0, 0, 0))
    d = ImageDraw.Draw(sh)
    d.ellipse(box, fill=(20, 22, 28, 55))
    sh = sh.filter(ImageFilter.GaussianBlur(4))
    return Image.alpha_composite(im, sh)


def tile_cabinet() -> Image.Image:
    """Filing cabinet — tall, centered, ≤1 cell."""
    im = Image.new("RGBA", (SIDE, SIDE), (0, 0, 0, 0))
    im = _shadow(im, (70, 200, 186, 242))
    d = ImageDraw.Draw(im)
    x0, y0, x1, y1 = 78, 48, 178, 214
    d.rounded_rectangle((x0, y0, x1, y1), radius=10, fill=(92, 108, 128, 255))
    d.rounded_rectangle((x0 + 4, y0 + 4, x1 - 4, y1 - 4), radius=8, fill=(118, 136, 158, 255))
    # drawers
    for i, top in enumerate((62, 108, 154)):
        d.rounded_rectangle((x0 + 12, top, x1 - 12, top + 38), radius=5, fill=(78, 92, 110, 255))
        d.rectangle((x0 + 14, top + 2, x1 - 14, top + 6), fill=(150, 168, 188, 255))
        # handle
        cy = top + 20
        d.rounded_rectangle((122, cy - 4, 134, cy + 4), radius=3, fill=(210, 190, 120, 255))
    return im


def tile_printer() -> Image.Image:
    """Office printer — squat box + tray, 1 cell."""
    im = Image.new("RGBA", (SIDE, SIDE), (0, 0, 0, 0))
    im = _shadow(im, (58, 188, 198, 236))
    d = ImageDraw.Draw(im)
    # body
    d.rounded_rectangle((62, 88, 194, 188), radius=12, fill=(70, 78, 90, 255))
    d.rounded_rectangle((70, 96, 186, 150), radius=8, fill=(96, 104, 118, 255))
    # top lid
    d.rounded_rectangle((74, 72, 182, 100), radius=8, fill=(58, 64, 74, 255))
    d.rectangle((88, 78, 168, 92), fill=(40, 44, 52, 255))
    # paper tray
    d.polygon([(78, 150), (178, 150), (188, 178), (68, 178)], fill=(230, 232, 236, 255))
    d.line((78, 150, 178, 150), fill=(180, 184, 190, 255), width=2)
    # status LED
    d.ellipse((160, 108, 172, 120), fill=(80, 210, 140, 255))
    return im


def tile_trash() -> Image.Image:
    """Waste bin — round, small footprint inside 1 cell."""
    im = Image.new("RGBA", (SIDE, SIDE), (0, 0, 0, 0))
    im = _shadow(im, (88, 196, 168, 236))
    d = ImageDraw.Draw(im)
    # body
    d.ellipse((96, 168, 160, 210), fill=(55, 62, 72, 255))
    d.rounded_rectangle((98, 96, 158, 190), radius=18, fill=(72, 82, 96, 255))
    d.rounded_rectangle((106, 104, 150, 178), radius=14, fill=(58, 66, 78, 255))
    # rim
    d.ellipse((92, 84, 164, 118), fill=(90, 100, 114, 255))
    d.ellipse((104, 92, 152, 114), fill=(40, 44, 52, 255))
    # highlight
    d.arc((110, 110, 132, 160), start=200, end=320, fill=(130, 142, 158, 255), width=3)
    return im


def main() -> int:
    FRAMES.mkdir(parents=True, exist_ok=True)
    items = {
        "tile_cabinet.png": tile_cabinet(),
        "tile_printer.png": tile_printer(),
        "tile_trash.png": tile_trash(),
    }
    for name, im in items.items():
        im.save(FRAMES / name)
        print(f"  {name}")

    prev = Image.new("RGBA", (SIDE * 3 + 16, SIDE + 8), (30, 32, 40, 255))
    for i, im in enumerate(items.values()):
        base = Image.new("RGBA", (SIDE, SIDE), (200, 205, 212, 255))
        cell = Image.alpha_composite(base, im)
        prev.paste(cell, (i * (SIDE + 8), 0))
    prev.save(FRAMES.parent / "border_props_preview.png")
    print("DONE border 1×1 props (cabinet/printer/trash)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

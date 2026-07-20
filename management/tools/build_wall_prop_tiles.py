#!/usr/bin/env python3
"""Build wall/window + prop composite tiles for deadline-escape.

Uses prop sprites + painted edge-flush wall bands.
Outputs:
  frames/tile_{wall,window}_{n,s,e,w}_{plant,cooler}.png
  border_wall_props_preview.png
"""
from __future__ import annotations

import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance

ROOT = Path(__file__).resolve().parents[2]
FRAMES = ROOT / "games" / "deadline-escape" / "refs" / "sprites" / "frames"
SPRITES = FRAMES.parent
SIDE = 256
BAND = 112  # wall thickness flush to outer edge

PROPS = ("plant", "cooler")
EDGES = ("n", "s", "e", "w")

# staging dirs for generated AI props (optional)
STAGING = [
    Path("/tmp/wall_props_clean"),
    Path("/opt/cursor/artifacts/assets"),
]

sys.path.insert(0, str(Path(__file__).resolve().parent))
from chroma_to_alpha import chroma_to_rgba, fit_square  # noqa: E402


def _paint_h_wall(with_window: bool, at_bottom: bool) -> Image.Image:
    """Richer horizontal wall band — soft panels, trim, optional glass."""
    im = Image.new("RGBA", (SIDE, SIDE), (0, 0, 0, 0))
    y0 = SIDE - BAND if at_bottom else 0
    y1 = SIDE if at_bottom else BAND

    # soft inward shadow
    sh = Image.new("RGBA", (SIDE, SIDE), (0, 0, 0, 0))
    sd = ImageDraw.Draw(sh)
    if at_bottom:
        sd.rectangle((0, y0 - 14, SIDE, y0 + 6), fill=(12, 14, 20, 80))
    else:
        sd.rectangle((0, y1 - 6, SIDE, y1 + 14), fill=(12, 14, 20, 80))
    im = Image.alpha_composite(im, sh.filter(ImageFilter.GaussianBlur(5)))

    d = ImageDraw.Draw(im)
    # main cap with slight vertical gradient via strips
    for i in range(BAND):
        t = i / max(BAND - 1, 1)
        if at_bottom:
            yy = y0 + i
            # darker toward outer (bottom)
            c = (
                int(58 + 18 * (1 - t)),
                int(62 + 16 * (1 - t)),
                int(72 + 14 * (1 - t)),
                255,
            )
        else:
            yy = y0 + i
            c = (
                int(58 + 18 * t),
                int(62 + 16 * t),
                int(72 + 14 * t),
                255,
            )
        d.line((0, yy, SIDE, yy), fill=c)

    # panel seams
    for x in (64, 128, 192):
        d.line((x, y0 + 8, x, y1 - 8), fill=(70, 76, 88, 90), width=2)

    # outer trim
    if at_bottom:
        d.rectangle((0, y1 - 6, SIDE, y1), fill=(108, 116, 128, 255))
        face_y0, face_y1 = y0, y0 + 26
    else:
        d.rectangle((0, y0, SIDE, y0 + 6), fill=(108, 116, 128, 255))
        face_y0, face_y1 = y1 - 26, y1

    # beige face toward play
    d.rectangle((0, face_y0, SIDE, face_y1), fill=(198, 184, 164, 255))
    d.rectangle((0, face_y0 + 2, SIDE, face_y0 + 5), fill=(220, 208, 190, 255))
    d.line(
        (0, face_y1 - 1 if not at_bottom else face_y0, SIDE, face_y1 - 1 if not at_bottom else face_y0),
        fill=(150, 138, 120, 255),
        width=2,
    )

    # highlight seam on cap
    seam = y0 + 8 if not at_bottom else y1 - 9
    d.line((0, seam, SIDE, seam), fill=(96, 104, 118, 255), width=2)

    if with_window:
        pad_x = 30
        if at_bottom:
            gy0, gy1 = y0 + 28, y1 - 12
        else:
            gy0, gy1 = y0 + 12, y1 - 28
        d.rounded_rectangle((pad_x, gy0, SIDE - pad_x, gy1), radius=6, fill=(68, 76, 88, 255))
        d.rounded_rectangle((pad_x + 5, gy0 + 5, SIDE - pad_x - 5, gy1 - 5), radius=4, fill=(110, 185, 215, 230))
        # glass shine
        d.rectangle((pad_x + 10, gy0 + 8, pad_x + 28, gy1 - 8), fill=(235, 248, 255, 70))
        cx = SIDE // 2
        cy = (gy0 + gy1) // 2
        d.line((cx, gy0 + 8, cx, gy1 - 8), fill=(235, 248, 255, 160), width=2)
        d.line((pad_x + 10, cy, SIDE - pad_x - 10, cy), fill=(235, 248, 255, 160), width=2)

    return im


def _paint_v_wall(with_window: bool, at_right: bool) -> Image.Image:
    """Vertical wall band — rotate of horizontal logic for consistency."""
    # paint as N then rotate: N→E is -90? 
    # easier: mirror of h-band logic on X
    im = Image.new("RGBA", (SIDE, SIDE), (0, 0, 0, 0))
    x0 = SIDE - BAND if at_right else 0
    x1 = SIDE if at_right else BAND

    sh = Image.new("RGBA", (SIDE, SIDE), (0, 0, 0, 0))
    sd = ImageDraw.Draw(sh)
    if at_right:
        sd.rectangle((x0 - 14, 0, x0 + 6, SIDE), fill=(12, 14, 20, 80))
    else:
        sd.rectangle((x1 - 6, 0, x1 + 14, SIDE), fill=(12, 14, 20, 80))
    im = Image.alpha_composite(im, sh.filter(ImageFilter.GaussianBlur(5)))

    d = ImageDraw.Draw(im)
    for i in range(BAND):
        t = i / max(BAND - 1, 1)
        if at_right:
            xx = x0 + i
            c = (int(58 + 18 * (1 - t)), int(62 + 16 * (1 - t)), int(72 + 14 * (1 - t)), 255)
        else:
            xx = x0 + i
            c = (int(58 + 18 * t), int(62 + 16 * t), int(72 + 14 * t), 255)
        d.line((xx, 0, xx, SIDE), fill=c)

    for y in (64, 128, 192):
        d.line((x0 + 8, y, x1 - 8, y), fill=(70, 76, 88, 90), width=2)

    if at_right:
        d.rectangle((x1 - 6, 0, x1, SIDE), fill=(108, 116, 128, 255))
        face_x0, face_x1 = x0, x0 + 26
    else:
        d.rectangle((x0, 0, x0 + 6, SIDE), fill=(108, 116, 128, 255))
        face_x0, face_x1 = x1 - 26, x1

    d.rectangle((face_x0, 0, face_x1, SIDE), fill=(198, 184, 164, 255))
    d.rectangle((face_x0 + 2, 0, face_x0 + 5, SIDE), fill=(220, 208, 190, 255))
    seam = x0 + 8 if not at_right else x1 - 9
    d.line((seam, 0, seam, SIDE), fill=(96, 104, 118, 255), width=2)

    if with_window:
        pad_y = 30
        if at_right:
            gx0, gx1 = x0 + 28, x1 - 12
        else:
            gx0, gx1 = x0 + 12, x1 - 28
        d.rounded_rectangle((gx0, pad_y, gx1, SIDE - pad_y), radius=6, fill=(68, 76, 88, 255))
        d.rounded_rectangle((gx0 + 5, pad_y + 5, gx1 - 5, SIDE - pad_y - 5), radius=4, fill=(110, 185, 215, 230))
        d.rectangle((gx0 + 8, pad_y + 10, gx1 - 8, pad_y + 28), fill=(235, 248, 255, 70))
        cx = (gx0 + gx1) // 2
        cy = SIDE // 2
        d.line((cx, pad_y + 10, cx, SIDE - pad_y - 10), fill=(235, 248, 255, 160), width=2)
        d.line((gx0 + 10, cy, gx1 - 10, cy), fill=(235, 248, 255, 160), width=2)

    return im


def wall_tile(edge: str, with_window: bool) -> Image.Image:
    if edge == "n":
        return _paint_h_wall(with_window, at_bottom=False)
    if edge == "s":
        return _paint_h_wall(with_window, at_bottom=True)
    if edge == "w":
        return _paint_v_wall(with_window, at_right=False)
    return _paint_v_wall(with_window, at_right=True)


def load_prop(name: str) -> Image.Image:
    """Prefer cleaned staging, else frames/, else magenta AI gen."""
    for base in STAGING:
        p = base / f"tile_{name}.png"
        if p.exists():
            return fit_square(Image.open(p).convert("RGBA"), SIDE)
        # AI magenta gens
        for alt in (f"gen_{name}_m.png", f"gen_{name}.png"):
            ap = base / alt
            if ap.exists():
                cut = chroma_to_rgba(Image.open(ap), threshold=55, soft=40)
                return fit_square(cut, SIDE)
    p = FRAMES / f"tile_{name}.png"
    if p.exists():
        return fit_square(Image.open(p).convert("RGBA"), SIDE)
    raise FileNotFoundError(name)


def soft_shadow(w: int, h: int) -> Image.Image:
    sh = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(sh)
    d.ellipse((2, int(h * 0.72), w - 2, h - 2), fill=(15, 17, 22, 90))
    return sh.filter(ImageFilter.GaussianBlur(3))


def place_prop(canvas: Image.Image, prop: Image.Image, edge: str) -> Image.Image:
    """Seat prop in free half toward play, slightly overlapping wall face."""
    out = canvas.copy()
    # scale prop to ~48% of cell
    scale = 0.48
    pw = max(8, int(SIDE * scale))
    ph = max(8, int(SIDE * scale))
    # keep aspect
    bb = prop.getbbox()
    src = prop.crop(bb) if bb else prop
    ratio = min(pw / max(src.width, 1), ph / max(src.height, 1))
    nw = max(1, int(src.width * ratio))
    nh = max(1, int(src.height * ratio))
    scaled = src.resize((nw, nh), Image.Resampling.LANCZOS)

    # position: free half + slight tuck under wall face
    face = 26
    if edge == "n":
        x = (SIDE - nw) // 2
        y = BAND - face + 4
    elif edge == "s":
        x = (SIDE - nw) // 2
        y = SIDE - BAND + face - nh - 4
        if y < 4:
            y = 4
    elif edge == "w":
        x = BAND - face + 4
        y = (SIDE - nh) // 2
    else:  # e
        x = SIDE - BAND + face - nw - 4
        if x < 4:
            x = 4
        y = (SIDE - nh) // 2

    # contact shadow under prop
    shadow = soft_shadow(nw + 10, nh + 8)
    out.alpha_composite(shadow, (max(0, x - 5), max(0, y + nh - 18)))
    out.alpha_composite(scaled, (x, y))
    return out


def compose(edge: str, prop_name: str, prop: Image.Image, with_window: bool) -> Image.Image:
    base = wall_tile(edge, with_window=with_window)
    return place_prop(base, prop, edge)


def main() -> int:
    FRAMES.mkdir(parents=True, exist_ok=True)

    # refresh standalone props into frames
    props: dict[str, Image.Image] = {}
    for name in PROPS:
        im = load_prop(name)
        # keep authored plant/cooler frames as-is
        print(f"  tile_{name}.png (keep)")
        props[name] = im

    # base walls/windows (no prop)
    for edge in EDGES:
        w = wall_tile(edge, False)
        win = wall_tile(edge, True)
        w.save(FRAMES / f"tile_wall_{edge}.png")
        win.save(FRAMES / f"tile_window_{edge}.png")
        print(f"  tile_wall_{edge}.png / tile_window_{edge}.png")
    wall_tile("n", False).save(FRAMES / "tile_wall.png")
    wall_tile("n", True).save(FRAMES / "tile_window.png")

    # composites
    for edge in EDGES:
        for name in PROPS:
            for kind, win in (("wall", False), ("window", True)):
                im = compose(edge, name, props[name], with_window=win)
                out = FRAMES / f"tile_{kind}_{edge}_{name}.png"
                im.save(out)
            print(f"  tile_wall_{edge}_{name}.png (+window)")

    # preview grid: edges × props (walls)
    cols = len(PROPS)
    rows = len(EDGES)
    prev = Image.new("RGBA", (SIDE * cols + 8 * (cols - 1), SIDE * rows + 8 * (rows - 1)), (32, 34, 42, 255))
    for ri, edge in enumerate(EDGES):
        for ci, name in enumerate(PROPS):
            base = Image.new("RGBA", (SIDE, SIDE), (210, 214, 220, 255))
            tile = Image.open(FRAMES / f"tile_wall_{edge}_{name}.png").convert("RGBA")
            cell = Image.alpha_composite(base, tile)
            prev.paste(cell, (ci * (SIDE + 8), ri * (SIDE + 8)))
    prev.save(SPRITES / "border_wall_props_preview.png")
    print("DONE wall+prop composites")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

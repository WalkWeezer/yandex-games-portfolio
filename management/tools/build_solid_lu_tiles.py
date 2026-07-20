#!/usr/bin/env python3
"""Solid L/U wall tiles: one continuous wood field + mitered cap (no strip overlay).

Uses face pixels from tile_wall_n (mid wood, no cap/baseboard) so the whole L/U
shares one UV — no arm seam / crosshair at the join.

Outputs:
  tile_wall_{nw,ne,sw,se}.png
  tile_wall_{nwe,swe,nsw,nse}.png
"""
from __future__ import annotations

from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[2]
FRAMES = ROOT / "games" / "deadline-escape" / "refs" / "sprites" / "frames"
ART = ROOT / "games" / "deadline-escape" / "refs" / "art"
ART_OUT = Path("/opt/cursor/artifacts")
SIDE = 128
BAND_L = 56
BAND_U = 40
UNDER = (2, 3, 8, 255)
CAP = (218, 198, 162, 255)
CAP_HI = (236, 220, 188, 255)


def wood_face() -> np.ndarray:
    wn = np.array(Image.open(FRAMES / "tile_wall_n.png").convert("RGBA"))
    band = wn[SIDE - 56 : SIDE]
    mid = band[10:44, 4:124].copy()
    # stretch — no mirror tile (mirror = butterfly seam / «перекрестье»)
    return np.array(Image.fromarray(mid).resize((SIDE, SIDE), Image.Resampling.BICUBIC))


def fill_one_grain(mask: np.ndarray, face: np.ndarray) -> np.ndarray:
    out = np.full((SIDE, SIDE, 4), UNDER, np.uint8)
    ys, xs = np.where(mask)
    out[ys, xs] = face[ys, xs]
    out[ys, xs, 3] = 255
    return out


def l_nw(face: np.ndarray) -> Image.Image:
    yy, xx = np.mgrid[0:SIDE, 0:SIDE]
    mask = (yy >= SIDE - BAND_L) | (xx >= SIDE - BAND_L)
    im = Image.fromarray(fill_one_grain(mask, face))
    d = ImageDraw.Draw(im, "RGBA")
    y0 = x0 = SIDE - BAND_L
    pts = [(0, y0 + 1), (x0 + 1, y0 + 1), (x0 + 1, 0)]
    d.line(pts, fill=CAP, width=5, joint="curve")
    d.line(pts, fill=CAP_HI, width=2, joint="curve")
    return im


def u_nwe(face: np.ndarray) -> Image.Image:
    yy, xx = np.mgrid[0:SIDE, 0:SIDE]
    mask = (xx < BAND_U) | (xx >= SIDE - BAND_U) | (yy >= SIDE - BAND_U)
    im = Image.fromarray(fill_one_grain(mask, face))
    d = ImageDraw.Draw(im, "RGBA")
    y0 = SIDE - BAND_U
    pts = [(BAND_U - 1, 0), (BAND_U - 1, y0 + 1), (SIDE - BAND_U, y0 + 1), (SIDE - BAND_U, 0)]
    d.line(pts, fill=CAP, width=5, joint="curve")
    d.line(pts, fill=CAP_HI, width=2, joint="curve")
    return im


def orient_l(im: Image.Image, key: str) -> Image.Image:
    a = np.array(im)
    if key == "nw":
        return im
    if key == "ne":
        return Image.fromarray(np.fliplr(a))
    if key == "sw":
        return Image.fromarray(np.flipud(a))
    return Image.fromarray(np.flipud(np.fliplr(a)))


def orient_u(im: Image.Image, key: str) -> Image.Image:
    a = np.array(im)
    if key == "nwe":
        return im
    if key == "swe":
        return Image.fromarray(np.flipud(a))
    if key == "nse":
        return Image.fromarray(np.rot90(a, 1))
    return Image.fromarray(np.rot90(a, 3))


def main() -> None:
    face = wood_face()
    l0 = l_nw(face)
    u0 = u_nwe(face)
    for k in ("nw", "ne", "sw", "se"):
        orient_l(l0, k).save(FRAMES / f"tile_wall_{k}.png")
        print("L", k)
    for k in ("nwe", "swe", "nse", "nsw"):
        orient_u(u0, k).save(FRAMES / f"tile_wall_{k}.png")
        print("U", k)
    ART.mkdir(parents=True, exist_ok=True)
    l0.save(ART / "ai-set-corner-nw.png")
    u0.save(ART / "ai-set-u-nwe.png")
    preview = Image.new("RGBA", (SIDE * 3 + 40, SIDE + 20), (18, 18, 22, 255))
    for i, n in enumerate(("tile_wall_nw", "tile_wall_ne", "tile_wall_nwe")):
        preview.paste(Image.open(FRAMES / f"{n}.png"), (10 + i * (SIDE + 10), 10))
    sheet = FRAMES.parent / "wall_lu_solid_preview.png"
    preview.save(sheet)
    if ART_OUT.exists():
        preview.resize((preview.width * 3, preview.height * 3), Image.Resampling.NEAREST).save(
            ART_OUT / "wall-lu-three-preview.png"
        )
    print("preview", sheet)


if __name__ == "__main__":
    main()

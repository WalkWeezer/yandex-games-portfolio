#!/usr/bin/env python3
"""Solid L/U from straight strips — arms match neighbors, no corner overlay (+).

Bottom/side arms copied from tile_wall_{n,e,w,s}; corner square stays from the
horizontal/vertical arm only (no second strip over it → no crosshair).
"""
from __future__ import annotations

from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
FRAMES = ROOT / "games" / "deadline-escape" / "refs" / "sprites" / "frames"
ART = ROOT / "games" / "deadline-escape" / "refs" / "art"
SIDE = 128
BAND = 56
BAND_U = 40
UNDER = (2, 3, 8, 255)


def load(name: str) -> np.ndarray:
    return np.array(Image.open(FRAMES / name).convert("RGBA"))


def l_nw(n: np.ndarray, e: np.ndarray) -> Image.Image:
    out = np.full((SIDE, SIDE, 4), UNDER, np.uint8)
    out[SIDE - BAND : SIDE, :] = n[SIDE - BAND : SIDE, :]
    out[0 : SIDE - BAND, SIDE - BAND : SIDE] = e[0 : SIDE - BAND, SIDE - BAND : SIDE]
    return Image.fromarray(out)


def u_nwe(n: np.ndarray, e: np.ndarray, w: np.ndarray) -> Image.Image:
    out = np.full((SIDE, SIDE, 4), UNDER, np.uint8)
    out[0 : SIDE - BAND_U, 0:BAND_U] = e[0 : SIDE - BAND_U, 0:BAND_U]
    out[0 : SIDE - BAND_U, SIDE - BAND_U : SIDE] = w[0 : SIDE - BAND_U, SIDE - BAND_U : SIDE]
    out[SIDE - BAND_U : SIDE, :] = n[SIDE - BAND_U : SIDE, :]
    return Image.fromarray(out)


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
    n, e, w = load("tile_wall_n.png"), load("tile_wall_e.png"), load("tile_wall_w.png")
    l0 = l_nw(n, e)
    u0 = u_nwe(n, e, w)
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
    for i, name in enumerate(("tile_wall_nw", "tile_wall_ne", "tile_wall_nwe")):
        preview.paste(Image.open(FRAMES / f"{name}.png"), (10 + i * (SIDE + 10), 10))
    preview.save(FRAMES.parent / "wall_lu_solid_preview.png")
    print("done")


if __name__ == "__main__":
    main()

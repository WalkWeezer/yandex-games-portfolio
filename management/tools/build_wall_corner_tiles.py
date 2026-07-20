#!/usr/bin/env python3
"""Build wall corner variants from inner-edge wall strips.

Inner flush: N=bottom, S=top, W=right, E=left.

Outputs:
  tile_wall_{nw,ne,sw,se}.png     — L (2 walls)
  tile_wall_{nwe,nsw,nse,swe}.png — U (3 walls)
  tile_wall_stub_{nw,ne,sw,se}.png — small corner stub (arena corner)
(+ window aliases)
"""
from __future__ import annotations

from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
FRAMES = ROOT / "games" / "deadline-escape" / "refs" / "sprites" / "frames"
UNDER = np.array([2, 3, 8, 255], dtype=np.uint8)
SIDE = 256
STUB_LEN = 96

L2 = {"nw": ("n", "w"), "ne": ("n", "e"), "sw": ("s", "w"), "se": ("s", "e")}
U3 = {
    "nwe": ("n", "w", "e"),
    "nsw": ("n", "s", "w"),
    "nse": ("n", "s", "e"),
    "swe": ("s", "w", "e"),
}


def load(edge: str) -> np.ndarray:
    return np.array(Image.open(FRAMES / f"tile_wall_{edge}.png").convert("RGBA"))


def is_content(a: np.ndarray) -> np.ndarray:
    rgb, al = a[..., :3], a[..., 3]
    lum = rgb.astype(np.int16).sum(axis=-1)
    return (al > 20) & (lum > 50)


def underlay() -> np.ndarray:
    out = np.zeros((SIDE, SIDE, 4), dtype=np.uint8)
    out[:] = UNDER
    return out


def composite_edges(edges: tuple[str, ...]) -> np.ndarray:
    out = underlay()
    for e in edges:
        a = load(e)
        m = is_content(a)
        out[m] = a[m]
    return out


def make_stub(corner: str) -> np.ndarray:
    out = underlay()
    src = {e: load(e) for e in "nsew"}

    def band_mask(a: np.ndarray, edge: str) -> np.ndarray:
        m = is_content(a)
        mm = np.zeros_like(m)
        xs = np.arange(SIDE)[None, :]
        ys = np.arange(SIDE)[:, None]
        if corner == "nw":
            if edge == "n":
                mm |= m & (xs >= SIDE - STUB_LEN)
            elif edge == "w":
                mm |= m & (ys >= SIDE - STUB_LEN)
        elif corner == "ne":
            if edge == "n":
                mm |= m & (xs < STUB_LEN)
            elif edge == "e":
                mm |= m & (ys >= SIDE - STUB_LEN)
        elif corner == "sw":
            if edge == "s":
                mm |= m & (xs >= SIDE - STUB_LEN)
            elif edge == "w":
                mm |= m & (ys < STUB_LEN)
        elif corner == "se":
            if edge == "s":
                mm |= m & (xs < STUB_LEN)
            elif edge == "e":
                mm |= m & (ys < STUB_LEN)
        return mm

    for e in L2[corner]:
        a = src[e]
        m = band_mask(a, e)
        out[m] = a[m]
    return out


def save(name: str, arr: np.ndarray) -> None:
    Image.fromarray(arr).save(FRAMES / name)
    print("wrote", name)


def main() -> None:
    for key, edges in L2.items():
        save(f"tile_wall_{key}.png", composite_edges(edges))
        save(f"tile_window_{key}.png", composite_edges(edges))
    for key, edges in U3.items():
        save(f"tile_wall_{key}.png", composite_edges(edges))
        save(f"tile_window_{key}.png", composite_edges(edges))
    for corner in L2:
        stub = make_stub(corner)
        save(f"tile_wall_stub_{corner}.png", stub)
        save(f"tile_window_stub_{corner}.png", stub)
    print("DONE wall corner variants")


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""Rebuild office wall tiles from AI master N + compose L/U/stub.

1) Process wall-master-n.png → straight N (bottom band), rotate to S/E/W
2) Compose L / U / stub from straights (clean joins, game style)

Inner-edge convention (toward play):
  N=bottom, S=top, E=left, W=right
"""
from __future__ import annotations

from pathlib import Path

import numpy as np
from PIL import Image, ImageEnhance

ROOT = Path(__file__).resolve().parents[2]
FRAMES = ROOT / "games" / "deadline-escape" / "refs" / "sprites" / "frames"
ART = Path("/opt/cursor/artifacts/assets")
SIDE = 256
BAND = 72
STUB_ARM = 100
UNDER = np.array([2, 3, 8, 255], dtype=np.uint8)


def fit(im: Image.Image) -> Image.Image:
    im = im.convert("RGBA")
    w, h = im.size
    s = min(w, h)
    left, top = (w - s) // 2, (h - s) // 2
    return im.crop((left, top, left + s, top + s)).resize((SIDE, SIDE), Image.Resampling.LANCZOS)


def key(arr: np.ndarray, thr: float = 42.0) -> np.ndarray:
    a = arr.astype(np.float32)
    lum = a[..., :3].mean(-1)
    mx = a[..., :3].max(-1)
    empty = (lum < thr) | (a[..., 3] < 15) | ((mx < 55) & (lum < 70))
    out = a.copy()
    out[empty] = UNDER
    out[~empty, 3] = 255
    return out.astype(np.uint8)


def content(a: np.ndarray) -> np.ndarray:
    lum = a[..., :3].astype(np.int16).sum(-1)
    return (lum > 90) & (a[..., 3] > 20)


def under() -> np.ndarray:
    o = np.zeros((SIDE, SIDE, 4), np.uint8)
    o[:] = UNDER
    return o


def polish(arr: np.ndarray) -> np.ndarray:
    im = Image.fromarray(arr)
    im = ImageEnhance.Contrast(im).enhance(1.08)
    im = ImageEnhance.Sharpness(im).enhance(1.2)
    return np.asarray(im.convert("RGBA"))


def extract_n_from_master() -> np.ndarray:
    src = ART / "wall-master-n.png"
    if not src.exists():
        # fallback: keep existing tile_wall_n
        return np.asarray(Image.open(FRAMES / "tile_wall_n.png").convert("RGBA"))
    raw = key(np.asarray(fit(Image.open(src))))
    m = content(raw)
    ys, xs = np.where(m)
    if len(ys) == 0:
        raise RuntimeError("no wall content in master N")
    y0, y1 = int(ys.min()), int(ys.max()) + 1
    band = raw[y0:y1, :]
    im = Image.fromarray(band).resize((SIDE, BAND), Image.Resampling.LANCZOS)
    out = under()
    out[SIDE - BAND : SIDE, :] = np.asarray(im)
    return polish(out)


def save(name: str, arr: np.ndarray) -> None:
    Image.fromarray(arr).save(FRAMES / name)
    print("wrote", name)


def compose(*tiles: np.ndarray) -> np.ndarray:
    out = under()
    for t in tiles:
        m = content(t)
        out[m] = t[m]
    return out


def make_stub(base: np.ndarray, corner: str) -> np.ndarray:
    out = under()
    m = content(base)
    bm = np.zeros_like(m)
    if corner == "nw":
        bm[SIDE - BAND : SIDE, SIDE - STUB_ARM : SIDE] = True
        bm[SIDE - STUB_ARM : SIDE, SIDE - BAND : SIDE] = True
    elif corner == "ne":
        bm[SIDE - BAND : SIDE, 0:STUB_ARM] = True
        bm[SIDE - STUB_ARM : SIDE, 0:BAND] = True
    elif corner == "sw":
        bm[0:BAND, SIDE - STUB_ARM : SIDE] = True
        bm[0:STUB_ARM, SIDE - BAND : SIDE] = True
    else:
        bm[0:BAND, 0:STUB_ARM] = True
        bm[0:STUB_ARM, 0:BAND] = True
    keep = m & bm
    out[keep] = base[keep]
    return out


def main() -> None:
    n = extract_n_from_master()
    s = np.asarray(Image.fromarray(n).transpose(Image.Transpose.FLIP_TOP_BOTTOM))
    e = np.asarray(Image.fromarray(n).rotate(-90, expand=False))
    w = np.asarray(Image.fromarray(n).rotate(90, expand=False))

    for name, arr in [
        ("tile_wall_n", n), ("tile_wall_s", s), ("tile_wall_e", e), ("tile_wall_w", w),
        ("tile_wall", n), ("tile_window_n", n), ("tile_window_s", s),
        ("tile_window_e", e), ("tile_window_w", w), ("tile_window", n),
    ]:
        save(f"{name}.png", arr)

    pairs = {
        "nw": (n, w), "ne": (n, e), "sw": (s, w), "se": (s, e),
    }
    corners = {}
    for k, (a, b) in pairs.items():
        corners[k] = compose(a, b)
        save(f"tile_wall_{k}.png", corners[k])
        save(f"tile_window_{k}.png", corners[k])

    for k, base in corners.items():
        st = make_stub(base, k)
        save(f"tile_wall_stub_{k}.png", st)
        save(f"tile_window_stub_{k}.png", st)

    triples = {
        "nwe": (n, w, e), "nsw": (n, s, w), "nse": (n, s, e), "swe": (s, w, e),
    }
    for k, parts in triples.items():
        arr = compose(*parts)
        save(f"tile_wall_{k}.png", arr)
        save(f"tile_window_{k}.png", arr)

    print("DONE")


if __name__ == "__main__":
    main()

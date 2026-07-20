#!/usr/bin/env python3
"""Slice generated border wall sheets → oriented fog-frame tiles (256×256).

Sources (magenta #FF00FF):
  /opt/cursor/artifacts/assets/border-wall-sheet-raw.png   (5 tiles H)
  /opt/cursor/artifacts/assets/border-wall-sheet-raw-b.png (4 tiles H)

Outputs under games/deadline-escape/refs/sprites/frames/:
  tile_wall_{n,s,e,w}.png
  tile_window_{n,s,e,w}.png
  tile_wall_end_{n,s}_{l,r}.png  / tile_wall_end_{e,w}_{t,b}.png
  tile_corner_{nw,ne,sw,se}.png
  tile_wall.png / tile_window.png  (aliases → n / window_n)
"""
from __future__ import annotations

import sys
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
FRAMES = ROOT / "games" / "deadline-escape" / "refs" / "sprites" / "frames"
SRC_A = Path("/opt/cursor/artifacts/assets/border-wall-sheet-raw.png")
SRC_B = Path("/opt/cursor/artifacts/assets/border-wall-sheet-raw-b.png")
SIDE = 256
MAGENTA = (255, 0, 255)


def chroma_to_rgba(im: Image.Image, thresh: int = 40) -> Image.Image:
    im = im.convert("RGBA")
    arr = np.asarray(im).copy()
    r, g, b, a = arr[..., 0], arr[..., 1], arr[..., 2], arr[..., 3]
    # near-magenta → transparent
    mag = (np.abs(r.astype(np.int16) - 255) < thresh) & (g.astype(np.int16) < thresh) & (
        np.abs(b.astype(np.int16) - 255) < thresh
    )
    # also kill near-white page margins if any
    a = a.copy()
    a[mag] = 0
    arr[..., 3] = a
    return Image.fromarray(arr, "RGBA")


def content_bbox(im: Image.Image, alpha_min: int = 16):
    arr = np.asarray(im)
    mask = arr[..., 3] >= alpha_min
    ys, xs = np.where(mask)
    if len(xs) == 0:
        return None
    return int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1


def slice_row_blobs(im: Image.Image, expect: int) -> list[Image.Image]:
    """Split a horizontal sheet into content blobs left→right."""
    arr = np.asarray(im)
    mask = arr[..., 3] >= 16
    # column occupancy
    col_has = mask.any(axis=0)
    parts: list[tuple[int, int]] = []
    in_run = False
    start = 0
    for x, on in enumerate(col_has.tolist() + [False]):
        if on and not in_run:
            in_run = True
            start = x
        elif not on and in_run:
            in_run = False
            parts.append((start, x))
    # merge tiny gaps (< 8px) between parts
    merged: list[tuple[int, int]] = []
    for a, b in parts:
        if merged and a - merged[-1][1] < 8:
            merged[-1] = (merged[-1][0], b)
        else:
            merged.append((a, b))
    if len(merged) < expect:
        # fallback: equal columns
        w = im.width
        step = w // expect
        merged = [(i * step, (i + 1) * step if i < expect - 1 else w) for i in range(expect)]
    # take largest `expect` by width
    merged.sort(key=lambda ab: ab[1] - ab[0], reverse=True)
    merged = sorted(merged[:expect], key=lambda ab: ab[0])
    out: list[Image.Image] = []
    for a, b in merged:
        crop = im.crop((a, 0, b, im.height))
        bb = content_bbox(crop)
        if bb:
            crop = crop.crop(bb)
        out.append(crop)
    return out


def fit_square(im: Image.Image, side: int = SIDE, pad: float = 0.08) -> Image.Image:
    im = im.convert("RGBA")
    bb = content_bbox(im)
    if bb:
        im = im.crop(bb)
    canvas = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    max_w = max_h = int(side * (1 - pad * 2))
    scale = min(max_w / max(im.width, 1), max_h / max(im.height, 1))
    nw = max(1, int(round(im.width * scale)))
    nh = max(1, int(round(im.height * scale)))
    scaled = im.resize((nw, nh), Image.Resampling.LANCZOS)
    canvas.paste(scaled, ((side - nw) // 2, (side - nh) // 2), scaled)
    return canvas


def flip_h(im: Image.Image) -> Image.Image:
    return im.transpose(Image.Transpose.FLIP_LEFT_RIGHT)


def flip_v(im: Image.Image) -> Image.Image:
    return im.transpose(Image.Transpose.FLIP_TOP_BOTTOM)


def rot90(im: Image.Image, k: int = 1) -> Image.Image:
    return im.rotate(-90 * k, expand=False, fillcolor=(0, 0, 0, 0))


def save(name: str, im: Image.Image) -> None:
    path = FRAMES / name
    im.save(path)
    print(f"  wrote {path.relative_to(ROOT)} ({im.size[0]}x{im.size[1]})")


def main() -> int:
    if not SRC_A.exists() or not SRC_B.exists():
        print("Missing generated sheets under /opt/cursor/artifacts/assets/", file=sys.stderr)
        return 1
    FRAMES.mkdir(parents=True, exist_ok=True)

    a = chroma_to_rgba(Image.open(SRC_A))
    b = chroma_to_rgba(Image.open(SRC_B))
    # A: wall_h, window_h, corner_outer, end_l, end_r
    ta = [fit_square(x) for x in slice_row_blobs(a, 5)]
    # B: wall_v, window_v, corner_ne-ish, corner_sw-ish
    tb = [fit_square(x) for x in slice_row_blobs(b, 4)]

    wall_h, window_h, corner_a, end_l, end_r = ta
    wall_v, window_v, corner_b1, corner_b2 = tb

    # Straights — face toward play
    wall_n = wall_h
    wall_s = flip_v(wall_h)
    wall_w = wall_v
    wall_e = flip_h(wall_v)

    win_n = window_h
    win_s = flip_v(window_h)
    win_w = window_v
    win_e = flip_h(window_v)

    # Ends on horizontal edges (n/s): l = open fog on left, r = open on right
    end_n_l = end_l
    end_n_r = end_r
    end_s_l = flip_v(end_l)
    end_s_r = flip_v(end_r)
    # Ends on vertical edges: t/b via rotate of horizontal ends
    end_w_t = rot90(end_l, 1)
    end_w_b = rot90(end_r, 1)
    end_e_t = flip_h(end_w_t)
    end_e_b = flip_h(end_w_b)

    # Outer corners — derive 4 from generated pieces + flips
    corner_nw = corner_a
    corner_ne = flip_h(corner_a) if corner_b1 is None else corner_b1
    # prefer sheet B pieces when they look like outer corners
    corner_ne = corner_b1
    corner_sw = corner_b2
    corner_se = flip_h(corner_sw)

    mapping = {
        "tile_wall_n.png": wall_n,
        "tile_wall_s.png": wall_s,
        "tile_wall_e.png": wall_e,
        "tile_wall_w.png": wall_w,
        "tile_window_n.png": win_n,
        "tile_window_s.png": win_s,
        "tile_window_e.png": win_e,
        "tile_window_w.png": win_w,
        "tile_wall_end_n_l.png": end_n_l,
        "tile_wall_end_n_r.png": end_n_r,
        "tile_wall_end_s_l.png": end_s_l,
        "tile_wall_end_s_r.png": end_s_r,
        "tile_wall_end_w_t.png": end_w_t,
        "tile_wall_end_w_b.png": end_w_b,
        "tile_wall_end_e_t.png": end_e_t,
        "tile_wall_end_e_b.png": end_e_b,
        "tile_corner_nw.png": corner_nw,
        "tile_corner_ne.png": corner_ne,
        "tile_corner_sw.png": corner_sw,
        "tile_corner_se.png": corner_se,
        # aliases for legacy loaders
        "tile_wall.png": wall_n,
        "tile_window.png": win_n,
    }
    for name, im in mapping.items():
        save(name, im)

    # preview strip
    keys = [
        "tile_wall_n", "tile_window_n", "tile_wall_end_n_l", "tile_wall_end_n_r",
        "tile_corner_nw", "tile_corner_ne", "tile_wall_w", "tile_window_w",
    ]
    strip = Image.new("RGBA", (SIDE * len(keys), SIDE), (0, 0, 0, 0))
    for i, k in enumerate(keys):
        strip.paste(mapping[k + ".png"], (i * SIDE, 0), mapping[k + ".png"])
    preview = FRAMES.parent / "border_wall_preview.png"
    strip.save(preview)
    print(f"  preview {preview.relative_to(ROOT)}")
    print("DONE border tiles")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

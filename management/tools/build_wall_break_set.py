#!/usr/bin/env python3
"""Break the L/U corner cycle: only straights + stubs from AI masters.

Masters (preferred):
  /opt/cursor/artifacts/assets/ai-wall-final-n.png
  /opt/cursor/artifacts/assets/ai-window-final-n.png
  /opt/cursor/artifacts/assets/ai-stub-final-nw.png

Fallback: games/deadline-escape/refs/art/{wall,window,stub}_master_*.png

No L-corners, no U-junctions. Runtime uses strip + stub square only.
"""
from __future__ import annotations

from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
FRAMES = ROOT / "games" / "deadline-escape" / "refs" / "sprites" / "frames"
ART = ROOT / "games" / "deadline-escape" / "refs" / "art"
ART_IN = Path("/opt/cursor/artifacts/assets")
ART_OUT = Path("/opt/cursor/artifacts")
SIDE = 128
BAND = 56
UNDER = (2, 3, 8, 255)


def under() -> Image.Image:
    return Image.new("RGBA", (SIDE, SIDE), UNDER)


def is_bg(rgb: np.ndarray) -> np.ndarray:
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    black = (r.astype(np.int16) + g + b) < 55
    magenta = (r > 180) & (b > 180) & (g < 120)
    return black | magenta


def extract_content(im: Image.Image) -> Image.Image:
    a = np.array(im.convert("RGBA"), copy=True)
    a[is_bg(a[..., :3]), 3] = 0
    ys, xs = np.where(a[..., 3] > 20)
    if len(xs) == 0:
        raise RuntimeError("no wall content in master")
    return Image.fromarray(a).crop((int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1))


def make_n_band(master: Image.Image) -> Image.Image:
    crop = extract_content(master)
    if crop.width > 6 and crop.height > 4:
        crop = crop.crop((2, 0, crop.width - 2, crop.height))
    scaled = crop.resize((SIDE, BAND), Image.Resampling.LANCZOS)
    out = under()
    oa = np.array(out, copy=True)
    sa = np.array(scaled.convert("RGBA"))
    m = sa[..., 3] > 20
    y0 = SIDE - BAND
    oa[y0:SIDE, :, :][m] = sa[m]
    edge = oa[y0:SIDE, 4].copy()
    oa[y0:SIDE, 0] = edge
    oa[y0:SIDE, SIDE - 1] = edge
    return Image.fromarray(oa)


def orient(n_tile: Image.Image, edge: str) -> Image.Image:
    if edge == "n":
        return n_tile
    if edge == "s":
        return n_tile.transpose(Image.Transpose.ROTATE_180)
    if edge == "e":
        return n_tile.transpose(Image.Transpose.ROTATE_270)
    if edge == "w":
        return n_tile.transpose(Image.Transpose.ROTATE_90)
    return n_tile


def make_stub(master: Image.Image, corner: str) -> Image.Image:
    crop = extract_content(master)
    scaled = crop.resize((BAND, BAND), Image.Resampling.LANCZOS)
    out = under()
    oa = np.array(out, copy=True)
    sa = np.array(scaled.convert("RGBA"))
    m = sa[..., 3] > 20
    # stub_nw → SE quadrant (play-facing join of NW map corner)
    places = {
        "nw": (SIDE - BAND, SIDE - BAND),
        "ne": (SIDE - BAND, 0),
        "sw": (0, SIDE - BAND),
        "se": (0, 0),
    }
    y0, x0 = places[corner]
    oa[y0 : y0 + BAND, x0 : x0 + BAND][m] = sa[m]
    return Image.fromarray(oa)


def find_master(names: list[str]) -> Path:
    for n in names:
        for base in (ART_IN, ART):
            p = base / n
            if p.exists():
                return p
    raise FileNotFoundError(names)


def main() -> None:
    FRAMES.mkdir(parents=True, exist_ok=True)
    ART.mkdir(parents=True, exist_ok=True)

    wall_src = find_master(["ai-wall-final-n.png", "wall_master_n.png", "ai-set-wall-n.png"])
    win_src = find_master(["ai-window-final-n.png", "window_master_n.png", "ai-set-window-n.png"])
    stub_src = find_master(["ai-stub-final-nw.png", "stub_master_nw.png", "ai-set-stub-nw.png"])

    wall_m = Image.open(wall_src).convert("RGBA")
    win_m = Image.open(win_src).convert("RGBA")
    stub_m = Image.open(stub_src).convert("RGBA")

    wall_m.save(ART / "ai-set-wall-n.png")
    win_m.save(ART / "ai-set-window-n.png")
    stub_m.save(ART / "ai-set-stub-nw.png")
    wall_m.save(ART / "wall_master_n.png")
    win_m.save(ART / "window_master_n.png")
    stub_m.save(ART / "stub_master_nw.png")

    wall_n = make_n_band(wall_m)
    win_n = make_n_band(win_m)
    for e in "nsew":
        orient(wall_n, e).save(FRAMES / f"tile_wall_{e}.png")
        orient(win_n, e).save(FRAMES / f"tile_window_{e}.png")
        print("edge", e)

    for c in ("nw", "ne", "sw", "se"):
        st = make_stub(stub_m, c)
        st.save(FRAMES / f"tile_wall_stub_{c}.png")
        st.save(FRAMES / f"tile_window_stub_{c}.png")
        print("stub", c)

    # Remove any leftover L/U if present (they must not ship)
    for name in (
        "tile_wall_nw", "tile_wall_ne", "tile_wall_sw", "tile_wall_se",
        "tile_wall_nwe", "tile_wall_swe", "tile_wall_nsw", "tile_wall_nse",
        "tile_window_nw", "tile_window_ne", "tile_window_sw", "tile_window_se",
        "tile_window_nwe", "tile_window_swe", "tile_window_nsw", "tile_window_nse",
    ):
        p = FRAMES / f"{name}.png"
        if p.exists():
            p.unlink()
            print("removed", p.name)

    preview = Image.new("RGBA", (SIDE * 4 + 30, SIDE * 2 + 30), (18, 18, 22, 255))
    for i, name in enumerate(
        [
            "tile_wall_n", "tile_wall_e", "tile_window_n", "tile_window_e",
            "tile_wall_stub_nw", "tile_wall_stub_ne", "tile_wall_stub_sw", "tile_wall_stub_se",
        ]
    ):
        im = Image.open(FRAMES / f"{name}.png")
        preview.paste(im, (10 + (i % 4) * (SIDE + 5), 10 + (i // 4) * (SIDE + 5)))
    sheet = FRAMES.parent / "wall_break_preview.png"
    preview.save(sheet)
    if ART_OUT.exists():
        preview.save(ART_OUT / "wall-break-preview.png")
    print("preview", sheet)


if __name__ == "__main__":
    main()

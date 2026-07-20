#!/usr/bin/env python3
"""Build flush (no side-gap) wall/window tiles from AI masters.

Masters: /opt/cursor/artifacts/assets/ai-wall-n-flush.png
         /opt/cursor/artifacts/assets/ai-window-n-flush.png

Output frames are full-bleed on join edges (N/S: left+right; E/W: top+bottom)
so adjacent cells meet without dark seams. Underlay is near-black #020308.
"""
from __future__ import annotations

from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
FRAMES = ROOT / "games" / "deadline-escape" / "refs" / "sprites" / "frames"
ART_IN = Path("/opt/cursor/artifacts/assets")
ART_OUT = Path("/opt/cursor/artifacts")
SIDE = 256
BAND = 112  # ~44% — matches fog inner strip
UNDER = (2, 3, 8, 255)


def under() -> Image.Image:
    return Image.new("RGBA", (SIDE, SIDE), UNDER)


def is_bg(rgb: np.ndarray) -> np.ndarray:
    """Near-black / near-magenta treated as empty."""
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    black = (r.astype(np.int16) + g + b) < 55
    magenta = (r > 180) & (b > 180) & (g < 120)
    return black | magenta


def extract_content(im: Image.Image) -> Image.Image:
    a = np.array(im.convert("RGBA"), copy=True)
    bg = is_bg(a[..., :3])
    a[bg, 3] = 0
    # keep only opaque-ish content
    ys, xs = np.where(a[..., 3] > 20)
    if len(xs) == 0:
        raise RuntimeError("no wall content in master")
    return Image.fromarray(a).crop((int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1))


def make_n_band(master: Image.Image) -> Image.Image:
    """Horizontal wall flush left–right, pinned to bottom of cell."""
    crop = extract_content(master)
    # trim AI outline / soft AA, then stretch full width
    if crop.width > 6 and crop.height > 4:
        crop = crop.crop((2, 0, crop.width - 2, crop.height))
    scaled = crop.resize((SIDE, BAND), Image.Resampling.LANCZOS)
    out = under()
    oa = np.array(out, copy=True)
    sa = np.array(scaled.convert("RGBA"))
    m = sa[..., 3] > 20
    y0 = SIDE - BAND
    oa[y0:SIDE, :, :][m] = sa[m]
    # seamless tile: both outer columns == same interior column (no seam when joined)
    src = oa[y0:SIDE, 3].copy()
    for x in (0, 1, 2, SIDE - 3, SIDE - 2, SIDE - 1):
        oa[y0:SIDE, x] = src
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


def content_mask(a: np.ndarray) -> np.ndarray:
    lum = a[..., :3].astype(np.int16).sum(-1)
    return (lum > 55) & (a[..., 3] > 20)


def compose(*tiles: Image.Image) -> Image.Image:
    out = under()
    oa = np.array(out, copy=True)
    for t in tiles:
        a = np.array(t.convert("RGBA"))
        m = content_mask(a)
        oa[m] = a[m]
    return Image.fromarray(oa)


def make_stub(corner_im: Image.Image, corner: str) -> Image.Image:
    """Band×band square at play-facing join."""
    a = np.array(corner_im.convert("RGBA"))
    out = np.full_like(a, UNDER)
    m = content_mask(a)
    bm = np.zeros_like(m)
    if corner == "nw":
        bm[SIDE - BAND : SIDE, SIDE - BAND : SIDE] = True
    elif corner == "ne":
        bm[SIDE - BAND : SIDE, 0:BAND] = True
    elif corner == "sw":
        bm[0:BAND, SIDE - BAND : SIDE] = True
    else:
        bm[0:BAND, 0:BAND] = True
    keep = m & bm
    out[keep] = a[keep]
    return Image.fromarray(out)


def save(name: str, im: Image.Image) -> None:
    path = FRAMES / name
    im.save(path)
    print("wrote", path.relative_to(ROOT), path.stat().st_size)


def edge_gap_report(im: Image.Image, edge: str) -> str:
    a = np.array(im)
    m = content_mask(a)
    if edge in ("n", "s"):
        left = int(m[:, 0].sum())
        right = int(m[:, -1].sum())
        return f"{edge}: L={left} R={right}"
    top = int(m[0].sum())
    bot = int(m[-1].sum())
    return f"{edge}: T={top} B={bot}"


def main() -> None:
    wall_src = ART_IN / "ai-wall-n-flush.png"
    win_src = ART_IN / "ai-window-n-flush.png"
    if not wall_src.exists() or not win_src.exists():
        raise SystemExit(f"missing masters: {wall_src} / {win_src}")

    n = make_n_band(Image.open(wall_src))
    win_n = make_n_band(Image.open(win_src))

    walls = {e: orient(n, e) for e in ("n", "s", "e", "w")}
    wins = {e: orient(win_n, e) for e in ("n", "s", "e", "w")}

    for e, im in walls.items():
        save(f"tile_wall_{e}.png", im)
        print(" ", edge_gap_report(im, e))
    save("tile_wall.png", walls["n"])

    for e, im in wins.items():
        save(f"tile_window_{e}.png", im)
        print(" ", edge_gap_report(im, e))
    save("tile_window.png", wins["n"])

    pairs = {
        "nw": (walls["n"], walls["w"]),
        "ne": (walls["n"], walls["e"]),
        "sw": (walls["s"], walls["w"]),
        "se": (walls["s"], walls["e"]),
    }
    corners = {}
    for k, parts in pairs.items():
        corners[k] = compose(*parts)
        save(f"tile_wall_{k}.png", corners[k])
        save(f"tile_window_{k}.png", corners[k])  # no glass mash on corners

    for k, base in corners.items():
        st = make_stub(base, k)
        save(f"tile_wall_stub_{k}.png", st)
        save(f"tile_window_stub_{k}.png", st)

    triples = {
        "nwe": (walls["n"], walls["w"], walls["e"]),
        "nsw": (walls["n"], walls["s"], walls["w"]),
        "nse": (walls["n"], walls["s"], walls["e"]),
        "swe": (walls["s"], walls["w"], walls["e"]),
    }
    for k, parts in triples.items():
        im = compose(*parts)
        save(f"tile_wall_{k}.png", im)
        save(f"tile_window_{k}.png", im)

    # catalog preview
    names = [
        "tile_wall_n", "tile_window_n", "tile_wall_nw", "tile_wall_stub_nw",
        "tile_wall_e", "tile_window_e", "tile_wall_nwe", "tile_wall_swe",
    ]
    prev = Image.new("RGBA", (SIDE * 4 + 24, SIDE * 2 + 24), (24, 26, 32, 255))
    for i, nm in enumerate(names):
        prev.paste(Image.open(FRAMES / f"{nm}.png"), (12 + (i % 4) * SIDE, 12 + (i // 4) * SIDE))
    preview = ART_OUT / "wall-ai-flush-preview.png"
    prev.save(preview)
    # also copy into sprites root for catalog
    sheet = FRAMES.parent / "wall_ai_flush_preview.png"
    prev.save(sheet)
    print("preview", preview, sheet)
    print("DONE")


if __name__ == "__main__":
    main()

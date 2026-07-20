#!/usr/bin/env python3
"""Build Option A wall tiles (APPROVED) → frames/.

SoT look: refs/art/wall-option-a-cream-wood.png + wall-option-a-window.png
SoT geom: wallGeomOf bands (~42% toward play), underfill #000/#020308.

Straights: rotate N master.
L / U / stub: solid face fill + wood/cream edge rims only (no panel-cross).
"""
from __future__ import annotations

from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
FRAMES = ROOT / "games" / "deadline-escape" / "refs" / "sprites" / "frames"
ART = ROOT / "games" / "deadline-escape" / "refs" / "art"
SPRITES = FRAMES.parent
ARTIF = Path("/opt/cursor/artifacts/assets")

SIDE = 256
BAND = 108
UNDER = (0, 0, 0, 255)
WOOD = (120, 64, 24, 255)
WOOD_HI = (162, 100, 46, 255)
CREAM = (244, 230, 204, 255)
CREAM_DK = (214, 194, 160, 255)
FACE = (210, 178, 130, 255)
FACE2 = (198, 166, 118, 255)
WOOD_W = 18
CREAM_W = 12


def under() -> Image.Image:
    return Image.new("RGBA", (SIDE, SIDE), UNDER)


def find_master(names: list[str]) -> Path | None:
    for name in names:
        for base in (ART, ARTIF, SPRITES / "chroma"):
            p = base / name
            if p.exists():
                return p
    return None


def black_key(im: Image.Image, thr: float = 16.0) -> Image.Image:
    a = np.asarray(im.convert("RGBA")).astype(np.float32)
    lum = a[..., :3].mean(-1)
    alpha = np.where(lum < thr, 0, np.clip((lum - thr) / 10 * 255, 0, 255))
    out = a.copy()
    out[..., 3] = np.minimum(a[..., 3], alpha)
    return Image.fromarray(out.astype(np.uint8), "RGBA")


def extract_band(src: Image.Image) -> Image.Image:
    cut = black_key(src)
    a = np.asarray(cut)
    ys, xs = np.where(a[..., 3] > 40)
    if len(ys) < 50:
        raise RuntimeError("no wall content in master")
    y0, y1 = int(ys.min()), int(ys.max()) + 1
    x0, x1 = int(xs.min()), int(xs.max()) + 1
    if x1 - x0 < src.width * 0.65:
        x0, x1 = 0, src.width
    return cut.crop((x0, y0, x1, y1)).resize((SIDE, BAND), Image.Resampling.LANCZOS).convert("RGBA")


def place_bottom(band: Image.Image) -> Image.Image:
    im = under()
    im.alpha_composite(band, (0, SIDE - BAND))
    a = np.array(im, copy=True)
    a[: SIDE - BAND] = UNDER
    a[:, SIDE - 1] = a[:, 0]
    return Image.fromarray(a)


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


def edges_from_mask(mask, play_dirs, outer_dirs):
    void = ~mask
    up = np.zeros_like(mask)
    up[1:] = void[:-1]
    up[0] = True
    dn = np.zeros_like(mask)
    dn[:-1] = void[1:]
    dn[-1] = True
    lf = np.zeros_like(mask)
    lf[:, 1:] = void[:, :-1]
    lf[:, 0] = True
    rt = np.zeros_like(mask)
    rt[:, :-1] = void[:, 1:]
    rt[:, -1] = True
    play = np.zeros_like(mask)
    outer = np.zeros_like(mask)
    for d in play_dirs:
        if d == "n":
            play |= mask & up
        if d == "s":
            play |= mask & dn
        if d == "w":
            play |= mask & lf
        if d == "e":
            play |= mask & rt
    for d in outer_dirs:
        if d == "n":
            outer |= mask & up
        if d == "s":
            outer |= mask & dn
        if d == "w":
            outer |= mask & lf
        if d == "e":
            outer |= mask & rt
    return play, outer


def paint_solid_with_rims(mask, play_edge, outer_edge) -> Image.Image:
    a = np.array(under(), copy=True)
    ys, xs = np.where(mask)
    dist = np.full(mask.shape, -1, np.int32)
    frontier = play_edge & mask
    dist[frontier] = 0
    cur = frontier.copy()
    d = 0
    while cur.any() and d < BAND:
        d += 1
        grow = np.zeros_like(mask)
        grow[:-1] |= cur[1:]
        grow[1:] |= cur[:-1]
        grow[:, :-1] |= cur[:, 1:]
        grow[:, 1:] |= cur[:, :-1]
        grow &= mask & (dist < 0)
        dist[grow] = d
        cur = grow
    dist = np.where(mask & (dist < 0), BAND - 1, dist)

    outer_dist = np.full(mask.shape, -1, np.int32)
    frontier = outer_edge & mask
    outer_dist[frontier] = 0
    cur = frontier.copy()
    d = 0
    while cur.any() and d < BAND:
        d += 1
        grow = np.zeros_like(mask)
        grow[:-1] |= cur[1:]
        grow[1:] |= cur[:-1]
        grow[:, :-1] |= cur[:, 1:]
        grow[:, 1:] |= cur[:, :-1]
        grow &= mask & (outer_dist < 0)
        outer_dist[grow] = d
        cur = grow
    outer_dist = np.where(mask & (outer_dist < 0), BAND - 1, outer_dist)

    for y, x in zip(ys, xs):
        dp = int(dist[y, x])
        do = int(outer_dist[y, x])
        if dp < WOOD_W:
            u = dp / max(1, WOOD_W - 1)
            c = (np.array(WOOD_HI[:3]) * (1 - u) + np.array(WOOD[:3]) * u).astype(np.uint8)
        elif do < CREAM_W:
            u = do / max(1, CREAM_W - 1)
            c = (np.array(CREAM[:3]) * (1 - u) + np.array(CREAM_DK[:3]) * u).astype(np.uint8)
        else:
            u = (dp - WOOD_W) / max(1, BAND - WOOD_W - CREAM_W)
            u = float(np.clip(u, 0, 1))
            c = (np.array(FACE[:3]) * (1 - u) + np.array(FACE2[:3]) * u).astype(np.uint8)
        a[y, x, :3] = c
        a[y, x, 3] = 255
    return Image.fromarray(a)


def make_L(corner: str) -> Image.Image:
    yy, xx = np.indices((SIDE, SIDE))
    if corner == "nw":
        mask = (yy < BAND) | (xx < BAND)
        play, outer = edges_from_mask(mask, ("s", "e"), ("n", "w"))
    elif corner == "ne":
        mask = (yy < BAND) | (xx >= SIDE - BAND)
        play, outer = edges_from_mask(mask, ("s", "w"), ("n", "e"))
    elif corner == "sw":
        mask = (yy >= SIDE - BAND) | (xx < BAND)
        play, outer = edges_from_mask(mask, ("n", "e"), ("s", "w"))
    else:
        mask = (yy >= SIDE - BAND) | (xx >= SIDE - BAND)
        play, outer = edges_from_mask(mask, ("n", "w"), ("s", "e"))
    return paint_solid_with_rims(mask, play, outer)


def make_stub(corner: str) -> Image.Image:
    yy, xx = np.indices((SIDE, SIDE))
    if corner == "nw":
        mask = (yy >= SIDE - BAND) & (xx >= SIDE - BAND)
        play, outer = edges_from_mask(mask, ("s", "e"), ("n", "w"))
    elif corner == "ne":
        mask = (yy >= SIDE - BAND) & (xx < BAND)
        play, outer = edges_from_mask(mask, ("s", "w"), ("n", "e"))
    elif corner == "sw":
        mask = (yy < BAND) & (xx >= SIDE - BAND)
        play, outer = edges_from_mask(mask, ("n", "e"), ("s", "w"))
    else:
        mask = (yy < BAND) & (xx < BAND)
        play, outer = edges_from_mask(mask, ("n", "w"), ("s", "e"))
    return paint_solid_with_rims(mask, play, outer)


def make_U(key: str) -> Image.Image:
    yy, xx = np.indices((SIDE, SIDE))
    mask = np.zeros((SIDE, SIDE), bool)
    if "n" in key:
        mask |= yy < BAND
    if "s" in key:
        mask |= yy >= SIDE - BAND
    if "e" in key:
        mask |= xx >= SIDE - BAND
    if "w" in key:
        mask |= xx < BAND
    play_dirs, outer_dirs = [], []
    if "n" in key:
        play_dirs.append("s")
        outer_dirs.append("n")
    if "s" in key:
        play_dirs.append("n")
        outer_dirs.append("s")
    if "e" in key:
        play_dirs.append("w")
        outer_dirs.append("e")
    if "w" in key:
        play_dirs.append("e")
        outer_dirs.append("w")
    play, outer = edges_from_mask(mask, tuple(play_dirs), tuple(outer_dirs))
    return paint_solid_with_rims(mask, play, outer)


def save(name: str, im: Image.Image) -> None:
    path = FRAMES / name
    im.save(path)
    print("wrote", path.name)


def main() -> None:
    FRAMES.mkdir(parents=True, exist_ok=True)
    ART.mkdir(parents=True, exist_ok=True)

    wall_src = find_master([
        "wall-option-a-cream-wood.png",
        "wall_n_black.png",
    ])
    win_src = find_master([
        "wall-option-a-window.png",
        "window_n_black.png",
    ])
    if not wall_src or not win_src:
        raise SystemExit("missing Option A masters in refs/art/")

    print("master wall:", wall_src)
    print("master window:", win_src)
    wband = extract_band(Image.open(wall_src).convert("RGBA"))
    vband = extract_band(Image.open(win_src).convert("RGBA"))
    wall_n = place_bottom(wband)
    win_n = place_bottom(vband)
    walls = {e: orient(wall_n, e) for e in "nsew"}
    wins = {e: orient(win_n, e) for e in "nsew"}

    for e, im in walls.items():
        save(f"tile_wall_{e}.png", im)
    save("tile_wall.png", walls["n"])
    for e, im in wins.items():
        save(f"tile_window_{e}.png", im)
    save("tile_window.png", wins["n"])

    for c in ("nw", "ne", "sw", "se"):
        corner = make_L(c)
        stub = make_stub(c)
        save(f"tile_wall_{c}.png", corner)
        save(f"tile_window_{c}.png", corner)
        save(f"tile_wall_stub_{c}.png", stub)
        save(f"tile_window_stub_{c}.png", stub)

    for key in ("nwe", "nsw", "nse", "swe"):
        u = make_U(key)
        save(f"tile_wall_{key}.png", u)
        save(f"tile_window_{key}.png", u)

    # art copies
    Image.open(FRAMES / "tile_wall_n.png").save(ART / "ai-set-wall-n.png")
    Image.open(FRAMES / "tile_window_n.png").save(ART / "ai-set-window-n.png")
    Image.open(FRAMES / "tile_wall_nwe.png").save(ART / "ai-set-u-nwe.png")
    for e in "nsew":
        Image.open(FRAMES / f"tile_wall_{e}.png").save(ART / f"tile_wall_{e}.png")
    Image.open(FRAMES / "tile_wall_nw.png").save(ART / "tile_wall_nw.png")
    for c in ("nw", "ne", "sw", "se"):
        Image.open(FRAMES / f"tile_wall_stub_{c}.png").save(ART / f"tile_wall_stub_{c}.png")

    prev = Image.new("RGBA", (SIDE * 4 + 24, SIDE * 2 + 24), (22, 20, 28, 255))
    names = [
        "tile_wall_n", "tile_window_n", "tile_wall_e", "tile_window_e",
        "tile_wall_sw", "tile_wall_se", "tile_wall_nwe", "tile_wall_stub_nw",
    ]
    for i, nm in enumerate(names):
        prev.paste(Image.open(FRAMES / f"{nm}.png"), (12 + (i % 4) * SIDE, 12 + (i // 4) * SIDE))
    prev.save(SPRITES / "wall_layoutfeel_preview.png")
    prev.save(SPRITES / "wall_seamless_preview.png")
    if ARTIF.parent.exists():
        ARTIF.mkdir(parents=True, exist_ok=True)
        prev.save(ARTIF / "wall-set-a-overview.png")
    print("DONE Option A walls")


if __name__ == "__main__":
    main()

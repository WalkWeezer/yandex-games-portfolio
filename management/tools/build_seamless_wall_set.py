#!/usr/bin/env python3
"""Build a coherent seamless wall/window/corner/stub tile set.

Problems with prior approach:
  - wall vs window were different AI gens → mismatched trim/colors
  - corners were compose(n,w) → visible glued elbow

This builder paints ONE geometry language:
  - full-bleed ends (left==right wrap) for straights
  - window = same wall + glass inset
  - L corner = continuous painted elbow (not two strips)
  - stub = continuous square post
Optional: sample face texture from AI master for warmth.
"""
from __future__ import annotations

from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[2]
FRAMES = ROOT / "games" / "deadline-escape" / "refs" / "sprites" / "frames"
ART = Path("/opt/cursor/artifacts/assets")
ART_REF = ROOT / "games" / "deadline-escape" / "refs" / "art"
SIDE = 256
BAND = 112
UNDER = (2, 3, 8, 255)

# palette — warm office, close to desk + AI wall
CAP = (232, 214, 186, 255)
CAP_HI = (246, 236, 218, 255)
FACE = (214, 188, 152, 255)
FACE_DK = (186, 158, 122, 255)
WOOD = (140, 92, 52, 255)
WOOD_DK = (92, 58, 36, 255)
WOOD_HI = (176, 124, 74, 255)
OUT = (48, 34, 24, 255)
GLASS = (120, 190, 220, 255)
GLASS_HI = (200, 235, 250, 255)
FRAME = (62, 70, 80, 255)


def under() -> Image.Image:
    return Image.new("RGBA", (SIDE, SIDE), UNDER)


def sample_face_from_ai() -> Image.Image | None:
    for p in (ART / "ai-set-wall-n.png", ART_REF / "ai-set-wall-n.png", ART / "ai-wall-n-flush.png"):
        if not p.exists():
            continue
        im = Image.open(p).convert("RGBA")
        a = np.asarray(im)
        lum = a[..., :3].astype(np.int16).sum(-1)
        m = lum > 90
        ys, xs = np.where(m)
        if len(xs) < 100:
            continue
        # mid face strip
        y0 = int(ys.min() + (ys.max() - ys.min()) * 0.35)
        y1 = int(ys.min() + (ys.max() - ys.min()) * 0.72)
        x0, x1 = int(xs.min()), int(xs.max())
        crop = im.crop((x0, y0, x1, y1)).resize((SIDE, 48), Image.Resampling.LANCZOS)
        return crop
    return None


FACE_TEX = None  # flat face = truly seamless when tiled; AI refs kept for catalog only
# sample_face_from_ai()  # optional texture (breaks seamless look if it has posts)


def fill_face(d: ImageDraw.ImageDraw, box: tuple[int, int, int, int], im: Image.Image) -> None:
    x0, y0, x1, y1 = box
    d.rectangle(box, fill=FACE)
    if FACE_TEX is not None:
        tex = FACE_TEX.resize((max(1, x1 - x0 + 1), max(1, y1 - y0 + 1)), Image.Resampling.BILINEAR)
        # slight darken blend into face
        ta = np.asarray(tex).astype(np.float32)
        base = np.array(FACE[:3], dtype=np.float32)
        mix = (ta[..., :3] * 0.45 + base * 0.55).clip(0, 255).astype(np.uint8)
        alpha = np.full((mix.shape[0], mix.shape[1], 1), 255, np.uint8)
        patch = Image.fromarray(np.concatenate([mix, alpha], axis=-1))
        im.paste(patch, (x0, y0))


def paint_h_band(im: Image.Image, y0: int, y1: int, with_window: bool = False) -> None:
    """Horizontal partition — soft office look (3 layers, not striped tablecloth)."""
    d = ImageDraw.Draw(im)
    h = y1 - y0
    cap_h = max(14, int(h * 0.28))
    base_h = max(16, int(h * 0.22))
    body_y0 = y0 + cap_h
    body_y1 = y1 - base_h

    sh = Image.new("RGBA", (SIDE, SIDE), (0, 0, 0, 0))
    sd = ImageDraw.Draw(sh)
    sd.rectangle((0, y0 - 12, SIDE - 1, y0 + 3), fill=(0, 0, 0, 55))
    sh = sh.filter(ImageFilter.GaussianBlur(5))
    im.alpha_composite(sh)
    d = ImageDraw.Draw(im)

    d.rectangle((0, y0, SIDE - 1, body_y0 - 1), fill=CAP)
    d.line((0, y0 + 2, SIDE - 1, y0 + 2), fill=CAP_HI, width=2)
    d.line((0, body_y0 - 2, SIDE - 1, body_y0 - 2), fill=FACE_DK, width=2)

    d.rectangle((0, body_y0, SIDE - 1, body_y1 - 1), fill=FACE)
    # soft vertical shade only (no row noise — that read as tablecloth stripes)
    a = np.array(im, copy=True)
    for i, y in enumerate(range(body_y0, body_y1)):
        tt = i / max(1, body_y1 - body_y0 - 1)
        a[y, :, :3] = np.clip(a[y, :, :3].astype(np.int16) - int(10 * tt), 0, 255).astype(np.uint8)
    im.paste(Image.fromarray(a))
    d = ImageDraw.Draw(im)

    d.rectangle((0, body_y1, SIDE - 1, y1 - 1), fill=WOOD_DK)
    d.line((0, body_y1 + 2, SIDE - 1, body_y1 + 2), fill=WOOD_HI, width=2)
    d.line((0, y1 - 2, SIDE - 1, y1 - 2), fill=OUT, width=2)

    if with_window:
        gx0, gx1 = int(SIDE * 0.20), int(SIDE * 0.80)
        gy0, gy1 = body_y0 + 6, body_y1 - 6
        d.rounded_rectangle((gx0, gy0, gx1, gy1), radius=4, fill=FRAME)
        d.rounded_rectangle((gx0 + 5, gy0 + 5, gx1 - 5, gy1 - 5), radius=3, fill=GLASS)
        cx = (gx0 + gx1) // 2
        cy = (gy0 + gy1) // 2
        d.line((cx, gy0 + 8, cx, gy1 - 8), fill=GLASS_HI, width=2)
        d.line((gx0 + 10, cy, gx1 - 10, cy), fill=GLASS_HI, width=2)
        d.rectangle((gx0 - 2, gy1 - 1, gx1 + 2, min(y1 - 2, gy1 + 6)), fill=WOOD)

    a = np.array(im, copy=True)
    a[:, SIDE - 1] = a[:, 0]
    im.paste(Image.fromarray(a))


def make_n(with_window: bool = False) -> Image.Image:
    im = under()
    paint_h_band(im, SIDE - BAND, SIDE, with_window=with_window)
    return im


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




def band_layer_color(t: float, band: int = BAND):
    """Match paint_h_band: cap → face → base (no mid rail)."""
    cap_h = max(14, int(band * 0.28))
    base_h = max(16, int(band * 0.22))
    if t < 2:
        return CAP_HI
    if t < cap_h:
        return CAP
    if t < band - base_h:
        return FACE
    return WOOD_DK


def depth_l(ys, xs, corner: str):
    """Depth from inner rim into wall body for L masks."""
    if corner == "nw":
        # inner rim at y=SIDE-BAND (bottom arm) and x=SIDE-BAND (right arm)
        d_h = ys - (SIDE - BAND)  # depth on bottom arm
        d_v = xs - (SIDE - BAND)  # depth on right arm
        on_h = ys >= SIDE - BAND
        on_v = xs >= SIDE - BAND
        depth = np.full(ys.shape, -1, dtype=np.int32)
        depth[on_h] = d_h[on_h]
        depth[on_v] = np.where(depth[on_v] < 0, d_v[on_v], np.minimum(depth[on_v], d_v[on_v]))
        mask = on_h | on_v
    elif corner == "ne":
        d_h = ys - (SIDE - BAND)
        d_v = (BAND - 1) - xs
        on_h = ys >= SIDE - BAND
        on_v = xs < BAND
        depth = np.full(ys.shape, -1, dtype=np.int32)
        depth[on_h] = d_h[on_h]
        depth[on_v] = np.where(depth[on_v] < 0, d_v[on_v], np.minimum(depth[on_v], d_v[on_v]))
        mask = on_h | on_v
    elif corner == "sw":
        d_h = (BAND - 1) - ys
        d_v = xs - (SIDE - BAND)
        on_h = ys < BAND
        on_v = xs >= SIDE - BAND
        depth = np.full(ys.shape, -1, dtype=np.int32)
        depth[on_h] = d_h[on_h]
        depth[on_v] = np.where(depth[on_v] < 0, d_v[on_v], np.minimum(depth[on_v], d_v[on_v]))
        mask = on_h | on_v
    else:
        d_h = (BAND - 1) - ys
        d_v = (BAND - 1) - xs
        on_h = ys < BAND
        on_v = xs < BAND
        depth = np.full(ys.shape, -1, dtype=np.int32)
        depth[on_h] = d_h[on_h]
        depth[on_v] = np.where(depth[on_v] < 0, d_v[on_v], np.minimum(depth[on_v], d_v[on_v]))
        mask = on_h | on_v
    return mask, depth


def paint_by_depth(im: Image.Image, mask: np.ndarray, depth: np.ndarray) -> None:
    a = np.array(under(), copy=True)
    ys, xs = np.where(mask & (depth >= 0))
    for y, x in zip(ys, xs):
        t = int(depth[y, x])
        if t < 0 or t >= BAND:
            continue
        col = band_layer_color(t)
        a[y, x] = col
    im.paste(Image.fromarray(a))
    # soft highlight on innermost pixels
    d = ImageDraw.Draw(im)
    inner = mask & (depth >= 0) & (depth <= 2)
    aa = np.array(im, copy=True)
    aa[inner] = (*CAP_HI[:3], 255)
    im.paste(Image.fromarray(aa))


def paint_l_corner(im: Image.Image, corner: str) -> None:
    ys, xs = np.indices((SIDE, SIDE))
    mask, depth = depth_l(ys, xs, corner)
    paint_by_depth(im, mask, depth)


def make_corner(corner: str) -> Image.Image:
    im = under()
    paint_l_corner(im, corner)
    return im


def make_stub(corner: str) -> Image.Image:
    """Square post: depth from inner corner (toward void) outward."""
    im = under()
    ys, xs = np.indices((SIDE, SIDE))
    if corner == "nw":
        mask = (ys >= SIDE - BAND) & (xs >= SIDE - BAND)
        depth = np.minimum(ys - (SIDE - BAND), xs - (SIDE - BAND))
    elif corner == "ne":
        mask = (ys >= SIDE - BAND) & (xs < BAND)
        depth = np.minimum(ys - (SIDE - BAND), (BAND - 1) - xs)
    elif corner == "sw":
        mask = (ys < BAND) & (xs >= SIDE - BAND)
        depth = np.minimum((BAND - 1) - ys, xs - (SIDE - BAND))
    else:
        mask = (ys < BAND) & (xs < BAND)
        depth = np.minimum((BAND - 1) - ys, (BAND - 1) - xs)
    depth = np.where(mask, depth, -1)
    paint_by_depth(im, mask, depth)
    return im


def make_u(key: str) -> Image.Image:
    """U as depth-from-inner-channel (same layers as straight walls, no plaid)."""
    ys, xs = np.indices((SIDE, SIDE))
    # present edges → bands; depth = min depth into any present band from its inner rim
    depth = np.full((SIDE, SIDE), 10**9, dtype=np.int32)
    mask = np.zeros((SIDE, SIDE), dtype=bool)
    if "n" in key:
        m = ys >= SIDE - BAND
        mask |= m
        depth = np.where(m, np.minimum(depth, ys - (SIDE - BAND)), depth)
    if "s" in key:
        m = ys < BAND
        mask |= m
        depth = np.where(m, np.minimum(depth, (BAND - 1) - ys), depth)
    if "e" in key:
        m = xs < BAND
        mask |= m
        depth = np.where(m, np.minimum(depth, (BAND - 1) - xs), depth)
    if "w" in key:
        m = xs >= SIDE - BAND
        mask |= m
        depth = np.where(m, np.minimum(depth, xs - (SIDE - BAND)), depth)
    depth = np.where(mask, depth, -1)
    im = under()
    paint_by_depth(im, mask, depth)
    return im


def save(name: str, im: Image.Image) -> None:
    path = FRAMES / name
    im.save(path)
    print("wrote", path.name, path.stat().st_size)


def main() -> None:
    n = make_n(False)
    win_n = make_n(True)
    walls = {e: orient(n, e) for e in "nsew"}
    wins = {e: orient(win_n, e) for e in "nsew"}

    for e, im in walls.items():
        save(f"tile_wall_{e}.png", im)
    save("tile_wall.png", walls["n"])
    for e, im in wins.items():
        save(f"tile_window_{e}.png", im)
    save("tile_window.png", wins["n"])

    for c in ("nw", "ne", "sw", "se"):
        corner = make_corner(c)
        save(f"tile_wall_{c}.png", corner)
        save(f"tile_window_{c}.png", corner)  # corners never show glass
        stub = make_stub(c)
        save(f"tile_wall_stub_{c}.png", stub)
        save(f"tile_window_stub_{c}.png", stub)

    for key in ("nwe", "nsw", "nse", "swe"):
        u = make_u(key)
        save(f"tile_wall_{key}.png", u)
        save(f"tile_window_{key}.png", u)

    # copy AI refs used for texture into refs/art
    ART_REF.mkdir(parents=True, exist_ok=True)
    for src_name, dst_name in [
        ("ai-set-wall-n.png", "ai-set-wall-n.png"),
        ("ai-set-window-n.png", "ai-set-window-n.png"),
        ("ai-set-corner-nw-v2.png", "ai-set-corner-nw.png"),
        ("ai-set-stub-nw.png", "ai-set-stub-nw.png"),
    ]:
        src = ART / src_name
        if src.exists():
            Image.open(src).save(ART_REF / dst_name)
            print("ref", dst_name)

    # preview: wall|window|corner|stub row + seam check
    names = [
        "tile_wall_n", "tile_window_n", "tile_wall_nw", "tile_wall_stub_nw",
        "tile_wall_e", "tile_window_e", "tile_wall_nwe", "tile_wall_swe",
    ]
    prev = Image.new("RGBA", (SIDE * 4 + 24, SIDE * 2 + 24), (24, 26, 32, 255))
    for i, nm in enumerate(names):
        prev.paste(Image.open(FRAMES / f"{nm}.png"), (12 + (i % 4) * SIDE, 12 + (i // 4) * SIDE))
    prev.save(Path("/opt/cursor/artifacts/wall-seamless-preview.png"))
    prev.save(FRAMES.parent / "wall_seamless_preview.png")

    # seam strip: wall+wall+window
    seam = Image.new("RGBA", (SIDE * 3, SIDE), UNDER)
    seam.paste(walls["n"], (0, 0))
    seam.paste(walls["n"], (SIDE, 0))
    seam.paste(wins["n"], (SIDE * 2, 0))
    seam.save(Path("/opt/cursor/artifacts/wall-window-seam.png"))
    print("DONE")


if __name__ == "__main__":
    main()

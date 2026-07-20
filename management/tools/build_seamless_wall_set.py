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
    """Horizontal partition from y0..y1-1, FULL width 0..SIDE (seamless)."""
    d = ImageDraw.Draw(im)
    h = y1 - y0
    # proportions matching thick top-down partition
    cap_h = max(10, int(h * 0.22))
    rail_h = max(8, int(h * 0.14))
    base_h = max(12, int(h * 0.20))
    face_y0 = y0 + cap_h
    face_y1 = y1 - base_h
    rail_y0 = face_y0
    rail_y1 = face_y0 + rail_h
    body_y0 = rail_y1
    body_y1 = face_y1

    # soft contact shadow above cap (toward void)
    sh = Image.new("RGBA", (SIDE, SIDE), (0, 0, 0, 0))
    sd = ImageDraw.Draw(sh)
    sd.rectangle((0, y0 - 10, SIDE - 1, y0 + 2), fill=(0, 0, 0, 70))
    sh = sh.filter(ImageFilter.GaussianBlur(4))
    im.alpha_composite(sh)
    d = ImageDraw.Draw(im)

    # top cap (thickness toward play / void depending on edge)
    d.rectangle((0, y0, SIDE - 1, y0 + cap_h - 1), fill=CAP)
    d.line((0, y0 + 2, SIDE - 1, y0 + 2), fill=CAP_HI, width=2)
    d.line((0, y0 + cap_h - 2, SIDE - 1, y0 + cap_h - 2), fill=FACE_DK, width=2)

    # wood rail
    d.rectangle((0, rail_y0, SIDE - 1, rail_y1 - 1), fill=WOOD)
    d.line((0, rail_y0 + 2, SIDE - 1, rail_y0 + 2), fill=WOOD_HI, width=2)
    d.line((0, rail_y1 - 3, SIDE - 1, rail_y1 - 3), fill=WOOD_DK, width=2)

    # face body — continuous, NO panel posts (posts create seams when tiled)
    fill_face(d, (0, body_y0, SIDE - 1, body_y1 - 1), im)
    d = ImageDraw.Draw(im)

    # baseboard
    d.rectangle((0, y1 - base_h, SIDE - 1, y1 - 1), fill=WOOD_DK)
    d.line((0, y1 - base_h + 3, SIDE - 1, y1 - base_h + 3), fill=WOOD_HI, width=2)
    d.line((0, y1 - 2, SIDE - 1, y1 - 2), fill=OUT, width=2)

    if with_window:
        gx0, gx1 = int(SIDE * 0.18), int(SIDE * 0.82)
        gy0, gy1 = body_y0 + 4, body_y1 - 4
        d.rounded_rectangle((gx0, gy0, gx1, gy1), radius=3, fill=FRAME)
        d.rounded_rectangle((gx0 + 4, gy0 + 4, gx1 - 4, gy1 - 4), radius=2, fill=GLASS)
        cx = (gx0 + gx1) // 2
        cy = (gy0 + gy1) // 2
        d.line((cx, gy0 + 6, cx, gy1 - 6), fill=GLASS_HI, width=2)
        d.line((gx0 + 8, cy, gx1 - 8, cy), fill=GLASS_HI, width=2)
        # sill
        d.rectangle((gx0 - 2, gy1 - 2, gx1 + 2, gy1 + 5), fill=WOOD)

    # force wrap-seamless: left edge == right edge
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


def paint_l_corner(im: Image.Image, corner: str) -> None:
    """Continuous L as one top-down partition (cap wraps elbow; no dual-strip glue)."""
    a = np.array(under(), copy=True)
    ys, xs = np.indices((SIDE, SIDE))
    cap_t, rail_t, base_t = 18, 16, 16

    if corner == "nw":
        mask = (ys >= SIDE - BAND) | (xs >= SIDE - BAND)
        base = mask & ((ys >= SIDE - base_t) | (xs >= SIDE - base_t))
        cap = mask & (
            ((ys >= SIDE - BAND) & (ys < SIDE - BAND + cap_t) & (xs < SIDE - base_t))
            | ((xs >= SIDE - BAND) & (xs < SIDE - BAND + cap_t) & (ys < SIDE - base_t))
        )
        rail = mask & (
            ((ys >= SIDE - BAND + cap_t) & (ys < SIDE - BAND + cap_t + rail_t) & (xs < SIDE - base_t))
            | ((xs >= SIDE - BAND + cap_t) & (xs < SIDE - BAND + cap_t + rail_t) & (ys < SIDE - base_t))
        )
        void = (slice(0, SIDE - BAND), slice(0, SIDE - BAND))
        arc_box = (SIDE - BAND - 2, SIDE - BAND - 2, SIDE - BAND + cap_t + 6, SIDE - BAND + cap_t + 6)
        arc_angles = (180, 270)
        rim = [
            (0, SIDE - BAND + 3, SIDE - BAND + 6, SIDE - BAND + 3),
            (SIDE - BAND + 3, SIDE - BAND + 6, SIDE - BAND + 3, SIDE - 1),
        ]
    elif corner == "ne":
        mask = (ys >= SIDE - BAND) | (xs < BAND)
        base = mask & ((ys >= SIDE - base_t) | (xs < base_t))
        cap = mask & (
            ((ys >= SIDE - BAND) & (ys < SIDE - BAND + cap_t) & (xs >= base_t))
            | ((xs < BAND) & (xs >= BAND - cap_t) & (ys < SIDE - base_t))
        )
        rail = mask & (
            ((ys >= SIDE - BAND + cap_t) & (ys < SIDE - BAND + cap_t + rail_t) & (xs >= base_t))
            | ((xs < BAND - cap_t) & (xs >= BAND - cap_t - rail_t) & (ys < SIDE - base_t))
        )
        void = (slice(0, SIDE - BAND), slice(BAND, SIDE))
        arc_box = (BAND - cap_t - 6, SIDE - BAND - 2, BAND + 2, SIDE - BAND + cap_t + 6)
        arc_angles = (270, 360)
        rim = [
            (BAND - 6, SIDE - BAND + 3, SIDE - 1, SIDE - BAND + 3),
            (BAND - 3, SIDE - BAND + 6, BAND - 3, SIDE - 1),
        ]
    elif corner == "sw":
        mask = (ys < BAND) | (xs >= SIDE - BAND)
        base = mask & ((ys < base_t) | (xs >= SIDE - base_t))
        cap = mask & (
            ((ys < BAND) & (ys >= BAND - cap_t) & (xs < SIDE - base_t))
            | ((xs >= SIDE - BAND) & (xs < SIDE - BAND + cap_t) & (ys >= base_t))
        )
        rail = mask & (
            ((ys < BAND - cap_t) & (ys >= BAND - cap_t - rail_t) & (xs < SIDE - base_t))
            | ((xs >= SIDE - BAND + cap_t) & (xs < SIDE - BAND + cap_t + rail_t) & (ys >= base_t))
        )
        void = (slice(BAND, SIDE), slice(0, SIDE - BAND))
        arc_box = (SIDE - BAND - 2, BAND - cap_t - 6, SIDE - BAND + cap_t + 6, BAND + 2)
        arc_angles = (90, 180)
        rim = [
            (0, BAND - 3, SIDE - BAND + 6, BAND - 3),
            (SIDE - BAND + 3, 0, SIDE - BAND + 3, BAND - 6),
        ]
    else:
        mask = (ys < BAND) | (xs < BAND)
        base = mask & ((ys < base_t) | (xs < base_t))
        cap = mask & (
            ((ys < BAND) & (ys >= BAND - cap_t) & (xs >= base_t))
            | ((xs < BAND) & (xs >= BAND - cap_t) & (ys >= base_t))
        )
        rail = mask & (
            ((ys < BAND - cap_t) & (ys >= BAND - cap_t - rail_t) & (xs >= base_t))
            | ((xs < BAND - cap_t) & (xs >= BAND - cap_t - rail_t) & (ys >= base_t))
        )
        void = (slice(BAND, SIDE), slice(BAND, SIDE))
        arc_box = (BAND - cap_t - 6, BAND - cap_t - 6, BAND + 2, BAND + 2)
        arc_angles = (0, 90)
        rim = [
            (BAND - 6, BAND - 3, SIDE - 1, BAND - 3),
            (BAND - 3, 0, BAND - 3, BAND - 6),
        ]

    face = mask & ~base & ~cap & ~rail
    a[mask] = (*FACE[:3], 255)
    if FACE_TEX is not None:
        tex = np.asarray(FACE_TEX.resize((SIDE, SIDE), Image.Resampling.BILINEAR)).astype(np.float32)
        base_c = np.array(FACE[:3], dtype=np.float32)
        mix = (tex[..., :3] * 0.35 + base_c * 0.65).clip(0, 255).astype(np.uint8)
        a[face, :3] = mix[face]
        a[face, 3] = 255
    a[rail] = (*WOOD[:3], 255)
    a[cap] = (*CAP[:3], 255)
    a[base] = (*WOOD_DK[:3], 255)
    a[void] = UNDER

    # soft elbow: fill inner corner square with CAP so arms share one top plate
    if corner == "nw":
        a[SIDE - BAND : SIDE - BAND + cap_t, SIDE - BAND : SIDE - BAND + cap_t] = (*CAP[:3], 255)
    elif corner == "ne":
        a[SIDE - BAND : SIDE - BAND + cap_t, BAND - cap_t : BAND] = (*CAP[:3], 255)
    elif corner == "sw":
        a[BAND - cap_t : BAND, SIDE - BAND : SIDE - BAND + cap_t] = (*CAP[:3], 255)
    else:
        a[BAND - cap_t : BAND, BAND - cap_t : BAND] = (*CAP[:3], 255)

    im.paste(Image.fromarray(a))
    d = ImageDraw.Draw(im)
    d.pieslice(arc_box, arc_angles[0], arc_angles[1], fill=CAP)
    d.arc(arc_box, arc_angles[0], arc_angles[1], fill=CAP_HI, width=2)
    for x0, y0, x1, y1 in rim:
        d.line((x0, y0, x1, y1), fill=CAP_HI, width=2)


def make_corner(corner: str) -> Image.Image:
    im = under()
    paint_l_corner(im, corner)
    return im


def make_stub(corner: str) -> Image.Image:
    """Small continuous square post at play-facing corner."""
    im = under()
    d = ImageDraw.Draw(im)
    if corner == "nw":
        x0, y0 = SIDE - BAND, SIDE - BAND
    elif corner == "ne":
        x0, y0 = 0, SIDE - BAND
    elif corner == "sw":
        x0, y0 = SIDE - BAND, 0
    else:
        x0, y0 = 0, 0
    x1, y1 = x0 + BAND, y0 + BAND

    # soft shadow toward void (opposite of play flush edges)
    sh = Image.new("RGBA", (SIDE, SIDE), (0, 0, 0, 0))
    sd = ImageDraw.Draw(sh)
    sd.rectangle((x0 - 6, y0 - 6, x1 + 2, y1 + 2), fill=(0, 0, 0, 50))
    sh = sh.filter(ImageFilter.GaussianBlur(3))
    im.alpha_composite(sh)
    d = ImageDraw.Draw(im)

    # body square — continuous top
    d.rectangle((x0, y0, x1 - 1, y1 - 1), fill=CAP)
    d.rectangle((x0 + 6, y0 + 6, x1 - 7, y1 - 7), fill=FACE)
    if FACE_TEX is not None:
        tex = FACE_TEX.resize((BAND - 14, BAND - 14), Image.Resampling.BILINEAR)
        im.paste(tex, (x0 + 7, y0 + 7), tex if tex.mode == "RGBA" else None)
    d = ImageDraw.Draw(im)
    # wood rim on outer edges (toward void for nw: top+left of square = toward void)
    # play-facing edges for nw stub are bottom+right of cell (= bottom+right of square)
    d.rectangle((x0, y1 - 14, x1 - 1, y1 - 1), fill=WOOD_DK)  # outer base toward S
    d.rectangle((x1 - 14, y0, x1 - 1, y1 - 1), fill=WOOD_DK)  # outer base toward E
    d.line((x0 + 2, y0 + 3, x1 - 15, y0 + 3), fill=CAP_HI, width=2)
    d.line((x0 + 3, y0 + 2, x0 + 3, y1 - 15), fill=CAP_HI, width=2)
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

    # U shapes: continuous triple — paint face + two endcaps via oriented bands, blend overlaps
    for key, edges in {
        "nwe": ("n", "w", "e"),
        "nsw": ("n", "s", "w"),
        "nse": ("n", "s", "e"),
        "swe": ("s", "w", "e"),
    }.items():
        out = np.array(under(), copy=True)
        acc = []
        for e in edges:
            acc.append(np.asarray(walls[e]))
        for a in acc:
            m = a[..., :3].astype(np.int16).sum(-1) > 60
            out[m] = a[m]
        # blend multi-overlaps
        for i in range(len(acc)):
            for j in range(i + 1, len(acc)):
                mi = acc[i][..., :3].astype(np.int16).sum(-1) > 60
                mj = acc[j][..., :3].astype(np.int16).sum(-1) > 60
                both = mi & mj
                if both.any():
                    blend = ((acc[i].astype(np.float32) + acc[j].astype(np.float32)) / 2).astype(np.uint8)
                    out[both] = blend[both]
        im = Image.fromarray(out)
        save(f"tile_wall_{key}.png", im)
        save(f"tile_window_{key}.png", im)

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

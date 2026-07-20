#!/usr/bin/env python3
"""Paint thick top-down office partition walls matching desk/prop art style.

Style cues from tile_desk: warm wood, soft shading, dark outlines, rounded feel.
Walls sit on the INNER edge of fog cells (toward play):
  N=bottom, S=top, E=left, W=right
"""
from __future__ import annotations

from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[2]
FRAMES = ROOT / "games" / "deadline-escape" / "refs" / "sprites" / "frames"
SIDE = 256
# ~45% of cell — reads as architecture, not a hairline
BAND = 112
STUB_ARM = 118
UNDER = (2, 3, 8, 255)

# palette — close to desk wood / office props
WOOD_DK = (92, 58, 36, 255)
WOOD_MD = (140, 92, 52, 255)
WOOD_HI = (186, 132, 78, 255)
PANEL = (214, 196, 168, 255)
PANEL_DK = (186, 166, 136, 255)
PANEL_HI = (236, 224, 204, 255)
OUTLINE = (48, 34, 24, 255)
GLASS = (120, 190, 220, 230)
GLASS_HI = (200, 235, 250, 200)
FRAME = (70, 78, 88, 255)


def under() -> Image.Image:
    return Image.new("RGBA", (SIDE, SIDE), UNDER)


def draw_h_wall(im: Image.Image, at_bottom: bool, with_window: bool = False) -> None:
    """Horizontal partition: visible top rail + face toward play."""
    d = ImageDraw.Draw(im)
    if at_bottom:
        y0, y1 = SIDE - BAND, SIDE
        # outer (bottom) = wood base toward fog/outside
        # inner (top of band) = face toward play
        face_y0, face_y1 = y0, y0 + 34
        rail_y0, rail_y1 = y0 + 34, y0 + 52
        body_y0, body_y1 = y0 + 52, y1 - 18
        base_y0, base_y1 = y1 - 18, y1
    else:
        y0, y1 = 0, BAND
        face_y0, face_y1 = y1 - 34, y1
        rail_y0, rail_y1 = y1 - 52, y1 - 34
        body_y0, body_y1 = y0 + 18, y1 - 52
        base_y0, base_y1 = y0, y0 + 18

    # soft contact shadow toward play
    sh = Image.new("RGBA", (SIDE, SIDE), (0, 0, 0, 0))
    sd = ImageDraw.Draw(sh)
    if at_bottom:
        sd.rectangle((4, y0 - 14, SIDE - 5, y0 + 2), fill=(0, 0, 0, 70))
    else:
        sd.rectangle((4, y1 - 2, SIDE - 5, y1 + 14), fill=(0, 0, 0, 70))
    sh = sh.filter(ImageFilter.GaussianBlur(5))
    im.alpha_composite(sh)
    d = ImageDraw.Draw(im)

    # outline
    d.rounded_rectangle((1, y0, SIDE - 2, y1 - 1), radius=6, outline=OUTLINE, width=3)
    # body panel
    d.rectangle((4, body_y0, SIDE - 5, body_y1), fill=PANEL)
    # subtle vertical panel seams
    for x in (64, 128, 192):
        d.line((x, body_y0 + 4, x, body_y1 - 4), fill=PANEL_DK, width=2)
    # wood rail (top of partition — top-down)
    d.rectangle((4, rail_y0, SIDE - 5, rail_y1), fill=WOOD_MD)
    d.line((6, rail_y0 + 3, SIDE - 7, rail_y0 + 3), fill=WOOD_HI, width=2)
    d.line((6, rail_y1 - 3, SIDE - 7, rail_y1 - 3), fill=WOOD_DK, width=2)
    # face strip toward play (lighter)
    d.rectangle((4, face_y0, SIDE - 5, face_y1), fill=PANEL_HI)
    d.rectangle((6, face_y0 + 3, SIDE - 7, face_y1 - 2), fill=PANEL)
    # baseboard outer
    d.rectangle((3, base_y0, SIDE - 4, base_y1), fill=WOOD_DK)
    d.line((5, base_y0 + 3, SIDE - 6, base_y0 + 3), fill=WOOD_HI, width=2)

    if with_window:
        # glass inset in body
        gx0, gx1 = 28, SIDE - 29
        if at_bottom:
            gy0, gy1 = body_y0 + 6, body_y1 - 6
        else:
            gy0, gy1 = body_y0 + 6, body_y1 - 6
        d.rounded_rectangle((gx0, gy0, gx1, gy1), radius=4, fill=FRAME)
        d.rounded_rectangle((gx0 + 4, gy0 + 4, gx1 - 4, gy1 - 4), radius=3, fill=GLASS)
        cx = SIDE // 2
        cy = (gy0 + gy1) // 2
        d.line((cx, gy0 + 6, cx, gy1 - 6), fill=GLASS_HI, width=2)
        d.line((gx0 + 8, cy, gx1 - 8, cy), fill=GLASS_HI, width=2)


def draw_v_wall(im: Image.Image, at_right: bool, with_window: bool = False) -> None:
    d = ImageDraw.Draw(im)
    if at_right:
        x0, x1 = SIDE - BAND, SIDE
        face_x0, face_x1 = x0, x0 + 34
        rail_x0, rail_x1 = x0 + 34, x0 + 52
        body_x0, body_x1 = x0 + 52, x1 - 18
        base_x0, base_x1 = x1 - 18, x1
    else:
        x0, x1 = 0, BAND
        face_x0, face_x1 = x1 - 34, x1
        rail_x0, rail_x1 = x1 - 52, x1 - 34
        body_x0, body_x1 = x0 + 18, x1 - 52
        base_x0, base_x1 = x0, x0 + 18

    sh = Image.new("RGBA", (SIDE, SIDE), (0, 0, 0, 0))
    sd = ImageDraw.Draw(sh)
    if at_right:
        sd.rectangle((x0 - 14, 4, x0 + 2, SIDE - 5), fill=(0, 0, 0, 70))
    else:
        sd.rectangle((x1 - 2, 4, x1 + 14, SIDE - 5), fill=(0, 0, 0, 70))
    sh = sh.filter(ImageFilter.GaussianBlur(5))
    im.alpha_composite(sh)
    d = ImageDraw.Draw(im)

    d.rounded_rectangle((x0, 1, x1 - 1, SIDE - 2), radius=6, outline=OUTLINE, width=3)
    d.rectangle((body_x0, 4, body_x1, SIDE - 5), fill=PANEL)
    for y in (64, 128, 192):
        d.line((body_x0 + 4, y, body_x1 - 4, y), fill=PANEL_DK, width=2)
    d.rectangle((rail_x0, 4, rail_x1, SIDE - 5), fill=WOOD_MD)
    d.line((rail_x0 + 3, 6, rail_x0 + 3, SIDE - 7), fill=WOOD_HI, width=2)
    d.line((rail_x1 - 3, 6, rail_x1 - 3, SIDE - 7), fill=WOOD_DK, width=2)
    d.rectangle((face_x0, 4, face_x1, SIDE - 5), fill=PANEL_HI)
    d.rectangle((face_x0 + 2, 6, face_x1 - 3, SIDE - 7), fill=PANEL)
    d.rectangle((base_x0, 3, base_x1, SIDE - 4), fill=WOOD_DK)
    d.line((base_x0 + 3, 5, base_x0 + 3, SIDE - 6), fill=WOOD_HI, width=2)

    if with_window:
        if at_right:
            gx0, gx1 = body_x0 + 6, body_x1 - 6
        else:
            gx0, gx1 = body_x0 + 6, body_x1 - 6
        gy0, gy1 = 28, SIDE - 29
        d.rounded_rectangle((gx0, gy0, gx1, gy1), radius=4, fill=FRAME)
        d.rounded_rectangle((gx0 + 4, gy0 + 4, gx1 - 4, gy1 - 4), radius=3, fill=GLASS)
        cx = (gx0 + gx1) // 2
        cy = SIDE // 2
        d.line((cx, gy0 + 6, cx, gy1 - 6), fill=GLASS_HI, width=2)
        d.line((gx0 + 6, cy, gx1 - 6, cy), fill=GLASS_HI, width=2)


def content(a: np.ndarray) -> np.ndarray:
    lum = a[..., :3].astype(np.int16).sum(-1)
    return (lum > 60) & (a[..., 3] > 20)


def compose(*tiles: Image.Image) -> Image.Image:
    out = under()
    oa = np.array(out, copy=True)
    for t in tiles:
        a = np.array(t, copy=True)
        m = content(a)
        oa[m] = a[m]
    return Image.fromarray(oa)


def make_stub(base: Image.Image, corner: str) -> Image.Image:
    a = np.asarray(base)
    out = np.zeros_like(a)
    out[:] = (*UNDER[:3], 255)
    m = content(a)
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
    out[keep] = a[keep]
    return Image.fromarray(out)


def save(name: str, im: Image.Image) -> None:
    a = np.array(im.convert("RGBA"), copy=True)
    lum = a[..., :3].astype(np.int16).sum(-1)
    empty = (lum < 40) | (a[..., 3] < 10)
    a[empty] = (*UNDER[:3], 255)
    Image.fromarray(a).save(FRAMES / name)
    print("wrote", name)


def main() -> None:
    # straights
    n = under(); draw_h_wall(n, at_bottom=True, with_window=False)
    s = under(); draw_h_wall(s, at_bottom=False, with_window=False)
    e = under(); draw_v_wall(e, at_right=False, with_window=False)
    w = under(); draw_v_wall(w, at_right=True, with_window=False)
    nw = under(); draw_h_wall(nw, True); draw_v_wall(nw, True)
    # rebuild L cleanly by compose after individual
    n = under(); draw_h_wall(n, True)
    s = under(); draw_h_wall(s, False)
    e = under(); draw_v_wall(e, False)
    w = under(); draw_v_wall(w, True)

    win_n = under(); draw_h_wall(win_n, True, with_window=True)
    win_s = under(); draw_h_wall(win_s, False, with_window=True)
    win_e = under(); draw_v_wall(win_e, False, with_window=True)
    win_w = under(); draw_v_wall(win_w, True, with_window=True)

    for name, im in [
        ("tile_wall_n", n), ("tile_wall_s", s), ("tile_wall_e", e), ("tile_wall_w", w),
        ("tile_wall", n),
        ("tile_window_n", win_n), ("tile_window_s", win_s),
        ("tile_window_e", win_e), ("tile_window_w", win_w), ("tile_window", win_n),
    ]:
        save(f"{name}.png", im)

    pairs = {"nw": (n, w), "ne": (n, e), "sw": (s, w), "se": (s, e)}
    corners = {}
    for k, (a, b) in pairs.items():
        corners[k] = compose(a, b)
        save(f"tile_wall_{k}.png", corners[k])
        # window corners = wall corners (no glass mash)
        save(f"tile_window_{k}.png", corners[k])

    for k, base in corners.items():
        st = make_stub(base, k)
        save(f"tile_wall_stub_{k}.png", st)
        save(f"tile_window_stub_{k}.png", st)

    triples = {
        "nwe": (n, w, e), "nsw": (n, s, w), "nse": (n, s, e), "swe": (s, w, e),
    }
    for k, parts in triples.items():
        im = compose(*parts)
        save(f"tile_wall_{k}.png", im)
        save(f"tile_window_{k}.png", im)

    # preview
    names = [
        "tile_wall_n", "tile_wall_e", "tile_wall_w", "tile_wall_s",
        "tile_wall_nw", "tile_wall_ne", "tile_wall_stub_nw", "tile_window_n",
    ]
    prev = Image.new("RGBA", (SIDE * 4 + 16, SIDE * 2 + 16), (16, 16, 20, 255))
    for i, nm in enumerate(names):
        prev.paste(Image.open(FRAMES / f"{nm}.png"), (8 + (i % 4) * SIDE, 8 + (i // 4) * SIDE))
    out = Path("/opt/cursor/artifacts/wall-style-preview.png")
    prev.save(out)
    print("preview", out)
    print("DONE")


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""Build fog-frame wall tiles from layout-feel AI masters + geometry canon.

SoT look: refs/levels/layout-feel.png + generated ai-*-layoutfeel.png
SoT geom: wallGeomOf bands (~42% toward play), black under #020308.

Outputs frames/tile_wall_{n,s,e,w,nw,...}, stubs, U, windows + art masters.
"""
from __future__ import annotations

from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[2]
FRAMES = ROOT / "games" / "deadline-escape" / "refs" / "sprites" / "frames"
ART = ROOT / "games" / "deadline-escape" / "refs" / "art"
ARTIF = Path("/opt/cursor/artifacts/assets")
SIDE = 256
BAND = 108  # ~42% — matches feel demo band
UNDER = (2, 3, 8, 255)

# layout-feel / sampled AI cool office greys
CAP = (58, 60, 66, 255)
CAP_HI = (92, 96, 104, 255)
FACE = (168, 172, 178, 255)
FACE_DK = (132, 136, 144, 255)
FACE_LO = (148, 152, 158, 255)
BASE = (48, 50, 54, 255)
BASE_HI = (78, 82, 88, 255)
OUT = (28, 30, 34, 255)
SEAM = (72, 76, 84, 255)
GLASS = (140, 196, 220, 255)
GLASS_HI = (210, 236, 248, 255)
FRAME = (210, 214, 220, 255)
FRAME_DK = (90, 96, 104, 255)


def under() -> Image.Image:
    return Image.new("RGBA", (SIDE, SIDE), UNDER)


def find_master(names: list[str]) -> Path | None:
    for name in names:
        for base in (ARTIF, ART):
            p = base / name
            if p.exists():
                return p
    return None


def extract_n_band(src: Image.Image) -> Image.Image:
    """Crop wall content → SIDE×BAND strip (play at bottom)."""
    a = np.asarray(src.convert("RGBA"))
    lum = a[..., :3].astype(np.int16).sum(-1)
    m = lum > 50
    ys, xs = np.where(m)
    if len(ys) < 50:
        raise RuntimeError("no wall content in master")
    y0, y1 = int(ys.min()), int(ys.max()) + 1
    # prefer full width; trim tiny side noise
    x0, x1 = 0, a.shape[1]
    crop = src.crop((x0, y0, x1, y1)).resize((SIDE, BAND), Image.Resampling.LANCZOS)
    return crop.convert("RGBA")


def place_band_bottom(band: Image.Image) -> Image.Image:
    im = under()
    im.paste(band, (0, SIDE - BAND), band)
    # force left/right seam wrap
    a = np.array(im, copy=True)
    a[:, SIDE - 1] = a[:, 0]
    return Image.fromarray(a)


def paint_procedural_n(with_window: bool = False) -> Image.Image:
    """Fallback / window: layout-feel layers with panel seams."""
    im = under()
    y0 = SIDE - BAND
    y1 = SIDE
    d = ImageDraw.Draw(im)

    # soft shadow above band (toward outer void)
    sh = Image.new("RGBA", (SIDE, SIDE), (0, 0, 0, 0))
    sd = ImageDraw.Draw(sh)
    sd.rectangle((0, y0 - 10, SIDE - 1, y0 + 2), fill=(0, 0, 0, 70))
    sh = sh.filter(ImageFilter.GaussianBlur(4))
    im.alpha_composite(sh)
    d = ImageDraw.Draw(im)

    cap_h = max(12, int(BAND * 0.16))
    base_h = max(14, int(BAND * 0.18))
    body_y0 = y0 + cap_h
    body_y1 = y1 - base_h

    # dark cap (layout-feel top)
    d.rectangle((0, y0, SIDE - 1, body_y0 - 1), fill=CAP)
    d.line((0, y0 + 1, SIDE - 1, y0 + 1), fill=CAP_HI, width=2)
    d.line((0, body_y0 - 1, SIDE - 1, body_y0 - 1), fill=OUT, width=1)

    # light face
    d.rectangle((0, body_y0, SIDE - 1, body_y1 - 1), fill=FACE)
    a = np.array(im, copy=True)
    for i, y in enumerate(range(body_y0, body_y1)):
        tt = i / max(1, body_y1 - body_y0 - 1)
        a[y, :, :3] = np.clip(
            a[y, :, :3].astype(np.int16) - int(14 * tt), 0, 255
        ).astype(np.uint8)
    im.paste(Image.fromarray(a))
    d = ImageDraw.Draw(im)

    # vertical panel seams (layout-feel)
    panel_w = SIDE // 4
    for px in range(panel_w, SIDE, panel_w):
        d.line((px, body_y0 + 2, px, body_y1 - 3), fill=SEAM, width=2)
        d.line((px + 1, body_y0 + 2, px + 1, body_y1 - 3), fill=FACE_LO, width=1)

    # baseboard toward play
    d.rectangle((0, body_y1, SIDE - 1, y1 - 1), fill=BASE)
    d.line((0, body_y1 + 1, SIDE - 1, body_y1 + 1), fill=BASE_HI, width=2)
    d.line((0, y1 - 2, SIDE - 1, y1 - 2), fill=OUT, width=2)

    if with_window:
        gx0, gx1 = int(SIDE * 0.18), int(SIDE * 0.82)
        gy0, gy1 = body_y0 + 8, body_y1 - 6
        d.rounded_rectangle((gx0, gy0, gx1, gy1), radius=5, fill=FRAME_DK)
        d.rounded_rectangle((gx0 + 4, gy0 + 4, gx1 - 4, gy1 - 4), radius=3, fill=FRAME)
        d.rounded_rectangle((gx0 + 8, gy0 + 8, gx1 - 8, gy1 - 8), radius=2, fill=GLASS)
        cx = (gx0 + gx1) // 2
        cy = (gy0 + gy1) // 2
        d.line((cx, gy0 + 10, cx, gy1 - 10), fill=GLASS_HI, width=2)
        d.line((gx0 + 12, cy, gx1 - 12, cy), fill=GLASS_HI, width=2)
        d.rectangle((gx0 - 2, gy1 - 2, gx1 + 2, min(y1 - 3, gy1 + 5)), fill=BASE_HI)

    a = np.array(im, copy=True)
    a[:, SIDE - 1] = a[:, 0]
    return Image.fromarray(a)


def blend_ai_n(ai_band: Image.Image) -> Image.Image:
    """Seat AI strip into layout-feel geometry; keep AI face, enforce layers."""
    proc = paint_procedural_n(False)
    im = under()
    # paste AI band
    im.paste(ai_band, (0, SIDE - BAND), ai_band)
    # darken extreme top pixels toward CAP if AI is too light on cap
    a = np.array(im, copy=True)
    y0 = SIDE - BAND
    cap_h = max(10, int(BAND * 0.14))
    for y in range(y0, y0 + cap_h):
        t = (y - y0) / max(1, cap_h - 1)
        target = np.array(CAP[:3], dtype=np.float32) * (1 - t) + np.array(CAP_HI[:3], dtype=np.float32) * t
        row = a[y, :, :3].astype(np.float32)
        a[y, :, :3] = (row * 0.35 + target * 0.65).clip(0, 255).astype(np.uint8)
        a[y, :, 3] = 255
    # ensure baseboard dark
    base_h = max(12, int(BAND * 0.16))
    for y in range(SIDE - base_h, SIDE):
        t = (y - (SIDE - base_h)) / max(1, base_h - 1)
        target = np.array(BASE[:3], dtype=np.float32) * (1 - t * 0.3)
        row = a[y, :, :3].astype(np.float32)
        a[y, :, :3] = (row * 0.4 + target * 0.6).clip(0, 255).astype(np.uint8)
        a[y, :, 3] = 255
    a[:, SIDE - 1] = a[:, 0]
    im = Image.fromarray(a)
    # light procedural overlay for seams only
    overlay = paint_procedural_n(False)
    oa = np.asarray(overlay)
    ia = np.array(im, copy=True)
    # keep AI mostly; pull seam columns from procedural if darker
    return Image.fromarray(ia)


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
    cap_h = max(12, int(band * 0.16))
    base_h = max(14, int(band * 0.18))
    if t < 2:
        return CAP_HI
    if t < cap_h:
        return CAP
    if t < band - base_h:
        # soft face gradient
        ft = (t - cap_h) / max(1, band - base_h - cap_h)
        c0 = np.array(FACE[:3], dtype=np.float32)
        c1 = np.array(FACE_DK[:3], dtype=np.float32)
        rgb = (c0 * (1 - ft) + c1 * ft).astype(np.uint8)
        return (int(rgb[0]), int(rgb[1]), int(rgb[2]), 255)
    return BASE


def depth_l(ys, xs, corner: str):
    if corner == "nw":
        d_h = ys - (SIDE - BAND)
        d_v = xs - (SIDE - BAND)
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


def paint_by_depth(mask: np.ndarray, depth: np.ndarray, face_tex: Image.Image | None) -> Image.Image:
    a = np.array(under(), copy=True)
    ys, xs = np.where(mask & (depth >= 0))
    tex = None
    if face_tex is not None:
        tex = np.asarray(face_tex.convert("RGBA"))
    for y, x in zip(ys, xs):
        t = int(depth[y, x])
        if t < 0 or t >= BAND:
            continue
        col = band_layer_color(t)
        cap_h = max(12, int(BAND * 0.16))
        base_h = max(14, int(BAND * 0.18))
        if tex is not None and cap_h <= t < BAND - base_h:
            # sample AI face row
            ty = min(BAND - 1, t)
            tx = x % SIDE
            tr, tg, tb, ta = tex[ty, tx]
            if ta > 200:
                # mix AI face into cool grey target
                mix = np.array([tr, tg, tb], dtype=np.float32) * 0.55 + np.array(col[:3], dtype=np.float32) * 0.45
                col = (int(mix[0]), int(mix[1]), int(mix[2]), 255)
        a[y, x] = col
    # inner rim highlight
    inner = mask & (depth >= 0) & (depth <= 2)
    a[inner] = CAP_HI
    return Image.fromarray(a)


def make_corner(corner: str, face_tex: Image.Image | None) -> Image.Image:
    ys, xs = np.indices((SIDE, SIDE))
    mask, depth = depth_l(ys, xs, corner)
    return paint_by_depth(mask, depth, face_tex)


def make_stub(corner: str, face_tex: Image.Image | None) -> Image.Image:
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
    return paint_by_depth(mask, depth, face_tex)


def make_u(key: str, face_tex: Image.Image | None) -> Image.Image:
    ys, xs = np.indices((SIDE, SIDE))
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
    return paint_by_depth(mask, depth, face_tex)


def save(name: str, im: Image.Image) -> None:
    path = FRAMES / name
    im.save(path)
    print("wrote", path.name, path.stat().st_size)


def main() -> None:
    FRAMES.mkdir(parents=True, exist_ok=True)
    ART.mkdir(parents=True, exist_ok=True)

    wall_src = find_master([
        "ai-wall-n-layoutfeel.png",
        "ai-set-wall-n.png",
        "wall_master_n.png",
    ])
    win_src = find_master([
        "ai-window-n-layoutfeel.png",
        "ai-set-window-n.png",
        "window_master_n.png",
    ])

    if wall_src:
        print("master wall:", wall_src)
        raw = Image.open(wall_src).convert("RGBA")
        raw.save(ART / "ai-wall-n-layoutfeel.png")
        band = extract_n_band(raw)
        band.save(ART / "ai-set-wall-n.png")
        n = blend_ai_n(band)
        face_tex = band
    else:
        print("no AI wall master — procedural layout-feel")
        n = paint_procedural_n(False)
        face_tex = n.crop((0, SIDE - BAND, SIDE, SIDE))

    if win_src:
        print("master window:", win_src)
        wraw = Image.open(win_src).convert("RGBA")
        wraw.save(ART / "ai-window-n-layoutfeel.png")
        try:
            wband = extract_n_band(wraw)
            wband.save(ART / "ai-set-window-n.png")
            win_n = place_band_bottom(wband)
            # reinforce dark under
            wa = np.array(win_n, copy=True)
            lum = wa[..., :3].astype(np.int16).sum(-1)
            wa[lum < 40] = UNDER
            win_n = Image.fromarray(wa)
        except Exception as e:
            print("window extract failed, procedural:", e)
            win_n = paint_procedural_n(True)
    else:
        win_n = paint_procedural_n(True)

    walls = {e: orient(n, e) for e in "nsew"}
    wins = {e: orient(win_n, e) for e in "nsew"}

    for e, im in walls.items():
        save(f"tile_wall_{e}.png", im)
    save("tile_wall.png", walls["n"])
    for e, im in wins.items():
        save(f"tile_window_{e}.png", im)
    save("tile_window.png", wins["n"])

    for c in ("nw", "ne", "sw", "se"):
        corner = make_corner(c, face_tex)
        save(f"tile_wall_{c}.png", corner)
        save(f"tile_window_{c}.png", corner)
        stub = make_stub(c, face_tex)
        save(f"tile_wall_stub_{c}.png", stub)
        save(f"tile_window_stub_{c}.png", stub)

    for key in ("nwe", "nsw", "nse", "swe"):
        u = make_u(key, face_tex)
        save(f"tile_wall_{key}.png", u)
        save(f"tile_window_{key}.png", u)

    # catalog copies
    for src_name, dst_name in [
        ("ai-wall-corner-nw-layoutfeel.png", "ai-set-corner-nw.png"),
        ("ai-wall-stub-se-layoutfeel.png", "ai-set-stub-nw.png"),
        ("ai-wall-stub-se-layoutfeel.png", "stub_master_nw.png"),
    ]:
        src = find_master([src_name])
        if src:
            Image.open(src).convert("RGBA").save(ART / dst_name)
            print("ref", dst_name)

    # U master from nwe
    Image.open(FRAMES / "tile_wall_nwe.png").save(ART / "ai-set-u-nwe.png")
    Image.open(FRAMES / "tile_wall_nw.png").save(ART / "tile_wall_nw.png")
    for e in "nsew":
        Image.open(FRAMES / f"tile_wall_{e}.png").save(ART / f"tile_wall_{e}.png")
    for c in ("nw", "ne", "sw", "se"):
        Image.open(FRAMES / f"tile_wall_stub_{c}.png").save(ART / f"tile_wall_stub_{c}.png")

    names = [
        "tile_wall_n", "tile_window_n", "tile_wall_nw", "tile_wall_stub_nw",
        "tile_wall_e", "tile_window_e", "tile_wall_nwe", "tile_wall_swe",
    ]
    prev = Image.new("RGBA", (SIDE * 4 + 24, SIDE * 2 + 24), (24, 26, 32, 255))
    for i, nm in enumerate(names):
        prev.paste(Image.open(FRAMES / f"{nm}.png"), (12 + (i % 4) * SIDE, 12 + (i // 4) * SIDE))
    out_prev = Path("/opt/cursor/artifacts/wall-layoutfeel-preview.png")
    prev.save(out_prev)
    prev.save(FRAMES.parent / "wall_layoutfeel_preview.png")
    prev.save(FRAMES.parent / "wall_seamless_preview.png")

    # seam strip
    seam = Image.new("RGBA", (SIDE * 3, SIDE), UNDER)
    seam.paste(walls["n"], (0, 0))
    seam.paste(walls["n"], (SIDE, 0))
    seam.paste(wins["n"], (SIDE * 2, 0))
    seam.save(Path("/opt/cursor/artifacts/wall-layoutfeel-seam.png"))
    print("DONE", out_prev)


if __name__ == "__main__":
    main()

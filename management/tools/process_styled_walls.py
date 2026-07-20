#!/usr/bin/env python3
"""Process AI wall tiles (desk-matching style) → frames + oriented composites.

Sources: /opt/cursor/artifacts/assets/wall_*_black.png, window_*_black.png
- Black (#000) keyed to alpha
- Carpet/floor bleed stripped via color distance to floor refs
- N masters → S/W/E by rotate (wall only) or re-seat prop upright
"""
from __future__ import annotations

import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance

ROOT = Path(__file__).resolve().parents[2]
FRAMES = ROOT / "games" / "deadline-escape" / "refs" / "sprites" / "frames"
SPRITES = FRAMES.parent
ART = Path("/opt/cursor/artifacts/assets")
SIDE = 256
BAND = 118

PROPS = ("plant", "cooler")
EDGES = ("n", "s", "e", "w")

sys.path.insert(0, str(Path(__file__).resolve().parent))
from chroma_to_alpha import fit_square  # noqa: E402


def black_key(im: Image.Image, thr: float = 28.0, soft: float = 22.0) -> Image.Image:
    """Near-black → transparent."""
    rgba = im.convert("RGBA")
    arr = np.asarray(rgba).astype(np.float32)
    lum = arr[..., :3].mean(axis=-1)
    # also kill very dark cool pixels
    alpha = np.clip((lum - thr) / max(soft, 1e-6) * 255.0, 0, 255)
    alpha = np.where(lum < thr, 0, alpha)
    out = arr.copy()
    out[..., 3] = np.minimum(arr[..., 3], alpha)
    return Image.fromarray(out.astype(np.uint8), "RGBA")


def strip_carpet(im: Image.Image, floor_refs: list[Image.Image], max_dist: float = 48.0) -> Image.Image:
    """Kill pixels similar to floor carpet samples (desk-style walls stay)."""
    rgba = im.convert("RGBA")
    arr = np.asarray(rgba).astype(np.float32)
    if not floor_refs:
        return rgba
    samples = []
    for fr in floor_refs:
        f = np.asarray(fr.convert("RGB").resize((64, 64), Image.Resampling.BOX)).astype(np.float32)
        samples.append(f.reshape(-1, 3))
    pal = np.concatenate(samples, axis=0)
    # subsample palette
    rng = np.random.default_rng(0)
    if len(pal) > 400:
        pal = pal[rng.choice(len(pal), 400, replace=False)]
    rgb = arr[..., :3]
    h, w = rgb.shape[:2]
    flat = rgb.reshape(-1, 3)
    # chunked min distance
    mind = np.full(flat.shape[0], 1e9, dtype=np.float32)
    for i in range(0, len(pal), 50):
        chunk = pal[i : i + 50]
        # (N,1,3) - (1,M,3)
        d = np.linalg.norm(flat[:, None, :] - chunk[None, :, :], axis=-1).min(axis=1)
        mind = np.minimum(mind, d)
    mind = mind.reshape(h, w)
    # protect warm wall / wood / green plant / blue cooler glass / metal gray with edges
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    warm = (r > g + 8) & (r > b + 8) & (r > 90)  # wood/beige wall
    green = (g > r + 15) & (g > b + 10) & (g > 60)
    cyan = (b > r + 20) & (b > 100)  # cooler jug / glass
    bright = (r + g + b) > 520  # white plastics
    protect = warm | green | cyan | bright
    kill = (mind < max_dist) & (~protect) & (arr[..., 3] > 10)
    out = arr.copy()
    out[..., 3] = np.where(kill, 0, out[..., 3])
    return Image.fromarray(out.astype(np.uint8), "RGBA")


def normalize_n_wall(im: Image.Image, floor_refs: list[Image.Image]) -> Image.Image:
    cut = black_key(im)
    cut = strip_carpet(cut, floor_refs, max_dist=42)
    # trim and place: content should hug top
    bb = cut.getbbox()
    if not bb:
        return Image.new("RGBA", (SIDE, SIDE), (0, 0, 0, 0))
    cropped = cut.crop(bb)
    # scale to width SIDE, keep aspect, pin to top
    scale = SIDE / max(cropped.width, 1)
    # if almost full canvas already, just fit_square top-aligned
    nw = SIDE
    nh = max(1, int(round(cropped.height * scale)))
    if nh > SIDE:
        scale = SIDE / cropped.height
        nw = max(1, int(round(cropped.width * scale)))
        nh = SIDE
    scaled = cropped.resize((nw, nh), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", (SIDE, SIDE), (0, 0, 0, 0))
    x = (SIDE - nw) // 2
    # pin to top if looks like wall band (short), else center top-biased
    y = 0 if nh <= int(SIDE * 0.62) else 0
    canvas.alpha_composite(scaled, (x, y))
    return canvas


def orient_wall(n_tile: Image.Image, edge: str) -> Image.Image:
    """Rotate N wall band to other edges (prop-free walls)."""
    if edge == "n":
        return n_tile
    if edge == "s":
        return n_tile.transpose(Image.Transpose.ROTATE_180)
    if edge == "e":
        return n_tile.transpose(Image.Transpose.ROTATE_270)  # N→E
    if edge == "w":
        return n_tile.transpose(Image.Transpose.ROTATE_90)
    return n_tile


def wall_bottom_y(wall: Image.Image) -> int:
    """Y just below opaque wall content (for seating props)."""
    a = np.asarray(wall.convert("RGBA"))[..., 3]
    rows = np.where(a.max(axis=1) > 40)[0]
    if len(rows) == 0:
        return BAND
    return int(rows[-1]) + 1


def wall_right_x(wall: Image.Image) -> int:
    a = np.asarray(wall.convert("RGBA"))[..., 3]
    cols = np.where(a.max(axis=0) > 40)[0]
    if len(cols) == 0:
        return BAND
    return int(cols[-1]) + 1


def wall_left_x(wall: Image.Image) -> int:
    a = np.asarray(wall.convert("RGBA"))[..., 3]
    cols = np.where(a.max(axis=0) > 40)[0]
    if len(cols) == 0:
        return SIDE - BAND
    return int(cols[0])


def wall_top_y(wall: Image.Image) -> int:
    a = np.asarray(wall.convert("RGBA"))[..., 3]
    rows = np.where(a.max(axis=1) > 40)[0]
    if len(rows) == 0:
        return SIDE - BAND
    return int(rows[0])


def soft_shadow(w: int, h: int) -> Image.Image:
    sh = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(sh)
    d.ellipse((2, int(h * 0.7), w - 2, h - 2), fill=(20, 16, 12, 85))
    return sh.filter(ImageFilter.GaussianBlur(3))


def place_prop(wall: Image.Image, prop: Image.Image, edge: str) -> Image.Image:
    out = wall.copy()
    bb = prop.getbbox()
    src = prop.crop(bb) if bb else prop
    max_s = int(SIDE * 0.52)
    ratio = min(max_s / max(src.width, 1), max_s / max(src.height, 1))
    nw = max(1, int(src.width * ratio))
    nh = max(1, int(src.height * ratio))
    scaled = src.resize((nw, nh), Image.Resampling.LANCZOS)
    # seat flush against wall face using measured opaque edge
    if edge == "n":
        x = (SIDE - nw) // 2
        y = wall_bottom_y(wall) - 18  # slight overlap onto baseboard
        y = max(0, min(y, SIDE - nh))
    elif edge == "s":
        x = (SIDE - nw) // 2
        y = wall_top_y(wall) - nh + 18
        y = max(0, min(y, SIDE - nh))
    elif edge == "w":
        x = wall_right_x(wall) - 18
        y = (SIDE - nh) // 2
        x = max(0, min(x, SIDE - nw))
    else:
        x = wall_left_x(wall) - nw + 18
        y = (SIDE - nh) // 2
        x = max(0, min(x, SIDE - nw))
    out.alpha_composite(soft_shadow(nw + 12, nh + 10), (max(0, x - 6), max(0, y + nh - 20)))
    out.alpha_composite(scaled, (x, y))
    return out


def load_prop(name: str) -> Image.Image:
    p = FRAMES / f"tile_{name}.png"
    return fit_square(Image.open(p).convert("RGBA"), SIDE)


def try_load_ai_composite(prop: str) -> Image.Image | None:
    for stem in (
        f"wall_n_{prop}_black.png",
        f"wall_n_{prop}_style.png",
        f"comp_wall_n_{prop}.png",
    ):
        p = ART / stem
        if p.exists():
            return Image.open(p)
    return None


def process_ai_composite_n(im: Image.Image, floor_refs: list[Image.Image]) -> Image.Image:
    cut = black_key(im, thr=24, soft=20)
    cut = strip_carpet(cut, floor_refs, max_dist=38)
    # if still lots of mid-gray floor, rembg as assist then union with wall top band
    try:
        from rembg import remove
        rem = remove(im.convert("RGBA"))
        rem = black_key(rem, thr=18, soft=16)
        # keep rem opaque where it has content; also keep top wall from cut
        a = np.asarray(cut).astype(np.float32)
        b = np.asarray(rem.convert("RGBA").resize(cut.size, Image.Resampling.LANCZOS)).astype(np.float32)
        # wall preference on top 45%
        yy = np.linspace(0, 1, a.shape[0])[:, None]
        wall_zone = yy < 0.48
        out = a.copy()
        # in wall zone prefer cut; below prefer rem (prop) where rem alpha high
        use_rem = (b[..., 3] > 40) & (~wall_zone)
        for c in range(4):
            out[..., c] = np.where(use_rem, b[..., c], out[..., c])
        # below wall: kill residual carpet in cut that rem didn't keep
        kill = (a[..., 3] > 0) & (b[..., 3] < 20) & (~wall_zone)
        out[..., 3] = np.where(kill, 0, out[..., 3])
        cut = Image.fromarray(out.astype(np.uint8), "RGBA")
    except Exception:
        pass
    return normalize_n_wall(cut if cut.mode == "RGBA" else cut, floor_refs) if False else fit_top(cut)


def fit_top(im: Image.Image) -> Image.Image:
    bb = im.getbbox()
    if not bb:
        return Image.new("RGBA", (SIDE, SIDE), (0, 0, 0, 0))
    cropped = im.crop(bb)
    scale_w = SIDE / cropped.width
    nw = SIDE
    nh = max(1, int(round(cropped.height * scale_w)))
    if nh > SIDE:
        scale = SIDE / cropped.height
        nw = max(1, int(round(cropped.width * scale)))
        nh = SIDE
        scaled = cropped.resize((nw, nh), Image.Resampling.LANCZOS)
        canvas = Image.new("RGBA", (SIDE, SIDE), (0, 0, 0, 0))
        canvas.alpha_composite(scaled, ((SIDE - nw) // 2, 0))
        return canvas
    scaled = cropped.resize((nw, nh), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", (SIDE, SIDE), (0, 0, 0, 0))
    canvas.alpha_composite(scaled, (0, 0))
    return canvas


def fit_bottom(im: Image.Image) -> Image.Image:
    bb = im.getbbox()
    if not bb:
        return Image.new("RGBA", (SIDE, SIDE), (0, 0, 0, 0))
    cropped = im.crop(bb)
    scale_w = SIDE / cropped.width
    nw = SIDE
    nh = max(1, int(round(cropped.height * scale_w)))
    if nh > SIDE:
        nh = SIDE
        nw = max(1, int(round(cropped.width * (SIDE / cropped.height))))
    scaled = cropped.resize((nw, nh), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", (SIDE, SIDE), (0, 0, 0, 0))
    canvas.alpha_composite(scaled, ((SIDE - nw) // 2, SIDE - nh))
    return canvas


def fit_left(im: Image.Image) -> Image.Image:
    bb = im.getbbox()
    if not bb:
        return Image.new("RGBA", (SIDE, SIDE), (0, 0, 0, 0))
    cropped = im.crop(bb)
    scale_h = SIDE / cropped.height
    nh = SIDE
    nw = max(1, int(round(cropped.width * scale_h)))
    if nw > SIDE:
        nw = SIDE
        nh = max(1, int(round(cropped.height * (SIDE / cropped.width))))
    scaled = cropped.resize((nw, nh), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", (SIDE, SIDE), (0, 0, 0, 0))
    canvas.alpha_composite(scaled, (0, (SIDE - nh) // 2))
    return canvas


def main() -> int:
    floor_refs = []
    for n in ("tile_floor_a.png", "tile_floor_b.png"):
        p = FRAMES / n
        if p.exists():
            floor_refs.append(Image.open(p))

    # --- base walls / windows from clean black-bg gens ---
    wall_n_src = ART / "wall_n_black.png"
    win_n_src = ART / "window_n_black.png"
    if not wall_n_src.exists():
        wall_n_src = ART / "wall_n_style.png"
    if not win_n_src.exists():
        win_n_src = ART / "window_n_style.png"

    wall_n = fit_top(strip_carpet(black_key(Image.open(wall_n_src)), floor_refs, 40))
    win_n = fit_top(strip_carpet(black_key(Image.open(win_n_src)), floor_refs, 40))
    wall_n = ImageEnhance.Sharpness(wall_n).enhance(1.1)
    win_n = ImageEnhance.Sharpness(win_n).enhance(1.1)

    # Prefer authored S/W if present; else rotate from N
    walls = {"n": wall_n}
    wins = {"n": win_n}
    if (ART / "wall_s_black.png").exists():
        walls["s"] = fit_bottom(strip_carpet(black_key(Image.open(ART / "wall_s_black.png")), floor_refs, 40))
    else:
        walls["s"] = orient_wall(wall_n, "s")
    if (ART / "wall_w_black.png").exists():
        walls["w"] = fit_left(strip_carpet(black_key(Image.open(ART / "wall_w_black.png")), floor_refs, 40))
        walls["e"] = walls["w"].transpose(Image.Transpose.FLIP_LEFT_RIGHT)
    else:
        walls["w"] = orient_wall(wall_n, "w")
        walls["e"] = orient_wall(wall_n, "e")
    wins["s"] = orient_wall(win_n, "s")
    wins["w"] = orient_wall(win_n, "w")
    wins["e"] = orient_wall(win_n, "e")
    for e in EDGES:
        walls[e].save(FRAMES / f"tile_wall_{e}.png")
        wins[e].save(FRAMES / f"tile_window_{e}.png")
        print(f"  wall/window {e}")
    walls["n"].save(FRAMES / "tile_wall.png")
    wins["n"].save(FRAMES / "tile_window.png")

    props = {n: load_prop(n) for n in PROPS}

    # Always seat authored props against desk-style wall (AI full comps leave gaps/carpet)
    for name in PROPS:
        oriented = {e: place_prop(walls[e], props[name], e) for e in EDGES}
        win_or = {e: place_prop(wins[e], props[name], e) for e in EDGES}
        for e in EDGES:
            oriented[e].save(FRAMES / f"tile_wall_{e}_{name}.png")
            win_or[e].save(FRAMES / f"tile_window_{e}_{name}.png")
        print(f"  compose all edges + {name}")

    # preview
    prev = Image.new("RGBA", (SIDE * 5 + 32, SIDE * 4 + 24), (36, 38, 46, 255))
    for ri, e in enumerate(EDGES):
        for ci, name in enumerate(PROPS):
            base = Image.new("RGBA", (SIDE, SIDE), (200, 205, 212, 255))
            tile = Image.open(FRAMES / f"tile_wall_{e}_{name}.png").convert("RGBA")
            prev.paste(Image.alpha_composite(base, tile), (ci * (SIDE + 8), ri * (SIDE + 8)))
    prev.save(SPRITES / "border_wall_props_preview.png")
    print("DONE desk-style walls + composites")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

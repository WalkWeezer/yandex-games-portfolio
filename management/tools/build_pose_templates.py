#!/usr/bin/env python3
"""Pose templates — Slynyrd Pixelblog 55/50 top-down 6-frame run canon."""
from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[2]
RIG = ROOT / "games" / "deadline-escape" / "refs" / "sprites" / "rig"
MAGENTA = (255, 0, 255, 255)
INK = (20, 20, 28, 255)
ACCENT = (255, 255, 255, 255)
CELL = 256

# Slynyrd 6-frame: contact → down → pass → contact → down → pass
# contact = lowest + limbs extreme; down = weight plant; pass = tallest + legs under body
WALK_PHASES = [
    ("contactL", 6),   # lowest
    ("downL", 10),     # lower / plant
    ("passL", -6),     # tallest (negative bob = head up in our y+)
    ("contactR", 6),
    ("downR", 10),
    ("passR", -6),
]


def font(size: int = 18):
    try:
        return ImageFont.truetype("arial.ttf", size)
    except OSError:
        return ImageFont.load_default()


def line(draw: ImageDraw.ImageDraw, a, b, w=6):
    draw.line([a, b], fill=INK, width=w)
    r = max(3, w // 2)
    draw.ellipse((a[0] - r, a[1] - r, a[0] + r, a[1] + r), fill=INK)
    draw.ellipse((b[0] - r, b[1] - r, b[0] + r, b[1] + r), fill=INK)


def head(draw, cx, cy, r=22):
    draw.ellipse((cx - r, cy - r, cx + r, cy + r), outline=INK, width=5)
    draw.ellipse((cx - 4, cy - 2, cx + 4, cy + 6), fill=INK)


def foot(draw, x, y, big=False):
    r = 9 if big else 6
    draw.ellipse((x - r, y - r // 2, x + r, y + r), fill=INK)


def stick_south(draw, cx, cy, phase: str, bob=0):
    hy = cy - 70 + bob
    hip = (cx, cy + 10 + bob)
    head(draw, cx, hy)
    line(draw, (cx, hy + 22), hip, 7)
    # char-left = +x (viewer right)
    if phase.startswith("contactL"):
        knee = (cx + 22, cy + 44)
        line(draw, hip, knee, 6)
        line(draw, knee, (cx + 36, cy + 62), 6)
        foot(draw, cx + 36, cy + 62, True)
        line(draw, hip, (cx - 28, cy + 76), 6)
        foot(draw, cx - 28, cy + 76)
        line(draw, (cx, hy + 36), (cx - 40, cy + 16), 5)
        line(draw, (cx, hy + 36), (cx + 44, cy - 12), 5)
    elif phase.startswith("downL"):
        # front foot flat, back lifting
        line(draw, hip, (cx + 24, cy + 72), 6)
        foot(draw, cx + 24, cy + 72, True)
        knee = (cx - 18, cy + 48)
        line(draw, hip, knee, 6)
        line(draw, knee, (cx - 22, cy + 58), 6)
        foot(draw, cx - 22, cy + 58)
        line(draw, (cx, hy + 36), (cx - 28, cy + 10), 5)
        line(draw, (cx, hy + 36), (cx + 32, cy - 2), 5)
    elif phase.startswith("passL"):
        # tallest; slight lead: viewer-right foot / opposite arm
        line(draw, hip, (cx + 10, cy + 68), 6)
        line(draw, hip, (cx - 8, cy + 62), 6)
        foot(draw, cx + 10, cy + 68)
        foot(draw, cx - 8, cy + 62)
        line(draw, (cx, hy + 36), (cx - 22, cy + 2), 5)
        line(draw, (cx, hy + 36), (cx + 20, cy + 8), 5)
    elif phase.startswith("passR"):
        # opposite of passL
        line(draw, hip, (cx - 10, cy + 68), 6)
        line(draw, hip, (cx + 8, cy + 62), 6)
        foot(draw, cx - 10, cy + 68)
        foot(draw, cx + 8, cy + 62)
        line(draw, (cx, hy + 36), (cx + 22, cy + 2), 5)
        line(draw, (cx, hy + 36), (cx - 20, cy + 8), 5)
    elif phase.startswith("contactR"):
        knee = (cx - 22, cy + 44)
        line(draw, hip, knee, 6)
        line(draw, knee, (cx - 36, cy + 62), 6)
        foot(draw, cx - 36, cy + 62, True)
        line(draw, hip, (cx + 28, cy + 76), 6)
        foot(draw, cx + 28, cy + 76)
        line(draw, (cx, hy + 36), (cx + 40, cy + 16), 5)
        line(draw, (cx, hy + 36), (cx - 44, cy - 12), 5)
    elif phase.startswith("downR"):
        line(draw, hip, (cx - 24, cy + 72), 6)
        foot(draw, cx - 24, cy + 72, True)
        knee = (cx + 18, cy + 48)
        line(draw, hip, knee, 6)
        line(draw, knee, (cx + 22, cy + 58), 6)
        foot(draw, cx + 22, cy + 58)
        line(draw, (cx, hy + 36), (cx + 28, cy + 10), 5)
        line(draw, (cx, hy + 36), (cx - 32, cy - 2), 5)
    else:  # idle
        line(draw, hip, (cx - 12, cy + 74), 6)
        line(draw, hip, (cx + 12, cy + 74), 6)
        foot(draw, cx - 12, cy + 74)
        foot(draw, cx + 12, cy + 74)
        line(draw, (cx, hy + 36), (cx - 26, cy + 20), 5)
        line(draw, (cx, hy + 36), (cx + 26, cy + 20), 5)


def stick_north(draw, cx, cy, phase: str, bob=0):
    hy = cy - 70 + bob
    hip = (cx, cy + 10 + bob)
    head(draw, cx, hy)
    draw.arc((cx - 18, hy - 20, cx + 18, hy + 4), 200, 340, fill=INK, width=4)
    line(draw, (cx, hy + 22), hip, 7)
    # from back: char-left = -x
    if phase.startswith("contactL"):
        knee = (cx - 22, cy + 44)
        line(draw, hip, knee, 6)
        line(draw, knee, (cx - 36, cy + 62), 6)
        foot(draw, cx - 36, cy + 62, True)
        line(draw, hip, (cx + 28, cy + 76), 6)
        foot(draw, cx + 28, cy + 76)
        line(draw, (cx, hy + 36), (cx + 40, cy + 16), 5)
        line(draw, (cx, hy + 36), (cx - 44, cy - 12), 5)
    elif phase.startswith("downL"):
        line(draw, hip, (cx - 24, cy + 72), 6)
        foot(draw, cx - 24, cy + 72, True)
        knee = (cx + 18, cy + 48)
        line(draw, hip, knee, 6)
        line(draw, knee, (cx + 22, cy + 58), 6)
        foot(draw, cx + 22, cy + 58)
        line(draw, (cx, hy + 36), (cx + 28, cy + 10), 5)
        line(draw, (cx, hy + 36), (cx - 32, cy - 2), 5)
    elif phase.startswith("passL"):
        line(draw, hip, (cx - 10, cy + 68), 6)
        line(draw, hip, (cx + 8, cy + 62), 6)
        foot(draw, cx - 10, cy + 68)
        foot(draw, cx + 8, cy + 62)
        line(draw, (cx, hy + 36), (cx + 22, cy + 2), 5)
        line(draw, (cx, hy + 36), (cx - 20, cy + 8), 5)
    elif phase.startswith("passR"):
        line(draw, hip, (cx + 10, cy + 68), 6)
        line(draw, hip, (cx - 8, cy + 62), 6)
        foot(draw, cx + 10, cy + 68)
        foot(draw, cx - 8, cy + 62)
        line(draw, (cx, hy + 36), (cx - 22, cy + 2), 5)
        line(draw, (cx, hy + 36), (cx + 20, cy + 8), 5)
    elif phase.startswith("contactR"):
        knee = (cx + 22, cy + 44)
        line(draw, hip, knee, 6)
        line(draw, knee, (cx + 36, cy + 62), 6)
        foot(draw, cx + 36, cy + 62, True)
        line(draw, hip, (cx - 28, cy + 76), 6)
        foot(draw, cx - 28, cy + 76)
        line(draw, (cx, hy + 36), (cx - 40, cy + 16), 5)
        line(draw, (cx, hy + 36), (cx + 44, cy - 12), 5)
    elif phase.startswith("downR"):
        line(draw, hip, (cx + 24, cy + 72), 6)
        foot(draw, cx + 24, cy + 72, True)
        knee = (cx - 18, cy + 48)
        line(draw, hip, knee, 6)
        line(draw, knee, (cx - 22, cy + 58), 6)
        foot(draw, cx - 22, cy + 58)
        line(draw, (cx, hy + 36), (cx - 28, cy + 10), 5)
        line(draw, (cx, hy + 36), (cx + 32, cy - 2), 5)
    else:
        stick_south(draw, cx, cy, "idle", bob)


def stick_east(draw, cx, cy, phase: str, bob=0):
    hy = cy - 68 + bob
    hip = (cx, cy + 12 + bob)
    head(draw, cx + 6, hy)
    line(draw, (cx + 6, hy + 22), hip, 7)
    if phase.startswith("contactL"):
        knee = (cx + 28, cy + 42)
        line(draw, hip, knee, 6)
        line(draw, knee, (cx + 50, cy + 60), 6)
        foot(draw, cx + 50, cy + 60, True)
        line(draw, hip, (cx - 30, cy + 76), 6)
        foot(draw, cx - 30, cy + 76)
        line(draw, (cx, hy + 38), (cx + 48, cy - 14), 5)
        line(draw, (cx, hy + 38), (cx - 32, cy + 22), 5)
    elif phase.startswith("downL"):
        line(draw, hip, (cx + 36, cy + 74), 6)
        foot(draw, cx + 36, cy + 74, True)
        knee = (cx - 8, cy + 50)
        line(draw, hip, knee, 6)
        line(draw, knee, (cx - 18, cy + 58), 6)
        foot(draw, cx - 18, cy + 58)
        line(draw, (cx, hy + 38), (cx + 34, cy - 4), 5)
        line(draw, (cx, hy + 38), (cx - 22, cy + 18), 5)
    elif phase.startswith("passL"):
        line(draw, hip, (cx + 14, cy + 66), 6)
        line(draw, hip, (cx - 8, cy + 60), 6)
        foot(draw, cx + 14, cy + 66)
        foot(draw, cx - 8, cy + 60)
        line(draw, (cx, hy + 38), (cx + 18, cy + 0), 5)
        line(draw, (cx, hy + 38), (cx - 16, cy + 12), 5)
    elif phase.startswith("passR"):
        line(draw, hip, (cx - 10, cy + 66), 6)
        line(draw, hip, (cx + 12, cy + 60), 6)
        foot(draw, cx - 10, cy + 66)
        foot(draw, cx + 12, cy + 60)
        line(draw, (cx, hy + 38), (cx - 18, cy + 0), 5)
        line(draw, (cx, hy + 38), (cx + 16, cy + 12), 5)
    elif phase.startswith("contactR"):
        line(draw, hip, (cx + 42, cy + 76), 6)
        foot(draw, cx + 42, cy + 76)
        knee = (cx - 8, cy + 46)
        line(draw, hip, knee, 6)
        line(draw, knee, (cx - 32, cy + 58), 6)
        foot(draw, cx - 32, cy + 58, True)
        line(draw, (cx, hy + 38), (cx - 42, cy - 10), 5)
        line(draw, (cx, hy + 38), (cx + 30, cy + 24), 5)
    elif phase.startswith("downR"):
        line(draw, hip, (cx - 22, cy + 72), 6)
        foot(draw, cx - 22, cy + 72, True)
        line(draw, hip, (cx + 28, cy + 70), 6)
        foot(draw, cx + 28, cy + 70)
        line(draw, (cx, hy + 38), (cx - 28, cy + 2), 5)
        line(draw, (cx, hy + 38), (cx + 24, cy + 16), 5)
    else:
        line(draw, hip, (cx + 10, cy + 74), 6)
        line(draw, hip, (cx - 6, cy + 74), 6)
        foot(draw, cx + 10, cy + 74)
        foot(draw, cx - 6, cy + 74)
        line(draw, (cx, hy + 38), (cx + 22, cy + 22), 5)
        line(draw, (cx, hy + 38), (cx - 18, cy + 22), 5)


def stick_west(draw, cx, cy, phase: str, bob=0):
    # draw east into temp via geometric mirror by negating x offsets — call east then flip cell later
    stick_east(draw, cx, cy, phase, bob)


WALK_DRAW = {"S": stick_south, "E": stick_east, "N": stick_north, "W": stick_west}


def cell_bg(im: Image.Image):
    d = ImageDraw.Draw(im)
    d.rectangle((0, 0, CELL - 1, CELL - 1), fill=MAGENTA)
    d.rectangle((4, 4, 14, 14), outline=ACCENT, width=1)


def build_walk() -> Image.Image:
    cols, rows = 6, 4
    sheet = Image.new("RGBA", (cols * CELL, rows * CELL), MAGENTA)
    dirs = ["S", "E", "N", "W"]
    for ri, d in enumerate(dirs):
        fn = WALK_DRAW[d]
        for ci, (ph, bob) in enumerate(WALK_PHASES):
            cell = Image.new("RGBA", (CELL, CELL), MAGENTA)
            cell_bg(cell)
            cd = ImageDraw.Draw(cell)
            if d == "W":
                # build east then flip
                tmp = Image.new("RGBA", (CELL, CELL), MAGENTA)
                cell_bg(tmp)
                stick_east(ImageDraw.Draw(tmp), CELL // 2, CELL // 2 + 8, ph, bob=bob)
                cell = tmp.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
            else:
                fn(cd, CELL // 2, CELL // 2 + 8, ph, bob=bob)
            sheet.paste(cell, (ci * CELL, ri * CELL))
    return sheet


def build_idle() -> Image.Image:
    cols, rows = 4, 4
    sheet = Image.new("RGBA", (cols * CELL, rows * CELL), MAGENTA)
    dirs = ["S", "E", "N", "W"]
    # extremities held longer in playback; frames: low, mid-up, peak, mid-down
    bobs = [4, -2, -8, 0]
    for ri, d in enumerate(dirs):
        fn = WALK_DRAW[d]
        for ci, bob in enumerate(bobs):
            cell = Image.new("RGBA", (CELL, CELL), MAGENTA)
            cell_bg(cell)
            cd = ImageDraw.Draw(cell)
            if d == "W":
                tmp = Image.new("RGBA", (CELL, CELL), MAGENTA)
                cell_bg(tmp)
                stick_east(ImageDraw.Draw(tmp), CELL // 2, CELL // 2 + 8, "idle", bob=bob)
                cell = tmp.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
            else:
                fn(cd, CELL // 2, CELL // 2 + 8, "idle", bob=bob)
            if ci == 2 and d == "S":
                hx, hy = CELL // 2, CELL // 2 + 8 - 70 + bob
                cd = ImageDraw.Draw(cell)
                cd.line((hx - 10, hy - 2, hx - 4, hy - 2), fill=INK, width=3)
                cd.line((hx + 4, hy - 2, hx + 10, hy - 2), fill=INK, width=3)
            sheet.paste(cell, (ci * CELL, ri * CELL))
    return sheet


def stick_caught(draw, cx, cy, stage: int):
    hy = cy - 70
    hip = (cx, cy + 14)
    head(draw, cx, hy)
    line(draw, (cx, hy + 22), hip, 7)
    if stage == 0:
        line(draw, hip, (cx - 18, cy + 70), 6)
        line(draw, hip, (cx + 18, cy + 70), 6)
        line(draw, (cx, hy + 36), (cx - 40, cy - 10), 5)
        line(draw, (cx, hy + 36), (cx + 40, cy - 10), 5)
    elif stage == 1:
        line(draw, hip, (cx - 24, cy + 66), 6)
        line(draw, hip, (cx + 24, cy + 66), 6)
        line(draw, (cx, hy + 36), (cx - 36, hy + 10), 5)
        line(draw, (cx, hy + 36), (cx + 36, hy + 10), 5)
    elif stage == 2:
        line(draw, hip, (cx - 20, cy + 72), 6)
        line(draw, hip, (cx + 20, cy + 72), 6)
        line(draw, (cx, hy + 36), (cx - 22, hy - 8), 5)
        line(draw, (cx, hy + 36), (cx + 22, hy - 8), 5)
    else:
        line(draw, hip, (cx - 14, cy + 74), 6)
        line(draw, hip, (cx + 14, cy + 74), 6)
        line(draw, (cx, hy + 36), (cx - 22, cy + 28), 5)
        line(draw, (cx, hy + 36), (cx + 22, cy + 28), 5)


def build_caught() -> Image.Image:
    sheet = Image.new("RGBA", (4 * CELL, CELL), MAGENTA)
    for ci in range(4):
        cell = Image.new("RGBA", (CELL, CELL), MAGENTA)
        cell_bg(cell)
        stick_caught(ImageDraw.Draw(cell), CELL // 2, CELL // 2 + 8, ci)
        sheet.paste(cell, (ci * CELL, 0))
    return sheet


def main() -> None:
    RIG.mkdir(parents=True, exist_ok=True)
    walk = build_walk()
    idle = build_idle()
    caught = build_caught()
    walk.save(RIG / "pose_walk_6x4.png")
    # alias for docs that still mention 4x4 name during transition
    walk.save(RIG / "pose_walk_4x4.png")
    idle.save(RIG / "pose_idle_4x4.png")
    caught.save(RIG / "pose_caught_1x4.png")
    # export south row for paint-over refs
    rows = RIG / "rows"
    rows.mkdir(exist_ok=True)
    for i, name in enumerate(["s", "e", "n", "w"]):
        walk.crop((0, i * CELL, 6 * CELL, (i + 1) * CELL)).save(rows / f"pose_walk6_row_{name}.png")
    print("Wrote pose_walk_6x4.png (Slynyrd 6-frame) + idle + caught")


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""QA gate for HR idle+walk after reart. Exit 1 on fail."""
from __future__ import annotations

import sys
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
FRAMES = ROOT / "games/deadline-escape/refs/sprites/frames/boss_hr"
fail = 0


def check(cond: bool, msg: str) -> None:
    global fail
    if cond:
        print("OK ", msg)
    else:
        print("FAIL", msg)
        fail += 1


def content_wh(p: Path) -> tuple[int, int]:
    a = np.asarray(Image.open(p).convert("RGBA"))
    m = a[..., 3] > 16
    ys, xs = np.where(m)
    if len(xs) == 0:
        return 0, 0
    return int(xs.max() - xs.min() + 1), int(ys.max() - ys.min() + 1)


def border_hits(p: Path) -> dict[str, int]:
    a = np.asarray(Image.open(p).convert("RGBA"))[..., 3] > 10
    return {
        "L": int(a[:, 0].sum()),
        "R": int(a[:, -1].sum()),
        "T": int(a[0].sum()),
        "B": int(a[-1].sum()),
    }


def bun_rgb(p: Path) -> np.ndarray:
    im = np.asarray(Image.open(p).convert("RGBA"))
    bun = im[50:95, 100:160]
    o = bun[..., 3] > 200
    return bun[o, :3].mean(0) if o.any() else np.array([0, 0, 0])


def upper_lr(p: Path) -> tuple[int, int]:
    a = np.asarray(Image.open(p).convert("RGBA"))
    mid = a.shape[1] // 2
    upper = a[:140]
    return int((upper[:, :mid, 3] > 40).sum()), int((upper[:, mid:, 3] > 40).sum())


def main() -> int:
    idle_s = FRAMES / "idle_s.png"
    idle_e = FRAMES / "idle_e.png"
    idle_w = FRAMES / "idle_w.png"
    walk0 = FRAMES / "walk_s_0.png"
    walk3 = FRAMES / "walk_s_3.png"

    for p in (idle_s, idle_e, idle_w, walk0, walk3):
        check(p.exists(), f"exists {p.name}")

    bs = border_hits(idle_s)
    check(bs["L"] == 0 and bs["R"] == 0, f"idle_s not canvas-cropped {bs}")

    ws, hs = content_wh(idle_s)
    ww, hw = content_wh(walk0)
    check(ws >= 100, f"idle_s wide enough ({ws})")
    check(abs(ws - ww) <= 45, f"idle/walk width close ({ws} vs {ww})")
    check(abs(hs - hw) <= 8, f"idle/walk height close ({hs} vs {hw})")

    bun = bun_rgb(idle_s)
    check(bun[0] < 160 and bun[1] < 120, f"hair not pink-tinted {bun}")

    # E vs W distinct (normalize centers feet — facing checked visually on idle sheet)
    e = np.asarray(Image.open(idle_e).convert("RGBA")).astype(float)
    w = np.asarray(Image.open(idle_w).convert("RGBA")).astype(float)
    mse_ew = ((e - w) ** 2).mean()
    check(mse_ew > 400, f"E and W distinct (mse={mse_ew:.0f})")
    we, ww_ = content_wh(idle_e)[0], content_wh(idle_w)[0]
    check(we >= 60 and ww_ >= 60, f"profile widths ok (e={we} w={ww_})")

    l0, r0 = upper_lr(walk0)
    l3, r3 = upper_lr(walk3)
    # clipboard side stable: same side dominates
    check((r0 >= l0) == (r3 >= l3), f"walk S clipboard side stable ({l0}/{r0} vs {l3}/{r3})")

    if fail:
        print(f"QA FAILED ({fail})")
        return 1
    print("QA PASSED")
    return 0


if __name__ == "__main__":
    sys.exit(main())

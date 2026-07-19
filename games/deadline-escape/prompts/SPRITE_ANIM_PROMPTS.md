# Работник месяца — SPRITE_ANIM_PROMPTS

**Pipeline:** `docs/SPRITE_PIPELINE.md` (seed → strip → normalize → GIF QA)  
**Look:** `docs/STYLE_LOCK.md` + `refs/art/style-seed-hero.png`  
**Motion:** [Slynyrd Pixelblog 55](https://www.slynyrd.com/blog/2025/3/24/pixelblog-55-top-down-character-animation) (6-frame run)  
**Fundamentals:** [Pixelblog 50](https://www.slynyrd.com/blog/2024/5/24/pixelblog-50-human-walk-cycle)  
**Не писать `src/`.**  
**ART_STATUS = PIPELINE_V1** — визуал с нуля; сначала APPROVED style-seed, потом strips.

## Style + pose lock

```
ALWAYS references:
  1) refs/art/style-seed-hero.png — game style + proportions
  2) refs/sprites/rig/pose_walk_6x4.png — Slynyrd phases (for walk)
  3) character seed / concept (after P1 APPROVED)

Generate STRIPS from seed. Magenta #FF00FF → chroma → normalize.
Top-down 3/4. No portrait. No duplicate cells.
FORBIDDEN: independent idle+walk gens · warp/graft · open regen loops.
```

## Walk — 6 frames (linear 0→5→0; half-stride per cell)

| Col | Phase | Notes |
|-----|-------|-------|
| 0 | contact A | lowest, limbs extreme |
| 1 | down A | front foot flat, back lifting |
| 2 | pass A | **tallest**, legs under torso |
| 3 | contact B | opposite of A |
| 4 | down B | opposite down |
| 5 | pass B | tallest, **opposite limbs of pass A** |

Bob: variable (down/down/up), not sine. W = mirror **each** E cell (keep phase order).

Fallback: `contacts(2) + downs(2) + pass_a + pass_b` →  
`python management/tools/compose_hero_walk.py` · HR: `compose_hr_walk.py`  
**Forbidden:** reuse pass A as pass B; flip whole strip for W (reverses frames).

## Idle

4 frames/dir; playback holds extremities longer than in-betweens.

## Caught

1×4: startle → panic → hands-head → defeat

## Bosses

HR: idle + Slynyrd walk 6f (`rebuild_hr_sprites.py` from chroma rows); **no special**. Look = `art/boss-hr.png` + камера ГГ.  
Other bosses: legacy 4-dir OK until re-done.

### Concept locks (2026-07 redesign)

| ID | Concept file | Must | Avoid |
|----|--------------|------|-------|
| looker / ГЛЯД | `refs/art/concept-boss-looker.png` | beige cardigan, normal glasses, coffee, cubicle peek | binocular-face, purple spy trench |
| meeting / ВСТР | `refs/art/concept-boss-meeting.png` | mustard office shirt, agenda clipboard, sticky notes | mic/host energy, alien palette |
| kpi | `refs/art/concept-boss-kpi.png` | slim analyst, clear glasses, chart board, teal accent | red power suit, sunglasses (=director) |
| it | `refs/art/concept-boss-it.png` | muted sage/teal polo, plain laptop | acid neon green, RGB glow |

## Методология (кратко)

Locks → phased gen → opposite-limb fix (flip/validate) → normalize feet/height → half-stride playback → GIF QA.  
Details: `docs/STYLE_LOCK.md` § «Методология анимационных спрайтов».

## Cut-up bake (ГГ experiment)

Parts sheet (1 row) → `hero_cutup_bake.py` (angles) → baked `walk_*` frames.  
See `STYLE_LOCK.md` § Cut-up rig bake.

## QA

- [ ] 6 phases, opposite contacts  
- [ ] pass taller than contact  
- [ ] no magenta in frames  
- [ ] demo maps step → frames 0..5 linear  

Rebuild: `compose_hero_walk.py` then hard-refresh demo.

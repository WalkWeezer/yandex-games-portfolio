# ART_PROMPTS — auto-towers

**Роль:** арт-агент.  
**Читать:** `docs/DESIGN_LLM.md` §0, §4, §5.  
**coding_allowed:** false until CONFIRMED.

## Ground truth
| Ref | Path |
|-----|------|
| Key art | `refs/art/key-art.png` |
| UI wireframe | `refs/ui/wireframe-main.png` |
| Level layout | `refs/levels/layout-main.png` |
| Sprite sheet | `refs/sprites/sheet-main.png` |

## Master lock
```
Bright cute stylized fantasy casual strategy art, readable silhouettes, grass #7CB518, path #C4A574, sky #A8DADC, no grimdark, no gore, no photorealism, no text, no UI, no watermark
```

## A1 Key → `refs/art/key-art.png` → `art_key_towers.png`
```
{lock} match refs/art/key-art.png, 16:9 TD auto-battler key art, meadow path, cute towers shooting sparkles, cartoon monsters, heroes near towers
```

## A2 Battlefields portrait
`env_ch1_bg.png` meadow path L→R (align `refs/levels/layout-main.png`)  
`env_ch2_bg.png` ruined stone path same framing  
`env_ch3_bg.png` royal evening trail same framing  
Empty centers for units; subtle slot markers ok as faint circles.

## A3 Towers (still + sheet source)
arrow, cannon, frost, beam, barricade, totem — full body transparent; scale vs `refs/sprites/sheet-main.png`.

## A4 Heroes
knight, witch, ranger, druid (locked art ok).

## A5 Enemies
swarm, armored, fast, flyer, elite, boss_grove, boss_ruin, boss_crown.

## A6 Synergy icons 128
Hunt, Blast, Arcane, Bastion, Control — simple emblem, transparent.

## A7 IAP
hero unlock banner, pass banner — empty text band.

## Copy-paste
DESIGN_LLM §5 P1–P10 (refs paths included).

## Checklist
- [ ] Silhouette B/W test pass
- [ ] Filenames = IDs (§21 registry)
- [ ] No freeplace-building implication
- [ ] No `src/**`

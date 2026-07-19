# ART_PROMPTS — cozy-plot

**Роль:** арт-агент. Читай `docs/DESIGN_LLM.md` §4–5, §13, §19.  
**Выход:** `refs/art/` → финал по Integration Contract §0.3.  
**coding_allowed:** false until CONFIRMED.

## Ground truth (обязательно)
| Ref | Path |
|-----|------|
| Key art | `refs/art/key-art.png` |
| UI wireframe | `refs/ui/wireframe-main.png` |
| Level layout | `refs/levels/layout-main.png` |
| Sprite sheet | `refs/sprites/sheet-main.png` |

## Master style lock (prepend)
```
Wholesome cozy storybook casual farm game art, soft pastel greens #8CB369, warm wood #D4A373, river blue #4EA8DE, sunset #F4A261, cream #FAEDCD, rounded friendly shapes, gentle golden hour, no horror, no neon cyberpunk, no photorealism, no purple-indigo UI gradient, no text, no UI overlays, no watermark, no logo
```

## A1 — Key art → `refs/art/key-art.png` → `art_key_cozy.png`
```
{lock}
match refs/art/key-art.png, Game key art 16:9, small riverside cottage, neat vegetable plots, chicken and goat, wooden pier, peaceful wholesome mood, cinematic casual farm illustration
```

## A2 — Environments
| File | Prompt focus |
|------|----------------|
| `env_homestead_base.png` | Zone A 3/4 top-down, grass, 4×3 soil plots empty, cottage, path, river edge; align `refs/levels/layout-main.png` |
| `env_zone_b.png` | expansion across bridge, wildflowers, slightly overgrown |
| `env_village_strip.png` | NPC meeting lane with 3 door markers |

Template:
```
{lock}
Top-down three-quarter game background, [FOCUS], readable tile scale for 64px gameplay, soft lighting, no characters overlapping center plots unless noted
```

## A3 — Portraits (bust, transparent)
`npc_lada_bust.png` — kind elderly woman scarf  
`npc_tikhon_bust.png` — calm fisherman beard  
`npc_zoya_bust.png` — cheerful mail carrier  
`char_player_bust.png` — friendly farmer protagonist  

## A4 — Decor stills (20)
Generate each `decor_{id}.png` from DESIGN_LLM §13 catalog, 256×256 source, transparent, grounded shadow.

## A5 — Crop icon set
8 crops harvest icons 128×128: carrot wheat tomato berry pumpkin herb corn flower.

## A6 — IAP banners
```
{lock}
1024x500 cozy decor pack banner, river picnic aesthetic, empty center band for text, no letters
```

## Copy-paste
DESIGN_LLM §5 P1–P10 (all reference refs paths).

## Checklist
- [ ] Palette matched §4
- [ ] Filenames = asset IDs §19
- [ ] Ground truth refs checked
- [ ] No stress-red giant timers in art
- [ ] No `src/**`

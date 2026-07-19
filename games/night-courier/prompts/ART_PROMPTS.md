# ART_PROMPTS — night-courier

**Роль:** арт-агент.  
**Читать:** `docs/DESIGN_LLM.md` §0, §4, §5.  
**Статус:** `coding_allowed: false` until CONFIRMED — только `refs/` + предложения путей.

## Ground truth (обязательно)
| Ref | Path |
|-----|------|
| Key art | `refs/art/key-art.png` |
| UI wireframe | `refs/ui/wireframe-main.png` |
| Level layout | `refs/levels/layout-main.png` |
| Sprite sheet | `refs/sprites/sheet-main.png` |

## Master lock
```
Cyber-casual neon night endless runner art, cyan #00F5D4, magenta #FF2E97, night #0B1026, amber #FFB703, chunky readable shapes, rainy road reflections optional, no photoreal GTA, no gore, no seizure strobe, no text, no UI, no watermark
```

## A1 Key → `refs/art/key-art.png` → `public/assets/art/art_key_courier.png`
```
{lock} match refs/art/key-art.png mood, 16:9 motorcycle courier neon city glowing packages motion blur stylish casual
```

## A2 Environments
| File | Focus |
|------|-------|
| `env_road_scroll.png` | 3-lane asphalt seamless vertical scroll; match `refs/levels/layout-main.png` lane spacing |
| `env_district_downtown.png` | neon towers parallax |
| `env_district_harbor.png` | docks neon water |
| `env_district_campus.png` | campus night lights |
| `env_hub_garage.png` | hub backdrop |

## A3 Couriers & bikes
3 couriers full body; 5 bikes side view consistent scale with `refs/sprites/sheet-main.png`.

## A4 Obstacles & parcels
obs: car, barrier, pothole, drone — chunky.  
parcels: standard cyan, rush amber, fragile magenta — 128 icons.

## A5 Delivery gate art
Glowing arch/gate per type color.

## A6 Skin IAP banners empty text band

## Copy-paste prompts
Используй DESIGN_LLM §5 P1–P10 (все ссылаются на refs paths).

## Checklist
- [ ] Contrast vs road OK
- [ ] IDs match DESIGN_LLM §22 registry
- [ ] refs ground truth checked before final
- [ ] No `src/**` edits

# UI_PROMPTS — night-courier

**Роль:** UI агент.  
**Читать:** `docs/DESIGN_LLM.md` §3 (inventory + all wireframes).  
**Ground truth:** `refs/ui/wireframe-main.png` (+ key-art palette from `refs/art/key-art.png`).  
**coding_allowed:** false until CONFIRMED.

## Lock
```
Mobile neon runner UI kit, dark panels #141B2D, cyan CTA #00F5D4, magenta accents #FF2E97, amber warning #FFB703, huge thumb buttons, combo meter, no text labels, no fake numbers, no clutter stickers on HUD
```

## Atlas parts
panel_dark, btn_cyan, btn_magenta, btn_ghost, combo_meter, score_font_sheet optional, parcel_hud_icon_frames, continue_modal, result_panel, bike_carousel_frame, daily_card, shop_row, sticky_safe_inset_marker, pause_icon.

## Mocks → `refs/ui/` (ALL major screens)
1. Boot loading  
2. Hub (+ sticky reserve bottom) — align `refs/ui/wireframe-main.png`  
3. Garage carousel  
4. Daily orders  
5. Run HUD  
6. Pause  
7. Continue RV (1/2)  
8. Result + ×2  
9. Shop remove-ads  
10. Settings  
11. Tutorial swipe hints  

## Touch contract (from DESIGN_LLM §3.1)
| Control | Min |
|---------|-----|
| Play CTA | 64×64 |
| Pause / settings | 44×44 |
| Continue RV / ×2 | 56×56 |
| Garage cards | 72×72 |
| Swipe zone | full width × lower 70% |

## RU copy
«Гнать», «Продолжить», «Завершить», «×2 монеты», «Щит на старт», «Комбо», «Доставки дня», «Рекорд дистанции».

## Rules
Continue CTA clearly separated from interstitial; sticky **hub only**; no mid-run ad banners.

## Acceptance
- [ ] Every screen in DESIGN_LLM §3 mocked
- [ ] Touch mins met
- [ ] Matches `refs/ui/wireframe-main.png`
